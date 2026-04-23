from rest_framework import serializers
from api.models import UserProfe, InfCurp


class UserProfeSerializer(serializers.ModelSerializer):
    """Serializa datos del profesor (sin exponer la contraseña)"""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfe
        fields = [
            'id_profesor', 'correo_profe', 'numero_profe', 'genero_profe',
            'rol_profe', 'fecha_registro', 'activo', 'full_name',
        ]
        read_only_fields = ['id_profesor', 'fecha_registro']

    def get_full_name(self, obj):
        try:
            return InfCurp.objects.get(id_profesor=obj).full_name
        except InfCurp.DoesNotExist:
            return None


class RegistroProfesorSerializer(serializers.Serializer):
    """Valida datos para registrar un nuevo profesor"""
    correo_profe = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    rol_profe = serializers.ChoiceField(
        choices=['INVESTIGADOR', 'MEDIO_TIEMPO', 'TIEMPO_COMPLETO']
    )
    numero_profe = serializers.IntegerField(required=False, allow_null=True)
    genero_profe = serializers.ChoiceField(
        choices=['M', 'F', 'O', 'ND'], required=False, allow_null=True
    )
    full_name = serializers.CharField(max_length=150)
    fecha_nacimiento = serializers.DateTimeField(required=False, allow_null=True)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden'})
        if UserProfe.objects.filter(correo_profe=data['correo_profe']).exists():
            raise serializers.ValidationError({'correo_profe': 'Este correo ya está registrado'})
        return data


class LoginSerializer(serializers.Serializer):
    """Valida datos para login de profesor"""
    correo_profe = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class InfCurpSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfCurp
        fields = ['id_curp', 'full_name', 'fecha_nacimiento', 'fecha_actualizacion']
        read_only_fields = ['id_curp', 'fecha_actualizacion']
