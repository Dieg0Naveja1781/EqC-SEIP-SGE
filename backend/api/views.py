from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Login, UserProfile
from .serializers import (
    LoginSerializer, 
    LoginCreateSerializer,
    UserProfileSerializer,
    RegisterSerializer,
    UserSerializer
)


class AuthViewSet(viewsets.ViewSet):
    """
    API para autenticación de usuarios
    - Login: POST /auth/login/
    - Register: POST /auth/register/
    - Logout: POST /auth/logout/
    - Profile: GET /auth/profile/
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Endpoint para login de usuarios
        
        Parámetros:
        - username: nombre de usuario
        - password: contraseña
        - ip_address (opcional): dirección IP del cliente
        - user_agent (opcional): información del navegador
        
        Retorna:
        - success: True si el login fue exitoso
        - user: información del usuario logueado
        - message: mensaje de respuesta
        """
        serializer = LoginCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = serializer.validated_data.get('username')
        password = serializer.validated_data.get('password')
        ip_address = serializer.validated_data.get('ip_address')
        user_agent = serializer.validated_data.get('user_agent', '')

        # Permite autenticación por username o email
        auth_username = username
        if '@' in username:
            found_user = User.objects.filter(email__iexact=username).first()
            if found_user:
                auth_username = found_user.username

        # Autenticar usuario
        user = authenticate(username=auth_username, password=password)
        
        if user is not None:
            # Usuario autenticado exitosamente
            # Crear registro de login
            login_record = Login.objects.create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent,
                is_active=True
            )
            
            user_profile, _ = UserProfile.objects.get_or_create(
                user=user,
                defaults={'role': 'estudiante'}
            )
            
            return Response({
                'success': True,
                'message': 'Login exitoso',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user_profile.role
                },
                'login_id': login_record.id
            }, status=status.HTTP_200_OK)
        else:
            # Usuario o contraseña incorrectos
            return Response({
                'success': False,
                'message': 'Usuario o contraseña incorrectos'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Endpoint para registrar nuevos usuarios
        
        Parámetros requeridos:
        - username
        - email
        - first_name
        - last_name
        - password
        - password2 (confirmación de contraseña)
        
        Retorna:
        - success: True si el registro fue exitoso
        - user: información del usuario creado
        - message: mensaje de respuesta
        """
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Usuario registrado exitosamente',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """
        Endpoint para cerrar sesión del usuario
        
        Parámetros:
        - login_id: ID del registro de login a cerrar
        
        Retorna:
        - success: True si el logout fue exitoso
        """
        login_id = request.data.get('login_id')
        
        try:
            login_record = Login.objects.get(id=login_id)
            login_record.is_active = False
            login_record.save()
            
            return Response({
                'success': True,
                'message': 'Sesión cerrada exitosamente'
            }, status=status.HTTP_200_OK)
        except Login.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Registro de login no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        """
        Endpoint para obtener el perfil del usuario autenticado
        
        Retorna:
        - Información del usuario y su perfil
        """
        try:
            user_profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(user_profile)
            
            return Response({
                'success': True,
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Perfil de usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)


class LoginHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ver el historial de logins
    GET /api/login-history/ - Listar todos los logins
    GET /api/login-history/{id}/ - Obtener un login específico
    """
    queryset = Login.objects.all()
    serializer_class = LoginSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Solo mostrar logins del usuario autenticado"""
        return Login.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active_sessions(self, request):
        """
        Obtener solo las sesiones activas del usuario
        GET /api/login-history/active_sessions/
        """
        active_logins = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_logins, many=True)
        
        return Response({
            'success': True,
            'active_sessions': serializer.data
        }, status=status.HTTP_200_OK)
