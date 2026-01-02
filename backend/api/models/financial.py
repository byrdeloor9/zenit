"""
Financial models: Budget, Goal, Transfer, Debt, RecurringIncome
"""
from django.db import models
from datetime import date, timedelta
from decimal import Decimal
from .user import User
from .account import Account
from .transaction import Category, Transaction


class Budget(models.Model):
    """
    Budget model for spending limits per category
    Supports indefinite budgets (no end date) and tracks change history
    """
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Paused', 'Paused'),
        ('Archived', 'Archived'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    period_start = models.DateField()
    period_end = models.DateField(null=True, blank=True)  # Nullable for indefinite budgets
    is_recurring = models.BooleanField(default=False)  # Auto-renew for indefinite budgets
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'budgets'
    
    def __str__(self) -> str:
        return f"Budget: {self.category.name} - {self.amount}"


class BudgetHistory(models.Model):
    """
    Budget change history for tracking modifications over time
    """
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='history')
    previous_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    new_amount = models.DecimalField(max_digits=12, decimal_places=2)
    previous_period_end = models.DateField(null=True, blank=True)
    new_period_end = models.DateField(null=True, blank=True)
    change_reason = models.TextField(null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'budget_history'
        ordering = ['-changed_at']
    
    def __str__(self) -> str:
        return f"Budget change: ${self.previous_amount or 0} → ${self.new_amount}"


class Goal(models.Model):
    """
    Goal model for financial goals tracking
    """
    STATUS_CHOICES = [
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='goals')
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='In Progress')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'goals'
    
    def __str__(self) -> str:
        return f"{self.name} - {self.current_amount}/{self.target_amount}"


class Transfer(models.Model):
    """
    Transfer model for money transfers between accounts
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transfers')
    from_account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transfers_from')
    to_account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transfers_to')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transfer_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'transfers'
    
    def __str__(self) -> str:
        return f"Transfer: {self.amount} from {self.from_account.name} to {self.to_account.name}"


class Debt(models.Model):
    """
    Debt/Loan model for tracking debts with interest and payment schedule
    """
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Paid', 'Paid'),
        ('Cancelled', 'Cancelled'),
    ]
    
    INTEREST_TYPE_CHOICES = [
        ('simple', 'Interés Simple'),
        ('amortized', 'Amortización'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='debts')
    creditor_name = models.CharField(max_length=100)  # Who you owe (e.g., "Mi hermana")
    principal_amount = models.DecimalField(max_digits=12, decimal_places=2)  # Initial debt amount
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)  # Annual interest rate (%)
    interest_type = models.CharField(max_length=20, choices=INTEREST_TYPE_CHOICES, default='simple')  # Type of interest calculation
    term_months = models.IntegerField()  # Number of months to pay
    monthly_payment = models.DecimalField(max_digits=12, decimal_places=2)  # Calculated payment
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)  # Total paid so far
    start_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'debts'
    
    def __str__(self) -> str:
        return f"Debt: {self.creditor_name} - ${self.principal_amount}"
    
    @property
    def total_interest(self) -> float:
        """Calculate total interest to be paid"""
        if self.interest_type == 'simple':
            # Simple interest: I = P × r × t
            return float(self.principal_amount) * (float(self.interest_rate) / 100) * (self.term_months / 12)
        else:
            # Amortized: total payments - principal
            total = float(self.monthly_payment) * self.term_months
            return total - float(self.principal_amount)
    
    @property
    def total_amount(self) -> float:
        """Calculate total amount to pay (principal + interest)"""
        return float(self.principal_amount) + self.total_interest
    
    @property
    def remaining_balance(self) -> float:
        """Calculate remaining balance"""
        return self.total_amount - float(self.amount_paid)
    
    @property
    def payment_progress(self) -> float:
        """Calculate payment progress percentage"""
        if self.total_amount > 0:
            return (float(self.amount_paid) / self.total_amount) * 100
        return 0.0


class DebtPayment(models.Model):
    """
    Debt Payment model for tracking individual debt payments
    """
    debt = models.ForeignKey(Debt, on_delete=models.CASCADE, related_name='payments')
    account = models.ForeignKey('Account', on_delete=models.CASCADE, related_name='debt_payments', null=True, blank=True)  # Account used for payment
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField()
    notes = models.CharField(max_length=255, null=True, blank=True)
    transaction = models.OneToOneField('Transaction', on_delete=models.SET_NULL, null=True, blank=True, related_name='debt_payment')  # Link to transaction
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'debt_payments'
        ordering = ['-payment_date']
    
    def __str__(self) -> str:
        return f"Payment: ${self.amount} - {self.debt.creditor_name}"


class RecurringTransaction(models.Model):
    """
    Recurring Transaction model for automatic transaction generation (income or expenses)
    Examples: salary, rent, subscriptions, utilities, etc.
    """
    TRANSACTION_TYPE_CHOICES = [
        ('Income', 'Ingreso'),
        ('Expense', 'Egreso'),
    ]
    
    FREQUENCY_CHOICES = [
        ('monthly', 'Mensual'),
        ('biweekly', 'Quincenal'),
        ('weekly', 'Semanal'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring_transactions')
    name = models.CharField(max_length=200)  # "Sueldo", "Netflix", "Servicios"
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES, default='Income')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='monthly')
    day_of_period = models.IntegerField()  # Day of month (1-31), or day of fortnight (1-15), or weekday (1-7)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='recurring_transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='recurring_transactions')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # Null = indefinite
    is_active = models.BooleanField(default=True)
    notes = models.TextField(null=True, blank=True)
    last_generated_date = models.DateField(null=True, blank=True)  # Control for generation
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'recurring_transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'start_date', 'transaction_type']),
        ]
    
    def __str__(self) -> str:
        return f"{self.name} - ${self.amount} ({self.get_frequency_display()})"
    
    def should_generate_today(self) -> bool:
        """Check if a transaction should be generated today"""
        if not self.is_active:
            return False
        
        today = date.today()
        
        # Check if before start date
        if today < self.start_date:
            return False
        
        # Check if after end date (if set)
        if self.end_date and today > self.end_date:
            return False
        
        # Check if already generated today
        if self.last_generated_date == today:
            return False
        
        # Check based on frequency
        if self.frequency == 'monthly':
            return self._should_generate_monthly(today)
        elif self.frequency == 'biweekly':
            return self._should_generate_biweekly(today)
        elif self.frequency == 'weekly':
            return self._should_generate_weekly(today)
        
        return False
    
    def _should_generate_monthly(self, check_date: date) -> bool:
        """Check if should generate for monthly frequency"""
        # Generate on the specified day of month
        return check_date.day == self.day_of_period
    
    def _should_generate_biweekly(self, check_date: date) -> bool:
        """Check if should generate for biweekly frequency"""
        # Generate on day_of_period and day_of_period + 15
        return check_date.day == self.day_of_period or check_date.day == (self.day_of_period + 15)
    
    def _should_generate_weekly(self, check_date: date) -> bool:
        """Check if should generate for weekly frequency"""
        # Check if enough days have passed since start_date
        days_since_start = (check_date - self.start_date).days
        
        # Check if it's been a multiple of 7 days
        if days_since_start % 7 != 0:
            return False
        
        # If last_generated_date exists, check it's been at least 7 days
        if self.last_generated_date:
            days_since_last = (check_date - self.last_generated_date).days
            return days_since_last >= 7
        
        return True
    
    def generate_transaction(self) -> Transaction:
        """Generate a transaction for this recurring transaction (income or expense)"""
        # Determine transaction description based on type
        type_label = 'Ingreso' if self.transaction_type == 'Income' else 'Egreso'
        
        transaction = Transaction.objects.create(
            user=self.user,
            account=self.account,
            category=self.category,
            type=self.transaction_type,
            amount=self.amount,
            description=f'{self.name} ({type_label} recurrente)',
            transaction_date=date.today()
        )
        
        # Update account balance based on transaction type
        if self.transaction_type == 'Income':
            self.account.balance = Decimal(str(self.account.balance)) + self.amount
        else:  # Expense
            self.account.balance = Decimal(str(self.account.balance)) - self.amount
        self.account.save()
        
        # Update last generated date
        self.last_generated_date = date.today()
        self.save()
        
        return transaction
    
    def get_next_occurrence(self) -> date:
        """Calculate next occurrence date"""
        today = date.today()
        
        if self.frequency == 'monthly':
            # Next occurrence is on day_of_period of current or next month
            if today.day < self.day_of_period:
                # This month
                try:
                    return today.replace(day=self.day_of_period)
                except ValueError:
                    # Day doesn't exist in this month, go to last day
                    return today.replace(day=1) + timedelta(days=32)
                    # Then get last day of that month
            else:
                # Next month
                next_month = today.replace(day=1) + timedelta(days=32)
                try:
                    return next_month.replace(day=self.day_of_period)
                except ValueError:
                    # Day doesn't exist, use last day of month
                    return (next_month.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        elif self.frequency == 'biweekly':
            # Find next occurrence (either day_of_period or day_of_period + 15)
            day1 = self.day_of_period
            day2 = min(self.day_of_period + 15, 28)  # Cap at 28 to avoid month issues
            
            if today.day < day1:
                return today.replace(day=day1)
            elif today.day < day2:
                return today.replace(day=day2)
            else:
                # Next month, first occurrence
                next_month = today.replace(day=1) + timedelta(days=32)
                return next_month.replace(day=day1)
        
        elif self.frequency == 'weekly':
            # Next occurrence is 7 days from last generated or start date
            if self.last_generated_date:
                return self.last_generated_date + timedelta(days=7)
            else:
                # Calculate next occurrence from start_date
                days_since_start = (today - self.start_date).days
                weeks_passed = days_since_start // 7
                return self.start_date + timedelta(days=(weeks_passed + 1) * 7)
        
        return today
    
    def get_projected_amount(self, months: int = 12) -> dict:
        """Calculate projected income for the next N months"""
        projections = {}
        start = date.today()
        
        for month_offset in range(months):
            # Calculate date for this month
            month_date = (start.replace(day=1) + timedelta(days=32 * month_offset)).replace(day=1)
            month_key = month_date.strftime('%Y-%m')
            
            # Calculate occurrences in this month
            occurrences = 0
            if self.frequency == 'monthly':
                occurrences = 1
            elif self.frequency == 'biweekly':
                occurrences = 2
            elif self.frequency == 'weekly':
                # Approximately 4.33 weeks per month
                occurrences = 4
            
            projections[month_key] = float(self.amount) * occurrences
        
        return projections


