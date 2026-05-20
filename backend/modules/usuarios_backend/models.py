from django.db import models


class UserProfe(models.Model):
    """Profesor / Investigador del sistema."""
    id_profesor = models.AutoField(primary_key=True)
    correo_profe = models.EmailField(unique=True, max_length=254)
    password_profe = models.CharField(max_length=60)
    numero_profe = models.IntegerField(blank=True, null=True)
    full_name = models.CharField(max_length=150, blank=True, default='')
    rfc = models.CharField(max_length=13, blank=True, default='')
    curp = models.CharField(max_length=18, blank=True, default='')
    profesion = models.CharField(max_length=120, blank=True, default='')
    nivel_estudios = models.CharField(max_length=80, blank=True, default='')
    universidad = models.CharField(max_length=150, blank=True, default='')
    empresa = models.CharField(max_length=150, blank=True, default='')
    puesto = models.CharField(max_length=120, blank=True, default='')
    ubicacion = models.CharField(max_length=120, blank=True, default='')
    descripcion = models.TextField(blank=True, default='')
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_profe'
        verbose_name = 'Profesor'
        verbose_name_plural = 'Profesores'
        ordering = ['correo_profe']

    def __str__(self):
        return self.correo_profe
class InvestigadorID(models.Model):
    """IDs de investigador de un profesor (ORC ID, arXiv, PubMed, etc.).
    El 'tipo' es texto libre para permitir IDs personalizados."""
    id_inv = models.AutoField(primary_key=True)
    id_profesor = models.ForeignKey(
        UserProfe, on_delete=models.CASCADE,
        db_column='id_profesor', related_name='investigador_ids',
    )
    tipo = models.CharField(max_length=100)
    valor = models.CharField(max_length=100)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'investigador_id'
        verbose_name = 'ID de Investigador'
        verbose_name_plural = 'IDs de Investigador'
        ordering = ['fecha_creacion']

    def __str__(self):
        return f"{self.tipo}: {self.valor}"