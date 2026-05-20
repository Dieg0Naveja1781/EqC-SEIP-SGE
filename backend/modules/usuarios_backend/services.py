from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from .models import UserProfe, InvestigadorID
from .serializers import RegistroProfesorSerializer, UserProfeSerializer, InvestigadorIDSerializer
import logging

logger = logging.getLogger(__name__)


class ServicioUsuarios:
  

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
            for campo in ('numero_profe', 'full_name'):
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

    @staticmethod
    def listar_investigador_ids(id_profesor):
        try:
            ids = InvestigadorID.objects.filter(id_profesor=id_profesor)
            return {'success': True, 'investigador_ids': InvestigadorIDSerializer(ids, many=True).data}
        except Exception as e:
            logger.error(f"Error al listar IDs de investigador: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def agregar_investigador_id(id_profesor, tipo, valor):
        if not tipo or not valor:
            return {'success': False, 'error': 'tipo y valor son requeridos'}
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)
            nuevo = InvestigadorID.objects.create(
                id_profesor=profe, tipo=tipo, valor=valor,
            )
            return {'success': True, 'investigador_id': InvestigadorIDSerializer(nuevo).data}
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Profesor no encontrado'}
        except Exception as e:
            logger.error(f"Error al agregar ID de investigador: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def eliminar_investigador_id(id_inv, id_profesor):
        try:
            inv = InvestigadorID.objects.get(id_inv=id_inv, id_profesor=id_profesor)
            inv.delete()
            return {'success': True, 'message': 'ID eliminado'}
        except InvestigadorID.DoesNotExist:
            return {'success': False, 'error': 'ID no encontrado'}
        except Exception as e:
            logger.error(f"Error al eliminar ID de investigador: {str(e)}")
            return {'success': False, 'error': str(e)}