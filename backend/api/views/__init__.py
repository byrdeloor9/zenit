"""
Views package
"""
from .user import UserViewSet, RegisterView, UserProfileView, ChangePasswordView, CustomTokenObtainPairView
from .account import AccountViewSet
from .transaction import CategoryViewSet, TransactionViewSet
from .financial import BudgetViewSet, GoalViewSet, TransferViewSet, DebtViewSet, DebtPaymentViewSet, RecurringTransactionViewSet
from .investment import InvestmentViewSet, InvestmentTransactionViewSet
from .trends import TrendsViewSet
from .dashboard import dashboard_stats, health_check

__all__ = [
    'UserViewSet',
    'RegisterView',
    'UserProfileView',
    'ChangePasswordView',
    'CustomTokenObtainPairView',
    'AccountViewSet',
    'CategoryViewSet',
    'TransactionViewSet',
    'BudgetViewSet',
    'GoalViewSet',
    'TransferViewSet',
    'DebtViewSet',
    'DebtPaymentViewSet',
    'RecurringTransactionViewSet',
    'InvestmentViewSet',
    'InvestmentTransactionViewSet',
    'TrendsViewSet',
    'dashboard_stats',
    'health_check',
]


