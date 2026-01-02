"""
Custom permissions for the API
"""
from rest_framework import permissions


class IsOwnerPermission(permissions.BasePermission):
    """
    Permission that checks if the user is the owner of the object.
    
    This permission ensures that users can only access resources they own,
    preventing IDOR (Insecure Direct Object Reference) vulnerabilities.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the requesting user is the owner of the object.
        
        Returns:
            True if the object belongs to the requesting user, False otherwise
        """
        # Check if object has user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # For objects without direct user relationship, allow
        # (these should be filtered at queryset level)
        return True


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Read permissions are allowed to authenticated users.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for authenticated users
        if request.method in permissions.SAFE_METHODS:
            # Still check ownership for read operations
            if hasattr(obj, 'user'):
                return obj.user == request.user
            return True
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return True
