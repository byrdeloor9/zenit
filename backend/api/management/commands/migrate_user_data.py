"""
Django management command to migrate all data from one user to another
"""
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from api.models import (
    User, Account, Category, Transaction, 
    Budget, BudgetHistory, Goal, Transfer, 
    Debt, DebtPayment, RecurringIncome
)


class Command(BaseCommand):
    help = 'Migrate all data from one user to another'

    def add_arguments(self, parser):
        parser.add_argument(
            '--from-user',
            type=int,
            required=True,
            help='Source user ID (data will be moved FROM this user)'
        )
        parser.add_argument(
            '--to-user',
            type=int,
            required=True,
            help='Destination user ID (data will be moved TO this user)'
        )
        parser.add_argument(
            '--no-confirm',
            action='store_true',
            help='Skip confirmation prompt'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        from_user_id = options['from_user']
        to_user_id = options['to_user']
        skip_confirm = options['no_confirm']

        # Validate users exist
        try:
            from_user = User.objects.get(id=from_user_id)
            to_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist as e:
            raise CommandError(f'User not found: {e}')

        if from_user_id == to_user_id:
            raise CommandError('Source and destination users cannot be the same')

        # Count records to migrate
        accounts_count = Account.objects.filter(user_id=from_user_id).count()
        categories_count = Category.objects.filter(user_id=from_user_id).count()
        transactions_count = Transaction.objects.filter(user_id=from_user_id).count()
        budgets_count = Budget.objects.filter(user_id=from_user_id).count()
        goals_count = Goal.objects.filter(user_id=from_user_id).count()
        transfers_count = Transfer.objects.filter(user_id=from_user_id).count()
        debts_count = Debt.objects.filter(user_id=from_user_id).count()
        recurring_incomes_count = RecurringIncome.objects.filter(user_id=from_user_id).count()

        self.stdout.write(self.style.WARNING(f'\n=== Data Migration Summary ==='))
        self.stdout.write(f'FROM: User {from_user_id} ({from_user.email})')
        self.stdout.write(f'TO:   User {to_user_id} ({to_user.email})\n')
        
        self.stdout.write('Records to migrate:')
        self.stdout.write(f'  - Accounts: {accounts_count}')
        self.stdout.write(f'  - Categories: {categories_count}')
        self.stdout.write(f'  - Transactions: {transactions_count}')
        self.stdout.write(f'  - Budgets: {budgets_count}')
        self.stdout.write(f'  - Goals: {goals_count}')
        self.stdout.write(f'  - Transfers: {transfers_count}')
        self.stdout.write(f'  - Debts: {debts_count}')
        self.stdout.write(f'  - Recurring Incomes: {recurring_incomes_count}')
        
        total = (accounts_count + categories_count + transactions_count + 
                budgets_count + goals_count + transfers_count + 
                debts_count + recurring_incomes_count)
        self.stdout.write(f'\nTotal records: {total}\n')

        if total == 0:
            self.stdout.write(self.style.WARNING('No records to migrate.'))
            return

        # Confirm migration
        if not skip_confirm:
            confirm = input('Do you want to proceed with the migration? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.ERROR('Migration cancelled.'))
                return

        # Perform migration
        self.stdout.write('\nMigrating data...')

        # 1. Migrate Accounts
        updated = Account.objects.filter(user_id=from_user_id).update(user_id=to_user_id)
        self.stdout.write(self.style.SUCCESS(f'✓ Migrated {updated} accounts'))

        # 2. Migrate Categories
        updated = Category.objects.filter(user_id=from_user_id).update(user_id=to_user_id)
        self.stdout.write(self.style.SUCCESS(f'✓ Migrated {updated} categories'))

        # 3. Migrate Transactions
        updated = Transaction.objects.filter(user_id=from_user_id).update(user_id=to_user_id)
        self.stdout.write(self.style.SUCCESS(f'✓ Migrated {updated} transactions'))

        # 4. Migrate Budgets
        updated = Budget.objects.filter(user_id=from_user_id).update(user_id=to_user_id)
        self.stdout.write(self.style.SUCCESS(f'✓ Migrated {updated} budgets'))

        # 5. Migrate BudgetHistory (changed_by field)
        updated = BudgetHistory.objects.filter(changed_by_id=from_user_id).update(changed_by_id=to_user_id)
        self.stdout.write(self.style.SUCCESS(f'✓ Migrated {updated} budget history records'))

        # 6. Migrate Goals
        updated = Goal.objects.filter(user_id=from_user_id).update(user_id=to_user_id)
        self.stdout.write(self.style.SUCCESS(f'✓ Migrated {updated} goals'))

        # 7. Migrate Transfers
        updated = Transfer.objects.filter(user_id=from_user_id).update(user_id=to_user_id)
        self.stdout.write(self.style.SUCCESS(f'✓ Migrated {updated} transfers'))

        # 8. Migrate Debts
        updated = Debt.objects.filter(user_id=from_user_id).update(user_id=to_user_id)
        self.stdout.write(self.style.SUCCESS(f'✓ Migrated {updated} debts'))

        # 9. Migrate Recurring Incomes
        updated = RecurringIncome.objects.filter(user_id=from_user_id).update(user_id=to_user_id)
        self.stdout.write(self.style.SUCCESS(f'✓ Migrated {updated} recurring incomes'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Migration completed successfully!'))
        self.stdout.write(f'All data has been migrated from User {from_user_id} to User {to_user_id}')

