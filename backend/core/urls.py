"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Router para registrar los ViewSets de la app
router = DefaultRouter()
# Aquí se agregarán las rutas conforme se desarrollen las vistas

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]