import json
import os
from rest_framework import serializers
from .models import (
    CategoriasDoc, InfCarpeta, DocDocumento, DocExpediente,
    ExpedienteContenido, VersionDoc,
)


class CategoriaDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriasDoc
        fields = ['id_tipo', 'nombre_categoria', 'descripcion']


class InfCarpetaSerializer(serializers.ModelSerializer):
    subcarpetas = serializers.SerializerMethodField()

    class Meta:
        model = InfCarpeta
        fields = [
            'id_folder', 'nombre_carpeta', 'id_profesor', 'id_padre',
            'fecha_creacion', 'subcarpetas',
        ]
        read_only_fields = ['id_folder', 'fecha_creacion']

    def get_subcarpetas(self, obj):
        subs = InfCarpeta.objects.filter(id_padre=obj)
        return InfCarpetaSerializer(subs, many=True).data


class DocDocumentoSerializer(serializers.ModelSerializer):
    nombre_categoria = serializers.CharField(
        source='id_tipo.nombre_categoria', read_only=True,
    )
    nombre_carpeta = serializers.CharField(
        source='id_folder.nombre_carpeta', read_only=True, default=None,
    )

    class Meta:
        model = DocDocumento
        fields = [
            'id_doc', 'id_profesor', 'id_tipo', 'id_folder',
            'titulo_doc', 'fecha_creacion', 'fecha_expedicion',
            'ruta_archivo', 'tamano_bytes', 'extension_archivo', 'metadatos',
            'nombre_categoria', 'nombre_carpeta',
        ]
        read_only_fields = [
            'id_doc', 'fecha_creacion', 'ruta_archivo',
            'tamano_bytes', 'extension_archivo',
        ]


class VersionDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = VersionDoc
        fields = ['id_version', 'id_doc', 'ruta_archivo', 'num_version', 'fecha_subida']
        read_only_fields = ['id_version', 'fecha_subida']


class DocExpedienteSerializer(serializers.ModelSerializer):
    documentos_count = serializers.SerializerMethodField()

    class Meta:
        model = DocExpediente
        fields = [
            'id_exp', 'id_profesor', 'nombre_convocatoria',
            'fecha_creacion', 'fecha_expedicion', 'descripcion',
            'documentos_count',
        ]
        read_only_fields = ['id_exp', 'fecha_creacion']

    def get_documentos_count(self, obj):
        return ExpedienteContenido.objects.filter(id_exp=obj).count()


class SubidaDocumentoSerializer(serializers.Serializer):
    """Valida los datos para subir un documento PDF."""
    CATEGORIAS = ['Docencia', 'Gestion', 'Titulacion', 'Produccion', 'Tutoria']
    MAX_SIZE = 50 * 1024 * 1024  # 50 MB

    # Reglas numéricas por categoría: cada campo del JSON metadatos
    # se valida contra estas reglas.
    NUMERIC_RULES = {
        'Docencia':   {'cargaHoraria':   {'min': 0, 'integer': True}},
        'Titulacion': {'avance':         {'min': 0, 'max': 100}},
        'Tutoria':    {'numeroAlumnos':  {'min': 0, 'integer': True}},
    }

    titulo_doc = serializers.CharField(max_length=50)
    id_tipo = serializers.IntegerField()
    id_folder = serializers.IntegerField(required=False, allow_null=True)
    archivo = serializers.FileField()
    fecha_expedicion = serializers.DateTimeField(required=False, allow_null=True)
    categoria = serializers.ChoiceField(choices=CATEGORIAS)
    metadatos = serializers.JSONField(required=False, default=dict)

    def validate_archivo(self, archivo):
        ext = os.path.splitext(archivo.name)[1].lower()
        if ext != '.pdf':
            raise serializers.ValidationError('Solo se permiten archivos PDF (.pdf)')
        ctype = (getattr(archivo, 'content_type', '') or '').lower()
        if ctype and ctype != 'application/pdf':
            raise serializers.ValidationError('El archivo no es un PDF válido')
        if archivo.size > self.MAX_SIZE:
            raise serializers.ValidationError('El archivo no debe exceder 50MB')
        return archivo

    def validate(self, data):
        meta = data.get('metadatos') or {}
        # Cuando viaja en multipart, llega como string JSON.
        if isinstance(meta, str):
            try:
                meta = json.loads(meta)
            except ValueError:
                raise serializers.ValidationError({'metadatos': 'JSON inválido'})
        if not isinstance(meta, dict):
            raise serializers.ValidationError({'metadatos': 'Debe ser un objeto JSON'})

        rules = self.NUMERIC_RULES.get(data['categoria'], {})
        for field, rule in rules.items():
            if field not in meta or meta[field] in ('', None):
                continue
            try:
                val = float(meta[field])
            except (TypeError, ValueError):
                raise serializers.ValidationError({field: 'Debe ser numérico'})
            if rule.get('integer') and not float(val).is_integer():
                raise serializers.ValidationError({field: 'Debe ser un entero'})
            if 'min' in rule and val < rule['min']:
                raise serializers.ValidationError({field: f"Debe ser >= {rule['min']}"})
            if 'max' in rule and val > rule['max']:
                raise serializers.ValidationError({field: f"Debe ser <= {rule['max']}"})

        data['metadatos'] = meta
        return data


class ExpedienteContenidoSerializer(serializers.ModelSerializer):
    documento = DocDocumentoSerializer(source='id_doc', read_only=True)

    class Meta:
        model = ExpedienteContenido
        fields = ['id_exp', 'id_doc', 'orden', 'fecha_agregado', 'documento']
        read_only_fields = ['fecha_agregado']


class CrearCarpetaSerializer(serializers.Serializer):
    nombre_carpeta = serializers.CharField(max_length=50)
    id_padre = serializers.IntegerField(required=False, allow_null=True)


class CrearExpedienteSerializer(serializers.Serializer):
    nombre_convocatoria = serializers.CharField(max_length=50)
    descripcion = serializers.CharField(required=False, allow_blank=True)
    fecha_expedicion = serializers.DateTimeField(required=False, allow_null=True)
