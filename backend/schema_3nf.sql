-- ============================================================================
-- SISTEMA GESTOR DE EXPEDIENTES - SCHEMA NORMALIZADO A 3NF
-- ============================================================================
-- Base de datos normalizada a tercera forma normal (3NF)
-- ============================================================================

-- ============================================================================
-- TABLA 1: user_profe - Usuarios del Sistema (Profesores/Investigadores)
-- ============================================================================
CREATE TABLE user_profe (
    id_profesor SERIAL PRIMARY KEY,
    correo_profe VARCHAR(254) UNIQUE NOT NULL,
    password_profe VARCHAR(60) NOT NULL,
    numero_profe INTEGER,
    full_name VARCHAR(150) NOT NULL DEFAULT '',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profe_correo ON user_profe(correo_profe);

-- ============================================================================
-- TABLA 2: categorias_doc - Tipos de Documentos
-- ============================================================================
-- 3NF: Tabla de referencia independiente para evitar dependencias transitivas
CREATE TABLE categorias_doc (
    id_tipo SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE INDEX idx_categorias_nombre ON categorias_doc(nombre_categoria);

-- ============================================================================
-- TABLA 3: inf_carpeta - Carpetas Jerárquicas
-- ============================================================================
-- 3NF: Estructura recursiva con id_padre NULL para raíz
CREATE TABLE inf_carpeta (
    id_folder SERIAL PRIMARY KEY,
    nombre_carpeta VARCHAR(50) NOT NULL,
    id_profesor INTEGER NOT NULL,
    id_padre INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inf_carpeta_profesor FOREIGN KEY (id_profesor)
        REFERENCES user_profe(id_profesor) ON DELETE CASCADE,
    CONSTRAINT fk_inf_carpeta_padre FOREIGN KEY (id_padre)
        REFERENCES inf_carpeta(id_folder) ON DELETE CASCADE,
    CONSTRAINT unique_carpeta_por_profesor_padre UNIQUE(id_profesor, nombre_carpeta, id_padre)
);

CREATE INDEX idx_inf_carpeta_profesor ON inf_carpeta(id_profesor);
CREATE INDEX idx_inf_carpeta_padre ON inf_carpeta(id_padre);

-- ============================================================================
-- TABLA 4: doc_documento - Documentos Cargados
-- ============================================================================
-- 3NF:
-- - FK a user_profe (propietario)
-- - FK a inf_carpeta (ubicación)
-- - FK a categorias_doc (tipo/categoría)
-- - Versiones en tabla separada (version_doc)
-- - metadatos: JSONB con los campos dinámicos según la categoría
--   (sin necesidad de tablas adicionales por tipo de documento)
CREATE TABLE doc_documento (
    id_doc SERIAL PRIMARY KEY,
    id_profesor INTEGER NOT NULL,
    titulo_doc VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expedicion TIMESTAMP,
    ruta_archivo TEXT NOT NULL,
    id_folder INTEGER,
    id_tipo INTEGER NOT NULL,
    tamano_bytes BIGINT,
    extension_archivo VARCHAR(10),
    metadatos JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT fk_doc_documento_profesor FOREIGN KEY (id_profesor)
        REFERENCES user_profe(id_profesor) ON DELETE CASCADE,
    CONSTRAINT fk_doc_documento_carpeta FOREIGN KEY (id_folder)
        REFERENCES inf_carpeta(id_folder) ON DELETE SET NULL,
    CONSTRAINT fk_doc_documento_tipo FOREIGN KEY (id_tipo)
        REFERENCES categorias_doc(id_tipo) ON DELETE RESTRICT,
    CONSTRAINT unique_doc_por_profesor UNIQUE(id_profesor, titulo_doc)
);

CREATE INDEX idx_doc_documento_profesor ON doc_documento(id_profesor);
CREATE INDEX idx_doc_documento_carpeta ON doc_documento(id_folder);
CREATE INDEX idx_doc_documento_tipo ON doc_documento(id_tipo);
CREATE INDEX idx_doc_titulo_fts ON doc_documento USING gin(to_tsvector('spanish', titulo_doc));
CREATE INDEX idx_doc_metadatos ON doc_documento USING gin(metadatos);

-- ============================================================================
-- TABLA 5: version_doc - Historial de Versiones
-- ============================================================================
-- 3NF: Tabla separada para mantener 1NF (evita atributos multivaluados)
CREATE TABLE version_doc (
    id_version SERIAL PRIMARY KEY,
    id_doc INTEGER NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    num_version INTEGER NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_version_doc_documento FOREIGN KEY (id_doc)
        REFERENCES doc_documento(id_doc) ON DELETE CASCADE,
    CONSTRAINT unique_version_por_doc UNIQUE(id_doc, num_version)
);

CREATE INDEX idx_version_doc_documento ON version_doc(id_doc);

-- ============================================================================
-- TABLA 6: doc_expediente - Expedientes
-- ============================================================================
-- 3NF: FK a user_profe (propietario), relación M:N con documentos
CREATE TABLE doc_expediente (
    id_exp SERIAL PRIMARY KEY,
    id_profesor INTEGER NOT NULL,
    nombre_convocatoria VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expedicion TIMESTAMP,
    descripcion TEXT,

    CONSTRAINT fk_doc_expediente_profesor FOREIGN KEY (id_profesor)
        REFERENCES user_profe(id_profesor) ON DELETE CASCADE,
    CONSTRAINT unique_expediente_por_profesor UNIQUE(id_profesor, nombre_convocatoria)
);

CREATE INDEX idx_doc_expediente_profesor ON doc_expediente(id_profesor);

-- ============================================================================
-- TABLA 7: expediente_contenido - Relación M:N (Expediente ↔ Documentos)
-- ============================================================================
-- 3NF: Tabla de unión con clave primaria compuesta (id_exp, id_doc)
CREATE TABLE expediente_contenido (
    id_exp INTEGER NOT NULL,
    id_doc INTEGER NOT NULL,
    orden INTEGER DEFAULT 0,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_exp, id_doc),
    CONSTRAINT fk_expediente_contenido_exp FOREIGN KEY (id_exp)
        REFERENCES doc_expediente(id_exp) ON DELETE CASCADE,
    CONSTRAINT fk_expediente_contenido_doc FOREIGN KEY (id_doc)
        REFERENCES doc_documento(id_doc) ON DELETE CASCADE
);

CREATE INDEX idx_expediente_contenido_exp ON expediente_contenido(id_exp);
CREATE INDEX idx_expediente_contenido_doc ON expediente_contenido(id_doc);

-- ============================================================================
-- VISTAS ÚTILES PARA CONSULTAS COMUNES
-- ============================================================================

-- Vista: Profesores con su información básica
CREATE VIEW v_profesores_completo AS
SELECT
    up.id_profesor,
    up.correo_profe,
    up.numero_profe,
    up.full_name,
    up.fecha_registro
FROM user_profe up
ORDER BY up.correo_profe;

-- Vista: Documentos con información de categoría y carpeta
CREATE VIEW v_documentos_completo AS
SELECT
    dd.id_doc,
    dd.titulo_doc,
    up.correo_profe,
    cd.nombre_categoria,
    ic.nombre_carpeta,
    dd.fecha_creacion,
    dd.fecha_expedicion,
    dd.tamano_bytes,
    dd.extension_archivo,
    dd.metadatos,
    (SELECT COUNT(*) FROM version_doc WHERE id_doc = dd.id_doc) as cantidad_versiones
FROM doc_documento dd
JOIN user_profe up ON dd.id_profesor = up.id_profesor
JOIN categorias_doc cd ON dd.id_tipo = cd.id_tipo
LEFT JOIN inf_carpeta ic ON dd.id_folder = ic.id_folder
ORDER BY dd.fecha_creacion DESC;

-- Vista: Expedientes con cantidad de documentos
CREATE VIEW v_expedientes_resumen AS
SELECT
    de.id_exp,
    de.nombre_convocatoria,
    up.correo_profe,
    de.fecha_creacion,
    de.fecha_expedicion,
    COUNT(ec.id_doc) as cantidad_documentos
FROM doc_expediente de
JOIN user_profe up ON de.id_profesor = up.id_profesor
LEFT JOIN expediente_contenido ec ON de.id_exp = ec.id_exp
GROUP BY de.id_exp, de.nombre_convocatoria, up.correo_profe, de.fecha_creacion, de.fecha_expedicion
ORDER BY de.fecha_creacion DESC;

-- ============================================================================
-- FUNCIONES ÚTILES
-- ============================================================================

-- Función: Obtener ruta completa de una carpeta (con jerarquía)
CREATE OR REPLACE FUNCTION get_carpeta_path(p_id_folder INTEGER)
RETURNS TEXT AS $$
DECLARE
    v_path TEXT := '';
    v_current_id INTEGER := p_id_folder;
    v_nombre VARCHAR(50);
    v_padre INTEGER;
BEGIN
    LOOP
        SELECT nombre_carpeta, id_padre
        INTO v_nombre, v_padre
        FROM inf_carpeta
        WHERE id_folder = v_current_id;

        IF v_nombre IS NULL THEN
            EXIT;
        END IF;

        v_path := v_nombre || '/' || v_path;
        v_current_id := v_padre;

        EXIT WHEN v_padre IS NULL;
    END LOOP;

    RETURN TRIM(LEADING '/' FROM v_path);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INSERTAR CATEGORÍAS POR DEFECTO
-- ============================================================================
-- Las 5 categorías que maneja la interfaz SubirDoc.jsx
INSERT INTO categorias_doc (nombre_categoria, descripcion) VALUES
    ('Docencia', 'Documentos de actividades docentes (materias, grupos, carga horaria)'),
    ('Gestion', 'Documentos de gestión académica'),
    ('Titulacion', 'Documentos de procesos de titulación'),
    ('Produccion', 'Documentos de producción académica (artículos, libros, capítulos)'),
    ('Tutoria', 'Documentos de tutorías académicas')
ON CONFLICT (nombre_categoria) DO NOTHING;

-- ============================================================================
-- SENTENCIAS DE PRUEBA (comentadas)
-- ============================================================================
-- INSERT INTO user_profe (correo_profe, password_profe, numero_profe, full_name)
-- VALUES ('profesor@universidad.edu', 'hashed_password', 5551234567, 'Dr. Juan Pérez');

-- INSERT INTO inf_carpeta (nombre_carpeta, id_profesor, id_padre)
-- VALUES ('Mi Documentación', 1, NULL);

-- INSERT INTO doc_documento
--   (id_profesor, titulo_doc, id_folder, id_tipo, ruta_archivo, fecha_expedicion,
--    tamano_bytes, extension_archivo, metadatos)
-- VALUES
--   (1, 'Programa Curso IA', 1, 1, '/media/documentos/1/programa.pdf', '2024-01-15',
--    1048576, 'pdf',
--    '{"_categoria":"Docencia","cicloEscolar":"2024-A","claveMateria":"IL803",
--      "crn":"189895","nombreMateria":"Inteligencia Artificial","carrera":"ISI",
--      "grupo":"5°","cargaHoraria":80,"sede":"CUTonalá"}'::jsonb);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
