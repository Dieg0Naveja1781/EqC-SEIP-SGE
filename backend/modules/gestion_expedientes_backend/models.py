from django.db import models

from modules.usuarios_backend.models import UserProfe


class CategoriasDoc(models.Model):
    """Tipos de documentos disponibles."""
    id_tipo = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(unique=True, max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'categorias_doc'
        verbose_name = 'Categoría de Documento'
        verbose_name_plural = 'Categorías de Documentos'
        ordering = ['nombre_categoria']

    def __str__(self):
        return self.nombre_categoria


class InfCarpeta(models.Model):
    """Carpetas jerárquicas para organizar documentos."""
    id_folder = models.AutoField(primary_key=True)
    nombre_carpeta = models.CharField(max_length=50)
    id_profesor = models.ForeignKey(
        UserProfe, on_delete=models.CASCADE,
        db_column='id_profesor', related_name='carpetas',
    )
    id_padre = models.ForeignKey(
        'self', on_delete=models.CASCADE,
        db_column='id_padre', null=True, blank=True,
        related_name='subcarpetas',
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inf_carpeta'
        verbose_name = 'Carpeta'
        verbose_name_plural = 'Carpetas'
        unique_together = (('id_profesor', 'nombre_carpeta', 'id_padre'),)

    def __str__(self):
        return self.nombre_carpeta


class DocDocumento(models.Model):
    """Documento subido por un profesor."""
    id_doc = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey(
        UserProfe, on_delete=models.CASCADE,
        db_column='id_profesor', related_name='documentos',
    )
    id_tipo = models.ForeignKey(
        CategoriasDoc, on_delete=models.PROTECT,
        db_column='id_tipo', related_name='documentos',
    )
    id_folder = models.ForeignKey(
        InfCarpeta, on_delete=models.SET_NULL,
        db_column='id_folder', blank=True, null=True,
        related_name='documentos',
    )
    titulo_doc = models.CharField(max_length=50)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_expedicion = models.DateField(blank=True, null=True)
    ruta_archivo = models.TextField()
    tamano_bytes = models.BigIntegerField(blank=True, null=True)
    extension_archivo = models.CharField(max_length=10, blank=True, default='')
    metadatos = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'doc_documento'
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'
        unique_together = (('id_profesor', 'titulo_doc'),)

    def __str__(self):
        return self.titulo_doc


class DocExpediente(models.Model):
    """Colección de documentos agrupada por convocatoria."""
    id_exp = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey(
        UserProfe, on_delete=models.CASCADE,
        db_column='id_profesor', related_name='expedientes',
    )
    nombre_convocatoria = models.CharField(max_length=50)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_expedicion = models.DateField(blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'doc_expediente'
        verbose_name = 'Expediente'
        verbose_name_plural = 'Expedientes'
        unique_together = (('id_profesor', 'nombre_convocatoria'),)

    def __str__(self):
        return self.nombre_convocatoria


class ExpedienteContenido(models.Model):
    """Tabla de unión M:N entre expedientes y documentos."""
    id_exp = models.ForeignKey(
        DocExpediente, on_delete=models.CASCADE, db_column='id_exp',
    )
    id_doc = models.ForeignKey(
        DocDocumento, on_delete=models.CASCADE, db_column='id_doc',
    )
    orden = models.IntegerField(default=0)
    fecha_agregado = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expediente_contenido'
        verbose_name = 'Contenido de Expediente'
        verbose_name_plural = 'Contenidos de Expedientes'
        unique_together = (('id_exp', 'id_doc'),)
        ordering = ['orden']


class VersionDoc(models.Model):
    """Historial de versiones de un documento."""
    id_version = models.AutoField(primary_key=True)
    id_doc = models.ForeignKey(
        DocDocumento, on_delete=models.CASCADE,
        db_column='id_doc', related_name='versiones',
    )
    ruta_archivo = models.CharField(max_length=255)
    num_version = models.IntegerField()
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'version_doc'
        verbose_name = 'Versión de Documento'
        verbose_name_plural = 'Versiones de Documentos'
        unique_together = (('id_doc', 'num_version'),)
        ordering = ['-num_version']

    def __str__(self):
        return f"v{self.num_version}"


class CategoriaCustom(models.Model):
    """Categoría de documento personalizada creada por un profesor."""
    id_cat_custom = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey(
        UserProfe, on_delete=models.CASCADE,
        db_column='id_profesor', related_name='categorias_custom',
    )
    nombre = models.CharField(max_length=100)
    # Lista de claves de campos, e.g. ["cicloEscolar", "grupo", "sede"]
    campos = models.JSONField(default=list)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categoria_custom'
        verbose_name = 'Categoría Personalizada'
        verbose_name_plural = 'Categorías Personalizadas'
        unique_together = (('id_profesor', 'nombre'),)
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} (prof. {self.id_profesor_id})"
