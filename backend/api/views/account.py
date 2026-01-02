"""
Account views
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from api.models import Account
from api.serializers import AccountSerializer
from api.permissions import IsOwnerPermission


class AccountViewSet(viewsets.ModelViewSet[Account]):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]
    
    def get_queryset(self):
        """Filter accounts by authenticated user"""
        return Account.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Automatically assign the authenticated user when creating an account"""
        serializer.save(user=self.request.user)


