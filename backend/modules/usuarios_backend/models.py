from django.db import models

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

    def __str__(self):
        return self.correo_profe

class InfCurp(models.Model):
    id_curp = models.AutoField(primary_key=True)
    id_profesor = models.OneToOneField(UserProfe, models.CASCADE, db_column='id_profesor')
    curp_profe = models.CharField(unique=True, max_length=18)
    full_name = models.CharField(max_length=150)
    fecha_nacimiento = models.DateTimeField(blank=True, null=True)
    fecha_actualizacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inf_curp'

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