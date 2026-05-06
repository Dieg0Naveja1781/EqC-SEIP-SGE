from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from api.models import UserProfe, InfCurp
from .serializers import RegistroProfesorSerializer, UserProfeSerializer
import logging

logger = logging.getLogger(__name__)


class ServicioUsuarios:
    """Servicio centralizado con la lógica de negocio de usuarios/profesores"""

    @staticmethod
    def registrar_profesor(data):
        """Registra un profesor + su info CURP en una sola transacción"""
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
                    genero_profe=validated.get('genero_profe'),
                    rol_profe=validated['rol_profe'],
                    activo=True,
                )

                if validated.get('full_name'):
                    InfCurp.objects.create(
                        id_profesor=profe,
                        full_name=validated['full_name'],
                        fecha_nacimiento=validated.get('fecha_nacimiento'),
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
        """Valida credenciales y retorna datos del profesor si son correctas"""
        try:
            profe = UserProfe.objects.get(correo_profe=correo)
            if not profe.activo:
                return {'success': False, 'error': 'Profesor inactivo'}
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

            for campo in ('numero_profe', 'genero_profe', 'rol_profe'):
                if campo in data:
                    setattr(profe, campo, data[campo])
            profe.save()

            try:
                curp = InfCurp.objects.get(id_profesor=profe)
                for campo in ('full_name', 'fecha_nacimiento'):
                    if campo in data:
                        setattr(curp, campo, data[campo])
                curp.save()
            except InfCurp.DoesNotExist:
                if 'full_name' in data:
                    InfCurp.objects.create(
                        id_profesor=profe,
                        full_name=data['full_name'],
                        fecha_nacimiento=data.get('fecha_nacimiento'),
                    )

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
