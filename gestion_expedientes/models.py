# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuditoriaCambios(models.Model):
    id_auditoria = models.AutoField(primary_key=True)
    tabla = models.CharField(max_length=50, blank=True, null=True)
    operacion = models.CharField(max_length=10, blank=True, null=True)
    id_registro = models.IntegerField(blank=True, null=True)
    usuario = models.CharField(max_length=254, blank=True, null=True)
    fecha_cambio = models.DateTimeField(blank=True, null=True)
    valores_anteriores = models.TextField(blank=True, null=True)
    valores_nuevos = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'auditoria_cambios'


class CategoriasDoc(models.Model):
    id_tipo = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(unique=True, max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'categorias_doc'


class DocDocumento(models.Model):
    id_doc = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey('UserProfe', models.DO_NOTHING, db_column='id_profesor')
    titulo_doc = models.CharField(max_length=50)
    fecha_creacion = models.DateTimeField(blank=True, null=True)
    fecha_expedicion = models.DateTimeField(blank=True, null=True)
    ruta_archivo = models.TextField()
    id_folder = models.ForeignKey('InfCarpeta', models.DO_NOTHING, db_column='id_folder', blank=True, null=True)
    id_tipo = models.ForeignKey(CategoriasDoc, models.DO_NOTHING, db_column='id_tipo')
    tamano_bytes = models.BigIntegerField(blank=True, null=True)
    extension_archivo = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'doc_documento'
        unique_together = (('id_profesor', 'titulo_doc'),)


class DocExpediente(models.Model):
    id_exp = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey('UserProfe', models.DO_NOTHING, db_column='id_profesor')
    nombre_convocatoria = models.CharField(max_length=50)
    fecha_creacion = models.DateTimeField(blank=True, null=True)
    fecha_expedicion = models.DateTimeField(blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'doc_expediente'
        unique_together = (('id_profesor', 'nombre_convocatoria'),)


class ExpedienteContenido(models.Model):
    pk = models.CompositePrimaryKey('id_exp', 'id_doc')
    id_exp = models.ForeignKey(DocExpediente, models.DO_NOTHING, db_column='id_exp')
    id_doc = models.ForeignKey(DocDocumento, models.DO_NOTHING, db_column='id_doc')
    orden = models.IntegerField(blank=True, null=True)
    fecha_agregado = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'expediente_contenido'


class InfCarpeta(models.Model):
    id_folder = models.AutoField(primary_key=True)
    nombre_carpeta = models.CharField(max_length=50)
    id_profesor = models.ForeignKey('UserProfe', models.DO_NOTHING, db_column='id_profesor')
    id_padre = models.ForeignKey('self', models.DO_NOTHING, db_column='id_padre', blank=True, null=True)
    fecha_creacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inf_carpeta'
        unique_together = (('id_profesor', 'nombre_carpeta', 'id_padre'),)


class InfCurp(models.Model):
    id_curp = models.AutoField(primary_key=True)
    id_profesor = models.OneToOneField('UserProfe', models.DO_NOTHING, db_column='id_profesor')
    curp_profe = models.CharField(unique=True, max_length=18)
    full_name = models.CharField(max_length=150)
    fecha_nacimiento = models.DateTimeField(blank=True, null=True)
    fecha_actualizacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inf_curp'


class UserProfe(models.Model):
    id_profesor = models.AutoField(primary_key=True)
    correo_profe = models.CharField(unique=True, max_length=254)
    password_profe = models.CharField(max_length=60)
    numero_profe = models.IntegerField(blank=True, null=True)
    genero_profe = models.CharField(max_length=2, blank=True, null=True)
    rol_profe = models.CharField(max_length=20)
    fecha_registro = models.DateTimeField(blank=True, null=True)
    activo = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'user_profe'


class VersionDoc(models.Model):
    id_version = models.AutoField(primary_key=True)
    id_doc = models.ForeignKey(DocDocumento, models.DO_NOTHING, db_column='id_doc')
    ruta_archivo = models.CharField(max_length=255)
    comentario_cambio = models.TextField(blank=True, null=True)
    num_version = models.IntegerField()
    fecha_subida = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'version_doc'
        unique_together = (('id_doc', 'num_version'),)
