"""
Custom exceptions
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class InsufficientBalanceError(APIException):
    """Raised when account has insufficient balance for transaction"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Insufficient balance for this transaction'
    default_code = 'insufficient_balance'


class InvalidTransactionTypeError(APIException):
    """Raised when transaction type is invalid"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid transaction type'
    default_code = 'invalid_transaction_type'


class BudgetExceededError(APIException):
    """Raised when budget is exceeded"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Budget exceeded for this category'
    default_code = 'budget_exceeded'


class GoalAlreadyCompletedError(APIException):
    """Raised when trying to modify a completed goal"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Cannot modify a completed goal'
    default_code = 'goal_already_completed'


