from django.db import models


# ============================================================================
# TABLA 1: UserProfe - Usuarios del Sistema
# ============================================================================
class UserProfe(models.Model):
    GENDER_CHOICES = [
        ('M',  'Masculino'),
        ('F',  'Femenino'),
        ('O',  'Otro'),
        ('ND', 'Prefiero no decir'),
    ]
    ROL_CHOICES = [
        ('INVESTIGADOR',    'Investigador'),
        ('MEDIO_TIEMPO',    'Profesor Medio Tiempo'),
        ('TIEMPO_COMPLETO', 'Profesor Tiempo Completo'),
    ]

    id_profesor    = models.AutoField(primary_key=True)
    correo_profe   = models.EmailField(unique=True, max_length=254)
    password_profe = models.CharField(max_length=60)
    numero_profe   = models.IntegerField(null=True, blank=True)
    genero_profe   = models.CharField(max_length=2, choices=GENDER_CHOICES, null=True, blank=True)
    rol_profe      = models.CharField(max_length=20, choices=ROL_CHOICES)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo         = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_profe'
        verbose_name = 'Profesor'
        verbose_name_plural = 'Profesores'
        ordering = ['correo_profe']

    def __str__(self):
        return f"{self.correo_profe} - {self.rol_profe}"


# ============================================================================
# TABLA 2: InfCurp - Información Personal del Profesor
# ============================================================================
class InfCurp(models.Model):
    id_curp          = models.AutoField(primary_key=True)
    id_profesor      = models.OneToOneField(
        UserProfe,
        on_delete=models.CASCADE,
        related_name='curp_info'
    )
    # Campos nuevos agregados en 0002
    curp             = models.CharField(max_length=18, null=True, blank=True)
    nombres          = models.CharField(max_length=75, null=True, blank=True)
    apellidos        = models.CharField(max_length=75, null=True, blank=True)
    # Campo anterior conservado para no romper 0001
    full_name        = models.CharField(max_length=150, null=True, blank=True)
    fecha_nacimiento = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'inf_curp'
        verbose_name = 'Información CURP'
        verbose_name_plural = 'Información CURP'

    def __str__(self):
        return f"{self.nombres} {self.apellidos}" if self.nombres else self.full_name or ''


# ============================================================================
# TABLA 3: RolProfe - Roles (TABLA NUEVA)
# ============================================================================
class RolProfe(models.Model):
    id_rol      = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey(
        UserProfe,
        on_delete=models.CASCADE,
        related_name='roles'
    )
    rol = models.CharField(max_length=100)

    class Meta:
        db_table = 'rol_profe'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.rol


# ============================================================================
# TABLA 4: IDSProfe - Identificadores Académicos (TABLA NUEVA)
# ============================================================================
class IDSProfe(models.Model):
    id_identificador   = models.AutoField(primary_key=True)
    id_profesor        = models.ForeignKey(
        UserProfe,
        on_delete=models.CASCADE,
        related_name='identificadores'
    )
    cvu                = models.IntegerField(null=True, blank=True)
    orc                = models.CharField(max_length=20,  null=True, blank=True)
    thomson_researcher = models.CharField(max_length=12,  null=True, blank=True)
    arxiv_autor        = models.CharField(max_length=128, null=True, blank=True)
    pubmed_autor       = models.IntegerField(null=True, blank=True)
    open               = models.CharField(max_length=128, null=True, blank=True)

    class Meta:
        db_table = 'ids_profe'
        verbose_name = 'Identificador Académico'
        verbose_name_plural = 'Identificadores Académicos'

    def __str__(self):
        return f"IDs del profesor {self.id_profesor_id}"


# ============================================================================
# TABLA 5: CategoriasDoc - Tipos de Documentos
# ============================================================================
class CategoriasDoc(models.Model):
    id_tipo          = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(max_length=100, unique=True)
    descripcion      = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'categorias_doc'
        verbose_name = 'Categoría de Documento'
        verbose_name_plural = 'Categorías de Documentos'
        ordering = ['nombre_categoria']

    def __str__(self):
        return self.nombre_categoria


# ============================================================================
# TABLA 6: InfCarpeta - Carpetas de Documentos
# ============================================================================
class InfCarpeta(models.Model):
    id_folder      = models.AutoField(primary_key=True)
    nombre_carpeta = models.CharField(max_length=50)
    id_profesor    = models.ForeignKey(
        UserProfe,
        on_delete=models.CASCADE,
        related_name='carpetas'
    )
    id_padre       = models.ForeignKey(
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
        return self.nombre_carpeta


# ============================================================================
# TABLA 7: DocDocumento - Documentos Cargados
# ============================================================================
class DocDocumento(models.Model):
    id_doc           = models.AutoField(primary_key=True)
    id_profesor      = models.ForeignKey(
        UserProfe,
        on_delete=models.CASCADE,
        related_name='documentos'
    )
    titulo_doc       = models.CharField(max_length=50)
    fecha_creacion   = models.DateTimeField(auto_now_add=True)
    fecha_expedicion = models.DateTimeField(null=True, blank=True)
    ruta_archivo     = models.TextField()
    id_folder        = models.ForeignKey(
        InfCarpeta,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos'
    )
    id_tipo          = models.ForeignKey(
        CategoriasDoc,
        on_delete=models.PROTECT,
        related_name='documentos'
    )

    class Meta:
        db_table = 'doc_documento'
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'
        unique_together = ('id_profesor', 'titulo_doc')

    def __str__(self):
        return self.titulo_doc


# ============================================================================
# TABLA 8: VersionDoc - Historial de Versiones
# ============================================================================
class VersionDoc(models.Model):
    id_version   = models.AutoField(primary_key=True)
    id_doc       = models.ForeignKey(
        DocDocumento,
        on_delete=models.CASCADE,
        related_name='versiones'
    )
    ruta_archivo = models.CharField(max_length=255)
    num_version  = models.IntegerField()
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'version_doc'
        verbose_name = 'Versión de Documento'
        verbose_name_plural = 'Versiones de Documentos'
        unique_together = ('id_doc', 'num_version')
        ordering = ['-num_version']

    def __str__(self):
        return f"v{self.num_version} — {self.id_doc.titulo_doc}"


# ============================================================================
# TABLA 9: DocExpediente - Expedientes
# ============================================================================
class DocExpediente(models.Model):
    id_exp              = models.AutoField(primary_key=True)
    id_profesor         = models.ForeignKey(
        UserProfe,
        on_delete=models.CASCADE,
        related_name='expedientes'
    )
    nombre_convocatoria = models.CharField(max_length=50)
    fecha_creacion      = models.DateTimeField(auto_now_add=True)
    fecha_expedicion    = models.DateTimeField(null=True, blank=True)
    descripcion         = models.TextField(null=True, blank=True)
    documentos          = models.ManyToManyField(
        DocDocumento,
        through='ExpedienteContenido',
        related_name='expedientes'
    )

    class Meta:
        db_table = 'doc_expediente'
        verbose_name = 'Expediente'
        verbose_name_plural = 'Expedientes'
        unique_together = ('id_profesor', 'nombre_convocatoria')

    def __str__(self):
        return self.nombre_convocatoria


# ============================================================================
# TABLA 10: ExpedienteContenido - Relación M:N Expediente ↔ Documento
# ============================================================================
class ExpedienteContenido(models.Model):
    id_exp         = models.ForeignKey(DocExpediente, on_delete=models.CASCADE)
    id_doc         = models.ForeignKey(DocDocumento,  on_delete=models.CASCADE)
    orden          = models.IntegerField(default=0)
    fecha_agregado = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expediente_contenido'
        verbose_name = 'Contenido de Expediente'
        verbose_name_plural = 'Contenidos de Expedientes'
        unique_together = ('id_exp', 'id_doc')
        ordering = ['orden']

    def __str__(self):
        return f"{self.id_exp.nombre_convocatoria} → {self.id_doc.titulo_doc}"