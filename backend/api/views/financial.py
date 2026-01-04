"""
Financial views: Budget, Goal, Transfer, Debt, RecurringTransaction
"""
from decimal import Decimal
from datetime import date, timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import Sum
from api.models import Budget, BudgetHistory, Goal, Transfer, Debt, DebtPayment, Account, Transaction, RecurringTransaction
from api.serializers import BudgetSerializer, BudgetHistorySerializer, GoalSerializer, TransferSerializer, DebtSerializer, DebtPaymentSerializer, RecurringTransactionSerializer
from api.permissions import IsOwnerPermission


class BudgetViewSet(viewsets.ModelViewSet[Budget]):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter budgets by authenticated user"""
        return Budget.objects.filter(user=self.request.user).select_related('category', 'user')
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated user when creating a budget"""
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        """Save history when updating budget"""
        instance = self.get_object()
        
        # Create history entry before updating
        BudgetHistory.objects.create(
            budget=instance,
            previous_amount=instance.amount,
            new_amount=serializer.validated_data.get('amount', instance.amount),
            previous_period_end=instance.period_end,
            new_period_end=serializer.validated_data.get('period_end'),
            changed_by=instance.user,  # Using budget's user since we don't have auth yet
            change_reason=self.request.data.get('change_reason')
        )
        
        serializer.save()
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get budget change history"""
        budget = self.get_object()
        history = budget.history.all()
        serializer = BudgetHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Pause/Resume/Archive budget"""
        budget = self.get_object()
        new_status = request.data.get('status', 'Paused')
        
        if new_status in ['Active', 'Paused', 'Archived']:
            budget.status = new_status
            budget.save()
            serializer = self.get_serializer(budget)
            return Response(serializer.data)
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)


class GoalViewSet(viewsets.ModelViewSet[Goal]):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter goals by authenticated user (via account relationship)"""
        return Goal.objects.filter(user=self.request.user).select_related('account')
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated user when creating a goal"""
        serializer.save(user=self.request.user)


class TransferViewSet(viewsets.ModelViewSet[Transfer]):
    serializer_class = TransferSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter transfers by authenticated user"""
        return Transfer.objects.filter(user=self.request.user).select_related('from_account', 'to_account', 'user')
    
    @transaction.atomic
    def perform_create(self, serializer):
        """Create transfer and update both account balances"""
        # Save transfer
        instance = serializer.save(user=self.request.user)
        
        # Update from_account (subtract)
        from_account = instance.from_account
        from_account.balance -= instance.amount
        from_account.save()
        
        # Update to_account (add)
        to_account = instance.to_account
        to_account.balance += instance.amount
        to_account.save()


class DebtViewSet(viewsets.ModelViewSet[Debt]):
    serializer_class = DebtSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter debts by authenticated user"""
        return Debt.objects.filter(user=self.request.user).prefetch_related('payments')
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated user when creating a debt"""
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        """Recalculate monthly_payment when updating debt"""
        from decimal import Decimal
        
        # Get validated data and current instance
        validated_data = serializer.validated_data
        instance = self.get_object()
        
        # Get values (use new value if provided, otherwise use existing)
        principal = validated_data.get('principal_amount', instance.principal_amount)
        rate = validated_data.get('interest_rate', instance.interest_rate)
        months = validated_data.get('term_months', instance.term_months)
        interest_type = validated_data.get('interest_type', instance.interest_type)
        
        # Recalculate monthly payment
        if interest_type == 'simple':
            # Simple interest: Total = Principal + (Principal × rate × time)
            total_interest = float(principal) * (float(rate) / 100) * (months / 12)
            total_amount = float(principal) + total_interest
            monthly_payment = Decimal(str(total_amount / months))
        else:  # amortized
            if float(rate) == 0:
                monthly_payment = principal / months
            else:
                monthly_rate = float(rate) / 100 / 12
                payment = float(principal) * (monthly_rate * ((1 + monthly_rate) ** months)) / (((1 + monthly_rate) ** months) - 1)
                monthly_payment = Decimal(str(payment))
        
        # Save with recalculated monthly_payment
        serializer.save(monthly_payment=monthly_payment)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_payment(self, request, pk=None):
        """Add a payment to this debt - creates transaction and updates account balance"""
        debt = self.get_object()
        
        # Get payment data
        payment_amount = Decimal(str(request.data.get('amount')))
        payment_date = request.data.get('payment_date')
        notes = request.data.get('notes', '')
        account_id = request.data.get('account')
        
        # Validate account
        if not account_id:
            return Response(
                {'error': 'Debes seleccionar una cuenta para el pago'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # SECURITY FIX: Filter account by user to prevent IDOR
            account = Account.objects.get(id=account_id, user=request.user)
        except Account.DoesNotExist:
            return Response(
                {'error': 'Cuenta no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate sufficient balance
        if account.balance < payment_amount:
            return Response(
                {'error': f'Saldo insuficiente. Disponible: ${account.balance}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create transaction (Expense)
        new_transaction = Transaction.objects.create(
            user=debt.user,
            account=account,
            category=None,  # Debt payments don't have category
            type='Expense',
            amount=payment_amount,
            description=f'Pago de deuda: {debt.creditor_name}' + (f' - {notes}' if notes else ''),
            transaction_date=payment_date
        )
        
        # Update account balance
        account.balance -= payment_amount
        account.save()
        
        # Create payment record
        payment = DebtPayment.objects.create(
            debt=debt,
            account=account,
            transaction=new_transaction,
            amount=payment_amount,
            payment_date=payment_date,
            notes=notes
        )
        
        # Update debt amount_paid
        debt.amount_paid = Decimal(str(debt.amount_paid)) + payment_amount
        
        # Check if debt is fully paid
        if debt.remaining_balance <= 0:
            debt.status = 'Paid'
        
        debt.save()
        
        # Return updated debt
        serializer = self.get_serializer(debt)
        return Response(serializer.data)


class DebtPaymentViewSet(viewsets.ModelViewSet[DebtPayment]):
    serializer_class = DebtPaymentSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter payments by authenticated user (via debt relationship) and optionally by debt"""
        queryset = DebtPayment.objects.filter(debt__user=self.request.user).select_related('debt', 'account')
        
        # Optional: filter by specific debt
        debt_id = self.request.query_params.get('debt')
        if debt_id:
            queryset = queryset.filter(debt_id=debt_id)
        
        return queryset


class RecurringTransactionViewSet(viewsets.ModelViewSet[RecurringTransaction]):
    serializer_class = RecurringTransactionSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter recurring transactions by authenticated user"""
        return RecurringTransaction.objects.filter(user=self.request.user).select_related('user', 'account', 'category')
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated user when creating a recurring transaction"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle active status of recurring transaction"""
        recurring_transaction = self.get_object()
        recurring_transaction.is_active = not recurring_transaction.is_active
        recurring_transaction.save()
        
        serializer = self.get_serializer(recurring_transaction)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def generate_now(self, request, pk=None):
        """Manually generate a transaction for this recurring transaction"""
        recurring_transaction = self.get_object()
        
        if not recurring_transaction.is_active:
            return Response(
                {'error': 'No se puede generar una transacción para una transacción recurrente inactiva'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate transaction
        new_transaction = recurring_transaction.generate_transaction()
        
        # Return updated recurring transaction
        serializer = self.get_serializer(recurring_transaction)
        return Response({
            'recurring_transaction': serializer.data,
            'transaction_id': new_transaction.id,
            'message': 'Transacción generada exitosamente'
        })
    
    @action(detail=False, methods=['get'])
    def projections(self, request):
        """Get financial projections for the next N months (income and expenses)"""
        months = int(request.query_params.get('months', 12))
        include_variable = request.query_params.get('include_variable', 'true').lower() == 'true'
        
        # Get all active recurring transactions for the authenticated user
        active_income_transactions = RecurringTransaction.objects.filter(
            is_active=True, 
            user=request.user,
            transaction_type='Income'
        )
        active_expense_transactions = RecurringTransaction.objects.filter(
            is_active=True,
            user=request.user,
            transaction_type='Expense'
        )
        
        # Calculate variable spending average (last 3 months)
        variable_spending_avg = Decimal('0')
        if include_variable:
            # Get IDs of all recurring transactions to exclude them
            recurring_transaction_ids = set()
            for rt in RecurringTransaction.objects.filter(user=request.user, is_active=True):
                # Get transactions created by this recurring transaction
                # Note: This assumes transactions have a description matching the recurring transaction
                # You might need to adjust this logic based on your actual data model
                pass
            
            # Calculate date range for last 3 months
            today = date.today()
            three_months_ago = today.replace(day=1) - timedelta(days=1)
            for _ in range(2):
                three_months_ago = three_months_ago.replace(day=1) - timedelta(days=1)
            three_months_ago = three_months_ago.replace(day=1)
            
            # Get all non-recurring expenses (expenses not linked to recurring transactions)
            # This is a simplified approach - ideally you'd track which transactions came from recurring ones
            all_expenses = Transaction.objects.filter(
                user=request.user,
                type='Expense',
                transaction_date__gte=three_months_ago,
                transaction_date__lte=today
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
            # Calculate recurring expenses total for the same period
            recurring_expenses_total = Decimal('0')
            for expense in active_expense_transactions:
                # Estimate how many times this recurring expense occurred in 3 months
                if expense.frequency == 'monthly':
                    recurring_expenses_total += expense.amount * 3
                elif expense.frequency == 'biweekly':
                    recurring_expenses_total += expense.amount * 6
                elif expense.frequency == 'weekly':
                    recurring_expenses_total += expense.amount * 12
            
            # Add debt payments for 3 months
            active_debts = Debt.objects.filter(status='Active', user=request.user)
            debt_payments_total = sum(Decimal(str(d.monthly_payment)) * 3 for d in active_debts)
            
            # Variable spending = Total expenses - Recurring expenses - Debt payments
            variable_spending_total = all_expenses - recurring_expenses_total - debt_payments_total
            if variable_spending_total < 0:
                variable_spending_total = Decimal('0')
            
            # Average per month
            variable_spending_avg = variable_spending_total / 3
        
        # Calculate projections by month
        projections_list = []
        today = date.today()
        
        for month_offset in range(months):
            # Calculate first day of target month
            target_month = (today.replace(day=1) + timedelta(days=32 * month_offset)).replace(day=1)
            month_key = target_month.strftime('%Y-%m')
            month_name = target_month.strftime('%B %Y')
            
            # Calculate projected income for this month
            projected_income = Decimal('0')
            for income in active_income_transactions:
                # Skip if end_date is before this month
                if income.end_date and income.end_date < target_month:
                    continue
                
                # Skip if start_date is after this month
                last_day_of_month = (target_month.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                if income.start_date > last_day_of_month:
                    continue
                
                # Calculate occurrences in this month
                occurrences = 0
                if income.frequency == 'monthly':
                    occurrences = 1
                elif income.frequency == 'biweekly':
                    occurrences = 2
                elif income.frequency == 'weekly':
                    # Approximately 4 weeks per month
                    occurrences = 4
                
                projected_income += income.amount * occurrences
            
            # Calculate projected expenses (recurring expenses + debts + variable spending)
            projected_expenses = Decimal('0')
            recurring_expenses = Decimal('0')
            
            # Add recurring expense transactions
            for expense in active_expense_transactions:
                # Skip if end_date is before this month
                if expense.end_date and expense.end_date < target_month:
                    continue
                
                # Skip if start_date is after this month
                last_day_of_month = (target_month.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                if expense.start_date > last_day_of_month:
                    continue
                
                # Calculate occurrences in this month
                occurrences = 0
                if expense.frequency == 'monthly':
                    occurrences = 1
                elif expense.frequency == 'biweekly':
                    occurrences = 2
                elif expense.frequency == 'weekly':
                    # Approximately 4 weeks per month
                    occurrences = 4
                
                recurring_expenses += expense.amount * occurrences
            
            projected_expenses += recurring_expenses
            
            # Add debt payments
            active_debts = Debt.objects.filter(status='Active', user=request.user)
            debt_payments = sum(Decimal(str(d.monthly_payment)) for d in active_debts)
            projected_expenses += debt_payments
            
            # Add variable spending estimate
            if include_variable:
                projected_expenses += variable_spending_avg
            
            # Calculate net balance
            net_balance = projected_income - projected_expenses
            
            # Calculate cumulative balance
            cumulative_balance = net_balance
            if month_offset > 0:
                cumulative_balance += Decimal(str(projections_list[month_offset - 1]['cumulative_balance']))
            
            projections_list.append({
                'month': month_key,
                'month_name': month_name,
                'projected_income': float(projected_income),
                'projected_expenses': float(projected_expenses),
                'recurring_expenses': float(recurring_expenses),
                'debt_payments': float(debt_payments),
                'variable_expenses': float(variable_spending_avg) if include_variable else 0,
                'net_balance': float(net_balance),
                'cumulative_balance': float(cumulative_balance)
            })
        
        return Response({
            'projections': projections_list,
            'total_monthly_income': float(sum(p['projected_income'] for p in projections_list) / len(projections_list)),
            'total_monthly_expenses': float(sum(p['projected_expenses'] for p in projections_list) / len(projections_list)),
            'average_net_balance': float(sum(p['net_balance'] for p in projections_list) / len(projections_list)),
            'variable_spending_estimate': float(variable_spending_avg),
            'include_variable': include_variable
        })


