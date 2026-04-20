from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Login, UserProfile
from rest_framework import serializers
from .models import (
    UserProfe, DocDocumento, InfCarpeta, DocExpediente, 
    CategoriasDoc, VersionDoc, ExpedienteContenido
)


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

class UserProfessorSerializer(serializers.ModelSerializer):
    """Serializador para el modelo UserProfe"""
    class Meta:
        model = UserProfe
        fields = [
            'id_profesor', 'correo_profe', 'numero_profe', 'genero_profe',
            'rol_profe', 'fecha_registro', 'activo'
        ]
        read_only_fields = ['id_profesor', 'fecha_registro']


class CategoriasDocSerializer(serializers.ModelSerializer):
    """Serializador para categorías de documentos"""
    class Meta:
        model = CategoriasDoc
        fields = ['id_tipo', 'nombre_categoria', 'descripcion']
        read_only_fields = ['id_tipo']


class VersionDocSerializer(serializers.ModelSerializer):
    """Serializador para versiones de documentos"""
    class Meta:
        model = VersionDoc
        fields = ['id_version', 'ruta_archivo', 'num_version', 'fecha_subida']
        read_only_fields = ['id_version', 'fecha_subida']


class DocumentoSerializer(serializers.ModelSerializer):
    """Serializador para documentos"""
    categoria_nombre = serializers.CharField(
        source='id_tipo.nombre_categoria',
        read_only=True
    )
    profesor_correo = serializers.CharField(
        source='id_profesor.correo_profe',
        read_only=True
    )
    versiones = VersionDocSerializer(source='versiones', many=True, read_only=True)

    class Meta:
        model = DocDocumento
        fields = [
            'id_doc', 'titulo_doc', 'fecha_creacion', 'fecha_expedicion',
            'ruta_archivo', 'profesor_correo', 'id_folder', 'id_tipo',
            'categoria_nombre', 'versiones'
        ]
        read_only_fields = ['id_doc', 'fecha_creacion', 'profesor_correo']


class CarpetaSerializer(serializers.ModelSerializer):
    """Serializador para carpetas"""
    profesor_correo = serializers.CharField(
        source='id_profesor.correo_profe',
        read_only=True
    )
    carpeta_padre = serializers.CharField(
        source='id_padre.nombre_carpeta',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = InfCarpeta
        fields = [
            'id_folder', 'nombre_carpeta', 'fecha_creacion',
            'profesor_correo', 'id_padre', 'carpeta_padre'
        ]
        read_only_fields = ['id_folder', 'fecha_creacion', 'profesor_correo']


class ExpedienteContenidoSerializer(serializers.ModelSerializer):
    """Serializador para contenido de expedientes"""
    documento_titulo = serializers.CharField(
        source='id_doc.titulo_doc',
        read_only=True
    )

    class Meta:
        model = ExpedienteContenido
        fields = ['id_exp', 'id_doc', 'documento_titulo', 'orden', 'fecha_agregado']
        read_only_fields = ['fecha_agregado']


class ExpedienteSerializer(serializers.ModelSerializer):
    """Serializador para expedientes"""
    profesor_correo = serializers.CharField(
        source='id_profesor.correo_profe',
        read_only=True
    )
    contenido = ExpedienteContenidoSerializer(
        source='expedientecontenido_set',
        many=True,
        read_only=True
    )

    class Meta:
        model = DocExpediente
        fields = [
            'id_exp', 'nombre_convocatoria', 'fecha_creacion',
            'fecha_expedicion', 'descripcion', 'profesor_correo', 'contenido'
        ]
        read_only_fields = ['id_exp', 'fecha_creacion', 'profesor_correo']