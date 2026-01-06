"""
Financial serializers: Budget, Goal, Transfer, Debt, RecurringIncome
"""
from decimal import Decimal
from datetime import date, timedelta
from rest_framework import serializers
from django.db.models import Sum, Q
from api.models import Budget, BudgetHistory, Goal, Transfer, Transaction, Debt, DebtPayment, RecurringTransaction


class BudgetSerializer(serializers.ModelSerializer[Budget]):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()
    history_count = serializers.SerializerMethodField()
    is_indefinite = serializers.SerializerMethodField()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter category queryset by authenticated user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from api.models import Category
            self.fields['category'] = serializers.PrimaryKeyRelatedField(
                queryset=Category.objects.filter(user=request.user)
            )
    
    class Meta:
        model = Budget
        fields = [
            'id', 'user', 'category', 'category_name', 'category_icon',
            'amount', 'period_start', 'period_end', 'is_recurring', 'status',
            'created_at', 'updated_at',
            'spent', 'remaining', 'percentage', 'days_left', 'history_count', 'is_indefinite'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def get_spent(self, obj: Budget) -> float:
        """Calculate total spent in current month for the category"""
        today = date.today()
        
        # Always calculate for current month
        month_start = today.replace(day=1)
        
        # Get last day of current month
        if today.month == 12:
            month_end = today.replace(day=31)
        else:
            month_end = (today.replace(day=1, month=today.month + 1) - timedelta(days=1))
        
        # Build filter conditions
        filters = {
            'user': obj.user,
            'category': obj.category,
            'type': 'Expense',
            'transaction_date__gte': month_start,
            'transaction_date__lte': month_end,
        }
        
        result = Transaction.objects.filter(**filters).aggregate(total=Sum('amount'))
        
        total = result['total'] or Decimal('0')
        return float(total)
    
    def get_remaining(self, obj: Budget) -> float:
        """Calculate remaining budget"""
        spent = self.get_spent(obj)
        return float(obj.amount) - spent
    
    def get_percentage(self, obj: Budget) -> float:
        """Calculate percentage of budget used"""
        spent = self.get_spent(obj)
        if obj.amount > 0:
            return round((spent / float(obj.amount)) * 100, 2)
        return 0.0
    
    def get_days_left(self, obj: Budget) -> int | None:
        """Calculate days left in current month (None if indefinite/recurring)"""
        # Recurring budgets don't have a specific end date
        if obj.is_recurring or obj.period_end is None:
            return None
        
        today = date.today()
        
        # Get last day of current month
        if today.month == 12:
            month_end = today.replace(day=31)
        else:
            month_end = (today.replace(day=1, month=today.month + 1) - timedelta(days=1))
        
        return (month_end - today).days
    
    def get_history_count(self, obj: Budget) -> int:
        """Count of historical changes"""
        return obj.history.count()
    
    def get_is_indefinite(self, obj: Budget) -> bool:
        """Check if budget has no end date"""
        return obj.period_end is None


class BudgetHistorySerializer(serializers.ModelSerializer[BudgetHistory]):
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = BudgetHistory
        fields = [
            'id', 'budget', 'previous_amount', 'new_amount',
            'previous_period_end', 'new_period_end',
            'change_reason', 'changed_at', 'changed_by_username'
        ]
        read_only_fields = ['id', 'changed_at']


class GoalSerializer(serializers.ModelSerializer[Goal]):
    progress_percentage = serializers.SerializerMethodField()
    account_name = serializers.CharField(source='account.name', read_only=True, allow_null=True)
    account_id = serializers.IntegerField(source='account.id', read_only=True, allow_null=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter account queryset by authenticated user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from api.models import Account
            self.fields['account'] = serializers.PrimaryKeyRelatedField(
                queryset=Account.objects.filter(user=request.user),
                allow_null=True
            )
    
    class Meta:
        model = Goal
        fields = [
            'id', 'user', 'account', 'account_id', 'account_name',
            'name', 'target_amount', 'current_amount',
            'deadline', 'status', 'progress_percentage', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'user']
    
    def get_progress_percentage(self, obj: Goal) -> float:
        if obj.target_amount > 0:
            return round((obj.current_amount / obj.target_amount) * 100, 2)
        return 0.0


class TransferSerializer(serializers.ModelSerializer[Transfer]):
    # Read-only fields for display
    from_account_name = serializers.CharField(source='from_account.name', read_only=True)
    to_account_name = serializers.CharField(source='to_account.name', read_only=True)
    from_account_id = serializers.IntegerField(source='from_account.id', read_only=True)
    to_account_id = serializers.IntegerField(source='to_account.id', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter account querysets by authenticated user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from api.models import Account
            account_queryset = Account.objects.filter(user=request.user)
            self.fields['from_account'] = serializers.PrimaryKeyRelatedField(
                queryset=account_queryset
            )
            self.fields['to_account'] = serializers.PrimaryKeyRelatedField(
                queryset=account_queryset
            )
    
    def validate(self, attrs):
        """Validate that transfer doesn't exceed available balance (considering goals)"""
        from_account = attrs.get('from_account')
        amount = attrs.get('amount', Decimal('0'))
        
        if from_account:
            # Calculate committed to goals
            committed = Goal.objects.filter(
                account=from_account,
                status='In Progress'
            ).aggregate(total=Sum('current_amount'))['total'] or Decimal('0')
            
            # Calculate available balance
            available = from_account.balance - committed
            
            # Check if transfer would exceed available balance
            if amount > available:
                raise serializers.ValidationError({
                    'amount': f'Saldo insuficiente en {from_account.name}. Disponible: ${float(available):.2f} (${float(committed):.2f} comprometido en metas)'
                })
        
        return attrs
    
    class Meta:
        model = Transfer
        fields = [
            'id', 'user', 'user_id', 'from_account', 'from_account_id', 'from_account_name',
            'to_account', 'to_account_id', 'to_account_name', 'amount', 'transfer_date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'user']


class DebtSerializer(serializers.ModelSerializer[Debt]):
    total_interest = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    remaining_balance = serializers.SerializerMethodField()
    payment_progress = serializers.SerializerMethodField()
    payments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Debt
        fields = [
            'id', 'user', 'creditor_name', 'principal_amount', 'interest_rate', 'interest_type',
            'term_months', 'monthly_payment', 'amount_paid', 'start_date', 'status',
            'notes', 'created_at', 'total_interest', 'total_amount', 
            'remaining_balance', 'payment_progress', 'payments_count'
        ]
        read_only_fields = ['id', 'created_at', 'user']
    
    def get_total_interest(self, obj: Debt) -> float:
        return obj.total_interest
    
    def get_total_amount(self, obj: Debt) -> float:
        return obj.total_amount
    
    def get_remaining_balance(self, obj: Debt) -> float:
        return obj.remaining_balance
    
    def get_payment_progress(self, obj: Debt) -> float:
        return obj.payment_progress
    
    def get_payments_count(self, obj: Debt) -> int:
        return obj.payments.count()


class DebtPaymentSerializer(serializers.ModelSerializer[DebtPayment]):
    debt_creditor = serializers.CharField(source='debt.creditor_name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True, allow_null=True)
    account_id = serializers.IntegerField(source='account.id', read_only=True, allow_null=True)
    
    class Meta:
        model = DebtPayment
        fields = [
            'id', 'debt', 'debt_creditor', 'account', 'account_id', 'account_name', 
            'amount', 'payment_date', 'notes', 'transaction', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'transaction']


class RecurringTransactionSerializer(serializers.ModelSerializer[RecurringTransaction]):
    account_name = serializers.CharField(source='account.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    next_occurrence = serializers.SerializerMethodField()
    total_generated = serializers.SerializerMethodField()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter account and category querysets by authenticated user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from api.models import Account, Category
            self.fields['account'] = serializers.PrimaryKeyRelatedField(
                queryset=Account.objects.filter(user=request.user)
            )
            # Category filtering will be done in validation based on transaction_type
            self.fields['category'] = serializers.PrimaryKeyRelatedField(
                queryset=Category.objects.filter(user=request.user),
                allow_null=True,
                required=False
            )
    
    class Meta:
        model = RecurringTransaction
        fields = [
            'id', 'user', 'name', 'transaction_type', 'amount', 'frequency', 'day_of_period',
            'account', 'account_name', 'category', 'category_name',
            'start_date', 'end_date', 'is_active', 'notes',
            'last_generated_date', 'created_at',
            'next_occurrence', 'total_generated'
        ]
        read_only_fields = ['id', 'created_at', 'last_generated_date', 'user']
    
    def get_next_occurrence(self, obj: RecurringTransaction) -> str:
        """Get next occurrence date"""
        next_date = obj.get_next_occurrence()
        return next_date.isoformat()
    
    def get_total_generated(self, obj: RecurringTransaction) -> int:
        """Count transactions generated by this recurring transaction"""
        return Transaction.objects.filter(
            user=obj.user,
            account=obj.account,
            category=obj.category,
            type=obj.transaction_type,
            description__icontains=obj.name
        ).count()
    
    def validate(self, attrs):
        """Validate recurring transaction data"""
        frequency = attrs.get('frequency')
        day_of_period = attrs.get('day_of_period')
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        transaction_type = attrs.get('transaction_type')
        category = attrs.get('category')
        
        # Validate category type matches transaction type
        if category and transaction_type:
            if category.type != transaction_type:
                raise serializers.ValidationError({
                    'category': f'La categoría debe ser de tipo {transaction_type}'
                })
        
        # Validate day_of_period based on frequency
        if frequency == 'monthly' and day_of_period:
            if day_of_period < 1 or day_of_period > 31:
                raise serializers.ValidationError({
                    'day_of_period': 'Para frecuencia mensual, el día debe estar entre 1 y 31'
                })
        
        elif frequency == 'biweekly' and day_of_period:
            if day_of_period < 1 or day_of_period > 15:
                raise serializers.ValidationError({
                    'day_of_period': 'Para frecuencia quincenal, el día debe estar entre 1 y 15'
                })
        
        elif frequency == 'weekly' and day_of_period:
            if day_of_period < 1 or day_of_period > 7:
                raise serializers.ValidationError({
                    'day_of_period': 'Para frecuencia semanal, el día debe estar entre 1 (Lunes) y 7 (Domingo)'
                })
        
        # Validate dates
        if start_date and end_date:
            if end_date < start_date:
                raise serializers.ValidationError({
                    'end_date': 'La fecha de fin debe ser posterior a la fecha de inicio'
                })
        
        return attrs


