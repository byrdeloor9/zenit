"""
Management command to generate recurring transactions (income and expense)
Run this command daily via cron/scheduler: python manage.py generate_recurring_transactions
"""
from django.core.management.base import BaseCommand
from api.models import RecurringTransaction
from datetime import date


class Command(BaseCommand):
    help = 'Generate transactions for recurring transactions (income/expense) that are due today'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be generated without actually creating transactions',
        )
        parser.add_argument(
            '--type',
            type=str,
            choices=['Income', 'Expense', 'all'],
            default='all',
            help='Filter by transaction type (Income, Expense, or all)',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        transaction_type = options['type']
        
        # Get all active recurring transactions
        queryset = RecurringTransaction.objects.filter(is_active=True)
        
        # Filter by type if specified
        if transaction_type != 'all':
            queryset = queryset.filter(transaction_type=transaction_type)
        
        active_transactions = queryset
        
        generated_count = 0
        skipped_count = 0
        error_count = 0
        
        type_label = f"{transaction_type} " if transaction_type != 'all' else ""
        self.stdout.write(self.style.SUCCESS(
            f'Checking {active_transactions.count()} active {type_label}recurring transactions...'
        ))
        
        for recurring_tx in active_transactions:
            try:
                if recurring_tx.should_generate_today():
                    type_emoji = '💰' if recurring_tx.transaction_type == 'Income' else '💸'
                    type_label = 'Ingreso' if recurring_tx.transaction_type == 'Income' else 'Egreso'
                    
                    if dry_run:
                        self.stdout.write(
                            self.style.WARNING(
                                f'[DRY RUN] Would generate: {type_emoji} {recurring_tx.name} - ${recurring_tx.amount} ({type_label})'
                            )
                        )
                        generated_count += 1
                    else:
                        transaction = recurring_tx.generate_transaction()
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✓ Generated: {type_emoji} {recurring_tx.name} - ${recurring_tx.amount} ({type_label}) [TX ID: {transaction.id}]'
                            )
                        )
                        generated_count += 1
                else:
                    # Provide feedback on WHY it was skipped
                    today = date.today()
                    last_gen = recurring_tx.last_generated_date
                    self.stdout.write(
                        self.style.WARNING(
                            f"  [SKIP] {recurring_tx.name} ({recurring_tx.frequency}): "
                            f"Day {recurring_tx.day_of_period} vs Today {today.day}. "
                            f"Last Gen: {last_gen}"
                        )
                    )
                    skipped_count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'✗ Error generating {recurring_tx.name}: {str(e)}'
                    )
                )
                error_count += 1
        
        # Summary
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS(f'Summary:'))
        self.stdout.write(f'  Generated: {generated_count}')
        self.stdout.write(f'  Skipped: {skipped_count}')
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'  Errors: {error_count}'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nThis was a dry run. No transactions were actually created.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'\nCompleted successfully!'))



