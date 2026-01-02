"""
Dashboard views
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.services import DashboardService
from api.serializers import TransactionSerializer, DashboardStatsSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request) -> Response:
    """
    Get dashboard statistics for authenticated user
    Uses DashboardService for business logic with user filtering
    """
    # Get dashboard stats from service layer filtered by authenticated user
    stats_data = DashboardService.get_dashboard_stats(user_id=request.user.id)
    
    # Serialize recent transactions with context to allow proper field filtering
    recent_transactions_data = TransactionSerializer(
        stats_data['recent_transactions'], 
        many=True,
        context={'request': request}
    ).data
    
    # Build response data manually (no need for DashboardStatsSerializer)
    response_data = {
        'total_balance': str(stats_data['total_balance']),
        'total_income': str(stats_data['total_income']),
        'total_expenses': str(stats_data['total_expenses']),
        'accounts_count': stats_data['accounts_count'],
        'recent_transactions': recent_transactions_data,
        'goals_summary': stats_data['goals_summary'],
        'critical_budgets': stats_data['critical_budgets'],
        'top_goals': stats_data['top_goals'],
        'upcoming_payments': stats_data['upcoming_payments'],
        'mini_projection': stats_data['mini_projection'],
        'projection_final_balance': stats_data['projection_final_balance'],
    }
    
    return Response(response_data)


@api_view(['GET'])
def health_check(request) -> Response:
    """
    Simple health check endpoint
    """
    return Response({
        'status': 'healthy',
        'message': 'Budget API is running'
    })

