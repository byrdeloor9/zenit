"""
Dashboard service
Handles business logic for dashboard statistics
"""
from django.db.models import Sum, QuerySet, F, Case, When, IntegerField
from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import Dict, Any, Optional, List

from api.models import Account, Transaction, Goal, Budget, Debt, Investment, RecurringTransaction


class DashboardService:
    """
    Service class for dashboard-related business logic
    """
    
    @staticmethod
    def get_total_balance(user_id: Optional[int] = None) -> Decimal:
        """Get total balance across all accounts"""
        queryset = Account.objects.all()
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        result = queryset.aggregate(total=Sum('balance'))
        return result['total'] or Decimal('0')
    
    @staticmethod
    def get_period_income(days: int = 30, user_id: Optional[int] = None) -> Decimal:
        """Get total income for the specified period"""
        date_threshold = datetime.now().date() - timedelta(days=days)
        queryset = Transaction.objects.filter(
            type='Income',
            transaction_date__gte=date_threshold
        )
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        result = queryset.aggregate(total=Sum('amount'))
        return result['total'] or Decimal('0')
    
    @staticmethod
    def get_period_expenses(days: int = 30, user_id: Optional[int] = None) -> Decimal:
        """Get total expenses for the specified period"""
        date_threshold = datetime.now().date() - timedelta(days=days)
        queryset = Transaction.objects.filter(
            type='Expense',
            transaction_date__gte=date_threshold
        )
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        result = queryset.aggregate(total=Sum('amount'))
        return result['total'] or Decimal('0')
    
    @staticmethod
    def get_accounts_count(user_id: Optional[int] = None) -> int:
        """Get count of accounts"""
        queryset = Account.objects.all()
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset.count()
    
    @staticmethod
    def get_recent_transactions(limit: int = 10, user_id: Optional[int] = None) -> QuerySet[Transaction]:
        """Get recent transactions"""
        queryset = Transaction.objects.select_related('account', 'category', 'user').all()
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset[:limit]
    
    @staticmethod
    def get_goals_summary(user_id: Optional[int] = None) -> Dict[str, int]:
        """Get summary of goals"""
        queryset = Goal.objects.all()
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        return {
            'in_progress': queryset.filter(status='In Progress').count(),
            'completed': queryset.filter(status='Completed').count(),
        }
    
    @staticmethod
    def get_budget_status(user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get status of all active budgets for the current period"""
        from django.db.models import Q
        
        today = date.today()
        
        # Filter budgets that are:
        # 1. Status = 'Active'
        # 2. Started on or before today
        # 3. Either haven't ended yet (period_end is null) OR end date is today or later
        queryset = Budget.objects.select_related('category').filter(
            status='Active',
            period_start__lte=today
        ).filter(
            Q(period_end__isnull=True) | Q(period_end__gte=today)
        )
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        budgets_data = []
        for budget in queryset:
            # Calculate spent (same logic as BudgetSerializer)
            filters = {
                'user': budget.user,
                'category': budget.category,
                'type': 'Expense',
                'transaction_date__gte': budget.period_start,
            }
            if budget.period_end:
                filters['transaction_date__lte'] = budget.period_end
            
            spent_result = Transaction.objects.filter(**filters).aggregate(total=Sum('amount'))
            spent = float(spent_result['total'] or Decimal('0'))
            amount = float(budget.amount)
            percentage = (spent / amount * 100) if amount > 0 else 0
            
            # Append all active budgets, regardless of percentage
            budgets_data.append({
                'id': budget.id,
                'category_name': budget.category.name if budget.category else 'Sin categoría',
                'amount': str(budget.amount),
                'spent': str(spent),
                'percentage': round(percentage, 1),
            })
        
        # Return top 5 by percentage usage
        return sorted(budgets_data, key=lambda x: x['percentage'], reverse=True)[:5]
    
    @staticmethod
    def get_top_goals(user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get top active goals/investments by progress"""
        goals_data = []
        
        # Get legacy goals
        legacy_goals = Goal.objects.filter(status='In Progress')
        if user_id:
            legacy_goals = legacy_goals.filter(user_id=user_id)
        
        for goal in legacy_goals:
            current = float(goal.current_amount)
            target = float(goal.target_amount)
            percentage = (current / target * 100) if target > 0 else 0
            
            goals_data.append({
                'id': goal.id,
                'name': goal.name,
                'target_amount': str(goal.target_amount),
                'current_amount': str(goal.current_amount),
                'progress_percentage': round(percentage, 1),
            })
        
        # Get new investments
        investments = Investment.objects.filter(status='active')
        if user_id:
            investments = investments.filter(user_id=user_id)
        
        for inv in investments:
            current = float(inv.current_amount)
            target = float(inv.target_amount) if inv.investment_type == 'goal' else float(inv.initial_amount)
            percentage = (current / target * 100) if target > 0 else 0
            
            goals_data.append({
                'id': inv.id,
                'name': inv.name,
                'target_amount': str(target),
                'current_amount': str(inv.current_amount),
                'progress_percentage': round(percentage, 1),
            })
        
        return sorted(goals_data, key=lambda x: x['progress_percentage'], reverse=True)[:5]
    
    @staticmethod
    def get_upcoming_payments(user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get upcoming debt payments in the next 15 days"""
        today = date.today()
        
        debts = Debt.objects.filter(status='active')
        if user_id:
            debts = debts.filter(user_id=user_id)
        
        payments = []
        for debt in debts:
            # Calculate next payment date (assuming monthly on the same day as start_date)
            if debt.start_date:
                # Simple logic: next month from start_date
                days_until = (debt.start_date.day - today.day) % 30
                if days_until <= 15:
                    next_payment = today + timedelta(days=days_until if days_until > 0 else 1)
                    payments.append({
                        'id': debt.id,
                        'debt_name': debt.name,
                        'next_payment_date': next_payment.isoformat(),
                        'payment_amount': str(debt.monthly_payment),
                        'days_until_due': days_until if days_until > 0 else 1,
                    })
        
        return sorted(payments, key=lambda x: x['days_until_due'])[:5]
    
    @staticmethod
    def get_mini_projection(user_id: Optional[int] = None, months: int = 3) -> Dict[str, Any]:
        """Get mini projection data for next N months"""
        # Get active recurring transactions
        recurring_income = RecurringTransaction.objects.filter(
            is_active=True,
            transaction_type='Income'
        )
        recurring_expenses = RecurringTransaction.objects.filter(
            is_active=True,
            transaction_type='Expense'
        )
        
        if user_id:
            recurring_income = recurring_income.filter(user_id=user_id)
            recurring_expenses = recurring_expenses.filter(user_id=user_id)
        
        # Calculate monthly totals
        monthly_income = recurring_income.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        monthly_expenses = recurring_expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Add debt payments to expenses
        active_debts = Debt.objects.filter(status='active')
        if user_id:
            active_debts = active_debts.filter(user_id=user_id)
        monthly_debt_payments = active_debts.aggregate(total=Sum('monthly_payment'))['total'] or Decimal('0')
        
        total_monthly_expenses = monthly_expenses + monthly_debt_payments
        monthly_net = monthly_income - total_monthly_expenses
        
        # Get current total balance
        current_balance = DashboardService.get_total_balance(user_id)
        
        # Generate projection
        projection_data = []
        balance = float(current_balance)
        
        for i in range(months):
            month_name = (date.today() + timedelta(days=30 * i)).strftime('%b')
            projection_data.append({
                'month': month_name,
                'balance': round(balance, 2),
            })
            balance += float(monthly_net)
        
        return {
            'data': projection_data,
            'final_balance': round(balance, 2),
        }
    
    @classmethod
    def get_dashboard_stats(cls, user_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Get all dashboard statistics
        Consolidates all dashboard data in one method
        """
        mini_projection = cls.get_mini_projection(user_id, 3)
        
        return {
            'total_balance': cls.get_total_balance(user_id),
            'total_income': cls.get_period_income(30, user_id),
            'total_expenses': cls.get_period_expenses(30, user_id),
            'accounts_count': cls.get_accounts_count(user_id),
            'recent_transactions': cls.get_recent_transactions(10, user_id),
            'goals_summary': cls.get_goals_summary(user_id),
            'budget_status': cls.get_budget_status(user_id),
            'top_goals': cls.get_top_goals(user_id),
            'upcoming_payments': cls.get_upcoming_payments(user_id),
            'mini_projection': mini_projection['data'],
            'projection_final_balance': mini_projection['final_balance'],
        }


