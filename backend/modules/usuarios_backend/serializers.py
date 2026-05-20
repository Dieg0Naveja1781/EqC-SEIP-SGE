from rest_framework import serializers
from .models import UserProfe, InvestigadorID


class UserProfeSerializer(serializers.ModelSerializer):
    """Serializa datos del profesor (sin exponer la contraseña)."""

    class Meta:
        model = UserProfe
        fields = ['id_profesor', 'correo_profe', 'numero_profe',
                  'full_name',
                  'rfc', 'curp',
                  'profesion', 'nivel_estudios', 'universidad',
                  'empresa', 'puesto', 'ubicacion',
                  'descripcion',
                  'fecha_registro']
        read_only_fields = ['id_profesor', 'fecha_registro']


class RegistroProfesorSerializer(serializers.Serializer):
    """Valida los datos para registrar un nuevo profesor."""
    correo_profe = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    numero_profe = serializers.IntegerField(required=False, allow_null=True)
    full_name = serializers.CharField(max_length=150)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden'})
        if UserProfe.objects.filter(correo_profe=data['correo_profe']).exists():
            raise serializers.ValidationError({'correo_profe': 'Este correo ya está registrado'})
        return data


class LoginSerializer(serializers.Serializer):
    """Valida los datos de login del profesor."""
    correo_profe = serializers.EmailField()
    password = serializers.CharField(write_only=True)
class InvestigadorIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestigadorID
        fields = ['id_inv', 'tipo', 'valor', 'fecha_creacion']
        read_only_fields = ['id_inv', 'fecha_creacion']