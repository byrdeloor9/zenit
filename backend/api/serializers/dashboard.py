"""
Dashboard serializers
"""
from rest_framework import serializers
from typing import Dict, Any
from .transaction import TransactionSerializer


class DashboardStatsSerializer(serializers.Serializer[Dict[str, Any]]):
    """
    Serializer for dashboard statistics
    """
    total_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    accounts_count = serializers.IntegerField()
    recent_transactions = TransactionSerializer(many=True)
    goals_summary = serializers.DictField()


