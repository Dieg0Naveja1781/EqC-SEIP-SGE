from django.db import models

from modules.usuarios_backend.models import UserProfe

class CategoriasDoc(models.Model):
    id_tipo = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(unique=True, max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'categorias_doc'

    def __str__(self):
        return self.nombre_categoria

class InfCarpeta(models.Model):
    id_folder = models.AutoField(primary_key=True)
    nombre_carpeta = models.CharField(max_length=50)
    id_profesor = models.ForeignKey(UserProfe, models.CASCADE, db_column='id_profesor')
    id_padre = models.ForeignKey('self', models.SET_NULL, db_column='id_padre', blank=True, null=True)
    fecha_creacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inf_carpeta'
        unique_together = (('id_profesor', 'nombre_carpeta', 'id_padre'),)

class DocDocumento(models.Model):
    id_doc = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey(UserProfe, models.CASCADE, db_column='id_profesor')
    id_tipo = models.ForeignKey(CategoriasDoc, models.PROTECT, db_column='id_tipo')
    id_folder = models.ForeignKey(InfCarpeta, models.SET_NULL, db_column='id_folder', blank=True, null=True)
    titulo_doc = models.CharField(max_length=50)
    fecha_creacion = models.DateTimeField(blank=True, null=True)
    fecha_expedicion = models.DateTimeField(blank=True, null=True)
    ruta_archivo = models.TextField()
    tamano_bytes = models.BigIntegerField(blank=True, null=True)
    extension_archivo = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'doc_documento'
        unique_together = (('id_profesor', 'titulo_doc'),)

class DocExpediente(models.Model):
    id_exp = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey(UserProfe, models.CASCADE, db_column='id_profesor')
    nombre_convocatoria = models.CharField(max_length=50)
    fecha_creacion = models.DateTimeField(blank=True, null=True)
    fecha_expedicion = models.DateTimeField(blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'doc_expediente'
        unique_together = (('id_profesor', 'nombre_convocatoria'),)

class ExpedienteContenido(models.Model):

    id_exp = models.ForeignKey(DocExpediente, models.CASCADE, db_column='id_exp')
    id_doc = models.ForeignKey(DocDocumento, models.CASCADE, db_column='id_doc')
    orden = models.IntegerField(blank=True, null=True)
    fecha_agregado = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'expediente_contenido'
        unique_together = (('id_exp', 'id_doc'),)

class VersionDoc(models.Model):
    id_version = models.AutoField(primary_key=True)
    id_doc = models.ForeignKey(DocDocumento, models.CASCADE, db_column='id_doc')
    ruta_archivo = models.CharField(max_length=255)
    comentario_cambio = models.TextField(blank=True, null=True)
    num_version = models.IntegerField()
    fecha_subida = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'version_doc'
        unique_together = (('id_doc', 'num_version'),)