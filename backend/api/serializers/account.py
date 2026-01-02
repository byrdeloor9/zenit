"""
Account serializers
"""
from decimal import Decimal
from rest_framework import serializers
from django.db.models import Sum
from api.models import Account


class AccountSerializer(serializers.ModelSerializer[Account]):
    committed_to_goals = serializers.SerializerMethodField()
    available_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Account
        fields = ['id', 'user', 'name', 'type', 'balance', 'currency', 'color', 'committed_to_goals', 'available_balance', 'created_at']
        read_only_fields = ['id', 'created_at', 'user']
    
    def get_committed_to_goals(self, obj: Account) -> float:
        """Calculate total committed to active investments linked to this account"""
        from api.models import Investment
        
        # Sum all active investments (goals and insurance policies)
        investments_total = Investment.objects.filter(
            account=obj,
            status='active'
        ).aggregate(total=Sum('current_amount'))['total'] or Decimal('0')
        
        return float(investments_total)
    
    def get_available_balance(self, obj: Account) -> float:
        """Calculate available balance (total - committed to goals/investments)"""
        committed = self.get_committed_to_goals(obj)
        return float(obj.balance) - committed


