"""
Custom validators
"""
from django.core.exceptions import ValidationError
from decimal import Decimal
from datetime import date
from typing import Any


def validate_positive_amount(value: Decimal) -> None:
    """Validate that amount is positive"""
    if value <= 0:
        raise ValidationError('Amount must be positive')


def validate_future_date(value: date) -> None:
    """Validate that date is in the future"""
    if value < date.today():
        raise ValidationError('Date must be in the future')


def validate_date_range(start_date: date, end_date: date) -> None:
    """Validate that end date is after start date"""
    if end_date < start_date:
        raise ValidationError('End date must be after start date')


def validate_currency_code(value: str) -> None:
    """Validate currency code (3 characters)"""
    if len(value) != 3:
        raise ValidationError('Currency code must be 3 characters')
    if not value.isalpha():
        raise ValidationError('Currency code must contain only letters')
    if not value.isupper():
        raise ValidationError('Currency code must be uppercase')


