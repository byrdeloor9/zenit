"""
Investment models: Investment and InvestmentTransaction
Unified model for savings goals and investment policies
"""
from django.db import models
from decimal import Decimal
from datetime import date


class Investment(models.Model):
    """
    Unified model for savings goals and investment policies
    """
    INVESTMENT_TYPES = [
        ('goal', 'Meta de Ahorro'),
        ('insurance', 'Póliza de Inversión'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Activa'),
        ('completed', 'Completada'),
        ('matured', 'Vencida'),
        ('cancelled', 'Cancelada'),
    ]
    
    # Core fields
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='investments')
    investment_type = models.CharField(max_length=20, choices=INVESTMENT_TYPES)
    name = models.CharField(max_length=200)
    account = models.ForeignKey('Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='investments')
    
    # Amounts
    initial_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)  # Solo para 'goal'
    
    # Para pólizas
    policy_number = models.CharField(max_length=100, null=True, blank=True)
    institution_name = models.CharField(max_length=200, null=True, blank=True)
    expected_return_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # % anual
    maturity_term_months = models.IntegerField(null=True, blank=True)
    maturity_date = models.DateField(null=True, blank=True)
    
    # Dates
    start_date = models.DateField()
    deadline = models.DateField(null=True, blank=True)  # Solo para goals
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # For automatic returns generation (similar to RecurringTransaction.last_generated_date)
    last_return_date = models.DateField(null=True, blank=True, help_text='Última fecha en que se generó un rendimiento')
    
    class Meta:
        db_table = 'investments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'investment_type', 'status']),
        ]
    
    def __str__(self) -> str:
        return f"{self.name} ({self.get_investment_type_display()})"
    
    @property
    def progress_percentage(self) -> float:
        """For goals: current/target * 100"""
        if self.investment_type == 'goal' and self.target_amount and self.target_amount > 0:
            return float((self.current_amount / self.target_amount) * 100)
        return 0.0
    
    @property
    def projected_return(self) -> float:
        """For insurance: calculate expected return"""
        if self.expected_return_rate and self.initial_amount:
            if self.maturity_term_months:
                years = float(self.maturity_term_months) / 12
            else:
                years = 1.0
            return float(self.initial_amount) * (float(self.expected_return_rate) / 100) * years
        return 0.0
    
    @property
    def projected_final_value(self) -> float:
        """Initial + projected return"""
        return float(self.initial_amount) + self.projected_return
    
    def should_generate_return_today(self) -> bool:
        """
        Check if monthly return should be generated today
        Returns are generated on the same day of month as start_date
        Similar to RecurringTransaction.should_generate_today()
        """
        from datetime import date
        
        # Only for insurance policies
        if self.investment_type != 'insurance':
            return False
        
        # Must be active
        if self.status != 'active':
            return False
        
        # Must have expected return rate
        if not self.expected_return_rate:
            return False
        
        today = date.today()
        
        # Check if before start date
        if today < self.start_date:
            return False
        
        # Check if matured
        if self.maturity_date and today > self.maturity_date:
            # Mark as matured
            self.status = 'matured'
            self.save()
            return False
        
        # Check if already generated today
        if self.last_return_date == today:
            return False
        
        # Generate on the same day of month as start_date
        # Example: start_date = 2024-01-15 → generate on day 15 of each month
        return today.day == self.start_date.day
    
    def generate_monthly_return(self):
        """
        Generate monthly return transaction
        Similar to RecurringTransaction.generate_transaction()
        """
        from django.db import transaction as db_transaction
        from decimal import Decimal
        from datetime import date
        
        with db_transaction.atomic():
            # Calculate monthly return (compound interest on current_amount)
            monthly_rate = float(self.expected_return_rate) / 100 / 12
            monthly_return = float(self.current_amount) * monthly_rate
            
            # Get account (use linked account or user's first account)
            account = self.account
            if not account:
                account = self.user.accounts.first()
                if not account:
                    raise ValueError(f"No account available for policy {self.name}")
            
            # Import Transaction model to avoid circular import
            from api.models.transaction import Transaction
            
            # Create Transaction (Income) in the account
            transaction = Transaction.objects.create(
                user=self.user,
                account=account,
                category=None,  # Could create a "Rendimientos" category
                type='Income',
                amount=Decimal(str(monthly_return)),
                description=f'{self.name} (Rendimiento mensual)',
                transaction_date=date.today()
            )
            
            # Update account balance
            account.balance += Decimal(str(monthly_return))
            account.save()
            
            # Create InvestmentTransaction record
            inv_transaction = InvestmentTransaction.objects.create(
                investment=self,
                transaction_type='return',
                amount=Decimal(str(monthly_return)),
                transaction_date=date.today(),
                account=account,
                notes='Rendimiento mensual automático',
                account_transaction=transaction
            )
            
            # Update investment current_amount (compound interest)
            self.current_amount += Decimal(str(monthly_return))
            
            # Update last_return_date
            self.last_return_date = date.today()
            
            self.save()
            
            return inv_transaction


class InvestmentTransaction(models.Model):
    """
    Track contributions and withdrawals
    Always linked to a real Transaction in Account
    """
    TRANSACTION_TYPES = [
        ('contribution', 'Aporte'),
        ('withdrawal', 'Retiro'),
        ('return', 'Rendimiento'),
        ('maturity', 'Vencimiento'),
    ]
    
    investment = models.ForeignKey(Investment, on_delete=models.CASCADE, related_name='movements')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateField()
    account = models.ForeignKey('Account', on_delete=models.CASCADE, related_name='investment_transactions')
    notes = models.TextField(null=True, blank=True)
    
    # Link to account transaction
    account_transaction = models.ForeignKey(
        'Transaction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='investment_movement'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'investment_transactions'
        ordering = ['-transaction_date']
    
    def __str__(self) -> str:
        return f"{self.get_transaction_type_display()}: ${self.amount} - {self.investment.name}"

