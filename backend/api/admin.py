from django.contrib import admin

from .models import (
    UserProfe, InfCurp, CategoriasDoc, 
    InfCarpeta, DocDocumento, VersionDoc, 
    DocExpediente, ExpedienteContenido
)

@admin.register(UserProfe)
class UserProfeAdmin(admin.ModelAdmin):
    list_display = ('correo_profe', 'rol_profe', 'activo')
    search_fields = ('correo_profe',)

@admin.register(DocDocumento)
class DocDocumentoAdmin(admin.ModelAdmin):
    list_display = ('titulo_doc', 'id_profesor', 'id_tipo', 'fecha_creacion')
    list_filter = ('id_tipo', 'id_profesor')

admin.site.register(InfCurp)
admin.site.register(CategoriasDoc)
admin.site.register(InfCarpeta)
admin.site.register(VersionDoc)
admin.site.register(DocExpediente)
admin.site.register(ExpedienteContenido)

from .models import Login, UserProfile


@admin.register(Login)
class LoginAdmin(admin.ModelAdmin):
    list_display = ['user', 'login_time', 'logout_time', 'is_active', 'ip_address']
    list_filter = ['is_active', 'login_time', 'user']
    search_fields = ['user__username', 'ip_address']
    readonly_fields = ['login_time', 'logout_time', 'user_agent']
    
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('user', 'ip_address')
        }),
        ('Tiempos de Sesión', {
            'fields': ('login_time', 'logout_time', 'is_active')
        }),
        ('Detalles del Dispositivo', {
            'fields': ('user_agent',),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'university_id', 'is_verified', 'created_at']
    list_filter = ['role', 'is_verified', 'created_at']
    search_fields = ['user__username', 'university_id', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Usuario Asociado', {
            'fields': ('user',)
        }),
        ('Información Personal', {
            'fields': ('role', 'phone', 'university_id', 'is_verified')
        }),
        ('Fecha de Registro', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

