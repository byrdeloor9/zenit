from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from api.views import (
    UserViewSet,
    RegisterView,
    UserProfileView,
    ChangePasswordView,
    CustomTokenObtainPairView,
    AccountViewSet,
    CategoryViewSet,
    TransactionViewSet,
    BudgetViewSet,
    GoalViewSet,
    TransferViewSet,
    DebtViewSet,
    DebtPaymentViewSet,
    RecurringTransactionViewSet,
    InvestmentViewSet,
    InvestmentTransactionViewSet,
    TrendsViewSet,
    dashboard_stats,
    health_check,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'transfers', TransferViewSet, basename='transfer')
router.register(r'debts', DebtViewSet, basename='debt')
router.register(r'debt-payments', DebtPaymentViewSet, basename='debtpayment')
router.register(r'recurring-transactions', RecurringTransactionViewSet, basename='recurringtransaction')
router.register(r'investments', InvestmentViewSet, basename='investment')
router.register(r'investment-transactions', InvestmentTransactionViewSet, basename='investmenttransaction')
router.register(r'trends', TrendsViewSet, basename='trends')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', dashboard_stats, name='dashboard-stats'),
    path('health/', health_check, name='health-check'),
    
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/user/', UserProfileView.as_view(), name='auth-user'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
]

