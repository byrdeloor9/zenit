"""
User serializers
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from api.models import User, Category


class UserSerializer(serializers.ModelSerializer[User]):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer[User]):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate_email(self, value: str) -> str:
        """Validate that email is unique (case-insensitive)"""
        email_lower = value.lower()
        if User.objects.filter(email__iexact=email_lower).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return email_lower
    
    def validate(self, attrs: dict) -> dict:
        """Validate that passwords match"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        return attrs
    
    def create(self, validated_data: dict) -> User:
        """Create user with hashed password and default categories"""
        validated_data.pop('password_confirm')
        
        # Generate username from email (before @)
        username = validated_data['email'].split('@')[0]
        
        # Ensure username is unique
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        # Create default categories for the new user
        default_categories = [
            # Income categories
            {'name': 'Sueldo', 'type': 'Income', 'icon': '💰'},
            {'name': 'Bonificaciones', 'type': 'Income', 'icon': '🎁'},
            {'name': 'Cobro de Préstamos', 'type': 'Income', 'icon': '💵'},
            
            # Expense categories
            {'name': 'Renta', 'type': 'Expense', 'icon': '🏠'},
            {'name': 'Vehículo', 'type': 'Expense', 'icon': '🚗'},
            {'name': 'Restaurantes', 'type': 'Expense', 'icon': '🍽️'},
            {'name': 'Supermercado', 'type': 'Expense', 'icon': '🛒'},
            {'name': 'Salud', 'type': 'Expense', 'icon': '⚕️'},
        ]
        
        for cat_data in default_categories:
            Category.objects.create(
                user=user,
                name=cat_data['name'],
                type=cat_data['type'],
                icon=cat_data['icon']
            )
        
        return user


class UserProfileSerializer(serializers.ModelSerializer[User]):
    """Serializer for updating user profile"""
    email = serializers.EmailField(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username']
    
    def validate_email(self, value: str) -> str:
        """Validate that email is unique (excluding current user)"""
        email_lower = value.lower()
        user = self.context['request'].user
        if User.objects.filter(email__iexact=email_lower).exclude(id=user.id).exists():
            raise serializers.ValidationError("Este email ya está en uso.")
        return email_lower


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate_old_password(self, value: str) -> str:
        """Validate that old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value
    
    def validate(self, attrs: dict) -> dict:
        """Validate that new passwords match"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "Las contraseñas no coinciden."})
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that uses email instead of username
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace the username field with email field
        self.fields['email'] = serializers.EmailField(required=True, write_only=True)
        # Remove the username field requirement
        if 'username' in self.fields:
            del self.fields['username']
    
    def validate(self, attrs: dict) -> dict:
        # Get email from request (frontend sends 'email')
        email = attrs.get('email', '').lower()
        
        # Find user by email (case-insensitive)
        try:
            user = User.objects.get(email__iexact=email)
            # Set username for parent authentication
            attrs['username'] = user.username
        except User.DoesNotExist:
            # Set a non-existent username to let parent handle the error
            attrs['username'] = f'__nonexistent__{email}'
        
        # Call parent validation with username and password
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = UserSerializer(self.user).data
        
        return data


