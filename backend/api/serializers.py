from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Login, UserProfile


class UserSerializer(serializers.ModelSerializer):
    """Serializador para el modelo User"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializador para el perfil de usuario con info del User"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'role', 'phone', 'university_id', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at']


class LoginSerializer(serializers.ModelSerializer):
    """Serializador para registro de logins"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Login
        fields = ['id', 'username', 'login_time', 'logout_time', 'ip_address', 'is_active', 'user_agent']
        read_only_fields = ['id', 'login_time']


class LoginCreateSerializer(serializers.Serializer):
    """Serializador para crear un nuevo login"""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, max_length=128)
    ip_address = serializers.IPAddressField(required=False, allow_null=True)
    user_agent = serializers.CharField(required=False, allow_blank=True)


class RegisterSerializer(serializers.ModelSerializer):
    """Serializador para registrar nuevos usuarios"""
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, data):
        """Validar que las contraseñas coincidan"""
        if data['password'] != data['password2']:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden."}
            )
        return data
    
    def create(self, validated_data):
        """Crear usuario y su perfil"""
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        # Crear perfil de usuario automáticamente
        UserProfile.objects.create(
            user=user,
            role='estudiante'  # Por defecto todos inician como estudiantes
        )
        
        return user
