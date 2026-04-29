from rest_framework import serializers
from api.models import (
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
            'ruta_archivo',
            'nombre_categoria', 'nombre_carpeta',
        ]
        read_only_fields = ['id_doc', 'fecha_creacion', 'ruta_archivo']


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
    """Valida datos para subir un documento"""
    titulo_doc = serializers.CharField(max_length=50)
    id_tipo = serializers.IntegerField()
    id_folder = serializers.IntegerField(required=False, allow_null=True)
    archivo = serializers.FileField()
    fecha_expedicion = serializers.DateTimeField(required=False, allow_null=True)

    def validate_archivo(self, archivo):
        max_size = 50 * 1024 * 1024
        if archivo.size > max_size:
            raise serializers.ValidationError('El archivo no debe exceder 50MB')
        return archivo


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
