import { useState, useRef, useEffect } from "react";
import "./EditarDoc.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from "../../shared/components/DashboardLayout";
import { documentsService } from "../../shared/api/documentsService";
import DeleteCategoryModal from "../../shared/components/DeleteCategoryModal";

const CATEGORIAS_FIJAS = ["Docencia", "Gestion", "Titulacion", "Produccion", "Tutoria"];

const CATEGORIA_DESDE_BD = {
  Docencia: "Docencia",
  "Gestion Academica": "Gestion",
  "Gestión Académica": "Gestion",
  "Gestion Academica (Titulacion)": "Titulacion",
  "Gestión Académica (Titulación)": "Titulacion",
  "Produccion Academica": "Produccion",
  "Producción Académica": "Produccion",
  Tutoria: "Tutoria",
  "Tutoría": "Tutoria",
};

const DOCUMENTO_VACIO = {
  titulo_doc: "Sin nombre",
  categoria: "Docencia",
  fecha_creacion: null,
  metadatos: {},
  descripcion: "",
};

const TODOS_LOS_CAMPOS = [
  { key: "fechaExpedicion", label: "Fecha de Expedición" },
  { key: "cicloEscolar",    label: "Ciclo Escolar" },
  { key: "claveMateria",    label: "Clave de Materia" },
  { key: "crn",             label: "CRN" },
  { key: "nombreMateria",   label: "Nombre de Materia" },
  { key: "carrera",         label: "Carrera/Programa" },
  { key: "grupo",           label: "Grupo" },
  { key: "cargaHoraria",   label: "Carga Horaria Totales" },
  { key: "sede",            label: "Sede/Centro" },
  { key: "tipoActividad",   label: "Tipo de Actividad" },
  { key: "nombreActividad", label: "Nombre de Actividad" },
  { key: "instancia",       label: "Instancia/Dependencia" },
  { key: "periodo",         label: "Periodo" },
  { key: "duracion",        label: "Duración" },
  { key: "rol",             label: "Rol" },
  { key: "rolTesis",        label: "Rol (Tesis)" },
  { key: "alumno",          label: "Nombre del Alumno" },
  { key: "nivel",           label: "Nivel Educativo" },
  { key: "tituloTesis",     label: "Título de la Tesis" },
  { key: "fechaAsignacion", label: "Fecha de Asignación" },
  { key: "estatus",         label: "Estatus" },
  { key: "avance",          label: "Avance Actual (%)" },
  { key: "tipoProducto",    label: "Tipo de Producto" },
  { key: "tituloTrabajo",   label: "Título del Trabajo" },
  { key: "estado",          label: "Estado" },
  { key: "identificador",   label: "Identificador" },
  { key: "idiomas",         label: "Idiomas Disponibles" },
  { key: "cicloTutoria",    label: "Ciclo de Tutoría" },
  { key: "programa",        label: "Programa Académico" },
  { key: "tipoTutoria",     label: "Tipo de Tutoría" },
  { key: "numeroAlumnos",   label: "Número de Alumnos" },
  { key: "docAsignacion",   label: "Documento de Asignación" },
];

const REGLAS_NUMERICAS = {
  Docencia:   { cargaHoraria:  { min: 0, integer: true, label: "Carga Horaria" } },
  Titulacion: { avance:        { min: 0, max: 100,      label: "Avance Actual" } },
  Tutoria:    { numeroAlumnos: { min: 0, integer: true, label: "Número de Alumnos" } },
};

export function EditarDoc() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState("Docencia");
  const [formData, setFormData] = useState({});
  const [categorias, setCategorias]         = useState([]);
  const [categoriasCustom, setCategoriasCustom] = useState([]);
  const [subiendo, setSubiendo]             = useState(false);
  const location = useLocation();

  // Modal estado
  const [modalAbierto, setModalAbierto]         = useState(false);
  const [nuevoNombre, setNuevoNombre]           = useState("");
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);
  const [guardandoCat, setGuardandoCat]         = useState(false);

  // Modal de eliminación de categoría
  const [deleteModalOpen, setDeleteModalOpen]   = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  const [alertMsg, setAlertMsg] = useState({ visible: false, text: "", type: "" });
  const timerRef = useRef(null);

  const doc = location.state?.documento || DOCUMENTO_VACIO;

  // Cargar categorías del backend al montar
  useEffect(() => {
    const metadatos = doc.metadatos || {};
    const categoriaGuardada =
      metadatos._categoriaCustom ||
      metadatos._categoria ||
      CATEGORIA_DESDE_BD[doc.categoria] ||
      CATEGORIA_DESDE_BD[doc.nombre_categoria] ||
      doc.categoria;

    setCategoria(categoriaGuardada);
    setFormData({
      ...metadatos,
      nombreNube: doc.titulo_doc || doc.name || "",
      fechaExpedicion: doc.fecha_expedicion,
      descripcion: doc.descripcion || metadatos.descripcion || "",
    });
  }, [doc]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const res = await documentsService.listCategories();
          if (!cancelled) setCategorias(res?.categorias || []);
        } catch { /* silencioso */ }
        try {
          const res2 = await documentsService.listCustomCategories();
          if (!cancelled) setCategoriasCustom(res2?.categorias_custom || []);
        } catch { /* silencioso */ }
      })();
      return () => { cancelled = true; };
    }, []);

  //función para mostrar las alertas
  const mostrarAlerta = (text, type = "error") => {
    setAlertMsg({ visible: true, text, type });

    // Limpiamos el temporizador anterior si el usuario hace clics rápidos
    if (timerRef.current) clearTimeout(timerRef.current);

    // Ocultar automáticamente después de 3.5 segundos
    timerRef.current = setTimeout(() => {
      setAlertMsg({ visible: false, text: "", type: "" });
    }, 3500);
  };

  //lógica del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoriaChange = (e) => {
    const val = e.target.value;
    if (val === "__nueva__") {
      // Abrir modal, no cambiar categoría todavía
      setNuevoNombre("");
      setCamposSeleccionados([]);
      setModalAbierto(true);
      return;
    }
    const nombrePreservado = formData.nombreNube;
    setCategoria(val);
    setFormData({ nombreNube: nombrePreservado });
  };

  const toggleCampo = (key) => {
    setCamposSeleccionados((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleGuardarCategoria = async () => {
    if (!nuevoNombre.trim()) {
      mostrarAlerta("⚠️ Escribe un nombre para la categoría", "warning"); return;
    }
    if (camposSeleccionados.length === 0) {
      mostrarAlerta("⚠️ Selecciona al menos un campo", "warning"); return;
    }
    // Verificar nombre duplicado
    const existe = categoriasCustom.some(
      (c) => c.nombre.toLowerCase() === nuevoNombre.trim().toLowerCase()
    );
    if (existe) {
      mostrarAlerta(`❌ Ya existe una categoría llamada "${nuevoNombre.trim()}"`, "error"); return;
    }
    setGuardandoCat(true);
    try {
      // Siempre incluir fechaExpedicion en los campos, aunque no esté seleccionada
      const camposConFecha = camposSeleccionados.includes("fechaExpedicion") 
        ? camposSeleccionados 
        : [...camposSeleccionados, "fechaExpedicion"];
      
      const res = await documentsService.createCustomCategory(nuevoNombre.trim(), camposConFecha);
      if (res?.success) {
        const nueva = res.categoria;
        setCategoriasCustom((prev) => [...prev, nueva]);
        const nombrePreservado = formData.nombreNube;
        setCategoria(nueva.nombre);
        setFormData({ nombreNube: nombrePreservado });
        setModalAbierto(false);
        mostrarAlerta(`✅ Categoría "${nueva.nombre}" creada (incluye Fecha de Expedición)`, "success");
      } else {
        mostrarAlerta(res?.error || "❌ No se pudo crear la categoría", "error");
      }
    } catch (err) {
      mostrarAlerta(err?.data?.error || "❌ Error al crear la categoría", "error");
    } finally {
      setGuardandoCat(false);
    }
  };
  
const handleEliminarCategoria = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeletingCategory(true);
    
    try {
      const res = await documentsService.deleteCustomCategory(categoryToDelete.id_cat_custom);
      if (res?.success) {
        setCategoriasCustom((prev) => prev.filter((c) => c.id_cat_custom !== categoryToDelete.id_cat_custom));
        if (categoria === categoryToDelete.nombre) {
          setCategoria("Docencia");
          setFormData({ nombreNube: formData.nombreNube });
        }
        mostrarAlerta(`🗑️ Categoría "${categoryToDelete.nombre}" eliminada correctamente`, "success");
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      } else {
        mostrarAlerta(res?.error || "❌ No se pudo eliminar la categoría", "error");
      }
    } catch {
      mostrarAlerta("❌ Error al eliminar la categoría", "error");
    } finally {
      setDeletingCategory(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
    };
  
    // ---- Validación numérica ----
    const validarNumericos = () => {
    const reglas = REGLAS_NUMERICAS[categoria] || {};
    for (const [campo, regla] of Object.entries(reglas)) {
      const raw = formData[campo];
      if (raw === undefined || raw === "") continue;
      const num = Number(raw);
      if (Number.isNaN(num))                          { mostrarAlerta(`❌ "${regla.label}" debe ser numérico`, "error"); return false; }
      if (regla.integer && !Number.isInteger(num))    { mostrarAlerta(`❌ "${regla.label}" debe ser un entero`, "error"); return false; }
      if (regla.min !== undefined && num < regla.min) { mostrarAlerta(`❌ "${regla.label}" debe ser >= ${regla.min}`, "error"); return false; }
      if (regla.max !== undefined && num > regla.max) { mostrarAlerta(`❌ "${regla.label}" debe ser <= ${regla.max}`, "error"); return false; }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doc.id_doc) { mostrarAlerta("No se encontro el documento para editar.", "error"); return; }

    const CATEGORIAS_FIJAS = ["Docencia", "Gestion", "Titulacion", "Produccion", "Tutoria"];
    const esCustom = !CATEGORIAS_FIJAS.includes(categoria);

    const camposObligatoriosFijos = {
      Docencia:   ["nombreNube","fechaExpedicion","cicloEscolar","claveMateria","crn","nombreMateria","carrera","grupo","cargaHoraria","sede"],
      Gestion:    ["nombreNube","fechaExpedicion","tipoActividad","nombreActividad","instancia","periodo","duracion","rol"],
      Titulacion: ["nombreNube","fechaExpedicion","rolTesis","alumno","nivel","tituloTesis","fechaAsignacion","estatus","avance"],
      Produccion: ["nombreNube","fechaExpedicion","tipoProducto","tituloTrabajo","estado","identificador","idiomas"],
      Tutoria:    ["nombreNube","fechaExpedicion","cicloTutoria","programa","tipoTutoria","numeroAlumnos","docAsignacion"],
    };

    let requeridos;
    if (esCustom) {
      const catObj = categoriasCustom.find((c) => c.nombre === categoria);
      requeridos = ["nombreNube", ...(catObj?.campos || [])];
    } else {
      requeridos = camposObligatoriosFijos[categoria];
    }

    const faltantes = requeridos.filter(
      (campo) => !formData[campo] || formData[campo].toString().trim() === ""
    );
    if (faltantes.length > 0) {
      mostrarAlerta(`❌ Faltan campos obligatorios para "${categoria}".`, "error"); return;
    }

    if (!validarNumericos()) return;

    // id_tipo es solo una pista opcional para categorías fijas: si la lista de
    // categorías no cargó o los nombres no calzan, el backend resuelve la
    // categoría por nombre cuando id_tipo llega null.
    let id_tipo = null;
    if (!esCustom) {
      id_tipo = categorias.find((c) => c.nombre_categoria === categoria)?.id_tipo || null;
    }

    const metadatos = { ...formData };
    delete metadatos.nombreNube;
    const fechaExpedicion = metadatos.fechaExpedicion;
    delete metadatos.fechaExpedicion;
    delete metadatos._categoria;
    delete metadatos._categoriaCustom;
    if (esCustom) metadatos._categoriaCustom = categoria;

    setSubiendo(true);
    try {
      const res = await documentsService.updateDocument(doc.id_doc, {
        titulo_doc: formData.nombreNube,
        id_tipo,
        categoria,
        fecha_expedicion: fechaExpedicion,
        metadatos,
      });
      if (res?.success) {
        mostrarAlerta("Documento actualizado con exito.", "success");
        const documentoActualizado = {
          ...res.documento,
          categoria: res.documento?.metadatos?._categoria || res.documento?.nombre_categoria,
        };
        setTimeout(() => {
          navigate("/archive_view", { state: { documento: documentoActualizado } });
        }, 600);
      } else {
        mostrarAlerta(res?.error || "No se pudo actualizar el documento", "error");
      }
    } catch (err) {
      const data = err?.data || {};
      const msg = data.error ||
        Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ") ||
        "Error al actualizar el documento";
      mostrarAlerta(msg, "error");
    } finally {
      setSubiendo(false);
    }
  };

  const inputProps = (name, placeholder) => ({
    name,
    value: formData[name] || "",
    onChange: handleInputChange,
    placeholder,
  });

  // ---- Campos dinámicos ----
  const renderCamposDinamicos = () => {
    const CATEGORIAS_FIJAS = ["Docencia", "Gestion", "Titulacion", "Produccion", "Tutoria"];

    if (!CATEGORIAS_FIJAS.includes(categoria)) {
      const catObj = categoriasCustom.find((c) => c.nombre === categoria);
      if (!catObj || catObj.campos.length === 0) return null;
      return (
        <>
          {catObj.campos.map((key) => {
            const campo = TODOS_LOS_CAMPOS.find((f) => f.key === key);
            if (!campo) return null;
            let inputType = "text";
            if (key === "fechaAsignacion" || key === "fechaExpedicion") inputType = "date";
            else if (key === "numeroAlumnos") inputType = "number";
            return (
              <div className="field-group" key={key}>
                <label>{campo.label}</label>
                <input type={inputType} {...inputProps(key, `Ingresa ${campo.label}`)} />
              </div>
            );
          })}
        </>
      );
    }

    switch (categoria) {
      case "Docencia":
        return (
          <>
            <div className="field-group"><label>Fecha de Expedición *</label><input type="date" {...inputProps("fechaExpedicion", "")} /></div>
            <div className="field-group"><label>Ciclo Escolar</label><input type="text" {...inputProps("cicloEscolar", "Ej: 2022-A, 2024-B")} /></div>
            <div className="field-group"><label>Clave de Materia</label><input type="text" {...inputProps("claveMateria", "Ej: IL803, C0410")} /></div>
            <div className="field-group"><label>CRN</label><input type="text" {...inputProps("crn", "Ej: 189895, 207575")} /></div>
            <div className="field-group"><label>Nombre de Materia</label><input type="text" {...inputProps("nombreMateria", "Ej: Desarrollo de Proyectos...")} /></div>
            <div className="field-group"><label>Carrera/Programa</label><input type="text" {...inputProps("carrera", "Ej: Abogado, Nutrición...")} /></div>
            <div className="field-group"><label>Grupo</label><input type="text" {...inputProps("grupo", "Ej: 5°, 10°, T/M")} /></div>
            <div className="field-group"><label>Carga Horaria Totales</label><input type="text" {...inputProps("cargaHoraria", "Ej: 80 horas totales")} /></div>
            <div className="field-group"><label>Sede/Centro</label><input type="text" {...inputProps("sede", "Ej: CUAltos, CUTonalá")} /></div>
          </>
        );
      case "Gestion":
        return (
          <>
            <div className="field-group"><label>Fecha de Expedición *</label><input type="date" {...inputProps("fechaExpedicion", "")} /></div>
            <div className="field-group"><label>Tipo de Actividad</label><input type="text" {...inputProps("tipoActividad", "Ej: Jefe de Depto., Coordinador...")} /></div>
            <div className="field-group"><label>Nombre de Actividad</label><input type="text" {...inputProps("nombreActividad", 'Ej: Asesoría "LA CUENCA"')} /></div>
            <div className="field-group"><label>Instancia/Dependencia</label><input type="text" {...inputProps("instancia", "Ej: Depto. de Estudios Organizacionales")} /></div>
            <div className="field-group"><label>Periodo</label><input type="text" {...inputProps("periodo", "Ej: Jan 10, 2022 o Ciclo 2024-A")} /></div>
            <div className="field-group"><label>Duración</label><input type="text" {...inputProps("duracion", "Ej: 4 horas")} /></div>
            <div className="field-group"><label>Rol</label><input type="text" {...inputProps("rol", "Ej: Presidente, Sinodal...")} /></div>
          </>
        );
      case "Titulacion":
        return (
          <>
            <div className="field-group"><label>Fecha de Expedición *</label><input type="date" {...inputProps("fechaExpedicion", "")} /></div>
            <div className="field-group"><label>Rol</label><input type="text" {...inputProps("rolTesis", "Ej: Director o Codirector")} /></div>
            <div className="field-group"><label>Nombre del Alumno</label><input type="text" {...inputProps("alumno", "Ej: Karla Iveth Ayón Rendón")} /></div>
            <div className="field-group"><label>Nivel Educativo</label><input type="text" {...inputProps("nivel", "Ej: Licenciatura, Maestría...")} /></div>
            <div className="field-group full-width"><label>Título de la Tesis</label><input type="text" {...inputProps("tituloTesis", 'Ej: "Comparación de la eficiencia..."')} /></div>
            <div className="field-group"><label>Fecha de Asignación</label><input type="date" {...inputProps("fechaAsignacion", "")} /></div>
            <div className="field-group"><label>Estatus</label><input type="text" {...inputProps("estatus", "Ej: En proceso o Concluidas")} /></div>
            <div className="field-group"><label>Avance Actual (%)</label><input type="text" {...inputProps("avance", "Ej: 12.5%")} /></div>
          </>
        );
      case "Produccion":
        return (
          <>
            <div className="field-group"><label>Fecha de Expedición *</label><input type="date" {...inputProps("fechaExpedicion", "")} /></div>
            <div className="field-group"><label>Tipo de Producto</label><input type="text" {...inputProps("tipoProducto", "Ej: Artículo indexado, Libro...")} /></div>
            <div className="field-group"><label>Título del Trabajo</label><input type="text" {...inputProps("tituloTrabajo", "Título oficial de la publicación")} /></div>
            <div className="field-group"><label>Estado</label><input type="text" {...inputProps("estado", "Ej: Publicado, En prensa...")} /></div>
            <div className="field-group"><label>Identificador</label><input type="text" {...inputProps("identificador", "Ej: ISSN, ISBN, DOI...")} /></div>
            <div className="field-group full-width"><label>Idiomas Disponibles</label><input type="text" {...inputProps("idiomas", "Ej: Español, Inglés...")} /></div>
          </>
        );
      case "Tutoria":
        return (
          <>
            <div className="field-group"><label>Fecha de Expedición *</label><input type="date" {...inputProps("fechaExpedicion", "")} /></div>
            <div className="field-group"><label>Ciclo de Tutoría</label><input type="text" {...inputProps("cicloTutoria", "Ej: 2024-B")} /></div>
            <div className="field-group"><label>Programa Académico</label><input type="text" {...inputProps("programa", "Ej: Licenciatura en Administración")} /></div>
            <div className="field-group"><label>Tipo de Tutoría</label><input type="text" {...inputProps("tipoTutoria", "Ej: Individual o Grupal")} /></div>
            <div className="field-group"><label>Número de Alumnos</label><input type="number" {...inputProps("numeroAlumnos", "Ej: 46")} /></div>
            <div className="field-group full-width"><label>Documento de Asignación</label><input type="text" {...inputProps("docAsignacion", "Ej: Oficio emitido por Jefatura")} /></div>
          </>
        );
      default:
        return null;
    }
  };

  const categoriaCustomActual = categoriasCustom.find((c) => c.nombre === categoria);

  return (
    <>
    <DashboardLayout title="Editar Documento">
      <button className="regreso" onClick={() => navigate(-1)}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
      {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
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

      {/* Modal nueva categoría */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">✨ Nueva Categoría Personalizada</h3>
            <p className="modal-subtitle">Nómbrala y elige los campos que necesitas.</p>

            <div className="modal-field">
              <label>Nombre de la categoría *</label>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej: Investigación, Vinculación..."
                maxLength={100}
              />
            </div>

            <div className="modal-field">
              <label>Campos a incluir *</label>
              <p style={{fontSize: "0.85rem", color: "var(--text-s)", marginBottom: "8px", fontStyle: "italic"}}>
                📅 La Fecha de Expedición se incluirá automáticamente (es obligatoria)
              </p>
              <div className="campo-checkbox-list">
                {TODOS_LOS_CAMPOS.filter(({ key }) => key !== "fechaExpedicion").map(({ key, label }) => (
                  <label key={key} className="campo-checkbox-item">
                    <input
                      type="checkbox"
                      checked={camposSeleccionados.includes(key)}
                      onChange={() => toggleCampo(key)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <p className="campos-seleccionados-count">
                {camposSeleccionados.length} campo{camposSeleccionados.length !== 1 ? "s" : ""} seleccionado{camposSeleccionados.length !== 1 ? "s" : ""} + Fecha de Expedición
              </p>
            </div>

            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModalAbierto(false)} disabled={guardandoCat}>
                Cancelar
              </button>
              <button className="btn-modal-save" onClick={handleGuardarCategoria} disabled={guardandoCat}>
                {guardandoCat ? "Guardando…" : "✅ Añadir categoría"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="upload-section">
        <div className="upload-card">
          <h2 style={{ marginTop: 0 }}>Editar Registro</h2>
          <p style={{ color: "var(--text-s)", marginBottom: "30px" }}>
            Los campos con * son obligatorios.
          </p>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Nombre en la nube *</label>
              <input
                type="text"
                {...inputProps("nombreNube", "Ej: Tarea_Prolog")}
              />
            </div>

            <div className="field-group">
              <label>Categoría *</label>
              <div className="categoria-select-wrapper">
                <select value={categoria} onChange={handleCategoriaChange}>
                  <option value="__nueva__">➕ Nueva categoría…</option>
                  <optgroup label="── Categorías estándar ──">
                    <option value="Docencia">Docencia</option>
                    <option value="Gestion">Gestión Académica</option>
                    <option value="Titulacion">Gestión Académica (Titulación)</option>
                    <option value="Produccion">Producción Académica</option>
                    <option value="Tutoria">Tutoría</option>
                  </optgroup>
                  {categoriasCustom.length > 0 && (
                    <optgroup label="── Mis categorías ──">
                      {categoriasCustom.map((c) => (
                        <option key={c.id_cat_custom} value={c.nombre}>{c.nombre}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {categoriaCustomActual && (
                  <button
                    type="button"
                    className="btn-eliminar-cat"
                    title={`Eliminar categoría "${categoriaCustomActual.nombre}"`}
                    onClick={() => handleEliminarCategoria(categoriaCustomActual)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            <div className="full-width" style={{ borderBottom: "1px solid var(--border)", margin: "10px 0" }} />

            {renderCamposDinamicos()}

            <div className="field-group full-width">
              <label>Descripción (Opcional)</label>
              <textarea
                {...inputProps(
                  "descripcion",
                  "Escribe notas adicionales aquí...",
                )}
                rows="3"
              ></textarea>
            </div>

            <button className="btn-submit full-width" type="submit">
              Guardar cambios
            </button>
          </form>
        </div>
      </div>

      {/* Modal de eliminación de categoría */}
      <DeleteCategoryModal
        isOpen={deleteModalOpen}
        categoryName={categoryToDelete?.nombre}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deletingCategory}
      />
    </DashboardLayout>
    </>
  )
}

// ReactDOM.createRoot(document.getElementById('root')).render(<SubirDocumento />);
