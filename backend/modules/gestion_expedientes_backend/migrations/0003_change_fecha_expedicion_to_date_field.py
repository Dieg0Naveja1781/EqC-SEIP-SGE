# Generated migration to change fecha_expedicion from DateTimeField to DateField

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion_expedientes_backend', '0002_categoriacustom'),
    ]

    operations = [
        migrations.AlterField(
            model_name='docdocumento',
            name='fecha_expedicion',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='docexpediente',
            name='fecha_expedicion',
            field=models.DateField(blank=True, null=True),
        ),
    ]
