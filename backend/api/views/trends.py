"""
Trends views
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from typing import Dict, Any
from datetime import datetime

from api.services import TrendsService
from api.serializers import (
    CategoryTrendSerializer, 
    CategoryOverviewSerializer,
    GlobalTrendsSerializer,
    CategoryDistributionSerializer,
    SpendingComparisonSerializer
)


class TrendsViewSet(viewsets.ViewSet):
    """
    ViewSet for spending trends analysis
    """
    permission_classes = [IsAuthenticated]
    lookup_value_regex = '[0-9]+'  # Only match numeric IDs for retrieve

    
    def list(self, request) -> Response:
        """
        GET /api/trends/
        List all categories that have budgets for trends analysis
        """
        categories = TrendsService.get_categories_with_budgets(user_id=request.user.id)
        
        serializer = CategoryOverviewSerializer(categories, many=True)
        
        return Response({
            'categories': serializer.data
        })
    
    def retrieve(self, request, pk: int = None) -> Response:
        """
        GET /api/trends/{category_id}/?months=6
        Get spending trends for a specific category
        
        Query params:
            months: Number of months to analyze (3, 6, or 12, default=6)
        """
        # Get months parameter from query params
        months_str = request.query_params.get('months', '6')
        
        try:
            months = int(months_str)
            # Validate months parameter
            if months not in [3, 6, 12]:
                return Response(
                    {'error': 'months parameter must be 3, 6, or 12'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'error': 'months parameter must be a valid integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get category trends
        try:
            trends_data = TrendsService.get_category_trends_with_budget(
                user_id=request.user.id,
                category_id=pk,
                months=months
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CategoryTrendSerializer(trends_data)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def global_trends(self, request) -> Response:
        """
        GET /api/trends/global_trends/?months=12
        Get global spending trends (income vs expenses)
        
        Query params:
            months: Number of months to analyze (3, 6, 12, or 24, default=12)
        """
        months_str = request.query_params.get('months', '12')
        
        try:
            months = int(months_str)
            if months not in [3, 6, 12, 24]:
                return Response(
                    {'error': 'months parameter must be 3, 6, 12, or 24'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'error': 'months parameter must be a valid integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        trends_data = TrendsService.get_global_spending_trends(
            user_id=request.user.id,
            months=months
        )
        
        serializer = GlobalTrendsSerializer(trends_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def category_distribution(self, request) -> Response:
        """
        GET /api/trends/category_distribution/?start_date=2024-01-01&end_date=2024-01-31
        Get spending distribution by category
        
        Query params:
            start_date: Start date (YYYY-MM-DD, optional, defaults to first day of current month)
            end_date: End date (YYYY-MM-DD, optional, defaults to today)
        """
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        start_date = None
        end_date = None
        
        try:
            if start_date_str:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            if end_date_str:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        distribution_data = TrendsService.get_category_distribution(
            user_id=request.user.id,
            start_date=start_date,
            end_date=end_date
        )
        
        serializer = CategoryDistributionSerializer(distribution_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def comparison(self, request) -> Response:
        """
        GET /api/trends/comparison/?period=month
        Compare current period vs previous period
        
        Query params:
            period: 'month' or 'year' (default='month')
        """
        period_type = request.query_params.get('period', 'month')
        
        if period_type not in ['month', 'year']:
            return Response(
                {'error': 'period parameter must be "month" or "year"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comparison_data = TrendsService.get_spending_comparison(
            user_id=request.user.id,
            period_type=period_type
        )
        
        serializer = SpendingComparisonSerializer(comparison_data)
        return Response(serializer.data)


