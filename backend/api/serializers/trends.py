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

