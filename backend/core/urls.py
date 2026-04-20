"""
URL configuration for core project.
Configuración completa de URLs con todos los endpoints de la API
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (
    AuthViewSet, 
    LoginHistoryViewSet,
    UserProfessorViewSet,
    DocumentoViewSet,
    CarpetaViewSet,
    ExpedienteViewSet,
    CategoriasDocViewSet
)

# Crear router para los ViewSets
router = DefaultRouter()

# Rutas de Autenticación
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'login-history', LoginHistoryViewSet, basename='login-history')

# Rutas de Usuarios/Profesores
router.register(r'usuarios', UserProfessorViewSet, basename='usuarios')

# Rutas de Documentos
router.register(r'documentos', DocumentoViewSet, basename='documentos')

# Rutas de Carpetas
router.register(r'carpetas', CarpetaViewSet, basename='carpetas')

# Rutas de Expedientes
router.register(r'expedientes', ExpedienteViewSet, basename='expedientes')

# Rutas de Categorías de Documentos
router.register(r'categorias-doc', CategoriasDocViewSet, basename='categorias-doc')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
