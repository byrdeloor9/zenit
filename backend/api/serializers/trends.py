"""
Trends serializers
"""
from rest_framework import serializers
from typing import Dict, Any, List, Optional
from decimal import Decimal


class MonthlyDataSerializer(serializers.Serializer):
    """Serializer for individual month data in trends"""
    month = serializers.CharField()
    amount = serializers.FloatField()
    change_percentage = serializers.FloatField(allow_null=True)
    vs_previous = serializers.CharField()


class CategoryTrendSerializer(serializers.Serializer):
    """Serializer for category spending trends"""
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    category_icon = serializers.CharField(allow_null=True)
    period_months = serializers.IntegerField()
    monthly_data = MonthlyDataSerializer(many=True)
    budget_reference = serializers.FloatField(allow_null=True)
    average_spending = serializers.FloatField()
    total_spending = serializers.FloatField()


class CategoryOverviewSerializer(serializers.Serializer):
    """Serializer for category overview in trends list"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    icon = serializers.CharField(allow_null=True)
    type = serializers.CharField()


class TrendsOverviewSerializer(serializers.Serializer):
    """Serializer for trends overview (list of categories)"""
    categories = CategoryOverviewSerializer(many=True)


class GlobalMonthlyDataSerializer(serializers.Serializer):
    """Serializer for global monthly income/expense data"""
    month = serializers.CharField()
    income = serializers.FloatField()
    expenses = serializers.FloatField()
    net = serializers.FloatField()


class GlobalTrendsSerializer(serializers.Serializer):
    """Serializer for global spending trends"""
    monthly_data = GlobalMonthlyDataSerializer(many=True)
    total_income = serializers.FloatField()
    total_expenses = serializers.FloatField()
    net_balance = serializers.FloatField()
    average_monthly_income = serializers.FloatField()
    average_monthly_expenses = serializers.FloatField()


class CategoryDistributionItemSerializer(serializers.Serializer):
    """Serializer for individual category in distribution"""
    category_id = serializers.IntegerField()
    category_name = serializers.CharField()
    category_icon = serializers.CharField()
    amount = serializers.FloatField()
    percentage = serializers.FloatField()


class CategoryDistributionSerializer(serializers.Serializer):
    """Serializer for category distribution (pie chart data)"""
    distribution = CategoryDistributionItemSerializer(many=True)
    total_expenses = serializers.FloatField()
    period_start = serializers.CharField()
    period_end = serializers.CharField()


class PeriodDataSerializer(serializers.Serializer):
    """Serializer for period comparison data"""
    income = serializers.FloatField()
    expenses = serializers.FloatField()
    net = serializers.FloatField()
    start_date = serializers.CharField()
    end_date = serializers.CharField()


class ChangeDataSerializer(serializers.Serializer):
    """Serializer for change percentages"""
    income_percent = serializers.FloatField()
    expenses_percent = serializers.FloatField()


class SpendingComparisonSerializer(serializers.Serializer):
    """Serializer for spending comparison"""
    period_type = serializers.CharField()
    current = PeriodDataSerializer()
    previous = PeriodDataSerializer()
    change = ChangeDataSerializer()


