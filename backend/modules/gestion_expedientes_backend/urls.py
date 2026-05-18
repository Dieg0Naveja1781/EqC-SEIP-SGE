from django.urls import path
from .views import (
    ExpedienteViewSet, DocumentoViewSet, CarpetaViewSet, CategoriaDocViewSet,
    CategoriaCustomViewSet,
)

app_name = 'gestion_expedientes_backend'

urlpatterns = [
    # Expedientes
    path('expedientes/',
         ExpedienteViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='expediente-list'),
    path('expedientes/<int:pk>/documentos/',
         ExpedienteViewSet.as_view({'get': 'documentos'}),
         name='expediente-documentos'),
    path('expedientes/<int:pk>/agregar-documento/',
         ExpedienteViewSet.as_view({'post': 'agregar_documento'}),
         name='expediente-agregar-documento'),

    # Documentos
    path('documentos/',
         DocumentoViewSet.as_view({'get': 'list'}),
         name='documento-list'),
    path('documentos/buscar/',
         DocumentoViewSet.as_view({'get': 'buscar'}),
         name='documento-buscar'),
    path('documentos/subir/',
         DocumentoViewSet.as_view({'post': 'subir'}),
         name='documento-subir'),
    path('documentos/<int:pk>/descargar/',
         DocumentoViewSet.as_view({'get': 'descargar'}),
         name='documento-descargar'),
    path('documentos/<int:pk>/editar/',
         DocumentoViewSet.as_view({'put': 'editar'}),
         name='documento-editar'),
    path('documentos/<int:pk>/nueva-version/',
         DocumentoViewSet.as_view({'post': 'nueva_version'}),
         name='documento-nueva-version'),
    path('documentos/<int:pk>/versiones/',
         DocumentoViewSet.as_view({'get': 'versiones'}),
         name='documento-versiones'),
    path('documentos/<int:pk>/mover/',
         DocumentoViewSet.as_view({'post': 'mover'}),
         name='documento-mover'),
     path('documentos/<int:pk>/eliminar/',
          DocumentoViewSet.as_view({'delete': 'eliminar'}),
          name='documento-eliminar'),

    # Carpetas
    path('carpetas/',
         CarpetaViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='carpeta-list'),
    path('carpetas/<int:pk>/mover/',
         CarpetaViewSet.as_view({'post': 'mover'}),
         name='carpeta-mover'),
     path('carpetas/<int:pk>/eliminar/',
         CarpetaViewSet.as_view({'delete': 'eliminar'}),
         name='carpeta-eliminar'),
     path('carpetas/<int:pk>/renombrar/',
         CarpetaViewSet.as_view({'put': 'renombrar'}),
         name='carpeta-renombrar'),

    # Categorías
    path('categorias/',
         CategoriaDocViewSet.as_view({'get': 'list'}),
         name='categoria-list'),

    # Categorías personalizadas por usuario
    path('categorias-custom/',
         CategoriaCustomViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='categoria-custom-list'),
    path('categorias-custom/<int:pk>/',
         CategoriaCustomViewSet.as_view({'delete': 'destroy'}),
         name='categoria-custom-detail'),
]
