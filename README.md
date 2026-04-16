# EqC-SEIP-SGE
Sistema Gestor de Expedientes para las materias de Ingeniería de Software y Programación para Internet
## Nomenclatura de commits:
| Type     | Mean                                         |
|----------|----------------------------------------------|
| feat     | New feature                                  |
| fix      | Bugs error correction                        |
| build    | Changes on build system                      |
| chore    | Changes that don't affect production system  |
| ci       | Changes on setting of Continuous Integration |
| docs     | Changes on documentation                     |
| pref     | Changes of optimization                      |
| refactor | Process of refactoring                       |
| revert   | Reverts changes to the last one              |
| style    | Syntax changes                               |
| text     | Add or change test                           |
# Pasos para descargar el repositorio por primera vez
## Requisitos previos
Los de Frontend deben tener descargado *Node.js (v18 o superior)*

Los de Backend deben tener descargado *Python (v12 o superior) para evitar errores con Django*

Descargen el repositorio como siempre lo han hecho *(Con git clone)*
### Frontend
1. Abran la terminal
2. Entren a la carpeta *frontend* del repositorio
3. Ejecuten el siguiente comando: `npm install`
> Esto hace que se descarguen todas las herramientas necesarias de React (Librerías, carpetas, etc).
### Backend
1. Abran la terminal
2. Entren en la carpeta *backend* del repositorio
3. Deben crear el entorno virtual de Python:
   1. Ejecuten el comando `python -m venv venv`
   2. Activen el entorno virtual:
      - Windows: `venv\Scripts\activate`
      - Linux / Mac: `source venv/bin/activate`
5. Ejecuten el comando `pip install -r requirements.txt`
> Este comando lee el archivo 'requirements' y extrae los datos de ahí para instalar DJango. Esto asegura que todos tengamos la misma versión y librerías.
