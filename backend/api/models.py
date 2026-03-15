
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.utils import timezone

# ============================================================================
# TABLA 1: user_profe - Usuarios del Sistema (Profesores/Investigadores)
# ============================================================================
class UserProfe(models.Model):
    """
    Tabla de usuarios del sistema.
    3NF: Contiene solo atributos que dependen únicamente de id_profesor (PK)
    """
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
        ('ND', 'Prefiero no decir'),
    ]
    
    ROL_CHOICES = [
        ('INVESTIGADOR', 'Investigador'),
        ('MEDIO_TIEMPO', 'Profesor Medio Tiempo'),
        ('TIEMPO_COMPLETO', 'Profesor Tiempo Completo'),
    ]
    
    id_profesor = models.AutoField(primary_key=True)
    correo_profe = models.EmailField(unique=True, max_length=254)
    password_profe = models.CharField(max_length=60)
    numero_profe = models.IntegerField(null=True, blank=True)
    genero_profe = models.CharField(max_length=2, choices=GENDER_CHOICES, null=True, blank=True)
    rol_profe = models.CharField(max_length=20, choices=ROL_CHOICES)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'user_profe'
        verbose_name = 'Profesor'
        verbose_name_plural = 'Profesores'
        ordering = ['correo_profe']
    
    def __str__(self):
        return f"{self.correo_profe} - {self.rol_profe}"


# ============================================================================
# TABLA 2: inf_curp - Información Adicional del Profesor
# ============================================================================
class InfCurp(models.Model):
    """
    Información complementaria del profesor.
    3NF: Relación 1:1 con UserProfe, FK a user_profe
    Separada para evitar dependencia parcial en 2NF
    """
    id_curp = models.AutoField(primary_key=True)
    id_profesor = models.OneToOneField(
        UserProfe, 
        on_delete=models.CASCADE, 
        to_field='id_profesor',
        related_name='curp_info'
    )
    full_name = models.CharField(max_length=150)
    fecha_nacimiento = models.DateTimeField(null=True, blank=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'inf_curp'
        verbose_name = 'Información CURP'
        verbose_name_plural = 'Información CURP'
    
    def __str__(self):
        return f"CURP de {self.full_name}"


# ============================================================================
# TABLA 3: categorias_doc - Categorías/Tipos de Documentos
# ============================================================================
class CategoriasDoc(models.Model):
    """
    Tipos de documentos que pueden cargarse.
    3NF: Tabla de referencia independiente
    Ejemplos: Artículos, Cursos, Evaluaciones, Constancias, Certificados, etc.
    """
    id_tipo = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'categorias_doc'
        verbose_name = 'Categoría de Documento'
        verbose_name_plural = 'Categorías de Documentos'
        ordering = ['nombre_categoria']
    
    def __str__(self):
        return self.nombre_categoria


# ============================================================================
# TABLA 4: inf_carpeta - Carpetas de Almacenamiento
# ============================================================================
class InfCarpeta(models.Model):
    """
    Sistema de carpetas para organizar documentos y expedientes.
    3NF: Estructura jerárquica con auto-referencia (id_padre = NULL si es raíz)
    FK a user_profe (propietario)
    """
    id_folder = models.AutoField(primary_key=True)
    nombre_carpeta = models.CharField(max_length=50)
    id_profesor = models.ForeignKey(
        UserProfe,
        on_delete=models.CASCADE,
        to_field='id_profesor',
        related_name='carpetas'
    )
    id_padre = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcarpetas'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'inf_carpeta'
        verbose_name = 'Carpeta'
        verbose_name_plural = 'Carpetas'
        unique_together = ('id_profesor', 'nombre_carpeta', 'id_padre')
    
    def __str__(self):
        return f"{self.nombre_carpeta}"


# ============================================================================
# TABLA 5: doc_documento - Documentos Cargados
# ============================================================================
class DocDocumento(models.Model):
    """
    Documentos subidos por los profesores.
    3NF: 
    - FK a user_profe (propietario)
    - FK a inf_carpeta (ubicación)
    - FK a categorias_doc (tipo/categoría)
    - Versiones en tabla separada (version_doc)
    """
    id_doc = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey(
        UserProfe,
        on_delete=models.CASCADE,
        to_field='id_profesor',
        related_name='documentos'
    )
    titulo_doc = models.CharField(max_length=50)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_expedicion = models.DateTimeField(null=True, blank=True)
    ruta_archivo = models.TextField()
    id_folder = models.ForeignKey(
        InfCarpeta,
        on_delete=models.SET_NULL,
        null=True,
        to_field='id_folder',
        related_name='documentos'
    )
    id_tipo = models.ForeignKey(
        CategoriasDoc,
        on_delete=models.PROTECT,
        to_field='id_tipo',
        related_name='documentos'
    )
    
    class Meta:
        db_table = 'doc_documento'
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'
        unique_together = ('id_profesor', 'titulo_doc')
    
    def __str__(self):
        return f"{self.titulo_doc} - {self.id_profesor.correo_profe}"


# ============================================================================
# TABLA 6: version_doc - Historial de Versiones de Documentos
# ============================================================================
class VersionDoc(models.Model):
    """
    Historial de versiones de documentos.
    3NF: 
    - FK a doc_documento
    - Tabla separada para mantener 1NF (evita atributos multivaluados)
    """
    id_version = models.AutoField(primary_key=True)
    id_doc = models.ForeignKey(
        DocDocumento,
        on_delete=models.CASCADE,
        to_field='id_doc',
        related_name='versiones'
    )
    ruta_archivo = models.CharField(max_length=255)
    num_version = models.IntegerField()
    fecha_subida = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'version_doc'
        verbose_name = 'Versión de Documento'
        verbose_name_plural = 'Versiones de Documentos'
        unique_together = ('id_doc', 'num_version')
        ordering = ['-num_version']
    
    def __str__(self):
        return f"v{self.num_version} de {self.id_doc.titulo_doc}"


# ============================================================================
# TABLA 7: doc_expediente - Expedientes Generados
# ============================================================================
class DocExpediente(models.Model):
    """
    Expedientes creados por profesores (colecciones de documentos).
    3NF:
    - FK a user_profe (propietario)
    - Relación M:N con documentos mediante expediente_contenido
    """
    id_exp = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey(
        UserProfe,
        on_delete=models.CASCADE,
        to_field='id_profesor',
        related_name='expedientes'
    )
    nombre_convocatoria = models.CharField(max_length=50)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_expedicion = models.DateTimeField(null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'doc_expediente'
        verbose_name = 'Expediente'
        verbose_name_plural = 'Expedientes'
        unique_together = ('id_profesor', 'nombre_convocatoria')
    
    def __str__(self):
        return f"{self.nombre_convocatoria} - {self.id_profesor.correo_profe}"


# ============================================================================
# TABLA 8: expediente_contenido - Relación M:N (Expediente ↔ Documentos)
# ============================================================================
class ExpedienteContenido(models.Model):
    """
    Tabla de unión para la relación M:N entre expedientes y documentos.
    3NF:
    - Clave primaria compuesta: (id_exp, id_doc)
    - Evita redundancia en la relación M:N
    """
    id_exp = models.ForeignKey(
        DocExpediente,
        on_delete=models.CASCADE,
        to_field='id_exp'
    )
    id_doc = models.ForeignKey(
        DocDocumento,
        on_delete=models.CASCADE,
        to_field='id_doc'
    )
    orden = models.IntegerField(default=0)
    fecha_agregado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'expediente_contenido'
        verbose_name = 'Contenido de Expediente'
        verbose_name_plural = 'Contenidos de Expedientes'
        unique_together = ('id_exp', 'id_doc')
        ordering = ['orden']
    
    def __str__(self):
        return f"{self.id_exp.nombre_convocatoria} → {self.id_doc.titulo_doc}"
