"""
Transaction service
Handles business logic for transactions
"""
from decimal import Decimal
from datetime import date
from typing import Optional

from django.db import transaction as db_transaction
from api.models import Transaction, Account


class TransactionService:
    """
    Service class for transaction-related business logic
    """
    
    @staticmethod
    @db_transaction.atomic
    def create_transaction_with_balance_update(
        user_id: int,
        account_id: int,
        category_id: Optional[int],
        transaction_type: str,
        amount: Decimal,
        transaction_date: date,
        description: Optional[str] = None
    ) -> Transaction:
        """
        Create a transaction and update account balance atomically
        """
        # Create transaction
        new_transaction = Transaction.objects.create(
            user_id=user_id,
            account_id=account_id,
            category_id=category_id,
            type=transaction_type,
            amount=amount,
            transaction_date=transaction_date,
            description=description
        )
        
        # Update account balance
        account = Account.objects.select_for_update().get(id=account_id)
        if transaction_type == 'Income':
            account.balance += amount
        elif transaction_type == 'Expense':
            account.balance -= amount
        account.save()
        
        return new_transaction
    
    @staticmethod
    @db_transaction.atomic
    def delete_transaction_with_balance_update(transaction_id: int) -> None:
        """
        Delete a transaction and revert account balance atomically
        """
        trans = Transaction.objects.select_related('account').get(id=transaction_id)
        account = Account.objects.select_for_update().get(id=trans.account_id)
        
        # Revert balance
        if trans.type == 'Income':
            account.balance -= trans.amount
        elif trans.type == 'Expense':
            account.balance += trans.amount
        account.save()
        
        # Delete transaction
        trans.delete()
    
    @staticmethod
    @db_transaction.atomic
    def update_transaction_with_balance_update(
        transaction_id: int,
        amount: Optional[Decimal] = None,
        transaction_type: Optional[str] = None
    ) -> Transaction:
        """
        Update a transaction and adjust account balance atomically
        Only updates if amount or type changed
        """
        trans = Transaction.objects.select_related('account').get(id=transaction_id)
        account = Account.objects.select_for_update().get(id=trans.account_id)
        
        # Revert old transaction effect
        if trans.type == 'Income':
            account.balance -= trans.amount
        elif trans.type == 'Expense':
            account.balance += trans.amount
        
        # Apply new values
        if amount is not None:
            trans.amount = amount
        if transaction_type is not None:
            trans.type = transaction_type
        
        # Apply new transaction effect
        if trans.type == 'Income':
            account.balance += trans.amount
        elif trans.type == 'Expense':
            account.balance -= trans.amount
        
        account.save()
        trans.save()
        
        return trans


