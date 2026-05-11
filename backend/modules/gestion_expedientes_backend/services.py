import logging
import os
from django.conf import settings as django_settings
from django.db import transaction

from modules.usuarios_backend.models import UserProfe
from .models import (
    CategoriasDoc, InfCarpeta, DocDocumento, DocExpediente,
    ExpedienteContenido, VersionDoc,
)
from .serializers import (
    DocExpedienteSerializer, DocDocumentoSerializer,
    InfCarpetaSerializer, VersionDocSerializer,
    ExpedienteContenidoSerializer, CategoriaDocSerializer,
)

logger = logging.getLogger(__name__)


def _media_root():
    return getattr(
        django_settings, 'MEDIA_ROOT',
        os.path.join(django_settings.BASE_DIR, 'media'),
    )


class ServicioExpedientes:
    """Lógica de negocio de expedientes, carpetas y documentos."""

    # ---------------- EXPEDIENTES ----------------
    @staticmethod
    def crear_expediente(id_profesor, nombre_convocatoria, descripcion='', fecha_expedicion=None):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)

            if DocExpediente.objects.filter(
                id_profesor=profe, nombre_convocatoria=nombre_convocatoria
            ).exists():
                return {'success': False, 'error': 'Ya existe un expediente con ese nombre'}

            exp = DocExpediente.objects.create(
                id_profesor=profe,
                nombre_convocatoria=nombre_convocatoria,
                descripcion=descripcion,
                fecha_expedicion=fecha_expedicion,
            )
            logger.info(f"Expediente creado: {nombre_convocatoria} (profesor {id_profesor})")
            return {'success': True, 'expediente': DocExpedienteSerializer(exp).data}
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Profesor no encontrado'}
        except Exception as e:
            logger.error(f"Error al crear expediente: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def obtener_expedientes(id_profesor):
        try:
            exps = DocExpediente.objects.filter(id_profesor=id_profesor)
            return {'success': True, 'expedientes': DocExpedienteSerializer(exps, many=True).data}
        except Exception as e:
            logger.error(f"Error al obtener expedientes: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def agregar_documento_a_expediente(id_exp, id_doc, id_profesor, orden=0):
        try:
            exp = DocExpediente.objects.get(id_exp=id_exp, id_profesor=id_profesor)
            doc = DocDocumento.objects.get(id_doc=id_doc, id_profesor=id_profesor)

            if ExpedienteContenido.objects.filter(id_exp=exp, id_doc=doc).exists():
                return {'success': False, 'error': 'El documento ya está en el expediente'}

            contenido = ExpedienteContenido.objects.create(id_exp=exp, id_doc=doc, orden=orden)
            return {'success': True, 'contenido': ExpedienteContenidoSerializer(contenido).data}
        except DocExpediente.DoesNotExist:
            return {'success': False, 'error': 'Expediente no encontrado'}
        except DocDocumento.DoesNotExist:
            return {'success': False, 'error': 'Documento no encontrado'}
        except Exception as e:
            logger.error(f"Error al agregar documento al expediente: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def obtener_documentos_expediente(id_exp, id_profesor):
        try:
            DocExpediente.objects.get(id_exp=id_exp, id_profesor=id_profesor)
            contenidos = ExpedienteContenido.objects.filter(id_exp=id_exp).order_by('orden')
            return {
                'success': True,
                'documentos': ExpedienteContenidoSerializer(contenidos, many=True).data,
            }
        except DocExpediente.DoesNotExist:
            return {'success': False, 'error': 'Expediente no encontrado'}
        except Exception as e:
            logger.error(f"Error al obtener documentos del expediente: {str(e)}")
            return {'success': False, 'error': str(e)}

    # ---------------- DOCUMENTOS ----------------
    @staticmethod
    def subir_documento(id_profesor, archivo, titulo_doc, id_tipo,
                        categoria, metadatos=None,
                        id_folder=None, fecha_expedicion=None):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)
            categoria_obj = CategoriasDoc.objects.get(id_tipo=id_tipo)

            carpeta = None
            if id_folder:
                carpeta = InfCarpeta.objects.get(id_folder=id_folder, id_profesor=profe)

            if DocDocumento.objects.filter(id_profesor=profe, titulo_doc=titulo_doc).exists():
                return {'success': False, 'error': 'Ya existe un documento con ese título'}

            folder_path = os.path.join(_media_root(), 'documentos', str(id_profesor))
            os.makedirs(folder_path, exist_ok=True)
            ruta_archivo = os.path.join(folder_path, archivo.name)

            with open(ruta_archivo, 'wb+') as destination:
                for chunk in archivo.chunks():
                    destination.write(chunk)

            meta = dict(metadatos or {})
            meta['_categoria'] = categoria

            with transaction.atomic():
                doc = DocDocumento.objects.create(
                    id_profesor=profe,
                    id_tipo=categoria_obj,
                    id_folder=carpeta,
                    titulo_doc=titulo_doc,
                    ruta_archivo=ruta_archivo,
                    fecha_expedicion=fecha_expedicion,
                    tamano_bytes=archivo.size,
                    extension_archivo='pdf',
                    metadatos=meta,
                )
                VersionDoc.objects.create(
                    id_doc=doc,
                    ruta_archivo=ruta_archivo,
                    num_version=1,
                )

            logger.info(f"Documento subido: {titulo_doc} (profesor {id_profesor})")
            return {'success': True, 'documento': DocDocumentoSerializer(doc).data}
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Profesor no encontrado'}
        except CategoriasDoc.DoesNotExist:
            return {'success': False, 'error': 'Categoría no válida'}
        except InfCarpeta.DoesNotExist:
            return {'success': False, 'error': 'Carpeta no encontrada'}
        except Exception as e:
            logger.error(f"Error al subir documento: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def obtener_documentos(id_profesor, id_folder=None):
        try:
            qs = DocDocumento.objects.filter(id_profesor=id_profesor)
            if id_folder is not None:
                qs = qs.filter(id_folder=id_folder if id_folder else None)
            return {'success': True, 'documentos': DocDocumentoSerializer(qs, many=True).data}
        except Exception as e:
            logger.error(f"Error al obtener documentos: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def descargar_documento(id_doc, id_profesor):
        try:
            doc = DocDocumento.objects.get(id_doc=id_doc, id_profesor=id_profesor)
            return {
                'success': True,
                'ruta_archivo': doc.ruta_archivo,
                'titulo': doc.titulo_doc,
            }
        except DocDocumento.DoesNotExist:
            return {'success': False, 'error': 'Documento no encontrado'}
        except Exception as e:
            logger.error(f"Error al descargar documento: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def nueva_version_documento(id_doc, id_profesor, archivo):
        try:
            doc = DocDocumento.objects.get(id_doc=id_doc, id_profesor=id_profesor)

            folder_path = os.path.join(_media_root(), 'documentos', str(id_profesor), 'versiones')
            os.makedirs(folder_path, exist_ok=True)

            ultima = VersionDoc.objects.filter(id_doc=doc).order_by('-num_version').first()
            siguiente = (ultima.num_version + 1) if ultima else 1

            ruta = os.path.join(folder_path, f'v{siguiente}_{archivo.name}')
            with open(ruta, 'wb+') as destination:
                for chunk in archivo.chunks():
                    destination.write(chunk)

            version = VersionDoc.objects.create(
                id_doc=doc,
                ruta_archivo=ruta,
                num_version=siguiente,
            )
            return {'success': True, 'version': VersionDocSerializer(version).data}
        except DocDocumento.DoesNotExist:
            return {'success': False, 'error': 'Documento no encontrado'}
        except Exception as e:
            logger.error(f"Error al crear nueva versión: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def listar_versiones(id_doc, id_profesor):
        try:
            DocDocumento.objects.get(id_doc=id_doc, id_profesor=id_profesor)
            versiones = VersionDoc.objects.filter(id_doc=id_doc).order_by('-num_version')
            return {'success': True, 'versiones': VersionDocSerializer(versiones, many=True).data}
        except DocDocumento.DoesNotExist:
            return {'success': False, 'error': 'Documento no encontrado'}

    # ---------------- CARPETAS ----------------
    @staticmethod
    def crear_carpeta(id_profesor, nombre_carpeta, id_padre=None):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)

            padre = None
            if id_padre:
                padre = InfCarpeta.objects.get(id_folder=id_padre, id_profesor=profe)

            if InfCarpeta.objects.filter(
                id_profesor=profe, nombre_carpeta=nombre_carpeta, id_padre=padre,
            ).exists():
                return {'success': False, 'error': 'Ya existe una carpeta con ese nombre en esta ubicación'}

            carpeta = InfCarpeta.objects.create(
                id_profesor=profe,
                nombre_carpeta=nombre_carpeta,
                id_padre=padre,
            )
            return {'success': True, 'carpeta': InfCarpetaSerializer(carpeta).data}
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Profesor no encontrado'}
        except InfCarpeta.DoesNotExist:
            return {'success': False, 'error': 'Carpeta padre no encontrada'}
        except Exception as e:
            logger.error(f"Error al crear carpeta: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def obtener_carpetas(id_profesor, id_padre=None):
        try:
            qs = InfCarpeta.objects.filter(id_profesor=id_profesor, id_padre=id_padre)
            return {'success': True, 'carpetas': InfCarpetaSerializer(qs, many=True).data}
        except Exception as e:
            logger.error(f"Error al obtener carpetas: {str(e)}")
            return {'success': False, 'error': str(e)}

    # ---------------- CATEGORÍAS ----------------
    @staticmethod
    def listar_categorias():
        cats = CategoriasDoc.objects.all()
        return {'success': True, 'categorias': CategoriaDocSerializer(cats, many=True).data}
