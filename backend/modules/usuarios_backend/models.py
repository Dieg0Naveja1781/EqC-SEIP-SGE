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
