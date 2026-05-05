import { useState, useRef, useEffect } from "react";
import "./SubirDoc.css";
import { DashboardLayout } from "../../shared/components/DashboardLayout";
import { documentsService } from "../../shared/api/documentsService";

// Reglas numéricas por categoría: el frontend valida antes de enviar y el
// backend revalida en SubidaDocumentoSerializer.NUMERIC_RULES.
const REGLAS_NUMERICAS = {
  Docencia: { cargaHoraria: { min: 0, integer: true, label: "Carga Horaria" } },
  Titulacion: { avance: { min: 0, max: 100, label: "Avance Actual" } },
  Tutoria: { numeroAlumnos: { min: 0, integer: true, label: "Número de Alumnos" } },
};

const CAMPOS_OBLIGATORIOS = {
  Docencia: ["nombreNube", "cicloEscolar", "claveMateria", "crn", "nombreMateria",
    "carrera", "grupo", "cargaHoraria", "sede"],
  Gestion: ["nombreNube", "tipoActividad", "nombreActividad", "instancia", "periodo",
    "duracion", "rol"],
  Titulacion: ["nombreNube", "rolTesis", "alumno", "nivel", "tituloTesis",
    "fechaAsignacion", "estatus", "avance"],
  Produccion: ["nombreNube", "tipoProducto", "tituloTrabajo", "estado", "identificador",
    "idiomas"],
  Tutoria: ["nombreNube", "cicloTutoria", "programa", "tipoTutoria", "numeroAlumnos",
    "docAsignacion"],
};

export function SubirDoc() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [categoria, setCategoria] = useState("Docencia");
  const [formData, setFormData] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [subiendo, setSubiendo] = useState(false);

  const [alertMsg, setAlertMsg] = useState({ visible: false, text: "", type: "" });
  const timerRef = useRef(null);

  const mostrarAlerta = (text, type = "error") => {
    setAlertMsg({ visible: true, text, type });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAlertMsg({ visible: false, text: "", type: "" });
    }, 3500);
  };

  // Carga las 5 categorías reales del backend al montar.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await documentsService.listCategories();
        if (!cancelled) setCategorias(res?.categorias || []);
      } catch {
        if (!cancelled)
          mostrarAlerta("⚠️ No se pudieron cargar las categorías", "warning");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Solo aceptamos PDF. El backend revalida.
  const esPdfValido = (f) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ext === "pdf" && (!f.type || f.type === "application/pdf");
  };

  const aceptarArchivo = (f) => {
    if (!esPdfValido(f)) {
      mostrarAlerta("⚠️ Solo se permiten archivos PDF (.pdf)", "error");
      return;
    }
    setFile(f);
    setFormData((prev) => ({ ...prev, nombreNube: f.name.replace(/\.pdf$/i, "") }));
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) aceptarArchivo(dropped);
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) aceptarArchivo(selected);
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoriaChange = (e) => {
    const nuevaCat = e.target.value;
    const nombrePreservado = formData.nombreNube;
    setCategoria(nuevaCat);
    setFormData(nombrePreservado ? { nombreNube: nombrePreservado } : {});
  };

  const validarNumericos = () => {
    const reglas = REGLAS_NUMERICAS[categoria] || {};
    for (const [campo, regla] of Object.entries(reglas)) {
      const raw = formData[campo];
      if (raw === undefined || raw === "") continue;
      const num = Number(raw);
      if (Number.isNaN(num)) {
        mostrarAlerta(`❌ "${regla.label}" debe ser numérico`, "error");
        return false;
      }
      if (regla.integer && !Number.isInteger(num)) {
        mostrarAlerta(`❌ "${regla.label}" debe ser un entero`, "error");
        return false;
      }
      if (regla.min !== undefined && num < regla.min) {
        mostrarAlerta(`❌ "${regla.label}" debe ser >= ${regla.min}`, "error");
        return false;
      }
      if (regla.max !== undefined && num > regla.max) {
        mostrarAlerta(`❌ "${regla.label}" debe ser <= ${regla.max}`, "error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      mostrarAlerta("⚠️ Por favor, selecciona un archivo PDF primero.", "warning");
      return;
    }
    if (!esPdfValido(file)) {
      mostrarAlerta("⚠️ Solo se permiten archivos PDF (.pdf)", "error");
      return;
    }

    const requeridos = CAMPOS_OBLIGATORIOS[categoria] || [];
    const faltantes = requeridos.filter(
      (c) => !formData[c] || formData[c].toString().trim() === ""
    );
    if (faltantes.length > 0) {
      mostrarAlerta(`❌ Faltan campos obligatorios para ${categoria}.`, "error");
      return;
    }

    if (!validarNumericos()) return;

    const id_tipo = categorias.find((c) => c.nombre_categoria === categoria)?.id_tipo;
    if (!id_tipo) {
      mostrarAlerta("❌ Categoría no disponible en el servidor.", "error");
      return;
    }

    // Construye el objeto de metadatos (todo lo dinámico excepto el título y la
    // descripción que viven como columnas/llaves separadas conceptualmente).
    const metadatos = { ...formData };
    delete metadatos.nombreNube;

    setSubiendo(true);
    try {
      const res = await documentsService.uploadDocument({
        archivo: file,
        titulo_doc: formData.nombreNube,
        id_tipo,
        categoria,
        metadatos,
      });
      if (res?.success) {
        mostrarAlerta(`✅ ¡Archivo "${file.name}" subido con éxito!`, "success");
        setFile(null);
        setFormData({});
        setCategoria("Docencia");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        mostrarAlerta(res?.error || "❌ No se pudo subir el archivo", "error");
      }
    } catch (err) {
      const data = err?.data || {};
      const msg = data.error
        || Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
        || "❌ Error al subir el archivo";
      mostrarAlerta(msg, "error");
    } finally {
      setSubiendo(false);
    }
  };

  const inputProps = (name, placeholder, extra = {}) => ({
    name,
    value: formData[name] || "",
    onChange: handleInputChange,
    placeholder,
    ...extra,
  });

  const renderCamposDinamicos = () => {
    switch (categoria) {
      case "Docencia":
        return (
          <>
            <div className="field-group"><label>Ciclo Escolar</label>
              <input type="text" {...inputProps("cicloEscolar", "Ej: 2022-A, 2024-B")} /></div>
            <div className="field-group"><label>Clave de Materia</label>
              <input type="text" {...inputProps("claveMateria", "Ej: IL803, C0410")} /></div>
            <div className="field-group"><label>CRN</label>
              <input type="text" {...inputProps("crn", "Ej: 189895, 207575")} /></div>
            <div className="field-group"><label>Nombre de Materia</label>
              <input type="text" {...inputProps("nombreMateria", "Ej: Desarrollo de Proyectos...")} /></div>
            <div className="field-group"><label>Carrera/Programa</label>
              <input type="text" {...inputProps("carrera", "Ej: Abogado, Nutrición...")} /></div>
            <div className="field-group"><label>Grupo</label>
              <input type="text" {...inputProps("grupo", "Ej: 5°, 10°, T/M")} /></div>
            <div className="field-group"><label>Carga Horaria Totales</label>
              <input type="number" min="0" step="1" inputMode="numeric"
                {...inputProps("cargaHoraria", "Ej: 80")} /></div>
            <div className="field-group"><label>Sede/Centro</label>
              <input type="text" {...inputProps("sede", "Ej: CUAltos, CUTonalá")} /></div>
          </>
        );
      case "Gestion":
        return (
          <>
            <div className="field-group"><label>Tipo de Actividad</label>
              <input type="text" {...inputProps("tipoActividad", "Ej: Jefe de Depto., Coordinador...")} /></div>
            <div className="field-group"><label>Nombre de Actividad</label>
              <input type="text" {...inputProps("nombreActividad", 'Ej: Asesoría "LA CUENCA"')} /></div>
            <div className="field-group"><label>Instancia/Dependencia</label>
              <input type="text" {...inputProps("instancia", "Ej: Depto. de Estudios Organizacionales")} /></div>
            <div className="field-group"><label>Periodo</label>
              <input type="text" {...inputProps("periodo", "Ej: Jan 10, 2022 o Ciclo 2024-A")} /></div>
            <div className="field-group"><label>Duración</label>
              <input type="text" {...inputProps("duracion", "Ej: 4 horas")} /></div>
            <div className="field-group"><label>Rol</label>
              <input type="text" {...inputProps("rol", "Ej: Presidente, Sinodal...")} /></div>
          </>
        );
      case "Titulacion":
        return (
          <>
            <div className="field-group"><label>Rol</label>
              <input type="text" {...inputProps("rolTesis", "Ej: Director o Codirector")} /></div>
            <div className="field-group"><label>Nombre del Alumno</label>
              <input type="text" {...inputProps("alumno", "Ej: Karla Iveth Ayón Rendón")} /></div>
            <div className="field-group"><label>Nivel Educativo</label>
              <input type="text" {...inputProps("nivel", "Ej: Licenciatura, Maestría...")} /></div>
            <div className="field-group full-width"><label>Título de la Tesis</label>
              <input type="text" {...inputProps("tituloTesis", 'Ej: "Comparación de la eficiencia..."')} /></div>
            <div className="field-group"><label>Fecha de Asignación</label>
              <input type="date" {...inputProps("fechaAsignacion", "")} /></div>
            <div className="field-group"><label>Estatus</label>
              <input type="text" {...inputProps("estatus", "Ej: En proceso o Concluidas")} /></div>
            <div className="field-group"><label>Avance Actual (%)</label>
              <input type="number" min="0" max="100" step="0.1" inputMode="decimal"
                {...inputProps("avance", "Ej: 12.5")} /></div>
          </>
        );
      case "Produccion":
        return (
          <>
            <div className="field-group"><label>Tipo de Producto</label>
              <input type="text" {...inputProps("tipoProducto", "Ej: Artículo indexado, Libro...")} /></div>
            <div className="field-group"><label>Título del Trabajo</label>
              <input type="text" {...inputProps("tituloTrabajo", "Título oficial de la publicación")} /></div>
            <div className="field-group"><label>Estado</label>
              <input type="text" {...inputProps("estado", "Ej: Publicado, En prensa...")} /></div>
            <div className="field-group"><label>Identificador</label>
              <input type="text" {...inputProps("identificador", "Ej: ISSN, ISBN, DOI...")} /></div>
            <div className="field-group full-width"><label>Idiomas Disponibles</label>
              <input type="text" {...inputProps("idiomas", "Ej: Español, Inglés...")} /></div>
          </>
        );
      case "Tutoria":
        return (
          <>
            <div className="field-group"><label>Ciclo de Tutoría</label>
              <input type="text" {...inputProps("cicloTutoria", "Ej: 2024-B")} /></div>
            <div className="field-group"><label>Programa Académico</label>
              <input type="text" {...inputProps("programa", "Ej: Licenciatura en Administración")} /></div>
            <div className="field-group"><label>Tipo de Tutoría</label>
              <input type="text" {...inputProps("tipoTutoria", "Ej: Individual o Grupal")} /></div>
            <div className="field-group"><label>Número de Alumnos</label>
              <input type="number" min="0" step="1" inputMode="numeric"
                {...inputProps("numeroAlumnos", "Ej: 46")} /></div>
            <div className="field-group full-width"><label>Documento de Asignación</label>
              <input type="text" {...inputProps("docAsignacion", "Ej: Oficio emitido por Jefatura")} /></div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Subir Documento">
      {alertMsg.visible && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            padding: "15px 25px",
            borderRadius: "10px",
            backgroundColor:
              alertMsg.type === "success"
                ? "#2ecc71"
                : alertMsg.type === "error"
                  ? "#e74c3c"
                  : "#f1c40f",
            color: alertMsg.type === "warning" ? "#333" : "#fff",
            boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
            zIndex: 9999,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.3s ease",
            transform: "translateY(0)",
          }}
        >
          {alertMsg.text}
        </div>
      )}

      <div className="upload-section">
        <div className="upload-card">
          <h2 style={{ marginTop: 0 }}>Nuevo Registro</h2>
          <p style={{ color: "var(--text-s)", marginBottom: "30px" }}>
            Solo se permiten archivos PDF. Los campos con * son obligatorios.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf,.pdf"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <div
            className={`drop-zone ${dragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            style={{
              border: dragging
                ? "2px solid var(--text-p)"
                : "2px dashed var(--color-500)",
              backgroundColor: dragging
                ? "rgba(29, 154, 226, 0.2)"
                : "rgba(29, 154, 226, 0.05)",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>{file ? "📄" : "📁"}</span>
            <p>
              {file
                ? `Archivo: ${file.name}`
                : "Selecciona o arrastra un PDF *"}
            </p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Nombre en la nube *</label>
              <input type="text" {...inputProps("nombreNube", "Ej: Tarea_Prolog")} />
            </div>

            <div className="field-group">
              <label>Categoría *</label>
              <select value={categoria} onChange={handleCategoriaChange}>
                <option value="Docencia">Docencia</option>
                <option value="Gestion">Gestión Académica</option>
                <option value="Titulacion">Gestión Académica (Titulación)</option>
                <option value="Produccion">Producción Académica</option>
                <option value="Tutoria">Tutoría</option>
              </select>
            </div>

            <div
              className="full-width"
              style={{ borderBottom: "1px solid var(--border)", margin: "10px 0" }}
            ></div>

            {renderCamposDinamicos()}

            <div className="field-group full-width">
              <label>Descripción (Opcional)</label>
              <textarea
                {...inputProps("descripcion", "Escribe notas adicionales aquí...")}
                rows="3"
              ></textarea>
            </div>

            <button
              className="btn-submit full-width"
              type="submit"
              disabled={subiendo}
            >
              {subiendo ? "Subiendo…" : "Subir a mi Unidad"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
