from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .serializers import (
    SubidaDocumentoSerializer, CrearCarpetaSerializer, CrearExpedienteSerializer,
)
from .services import ServicioExpedientes
import os


def _get_id_profesor(request):
    return request.session.get('id_profesor')


def _no_auth():
    return Response(
        {'success': False, 'error': 'No autenticado'},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@method_decorator(csrf_exempt, name='dispatch')
class ExpedienteViewSet(viewsets.ViewSet):
    """
    Endpoints:
      GET  /api/expedientes/                         Lista expedientes del profesor
      POST /api/expedientes/                         Crea un expediente
      GET  /api/expedientes/{id}/documentos/         Lista documentos del expediente
      POST /api/expedientes/{id}/agregar-documento/  Agrega un documento al expediente
    """
    permission_classes = [AllowAny]

    def list(self, request):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()
        resultado = ServicioExpedientes.obtener_expedientes(id_profesor)
        return Response(
            resultado,
            status=status.HTTP_200_OK if resultado['success'] else status.HTTP_400_BAD_REQUEST,
        )

    def create(self, request):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()

        serializer = CrearExpedienteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        resultado = ServicioExpedientes.crear_expediente(
            id_profesor=id_profesor,
            nombre_convocatoria=serializer.validated_data['nombre_convocatoria'],
            descripcion=serializer.validated_data.get('descripcion', ''),
            fecha_expedicion=serializer.validated_data.get('fecha_expedicion'),
        )
        return Response(
            resultado,
            status=status.HTTP_201_CREATED if resultado['success'] else status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=True, methods=['get'])
    def documentos(self, request, pk=None):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()
        resultado = ServicioExpedientes.obtener_documentos_expediente(pk, id_profesor)
        return Response(
            resultado,
            status=status.HTTP_200_OK if resultado['success'] else status.HTTP_404_NOT_FOUND,
        )

    @action(detail=True, methods=['post'], url_path='agregar-documento')
    def agregar_documento(self, request, pk=None):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()

        id_doc = request.data.get('id_doc')
        orden = request.data.get('orden', 0)
        if not id_doc:
            return Response(
                {'success': False, 'error': 'id_doc es requerido'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resultado = ServicioExpedientes.agregar_documento_a_expediente(
            id_exp=pk, id_doc=id_doc, id_profesor=id_profesor, orden=orden,
        )
        return Response(
            resultado,
            status=status.HTTP_201_CREATED if resultado['success'] else status.HTTP_400_BAD_REQUEST,
        )


@method_decorator(csrf_exempt, name='dispatch')
class DocumentoViewSet(viewsets.ViewSet):
    """
    Endpoints:
      GET  /api/documentos/                          Lista documentos del profesor
      POST /api/documentos/subir/                    Sube un documento (multipart)
      GET  /api/documentos/{id}/descargar/           Descarga el archivo
      POST /api/documentos/{id}/nueva-version/       Sube una nueva versión
      GET  /api/documentos/{id}/versiones/           Lista versiones del documento
    """
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def list(self, request):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()
        id_folder = request.query_params.get('id_folder')
        resultado = ServicioExpedientes.obtener_documentos(id_profesor, id_folder)
        return Response(
            resultado,
            status=status.HTTP_200_OK if resultado['success'] else status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=False, methods=['post'])
    def subir(self, request):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()

        serializer = SubidaDocumentoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        resultado = ServicioExpedientes.subir_documento(
            id_profesor=id_profesor,
            archivo=serializer.validated_data['archivo'],
            titulo_doc=serializer.validated_data['titulo_doc'],
            id_tipo=serializer.validated_data['id_tipo'],
            id_folder=serializer.validated_data.get('id_folder'),
            fecha_expedicion=serializer.validated_data.get('fecha_expedicion'),
        )
        return Response(
            resultado,
            status=status.HTTP_201_CREATED if resultado['success'] else status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=True, methods=['get'])
    def descargar(self, request, pk=None):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()

        resultado = ServicioExpedientes.descargar_documento(pk, id_profesor)
        if not resultado['success']:
            return Response(resultado, status=status.HTTP_404_NOT_FOUND)

        try:
            return FileResponse(
                open(resultado['ruta_archivo'], 'rb'),
                as_attachment=True,
                filename=os.path.basename(resultado['ruta_archivo']),
            )
        except FileNotFoundError:
            return Response(
                {'success': False, 'error': 'Archivo físico no encontrado en el servidor'},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=True, methods=['post'], url_path='nueva-version')
    def nueva_version(self, request, pk=None):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()

        archivo = request.FILES.get('archivo')
        if not archivo:
            return Response(
                {'success': False, 'error': 'archivo es requerido'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resultado = ServicioExpedientes.nueva_version_documento(
            id_doc=pk,
            id_profesor=id_profesor,
            archivo=archivo,
            comentario_cambio=request.data.get('comentario_cambio', ''),
        )
        return Response(
            resultado,
            status=status.HTTP_201_CREATED if resultado['success'] else status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=True, methods=['get'])
    def versiones(self, request, pk=None):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()
        resultado = ServicioExpedientes.listar_versiones(pk, id_profesor)
        return Response(
            resultado,
            status=status.HTTP_200_OK if resultado['success'] else status.HTTP_404_NOT_FOUND,
        )


@method_decorator(csrf_exempt, name='dispatch')
class CarpetaViewSet(viewsets.ViewSet):
    """
    Endpoints:
      GET  /api/carpetas/            Lista carpetas (opcional ?id_padre=)
      POST /api/carpetas/            Crea una carpeta
    """
    permission_classes = [AllowAny]

    def list(self, request):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()

        id_padre = request.query_params.get('id_padre')
        if id_padre in ('', 'null', 'None'):
            id_padre = None
        elif id_padre is not None:
            try:
                id_padre = int(id_padre)
            except (TypeError, ValueError):
                id_padre = None

        resultado = ServicioExpedientes.obtener_carpetas(id_profesor, id_padre)
        return Response(
            resultado,
            status=status.HTTP_200_OK if resultado['success'] else status.HTTP_400_BAD_REQUEST,
        )

    def create(self, request):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()

        serializer = CrearCarpetaSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        resultado = ServicioExpedientes.crear_carpeta(
            id_profesor=id_profesor,
            nombre_carpeta=serializer.validated_data['nombre_carpeta'],
            id_padre=serializer.validated_data.get('id_padre'),
        )
        return Response(
            resultado,
            status=status.HTTP_201_CREATED if resultado['success'] else status.HTTP_400_BAD_REQUEST,
        )


@method_decorator(csrf_exempt, name='dispatch')
class CategoriaDocViewSet(viewsets.ViewSet):
    """GET /api/categorias/ - Lista categorías de documentos disponibles"""
    permission_classes = [AllowAny]

    def list(self, request):
        resultado = ServicioExpedientes.listar_categorias()
        return Response(resultado, status=status.HTTP_200_OK)
