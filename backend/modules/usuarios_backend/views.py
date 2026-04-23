from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .serializers import LoginSerializer
from .services import ServicioUsuarios


def _get_id_profesor(request):
    """Obtiene el id_profesor almacenado en la sesión tras login"""
    return request.session.get('id_profesor')


def _no_auth():
    return Response(
        {'success': False, 'error': 'No autenticado'},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@method_decorator(csrf_exempt, name='dispatch')
class UsuarioViewSet(viewsets.ViewSet):
    """
    Endpoints:
      POST /api/usuarios/registro/            Registra un profesor
      POST /api/usuarios/login/               Inicia sesión
      POST /api/usuarios/logout/              Cierra sesión
      GET  /api/usuarios/perfil/              Devuelve el perfil actual
      PUT  /api/usuarios/perfil/actualizar/   Actualiza el perfil
      POST /api/usuarios/cambiar-password/    Cambia la contraseña
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def registro(self, request):
        resultado = ServicioUsuarios.registrar_profesor(request.data)
        code = status.HTTP_201_CREATED if resultado['success'] else status.HTTP_400_BAD_REQUEST
        return Response(resultado, status=code)

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        resultado = ServicioUsuarios.autenticar_profesor(
            correo=serializer.validated_data['correo_profe'],
            password=serializer.validated_data['password'],
        )
        if resultado['success']:
            request.session['id_profesor'] = resultado['id_profesor']
            return Response(resultado, status=status.HTTP_200_OK)
        return Response(resultado, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        request.session.flush()
        return Response(
            {'success': True, 'message': 'Sesión cerrada exitosamente'},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'])
    def perfil(self, request):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()
        resultado = ServicioUsuarios.obtener_perfil(id_profesor)
        code = status.HTTP_200_OK if resultado['success'] else status.HTTP_404_NOT_FOUND
        return Response(resultado, status=code)

    @action(detail=False, methods=['put'], url_path='perfil/actualizar')
    def actualizar_perfil(self, request):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()
        resultado = ServicioUsuarios.actualizar_perfil(id_profesor, request.data)
        code = status.HTTP_200_OK if resultado['success'] else status.HTTP_400_BAD_REQUEST
        return Response(resultado, status=code)

    @action(detail=False, methods=['post'], url_path='cambiar-password')
    def cambiar_password(self, request):
        id_profesor = _get_id_profesor(request)
        if not id_profesor:
            return _no_auth()

        actual = request.data.get('password_actual')
        nuevo = request.data.get('password_nuevo')
        if not actual or not nuevo or len(nuevo) < 8:
            return Response(
                {'success': False, 'error': 'password_actual y password_nuevo (min 8) son requeridos'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        resultado = ServicioUsuarios.cambiar_password(id_profesor, actual, nuevo)
        code = status.HTTP_200_OK if resultado['success'] else status.HTTP_400_BAD_REQUEST
        return Response(resultado, status=code)
