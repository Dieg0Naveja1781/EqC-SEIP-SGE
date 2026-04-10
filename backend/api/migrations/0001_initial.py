from django.db import migrations, models
import django.db.models.deletion


CATEGORIAS = [
    'Artículo Científico',
    'Libro',
    'Capítulo de Libro',
    'Congreso',
    'Seminario',
    'Taller',
    'Certificado',
    'Constancia',
    'Evaluación',
    'Reconocimiento',
    'Otro',
]


def insertar_categorias(apps, schema_editor):
    CategoriasDoc = apps.get_model('api', 'CategoriasDoc')
    for nombre in CATEGORIAS:
        CategoriasDoc.objects.get_or_create(nombre_categoria=nombre)


def revertir_categorias(apps, schema_editor):
    CategoriasDoc = apps.get_model('api', 'CategoriasDoc')
    CategoriasDoc.objects.filter(nombre_categoria__in=CATEGORIAS).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [

        # ----------------------------------------------------------------
        # 1. Nuevos campos en InfCurp
        # ----------------------------------------------------------------
        migrations.AddField(
            model_name='infcurp',
            name='curp',
            field=models.CharField(blank=True, max_length=18, null=True),
        ),
        migrations.AddField(
            model_name='infcurp',
            name='nombres',
            field=models.CharField(blank=True, max_length=75, null=True),
        ),
        migrations.AddField(
            model_name='infcurp',
            name='apellidos',
            field=models.CharField(blank=True, max_length=75, null=True),
        ),
        # full_name pasa a ser opcional (ya existía como NOT NULL en 0001,
        # lo hacemos nullable para que conviva con los nuevos campos)
        migrations.AlterField(
            model_name='infcurp',
            name='full_name',
            field=models.CharField(blank=True, max_length=150, null=True),
        ),

        # ----------------------------------------------------------------
        # 2. Tabla nueva: RolProfe
        # ----------------------------------------------------------------
        migrations.CreateModel(
            name='RolProfe',
            fields=[
                ('id_rol', models.AutoField(primary_key=True, serialize=False)),
                ('rol', models.CharField(max_length=100)),
                ('id_profesor', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='roles',
                    to='api.userprofe',
                )),
            ],
            options={
                'verbose_name': 'Rol',
                'verbose_name_plural': 'Roles',
                'db_table': 'rol_profe',
            },
        ),

        # ----------------------------------------------------------------
        # 3. Tabla nueva: IDSProfe
        # ----------------------------------------------------------------
        migrations.CreateModel(
            name='IDSProfe',
            fields=[
                ('id_identificador', models.AutoField(primary_key=True, serialize=False)),
                ('cvu',                models.IntegerField(blank=True, null=True)),
                ('orc',                models.CharField(blank=True, max_length=20,  null=True)),
                ('thomson_researcher', models.CharField(blank=True, max_length=12,  null=True)),
                ('arxiv_autor',        models.CharField(blank=True, max_length=128, null=True)),
                ('pubmed_autor',       models.IntegerField(blank=True, null=True)),
                ('open',               models.CharField(blank=True, max_length=128, null=True)),
                ('id_profesor', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='identificadores',
                    to='api.userprofe',
                )),
            ],
            options={
                'verbose_name': 'Identificador Académico',
                'verbose_name_plural': 'Identificadores Académicos',
                'db_table': 'ids_profe',
            },
        ),

        # ----------------------------------------------------------------
        # 4. Insertar categorías por defecto
        # ----------------------------------------------------------------
        migrations.RunPython(insertar_categorias, revertir_categorias),
    ]