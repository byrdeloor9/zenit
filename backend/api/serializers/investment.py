"""
Investment serializers
"""
from rest_framework import serializers
from api.models import Investment, InvestmentTransaction


class InvestmentSerializer(serializers.ModelSerializer[Investment]):
    account_name = serializers.CharField(source='account.name', read_only=True, allow_null=True)
    progress_percentage = serializers.SerializerMethodField()
    projected_return = serializers.SerializerMethodField()
    projected_final_value = serializers.SerializerMethodField()
    movements_count = serializers.SerializerMethodField()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter account queryset by authenticated user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from api.models import Account
            self.fields['account'] = serializers.PrimaryKeyRelatedField(
                queryset=Account.objects.filter(user=request.user),
                allow_null=True,
                required=False
            )
    
    class Meta:
        model = Investment
        fields = [
            'id', 'user', 'investment_type', 'name', 'account', 'account_name',
            'initial_amount', 'current_amount', 'target_amount',
            'policy_number', 'institution_name', 'expected_return_rate',
            'maturity_term_months', 'maturity_date',
            'start_date', 'deadline', 'status',
            'notes', 'created_at', 'updated_at', 'last_return_date',
            'progress_percentage', 'projected_return', 'projected_final_value',
            'movements_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'last_return_date']
    
    def get_progress_percentage(self, obj: Investment) -> float:
        return obj.progress_percentage
    
    def get_projected_return(self, obj: Investment) -> float:
        return obj.projected_return
    
    def get_projected_final_value(self, obj: Investment) -> float:
        return obj.projected_final_value
    
    def get_movements_count(self, obj: Investment) -> int:
        return obj.movements.count()
    
    def validate(self, attrs):
        """Validate investment data based on type"""
        investment_type = attrs.get('investment_type')
        
        # Validations for goal
        if investment_type == 'goal':
            if not attrs.get('target_amount'):
                raise serializers.ValidationError({
                    'target_amount': 'El monto objetivo es requerido para metas de ahorro'
                })
        
        # Validations for insurance
        if investment_type == 'insurance':
            if not attrs.get('initial_amount') or attrs.get('initial_amount') <= 0:
                raise serializers.ValidationError({
                    'initial_amount': 'La inversión inicial es requerida para pólizas'
                })
            if not attrs.get('expected_return_rate'):
                raise serializers.ValidationError({
                    'expected_return_rate': 'El rendimiento esperado es requerido para pólizas'
                })
            # Must have either maturity_term_months or maturity_date
            if not attrs.get('maturity_term_months') and not attrs.get('maturity_date'):
                raise serializers.ValidationError({
                    'maturity_term_months': 'Debes especificar el plazo en meses o la fecha de vencimiento'
                })
        
        return attrs


class InvestmentTransactionSerializer(serializers.ModelSerializer[InvestmentTransaction]):
    investment_name = serializers.CharField(source='investment.name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = InvestmentTransaction
        fields = [
            'id', 'investment', 'investment_name', 'transaction_type',
            'amount', 'transaction_date', 'account', 'account_name',
            'notes', 'account_transaction', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'account_transaction']

