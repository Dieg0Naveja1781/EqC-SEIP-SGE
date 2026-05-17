import logging
import os
from django.conf import settings as django_settings
from django.db import transaction

from modules.usuarios_backend.models import UserProfe
from .models import (
    CategoriasDoc, InfCarpeta, DocDocumento, DocExpediente,
    ExpedienteContenido, VersionDoc, CategoriaCustom,
)
from .serializers import (
    DocExpedienteSerializer, DocDocumentoSerializer,
    InfCarpetaSerializer, VersionDocSerializer,
    ExpedienteContenidoSerializer, CategoriaDocSerializer,
    CategoriaCustomSerializer,
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

            # Resolver la categoría de BD:
            # - Si es categoría fija y se proporcionó id_tipo: usarlo directamente.
            # - Si es categoría fija sin id_tipo: buscar por nombre en la BD.
            # - Si es categoría custom: usar/crear una categoría comodín "Personalizada".
            CATEGORIAS_FIJAS = ['Docencia', 'Gestion', 'Titulacion', 'Produccion', 'Tutoria']
            if categoria in CATEGORIAS_FIJAS and id_tipo:
                categoria_obj = CategoriasDoc.objects.get(id_tipo=id_tipo)
            elif categoria in CATEGORIAS_FIJAS and not id_tipo:
                # Buscar por nombre en la BD (mapeo frontend→BD)
                NOMBRE_MAP = {
                    'Docencia': 'Docencia',
                    'Gestion': 'Gestión Académica',
                    'Titulacion': 'Gestión Académica (Titulación)',
                    'Produccion': 'Producción Académica',
                    'Tutoria': 'Tutoría',
                }
                nombre_bd = NOMBRE_MAP.get(categoria, categoria)
                cat_qs = CategoriasDoc.objects.filter(nombre_categoria__iexact=nombre_bd)
                if not cat_qs.exists():
                    cat_qs = CategoriasDoc.objects.filter(nombre_categoria__icontains=categoria[:4])
                if cat_qs.exists():
                    categoria_obj = cat_qs.first()
                else:
                    categoria_obj, _ = CategoriasDoc.objects.get_or_create(
                        nombre_categoria='Personalizada',
                        defaults={'descripcion': 'Categoría comodín para documentos personalizados'},
                    )
            else:
                # Categoría custom del usuario: usar/crear categoría comodín
                categoria_obj, _ = CategoriasDoc.objects.get_or_create(
                    nombre_categoria='Personalizada',
                    defaults={'descripcion': 'Categoría comodín para documentos personalizados'},
                )

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
    def actualizar_documento(id_doc, id_profesor, titulo_doc, id_tipo, categoria, metadatos=None, fecha_expedicion=None):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)
            doc = DocDocumento.objects.get(id_doc=id_doc, id_profesor=profe)

            if not titulo_doc:
                return {'success': False, 'error': 'El titulo es requerido'}

            duplicado = DocDocumento.objects.filter(
                id_profesor=profe,
                titulo_doc=titulo_doc,
            ).exclude(id_doc=id_doc).exists()
            if duplicado:
                return {'success': False, 'error': 'Ya existe un documento con ese titulo'}

            CATEGORIAS_FIJAS = ['Docencia', 'Gestion', 'Titulacion', 'Produccion', 'Tutoria']
            if categoria in CATEGORIAS_FIJAS and id_tipo:
                categoria_obj = CategoriasDoc.objects.get(id_tipo=id_tipo)
            elif categoria in CATEGORIAS_FIJAS:
                nombre_map = {
                    'Docencia': 'Docencia',
                    'Gestion': 'Gestión Académica',
                    'Titulacion': 'Gestión Académica (Titulación)',
                    'Produccion': 'Producción Académica',
                    'Tutoria': 'Tutoría',
                }
                categoria_obj = CategoriasDoc.objects.filter(
                    nombre_categoria__iexact=nombre_map.get(categoria, categoria)
                ).first()
                if not categoria_obj:
                    return {'success': False, 'error': 'Categoria no valida'}
            else:
                categoria_obj, _ = CategoriasDoc.objects.get_or_create(
                    nombre_categoria='Personalizada',
                    defaults={'descripcion': 'Categoria comodin para documentos personalizados'},
                )

            meta = dict(metadatos or {})
            meta['_categoria'] = categoria

            doc.titulo_doc = titulo_doc
            doc.id_tipo = categoria_obj
            doc.fecha_expedicion = fecha_expedicion
            doc.metadatos = meta
            doc.save(update_fields=['titulo_doc', 'id_tipo', 'fecha_expedicion', 'metadatos'])

            return {'success': True, 'documento': DocDocumentoSerializer(doc).data}
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Profesor no encontrado'}
        except DocDocumento.DoesNotExist:
            return {'success': False, 'error': 'Documento no encontrado'}
        except CategoriasDoc.DoesNotExist:
            return {'success': False, 'error': 'Categoria no valida'}
        except Exception as e:
            logger.error(f"Error al actualizar documento: {str(e)}")
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
        
    @staticmethod
    def mover_documento(id_doc, id_profesor, id_folder_destino):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)
            doc = DocDocumento.objects.get(id_doc=id_doc, id_profesor=profe)
            
            destino = None
            if id_folder_destino:
                destino = InfCarpeta.objects.get(id_folder=id_folder_destino, id_profesor=profe)

            doc.id_folder = destino
            doc.save()
            return {'success': True, 'documento': DocDocumentoSerializer(doc).data}
        except DocDocumento.DoesNotExist:
            return {'success': False, 'error': 'Documento no encontrado'}
        except InfCarpeta.DoesNotExist:
            return {'success': False, 'error': 'Carpeta destino no encontrada'}
        except Exception as e:
            logger.error(f"Error al mover documento: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def eliminar_documento(id_doc, id_profesor):
        try:
            doc = DocDocumento.objects.filter(
                id_doc=id_doc,
                id_profesor=id_profesor
            ).first()

            if not doc:
                return {
                    "success": False,
                    "error": "Documento no encontrado"
                }

            # eliminar archivo físico si existe
            if doc.ruta_archivo and os.path.exists(doc.ruta_archivo):
                os.remove(doc.ruta_archivo)

            doc.delete()

            return {
                "success": True
            }

        except Exception as e:
            logger.error(f"Error eliminando documento: {str(e)}")

            return {
                "success": False,
                "error": str(e)
            }

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
            if id_padre == 'all':
                qs = InfCarpeta.objects.filter(id_profesor=id_profesor)
            else:
                qs = InfCarpeta.objects.filter(id_profesor=id_profesor, id_padre=id_padre)
            return {'success': True, 'carpetas': InfCarpetaSerializer(qs, many=True).data}
        except Exception as e:
            logger.error(f"Error al obtener carpetas: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def mover_carpeta(id_carpeta, id_profesor, id_padre_destino):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)
            carpeta = InfCarpeta.objects.get(id_folder=id_carpeta, id_profesor=profe)
            
            destino = None
            if id_padre_destino:
                destino = InfCarpeta.objects.get(id_folder=id_padre_destino, id_profesor=profe)
                if destino.id_folder == carpeta.id_folder:
                    return {'success': False, 'error': 'No puede mover una carpeta dentro de sí misma'}

            carpeta.id_padre = destino
            carpeta.save()
            return {'success': True, 'carpeta': InfCarpetaSerializer(carpeta).data}
        except InfCarpeta.DoesNotExist:
            return {'success': False, 'error': 'Carpeta origen o destino no encontrada'}
        except Exception as e:
            logger.error(f"Error al mover carpeta: {str(e)}")
            return {'success': False, 'error': str(e)}
        
    @staticmethod
    def eliminar_carpeta(id_carpeta, id_profesor):
        try:
            carpeta = InfCarpeta.objects.filter(
                id_folder=id_carpeta,
                id_profesor=id_profesor
            ).first()
            if not carpeta:
                return {
                    "success": False,
                    "error": "Carpeta no encontrada"
                }
            # Encontrar y eliminar todos los documentos de esta carpeta (y subcarpetas)
            def eliminar_recursivo(folder):
                # Eliminar documentos en esta carpeta
                docs = DocDocumento.objects.filter(id_folder=folder.id_folder)
                for doc in docs:
                    if doc.ruta_archivo and os.path.exists(doc.ruta_archivo):
                        try:
                            os.remove(doc.ruta_archivo)
                        except OSError:
                            pass
                    doc.delete()
                # Recursión para subcarpetas
                subcarpetas = InfCarpeta.objects.filter(id_padre=folder.id_folder)
                for sub in subcarpetas:
                    eliminar_recursivo(sub)
            eliminar_recursivo(carpeta)
            # Eliminar las carpetas y subcarpetas
            carpeta.delete()
            return {
                "success": True
            }
        except Exception as e:
            logger.error(f"Error eliminando carpeta: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    # ---------------- CATEGORÍAS ----------------
    @staticmethod
    def listar_categorias():
        cats = CategoriasDoc.objects.all()
        return {'success': True, 'categorias': CategoriaDocSerializer(cats, many=True).data}

    # ---------------- CATEGORÍAS CUSTOM ----------------
    @staticmethod
    def listar_categorias_custom(id_profesor):
        try:
            cats = CategoriaCustom.objects.filter(id_profesor=id_profesor)
            return {
                'success': True,
                'categorias_custom': CategoriaCustomSerializer(cats, many=True).data,
            }
        except Exception as e:
            logger.error(f"Error al listar categorias custom: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def crear_categoria_custom(id_profesor, nombre, campos):
        try:
            profe = UserProfe.objects.get(id_profesor=id_profesor)

            if CategoriaCustom.objects.filter(id_profesor=profe, nombre=nombre).exists():
                return {'success': False, 'error': f"Ya existe una categoría llamada '{nombre}'"}

            cat = CategoriaCustom.objects.create(
                id_profesor=profe,
                nombre=nombre,
                campos=campos,
            )
            logger.info(f"Categoria custom creada: '{nombre}' (profesor {id_profesor})")
            return {'success': True, 'categoria': CategoriaCustomSerializer(cat).data}
        except UserProfe.DoesNotExist:
            return {'success': False, 'error': 'Profesor no encontrado'}
        except Exception as e:
            logger.error(f"Error al crear categoria custom: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def eliminar_categoria_custom(id_cat_custom, id_profesor):
        try:
            cat = CategoriaCustom.objects.get(
                id_cat_custom=id_cat_custom,
                id_profesor=id_profesor,
            )
            nombre = cat.nombre
            cat.delete()
            logger.info(f"Categoria custom eliminada: '{nombre}' (profesor {id_profesor})")
            return {'success': True, 'mensaje': f"Categoría '{nombre}' eliminada"}
        except CategoriaCustom.DoesNotExist:
            return {'success': False, 'error': 'Categoría no encontrada'}
        except Exception as e:
            logger.error(f"Error al eliminar categoria custom: {str(e)}")
            return {'success': False, 'error': str(e)}
