"""
Transaction and Category serializers
"""
from rest_framework import serializers
from api.models import Category, Transaction


class CategorySerializer(serializers.ModelSerializer[Category]):
    class Meta:
        model = Category
        fields = ['id', 'user', 'name', 'type', 'icon']
        read_only_fields = ['id', 'user']


class TransactionSerializer(serializers.ModelSerializer[Transaction]):
    # Read-only fields for display
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True, allow_null=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    account_id = serializers.IntegerField(source='account.id', read_only=True)
    category_id = serializers.IntegerField(source='category.id', read_only=True, allow_null=True)
    
    # Write-only fields for creating/updating
    # Note: queryset is set in __init__ to avoid circular imports
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Import here to avoid circular imports
        from api.models import Account
        
        # Get request from context to filter querysets by user
        request = self.context.get('request')
        
        # Define write-only fields dynamically, filtered by authenticated user
        if request and hasattr(request, 'user'):
            self.fields['account'] = serializers.PrimaryKeyRelatedField(
                write_only=True, 
                queryset=Account.objects.filter(user=request.user)
            )
            self.fields['category'] = serializers.PrimaryKeyRelatedField(
                write_only=True, 
                allow_null=True, 
                required=False, 
                queryset=Category.objects.filter(user=request.user)
            )
        else:
            # Fallback for cases without request (e.g., nested serializers)
            self.fields['account'] = serializers.PrimaryKeyRelatedField(
                write_only=True, 
                queryset=Account.objects.all()
            )
            self.fields['category'] = serializers.PrimaryKeyRelatedField(
                write_only=True, 
                allow_null=True, 
                required=False, 
                queryset=Category.objects.all()
            )
    
    def validate(self, attrs):
        """Validate that expenses don't exceed available balance (considering goals)"""
        from api.models import Goal, Account
        from decimal import Decimal
        from django.db.models import Sum
        
        # Only validate for Expense transactions
        if attrs.get('type') == 'Expense':
            account = attrs.get('account')
            amount = attrs.get('amount', Decimal('0'))
            
            if account:
                # Simple validation: check if amount exceeds total balance
                if amount > account.balance:
                    raise serializers.ValidationError({
                        'amount': f'Saldo insuficiente. Disponible: ${float(account.balance):.2f}'
                    })
                
                # Optional: Warning if spending from committed funds (commented out)
                # committed = Goal.objects.filter(
                #     account=account,
                #     status='In Progress'
                # ).aggregate(total=Sum('current_amount'))['total'] or Decimal('0')
                # 
                # available = account.balance - committed
                # 
                # if amount > available:
                #     raise serializers.ValidationError({
                #         'amount': f'Saldo insuficiente. Disponible: ${float(available):.2f} (${float(committed):.2f} comprometido en metas)'
                #     })
        
        return attrs
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_id', 'account', 'account_id', 'account_name', 
            'category', 'category_id', 'category_name', 'category_icon',
            'type', 'amount', 'description', 'transaction_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'user']


