"""
Custom filters for querysets
"""
from django.db.models import QuerySet, Q
from datetime import datetime, timedelta
from typing import Optional


class TransactionFilters:
    """
    Utility class for filtering transactions
    """
    
    @staticmethod
    def filter_by_date_range(
        queryset: QuerySet,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> QuerySet:
        """Filter transactions by date range"""
        if start_date:
            queryset = queryset.filter(transaction_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(transaction_date__lte=end_date)
        return queryset
    
    @staticmethod
    def filter_by_type(queryset: QuerySet, transaction_type: Optional[str] = None) -> QuerySet:
        """Filter transactions by type (Income/Expense)"""
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
        return queryset
    
    @staticmethod
    def filter_by_category(queryset: QuerySet, category_id: Optional[int] = None) -> QuerySet:
        """Filter transactions by category"""
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset
    
    @staticmethod
    def filter_by_account(queryset: QuerySet, account_id: Optional[int] = None) -> QuerySet:
        """Filter transactions by account"""
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        return queryset
    
    @staticmethod
    def filter_by_search(queryset: QuerySet, search: Optional[str] = None) -> QuerySet:
        """Search transactions by description or category name"""
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )
        return queryset
    
    @staticmethod
    def filter_last_days(queryset: QuerySet, days: int = 30) -> QuerySet:
        """Filter transactions from last N days"""
        date_threshold = datetime.now().date() - timedelta(days=days)
        return queryset.filter(transaction_date__gte=date_threshold)


class AccountFilters:
    """
    Utility class for filtering accounts
    """
    
    @staticmethod
    def filter_by_type(queryset: QuerySet, account_type: Optional[str] = None) -> QuerySet:
        """Filter accounts by type"""
        if account_type:
            queryset = queryset.filter(type=account_type)
        return queryset
    
    @staticmethod
    def filter_by_currency(queryset: QuerySet, currency: Optional[str] = None) -> QuerySet:
        """Filter accounts by currency"""
        if currency:
            queryset = queryset.filter(currency=currency)
        return queryset


