from django.urls import path
from .views import UsuarioViewSet

app_name = 'usuarios_backend'

urlpatterns = [
    path('usuarios/registro/',
         UsuarioViewSet.as_view({'post': 'registro'}),
         name='usuario-registro'),
    path('usuarios/login/',
         UsuarioViewSet.as_view({'post': 'login'}),
         name='usuario-login'),
    path('usuarios/logout/',
         UsuarioViewSet.as_view({'post': 'logout'}),
         name='usuario-logout'),
    path('usuarios/perfil/',
         UsuarioViewSet.as_view({'get': 'perfil'}),
         name='usuario-perfil'),
    path('usuarios/perfil/actualizar/',
         UsuarioViewSet.as_view({'put': 'actualizar_perfil'}),
         name='usuario-perfil-actualizar'),
    path('usuarios/cambiar-password/',
         UsuarioViewSet.as_view({'post': 'cambiar_password'}),
         name='usuario-cambiar-password'),
]
