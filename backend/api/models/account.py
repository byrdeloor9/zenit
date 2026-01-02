"""
Account model
"""
from django.db import models
from .user import User


class Account(models.Model):
    """
    Account model representing user's financial accounts
    """
    ACCOUNT_TYPES = [
        ('bank', 'Cuenta bancaria'),
        ('cash', 'Efectivo'),
        ('card', 'Tarjeta'),
        ('investment', 'Inversión'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default='USD')
    color = models.CharField(max_length=7, default='#667eea')  # Hex color code
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accounts'
    
    def __str__(self) -> str:
        return f"{self.name} - {self.user.email}"


