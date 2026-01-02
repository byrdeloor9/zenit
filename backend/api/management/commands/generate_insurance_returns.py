"""
Management command to generate monthly returns for insurance policies
Run this command DAILY via cron: python manage.py generate_insurance_returns
"""
from django.core.management.base import BaseCommand
from api.models import Investment


class Command(BaseCommand):
    help = 'Generate monthly returns for insurance policies that are due today'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be generated without actually creating transactions',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get all active insurance policies with expected returns
        policies = Investment.objects.filter(
            investment_type='insurance',
            status='active',
            expected_return_rate__isnull=False
        )
        
        generated_count = 0
        skipped_count = 0
        error_count = 0
        
        self.stdout.write(self.style.SUCCESS(
            f'Checking {policies.count()} active insurance policies...'
        ))
        
        for policy in policies:
            try:
                if policy.should_generate_return_today():
                    # Calculate return for display
                    monthly_rate = float(policy.expected_return_rate) / 100 / 12
                    monthly_return = float(policy.current_amount) * monthly_rate
                    
                    if dry_run:
                        self.stdout.write(
                            self.style.WARNING(
                                f'[DRY RUN] Would generate: 💰 {policy.name} - ${monthly_return:.2f} (Rendimiento mensual)'
                            )
                        )
                        generated_count += 1
                    else:
                        inv_tx = policy.generate_monthly_return()
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✓ Generated: 💰 {policy.name} - ${inv_tx.amount} (Rendimiento) [INV TX ID: {inv_tx.id}, ACC TX ID: {inv_tx.account_transaction.id}]'
                            )
                        )
                        generated_count += 1
                else:
                    skipped_count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'✗ Error generating return for {policy.name}: {str(e)}'
                    )
                )
                error_count += 1
                import traceback
                self.stdout.write(traceback.format_exc())
        
        # Summary
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('Summary:'))
        self.stdout.write(f'  Generated: {generated_count}')
        self.stdout.write(f'  Skipped: {skipped_count}')
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'  Errors: {error_count}'))
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('\nThis was a dry run. No transactions were actually created.')
            )
        else:
            self.stdout.write(self.style.SUCCESS('\nCompleted successfully!'))

