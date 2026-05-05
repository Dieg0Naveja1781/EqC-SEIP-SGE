from django.db import models


class UserProfe(models.Model):
    """Profesor / Investigador del sistema."""
    id_profesor = models.AutoField(primary_key=True)
    correo_profe = models.EmailField(unique=True, max_length=254)
    password_profe = models.CharField(max_length=60)
    numero_profe = models.IntegerField(blank=True, null=True)
    full_name = models.CharField(max_length=150, blank=True, default='')
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_profe'
        verbose_name = 'Profesor'
        verbose_name_plural = 'Profesores'
        ordering = ['correo_profe']

    def __str__(self):
        return self.correo_profe
