"""
Script para insertar las categorias iniciales del sistema.
Ejecutar una sola vez.
"""

import os
import sys
import django

# Ajusta la ruta al backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

sys.path.insert(0, BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

django.setup()

from modules.gestion_expedientes_backend.models import CategoriasDoc

CATEGORIAS = [
    "Docencia",
    "Gestion",
    "Titulacion",
    "Produccion",
    "Tutoria",
]

creadas = 0

for nombre in CATEGORIAS:

    _, creada = CategoriasDoc.objects.get_or_create(
        nombre_categoria=nombre
    )

    if creada:
        creadas += 1
        print(f"✅ Categoria creada: {nombre}")
    else:
        print(f"ℹ️ Ya existe: {nombre}")

print("\n--------------------------------")
print(f"Categorias creadas: {creadas}")
print(f"Total en BD: {CategoriasDoc.objects.count()}")
print("--------------------------------")