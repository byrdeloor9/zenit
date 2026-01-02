"""
Transaction and Category views
"""
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from api.models import Category, Transaction
from api.serializers import CategorySerializer, TransactionSerializer
from api.permissions import IsOwnerPermission


class CategoryViewSet(viewsets.ModelViewSet[Category]):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter categories by authenticated user"""
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated user when creating a category"""
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet[Transaction]):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter transactions by authenticated user"""
        return Transaction.objects.filter(user=self.request.user).select_related('account', 'category', 'user')
    
    @transaction.atomic
    def perform_create(self, serializer):
        """Create transaction and update account balance"""
        # Save transaction
        instance = serializer.save(user=self.request.user)
        
        # Update account balance
        account = instance.account
        if instance.type == 'Income':
            account.balance += instance.amount
        elif instance.type == 'Expense':
            account.balance -= instance.amount
        
        account.save()
    
    def create(self, request, *args, **kwargs):
        """Override create to add detailed error logging"""
        print(f"[DEBUG] Transaction create - Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"[DEBUG] Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


