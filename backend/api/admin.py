from django.contrib import admin
from .models import User, Account, Category, Transaction, Budget, Goal, Transfer


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'created_at']
    search_fields = ['username', 'email']


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'type', 'balance', 'currency', 'created_at']
    list_filter = ['type', 'currency']
    search_fields = ['name', 'user__email']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'icon', 'user']
    list_filter = ['type']
    search_fields = ['name']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['type', 'amount', 'category', 'account', 'transaction_date', 'user']
    list_filter = ['type', 'transaction_date']
    search_fields = ['description', 'user__email']


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['category', 'amount', 'period_start', 'period_end', 'user']
    list_filter = ['period_start', 'period_end']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['name', 'current_amount', 'target_amount', 'status', 'deadline', 'user']
    list_filter = ['status']
    search_fields = ['name']


@admin.register(Transfer)
class TransferAdmin(admin.ModelAdmin):
    list_display = ['from_account', 'to_account', 'amount', 'transfer_date', 'user']
    list_filter = ['transfer_date']

