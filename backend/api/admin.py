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
