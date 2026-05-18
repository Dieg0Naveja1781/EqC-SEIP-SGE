from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from .models import UserProfe
from .serializers import RegistroProfesorSerializer, UserProfeSerializer
import logging

logger = logging.getLogger(__name__)


class ServicioUsuarios:
    """Lógica de negocio de usuarios/profesores."""

    @staticmethod
    def registrar_profesor(data):
        serializer = RegistroProfesorSerializer(data=data)
        if not serializer.is_valid():
            return {'success': False, 'errors': serializer.errors}

        validated = serializer.validated_data
        try:
            with transaction.atomic():
                profe = UserProfe.objects.create(
                    correo_profe=validated['correo_profe'],
                    password_profe=make_password(validated['password']),
                    numero_profe=validated.get('numero_profe'),
                    full_name=validated.get('full_name', ''),
                )
            logger.info(f"Profesor registrado: {profe.correo_profe}")
            return {
                'success': True,
                'message': 'Profesor registrado exitosamente',
                'id_profesor': profe.id_profesor,
            }
        except Exception as e:
            logger.error(f"Error al registrar profesor: {str(e)}")
            return {'success': False, 'errors': str(e)}

    @staticmethod
    def autenticar_profesor(correo, password):
        try:
            profe = UserProfe.objects.get(correo_profe=correo)
            if not check_password(password, profe.password_profe):
                return {'success': False, 'error': 'Credenciales inválidas'}

            serializer = UserProfeSerializer(profe)
            logger.info(f"Login exitoso: {correo}")
            return {
                'success': True,
                'profesor': serializer.data,
                'id_profesor': profe.id_profesor,
            }
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Credenciales inválidas'}
        except Exception as e:
            logger.error(f"Error al autenticar: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def obtener_perfil(id_profesor):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)
            return {'success': True, 'profile': UserProfeSerializer(profe).data}
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Profesor no encontrado'}

    @staticmethod
    def actualizar_perfil(id_profesor, data):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)
            campos_permitidos = (
                'numero_profe', 'full_name',
                'rfc', 'curp',
                'profesion', 'nivel_estudios', 'universidad',
                'empresa', 'puesto', 'ubicacion',
                'descripcion',
            )
            for campo in campos_permitidos:
                if campo in data:
                    setattr(profe, campo, data[campo])
            profe.save()
            return {'success': True, 'profile': UserProfeSerializer(profe).data}
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Profesor no encontrado'}
        except Exception as e:
            logger.error(f"Error al actualizar perfil: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def cambiar_password(id_profesor, password_actual, password_nuevo):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)
            if not check_password(password_actual, profe.password_profe):
                return {'success': False, 'error': 'Contraseña actual incorrecta'}
            profe.password_profe = make_password(password_nuevo)
            profe.save()
            return {'success': True, 'message': 'Contraseña actualizada'}
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Profesor no encontrado'}
