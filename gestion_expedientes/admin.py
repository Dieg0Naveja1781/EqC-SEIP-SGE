from django.contrib import admin

from .models import UserProfe, DocDocumento, CategoriasDoc, InfCurp, DocExpediente


admin.site.register(UserProfe)
admin.site.register(CategoriasDoc)
admin.site.register(DocDocumento)
admin.site.register(InfCurp)
admin.site.register(DocExpediente)