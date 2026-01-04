"""
Trends service
Handles business logic for spending trends analysis
"""
from django.db.models import Sum, QuerySet
from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import Dict, Any, Optional, List
from calendar import monthrange

from api.models import Transaction, Budget, Category


class TrendsService:
    """
    Service class for trends-related business logic
    """
    
    @staticmethod
    def get_categories_with_budgets(user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get list of categories that have at least one active budget
        
        Args:
            user_id: Optional user ID to filter by
            
        Returns:
            List of dictionaries with category information
        """
        budgets = Budget.objects.select_related('category').filter(status='Active')
        if user_id:
            budgets = budgets.filter(user_id=user_id)
        
        # Get unique categories with budgets
        category_ids = budgets.values_list('category_id', flat=True).distinct()
        categories = Category.objects.filter(id__in=category_ids)
        
        result = []
        for category in categories:
            result.append({
                'id': category.id,
                'name': category.name,
                'icon': category.icon,
                'type': category.type,
            })
        
        return result
    
    @staticmethod
    def get_budget_reference_line(user_id: int, category_id: int) -> Optional[Decimal]:
        """
        Get current active budget amount for a category as reference line
        
        Args:
            user_id: User ID
            category_id: Category ID
            
        Returns:
            Budget amount or None if no active budget exists
        """
        try:
            budget = Budget.objects.filter(
                user_id=user_id,
                category_id=category_id,
                status='Active'
            ).latest('created_at')
            return budget.amount
        except Budget.DoesNotExist:
            return None
    
    @staticmethod
    def get_category_spending_trends(
        user_id: int, 
        category_id: int, 
        months: int = 6
    ) -> Dict[str, Any]:
        """
        Get monthly spending trends for a specific category
        
        Args:
            user_id: User ID
            category_id: Category ID
            months: Number of months to analyze (3, 6, or 12)
            
        Returns:
            Dictionary with monthly spending data and trend information
        """
        # Validate months parameter
        if months not in [3, 6, 12]:
            months = 6  # Default to 6 months
        
        # Calculate date range
        today = date.today()
        # Go back N months from today
        start_date = today.replace(day=1) - timedelta(days=1)  # Last day of previous month
        for _ in range(months - 1):
            start_date = start_date.replace(day=1) - timedelta(days=1)  # Move to previous month's last day
        start_date = start_date.replace(day=1)  # First day of the starting month
        
        # Query expenses for this category in the date range
        expenses = Transaction.objects.filter(
            user_id=user_id,
            category_id=category_id,
            type='Expense',
            transaction_date__gte=start_date
        ).order_by('transaction_date')
        
        # Group expenses by month (YYYY-MM format)
        monthly_spending: Dict[str, Decimal] = {}
        
        # Initialize all months with 0
        current_month = start_date
        while current_month <= today:
            month_key = current_month.strftime('%Y-%m')
            monthly_spending[month_key] = Decimal('0')
            
            # Move to next month
            if current_month.month == 12:
                current_month = current_month.replace(year=current_month.year + 1, month=1)
            else:
                current_month = current_month.replace(month=current_month.month + 1)
        
        # Aggregate expenses by month
        for expense in expenses:
            month_key = expense.transaction_date.strftime('%Y-%m')
            if month_key not in monthly_spending:
                monthly_spending[month_key] = Decimal('0')
            monthly_spending[month_key] += expense.amount
        
        # Convert to list format with month names
        monthly_data = []
        total_spending = Decimal('0')
        previous_amount: Optional[Decimal] = None
        
        # Sort months chronologically
        sorted_months = sorted(monthly_spending.keys())
        
        for month_key in sorted_months:
            amount = monthly_spending[month_key]
            total_spending += amount
            
            # Calculate change percentage vs previous month
            change_percentage: Optional[float] = None
            vs_previous = "stable"
            
            if previous_amount is not None and previous_amount > 0:
                change_percentage = float((amount - previous_amount) / previous_amount * 100)
                if change_percentage > 1:
                    vs_previous = "increase"
                elif change_percentage < -1:
                    vs_previous = "decrease"
                else:
                    vs_previous = "stable"
            elif previous_amount == Decimal('0') and amount > 0:
                vs_previous = "increase"
            
            monthly_data.append({
                'month': month_key,
                'amount': float(amount),
                'change_percentage': round(change_percentage, 2) if change_percentage is not None else None,
                'vs_previous': vs_previous
            })
            
            previous_amount = amount
        
        # Calculate average spending
        avg_spending = total_spending / Decimal(str(len(monthly_data))) if len(monthly_data) > 0 else Decimal('0')
        
        return {
            'monthly_data': monthly_data,
            'average_spending': float(avg_spending),
            'total_spending': float(total_spending),
        }
    
    @staticmethod
    def get_category_trends_with_budget(
        user_id: int,
        category_id: int,
        months: int = 6
    ) -> Dict[str, Any]:
        """
        Get complete trends data for a category including budget reference
        
        Args:
            user_id: User ID
            category_id: Category ID
            months: Number of months to analyze
            
        Returns:
            Complete dictionary with trends, budget, and category info
        """
        # Get category info
        try:
            category = Category.objects.get(id=category_id, user_id=user_id)
        except Category.DoesNotExist:
            raise ValueError(f"Category {category_id} not found for user {user_id}")
        
        # Get spending trends
        trends = TrendsService.get_category_spending_trends(user_id, category_id, months)
        
        # Get budget reference line
        budget_reference = TrendsService.get_budget_reference_line(user_id, category_id)
        
        return {
            'category_id': category.id,
            'category_name': category.name,
            'category_icon': category.icon,
            'period_months': months,
            'monthly_data': trends['monthly_data'],
            'budget_reference': float(budget_reference) if budget_reference is not None else None,
            'average_spending': trends['average_spending'],
            'total_spending': trends['total_spending'],
        }
    
    @staticmethod
    def get_global_spending_trends(
        user_id: int,
        months: int = 12
    ) -> Dict[str, Any]:
        """
        Get global spending trends (total income vs expenses) for all categories
        
        Args:
            user_id: User ID
            months: Number of months to analyze (default 12)
            
        Returns:
            Dictionary with monthly income/expense data
        """
        # Calculate date range
        today = date.today()
        start_date = today.replace(day=1) - timedelta(days=1)
        for _ in range(months - 1):
            start_date = start_date.replace(day=1) - timedelta(days=1)
        start_date = start_date.replace(day=1)
        
        # Query all transactions in date range
        transactions = Transaction.objects.filter(
            user_id=user_id,
            transaction_date__gte=start_date
        ).order_by('transaction_date')
        
        # Group by month
        monthly_data: Dict[str, Dict[str, Decimal]] = {}
        
        # Initialize all months
        current_month = start_date
        while current_month <= today:
            month_key = current_month.strftime('%Y-%m')
            monthly_data[month_key] = {
                'income': Decimal('0'),
                'expenses': Decimal('0')
            }
            
            if current_month.month == 12:
                current_month = current_month.replace(year=current_month.year + 1, month=1)
            else:
                current_month = current_month.replace(month=current_month.month + 1)
        
        # Aggregate transactions
        for transaction in transactions:
            month_key = transaction.transaction_date.strftime('%Y-%m')
            if month_key in monthly_data:
                if transaction.type == 'Income':
                    monthly_data[month_key]['income'] += transaction.amount
                elif transaction.type == 'Expense':
                    monthly_data[month_key]['expenses'] += transaction.amount
        
        # Convert to list format
        result = []
        total_income = Decimal('0')
        total_expenses = Decimal('0')
        
        for month_key in sorted(monthly_data.keys()):
            income = monthly_data[month_key]['income']
            expenses = monthly_data[month_key]['expenses']
            net = income - expenses
            
            total_income += income
            total_expenses += expenses
            
            result.append({
                'month': month_key,
                'income': float(income),
                'expenses': float(expenses),
                'net': float(net)
            })
        
        return {
            'monthly_data': result,
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'net_balance': float(total_income - total_expenses),
            'average_monthly_income': float(total_income / Decimal(str(months))) if months > 0 else 0,
            'average_monthly_expenses': float(total_expenses / Decimal(str(months))) if months > 0 else 0,
        }
    
    @staticmethod
    def get_category_distribution(
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Get spending distribution by category for pie/donut charts
        
        Args:
            user_id: User ID
            start_date: Optional start date (defaults to first day of current month)
            end_date: Optional end date (defaults to today)
            
        Returns:
            Dictionary with category breakdown
        """
        # Default to current month if no dates provided
        if start_date is None:
            start_date = date.today().replace(day=1)
        if end_date is None:
            end_date = date.today()
        
        # Query expenses in date range, grouped by category
        expenses = Transaction.objects.filter(
            user_id=user_id,
            type='Expense',
            transaction_date__gte=start_date,
            transaction_date__lte=end_date
        ).select_related('category')
        
        # Aggregate by category
        category_totals: Dict[int, Dict[str, Any]] = {}
        total_expenses = Decimal('0')
        
        for expense in expenses:
            category_id = expense.category_id if expense.category_id else 0
            category_name = expense.category.name if expense.category else 'Sin Categoría'
            category_icon = expense.category.icon if expense.category else '❓'
            
            if category_id not in category_totals:
                category_totals[category_id] = {
                    'id': category_id,
                    'name': category_name,
                    'icon': category_icon,
                    'amount': Decimal('0')
                }
            
            category_totals[category_id]['amount'] += expense.amount
            total_expenses += expense.amount
        
        # Convert to list and calculate percentages
        distribution = []
        for cat_data in category_totals.values():
            amount = cat_data['amount']
            percentage = float((amount / total_expenses * 100)) if total_expenses > 0 else 0
            
            distribution.append({
                'category_id': cat_data['id'],
                'category_name': cat_data['name'],
                'category_icon': cat_data['icon'],
                'amount': float(amount),
                'percentage': round(percentage, 2)
            })
        
        # Sort by amount descending
        distribution.sort(key=lambda x: x['amount'], reverse=True)
        
        return {
            'distribution': distribution,
            'total_expenses': float(total_expenses),
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat()
        }
    
    @staticmethod
    def get_spending_comparison(
        user_id: int,
        period_type: str = 'month'  # 'month' or 'year'
    ) -> Dict[str, Any]:
        """
        Compare current period spending vs previous period
        
        Args:
            user_id: User ID
            period_type: 'month' or 'year'
            
        Returns:
            Comparison data with change percentages
        """
        today = date.today()
        
        if period_type == 'month':
            # Current month
            current_start = today.replace(day=1)
            current_end = today
            
            # Previous month
            prev_end = current_start - timedelta(days=1)
            prev_start = prev_end.replace(day=1)
        else:  # year
            # Current year
            current_start = today.replace(month=1, day=1)
            current_end = today
            
            # Previous year
            prev_start = current_start.replace(year=current_start.year - 1)
            prev_end = prev_start.replace(month=12, day=31)
        
        # Get current period totals
        current_income = Transaction.objects.filter(
            user_id=user_id,
            type='Income',
            transaction_date__gte=current_start,
            transaction_date__lte=current_end
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        current_expenses = Transaction.objects.filter(
            user_id=user_id,
            type='Expense',
            transaction_date__gte=current_start,
            transaction_date__lte=current_end
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Get previous period totals
        prev_income = Transaction.objects.filter(
            user_id=user_id,
            type='Income',
            transaction_date__gte=prev_start,
            transaction_date__lte=prev_end
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        prev_expenses = Transaction.objects.filter(
            user_id=user_id,
            type='Expense',
            transaction_date__gte=prev_start,
            transaction_date__lte=prev_end
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Calculate changes
        income_change = float((current_income - prev_income) / prev_income * 100) if prev_income > 0 else 0
        expenses_change = float((current_expenses - prev_expenses) / prev_expenses * 100) if prev_expenses > 0 else 0
        
        return {
            'period_type': period_type,
            'current': {
                'income': float(current_income),
                'expenses': float(current_expenses),
                'net': float(current_income - current_expenses),
                'start_date': current_start.isoformat(),
                'end_date': current_end.isoformat()
            },
            'previous': {
                'income': float(prev_income),
                'expenses': float(prev_expenses),
                'net': float(prev_income - prev_expenses),
                'start_date': prev_start.isoformat(),
                'end_date': prev_end.isoformat()
            },
            'change': {
                'income_percent': round(income_change, 2),
                'expenses_percent': round(expenses_change, 2)
            }
        }

