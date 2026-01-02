"""
Investment views
"""
from decimal import Decimal
from datetime import date
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from api.models import Investment, InvestmentTransaction, Account, Transaction
from api.serializers import InvestmentSerializer, InvestmentTransactionSerializer
from api.permissions import IsOwnerPermission


class InvestmentViewSet(viewsets.ModelViewSet[Investment]):
    serializer_class = InvestmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter investments by authenticated user"""
        return Investment.objects.filter(user=self.request.user).select_related('account')
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated user when creating an investment"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def contribute(self, request, pk=None):
        """
        Add contribution to investment
        Creates real transaction in account and updates balance
        """
        investment = self.get_object()
        amount = Decimal(str(request.data.get('amount')))
        account_id = request.data.get('account')
        notes = request.data.get('notes', '')
        
        # Validate account
        try:
            account = Account.objects.get(id=account_id, user=request.user)
        except Account.DoesNotExist:
            return Response(
                {'error': 'Cuenta no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate balance
        if account.balance < amount:
            return Response(
                {'error': f'Saldo insuficiente. Disponible: ${account.balance}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create Transaction (Expense - money leaves account)
        trans = Transaction.objects.create(
            user=request.user,
            account=account,
            category=None,  # Could create "Inversiones" category
            type='Expense',
            amount=amount,
            description=f'Aporte a {investment.name}',
            transaction_date=date.today()
        )
        
        # Update account balance
        account.balance -= amount
        account.save()
        
        # Create InvestmentTransaction
        InvestmentTransaction.objects.create(
            investment=investment,
            transaction_type='contribution',
            amount=amount,
            transaction_date=date.today(),
            account=account,
            notes=notes,
            account_transaction=trans
        )
        
        # Update investment
        investment.current_amount += amount
        
        # Check if goal completed
        if investment.investment_type == 'goal' and investment.target_amount:
            if investment.current_amount >= investment.target_amount:
                investment.status = 'completed'
        
        investment.save()
        
        serializer = self.get_serializer(investment)
        return Response({
            'investment': serializer.data,
            'transaction_id': trans.id,
            'message': 'Aporte registrado exitosamente'
        })
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def withdraw(self, request, pk=None):
        """
        Withdraw from investment
        Creates real transaction in account (Income) and updates balance
        """
        investment = self.get_object()
        amount = Decimal(str(request.data.get('amount')))
        account_id = request.data.get('account')
        notes = request.data.get('notes', '')
        
        # Validate account
        try:
            account = Account.objects.get(id=account_id, user=request.user)
        except Account.DoesNotExist:
            return Response(
                {'error': 'Cuenta no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate investment has enough
        if investment.current_amount < amount:
            return Response(
                {'error': f'Monto insuficiente en la inversión. Disponible: ${investment.current_amount}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create Transaction (Income - money enters account)
        trans = Transaction.objects.create(
            user=request.user,
            account=account,
            category=None,
            type='Income',
            amount=amount,
            description=f'Retiro de {investment.name}',
            transaction_date=date.today()
        )
        
        # Update account balance
        account.balance += amount
        account.save()
        
        # Create InvestmentTransaction
        InvestmentTransaction.objects.create(
            investment=investment,
            transaction_type='withdrawal',
            amount=amount,
            transaction_date=date.today(),
            account=account,
            notes=notes,
            account_transaction=trans
        )
        
        # Update investment
        investment.current_amount -= amount
        investment.save()
        
        serializer = self.get_serializer(investment)
        return Response({
            'investment': serializer.data,
            'transaction_id': trans.id,
            'message': 'Retiro registrado exitosamente'
        })
    
    @action(detail=True, methods=['post'])
    def cancel_policy(self, request, pk=None):
        """Cancel an insurance policy"""
        investment = self.get_object()
        
        if investment.investment_type != 'insurance':
            return Response(
                {'error': 'Solo pólizas pueden cancelarse con esta acción'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        investment.status = 'cancelled'
        investment.save()
        
        serializer = self.get_serializer(investment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark investment as completed"""
        investment = self.get_object()
        investment.status = 'completed'
        investment.save()
        
        serializer = self.get_serializer(investment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get investment transaction history"""
        investment = self.get_object()
        movements = investment.movements.all()
        serializer = InvestmentTransactionSerializer(movements, many=True)
        return Response(serializer.data)


class InvestmentTransactionViewSet(viewsets.ReadOnlyModelViewSet[InvestmentTransaction]):
    """
    Read-only viewset for investment transactions
    Transactions are created via Investment.contribute/withdraw actions
    """
    serializer_class = InvestmentTransactionSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter by authenticated user via investment relationship"""
        queryset = InvestmentTransaction.objects.filter(
            investment__user=self.request.user
        ).select_related('investment', 'account', 'account_transaction')
        
        # Optional: filter by investment
        investment_id = self.request.query_params.get('investment')
        if investment_id:
            queryset = queryset.filter(investment_id=investment_id)
        
        return queryset

