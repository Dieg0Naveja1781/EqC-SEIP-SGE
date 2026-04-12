# backend/api/models.py - VERSIÓN RESUELTA

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
from django.utils import timezone

# ============================================================================
# TABLA 1: UserProfe - Usuarios del Sistema
# ============================================================================
class UserProfe(models.Model):
    """Tabla de usuarios del sistema (Profesores/Investigadores)"""
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
# TABLA 2: InfCurp - Información Adicional del Profesor
# ============================================================================
class InfCurp(models.Model):
    """Información complementaria del profesor"""
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
# OTROS MODELOS DE DOCUMENTOS Y EXPEDIENTES (DEL STASHED)
# ============================================================================
class CategoriasDoc(models.Model):
    """Tipos de documentos que pueden cargarse"""
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
# TABLA 7: LOGIN & USERPROFILE - Para autenticación moderna
# ============================================================================
class Login(models.Model):
    """Modelo para registrar intentos de login de usuarios"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_records')
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'login'
        verbose_name = 'Login'
        verbose_name_plural = 'Logins'
        ordering = ['-login_time']
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time.strftime('%Y-%m-%d %H:%M:%S')}"


class UserProfile(models.Model):
    """Modelo extendido de usuario con información adicional"""
    ROLE_CHOICES = [
        ('estudiante', 'Estudiante'),
        ('profesor', 'Profesor'),
        ('admin', 'Administrador'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='estudiante')
    phone = models.CharField(max_length=20, blank=True, null=True)
    university_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'user_profile'
        verbose_name = 'Perfil de Usuario'
        verbose_name_plural = 'Perfiles de Usuarios'
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"


# ============================================================================
# MODELOS DE DOCUMENTOS Y EXPEDIENTES (continuación)
# ============================================================================
class InfCarpeta(models.Model):
    """Sistema de carpetas para organizar documentos"""
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


class DocDocumento(models.Model):
    """Documentos cargados por los profesores"""
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


class VersionDoc(models.Model):
    """Historial de versiones de documentos"""
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


class DocExpediente(models.Model):
    """Expedientes creados por profesores"""
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


class ExpedienteContenido(models.Model):
    """Relación M:N entre expedientes y documentos"""
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