"""
Trends views
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from typing import Dict, Any

from api.services import TrendsService
from api.serializers import CategoryTrendSerializer, CategoryOverviewSerializer


class TrendsViewSet(viewsets.ViewSet):
    """
    ViewSet for spending trends analysis
    """
    permission_classes = [IsAuthenticated]
    
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

