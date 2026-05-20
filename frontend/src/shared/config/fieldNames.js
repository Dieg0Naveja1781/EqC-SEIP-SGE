/**
 * Mapeador de nombres técnicos de campos a nombres legibles.
 * Centralizado aquí para fácil mantenimiento.
 *
 * Estos nombres se usan en:
 * - Tablas de PDFs de expedientes
 * - Formularios de metadatos
 * - Vistas de documentos
 */

export const FIELD_NAMES_MAP = {
  // Campos de Tutoría
  cicloTutoria: 'Ciclo',
  cicloEscolar: 'Ciclo Escolar',
  programa: 'Programa',
  sede: 'Sede',
  grupo: 'Grupo',

  // Campos de Producción Académica
  titulo: 'Título',
  autores: 'Autores',
  fecha_publicacion: 'Fecha de Publicación',
  editorial: 'Editorial',
  doi: 'DOI',
  issn: 'ISSN',
  isbn: 'ISBN',
  volumen: 'Volumen',
  numero: 'Número',
  paginas: 'Páginas',
  indice: 'Índice',

  // Campos de Docencia
  materia: 'Materia',
  semestre: 'Semestre',
  estudiantes: 'Estudiantes',
  horario: 'Horario',
  salon: 'Salón',

  // Campos de Gestión
  proyecto: 'Proyecto',
  departamento: 'Departamento',
  responsable: 'Responsable',
  duracion: 'Duración',
  presupuesto: 'Presupuesto',

  // Campos comunes
  fecha: 'Fecha',
  descripcion: 'Descripción',
  observaciones: 'Observaciones',
  estado: 'Estado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  pendiente: 'Pendiente',

  // Categorías personalizadas
  _categoria_Custom: 'Categoría Personalizada',

  // Añade más mapeos según necesites
};

/**
 * Obtiene el nombre legible para un campo técnico.
 * Si el campo no existe en el mapa, retorna el nombre técnico convertido a título.
 *
 * @param {string} technicalName - Nombre del campo técnico (ej: "cicloTutoria")
 * @returns {string} - Nombre legible (ej: "Ciclo")
 */
export function getFieldDisplayName(technicalName) {
  if (!technicalName) return '';

  // Si existe en el mapa, retorna el valor mapeado
  if (FIELD_NAMES_MAP[technicalName]) {
    return FIELD_NAMES_MAP[technicalName];
  }

  // Si no, convierte camelCase a palabras con primera letra mayúscula
  // Ejemplo: cicloTutoria → Ciclo Tutoría
  return technicalName
    .replace(/([A-Z])/g, ' $1') // Inserta espacio antes de mayúsculas
    .replace(/^./, (str) => str.toUpperCase()) // Primera letra mayúscula
    .trim();
}
