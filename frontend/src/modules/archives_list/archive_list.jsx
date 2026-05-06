import React, { useEffect, useRef, useState } from "react";
import "./Styles/archive_list.css";
import { useTheme } from "../../shared/context/ThemeContext";
import { documentsService } from "../../shared/api/documentsService";
import { DashboardLayout } from "../../shared/components/DashboardLayout";

// Lista de categorias de documentos
const CATEGORIAS_FILTRO = [
  "Docencia",
  "Gestión Académica",
  "Gestión Académica (Titulación)",
  "Producción",
  "Tutoría",
];

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatFecha(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX");
  } catch {
    return iso;
  }
}

export function ArchiveList() {
  const [anio, setAnio] = useState("Cualquier Año");
  const [mes, setMes] = useState("Cualquier Mes");
  const [dia, setDia] = useState("Cualquier Día");
  const [files, setFiles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);

  // Filtra por tipo de documento, si no hay ninguno seleccionado muestra todo
  const showFiles = tiposSeleccionados.length === 0
    ? files
    : files.filter((f) =>
      f.type === "folder" ||
      tiposSeleccionados.includes(f.categoria)
    );

  const handleTipoChange = (categoria) => {
    setTiposSeleccionados((prev) =>
      prev.includes(categoria)
        ? prev.filter((t) => t !== categoria)
        : [...prev, categoria]
    );
  };

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [carpetasRes, docsRes, catsRes] = await Promise.all([
        documentsService.listFolders().catch(() => ({ carpetas: [] })),
        documentsService.listDocuments().catch(() => ({ documentos: [] })),
        documentsService.listCategories().catch(() => ({ categorias: [] })),
      ]);

      const carpetas = (carpetasRes?.carpetas || []).map((c) => ({
        id: `f-${c.id_folder}`,
        type: "folder",
        name: c.nombre_carpeta,
        date: formatFecha(c.fecha_creacion),
      }));

      const docs = (docsRes?.documentos || []).map((d) => ({
        id: `d-${d.id_doc}`,
        id_doc: d.id_doc,
        type: "pdf",
        name: d.titulo_doc,
        date: formatFecha(d.fecha_creacion),
        categoria: d.categoria || null,
      }));

      setFiles([...carpetas, ...docs]);
      setCategorias(catsRes?.categorias || []);
    } catch (err) {
      setErrorMsg(
        err?.status === 401
          ? "Debes iniciar sesión para ver tus archivos"
          : err?.data?.error || "Error al cargar datos",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleNuevaCarpeta = async () => {
    const nombre = window.prompt("Nombre de la nueva carpeta:");
    if (!nombre) return;
    try {
      const res = await documentsService.createFolder(nombre);
      if (res?.success) {
        cargarDatos();
      } else {
        alert(res?.error || "No se pudo crear la carpeta");
      }
    } catch (err) {
      alert(err?.data?.error || "Error al crear la carpeta");
    }
  };

  const handleSubirArchivoClick = () => {
    if (!categorias.length) {
      alert("No hay categorías disponibles. Pide al admin que cree alguna.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    const titulo = window.prompt("Título del documento:", archivo.name);
    if (!titulo) return;

    const id_tipo = categorias[0]?.id_tipo;
    if (!id_tipo) {
      alert("No hay categorías de documento disponibles.");
      return;
    }

    setUploading(true);
    try {
      const res = await documentsService.uploadDocument({
        archivo,
        titulo_doc: titulo,
        id_tipo,
      });
      if (res?.success) {
        cargarDatos();
      } else {
        alert(res?.error || "No se pudo subir el archivo");
      }
    } catch (err) {
      alert(err?.data?.error || "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title="Gestión de Archivos">
      <div className="archive_list_container_inner">
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleArchivoSeleccionado}
        />

        {/* === CONTENT === */}
        <div className="content">
          {/* === FILTER PANEL === */}
          <div className="filters_panel">
            {/* === SIMPLIFIED VIEW === */}
            {filtrosAvanzados ? (
              <div className="simple_view">
                <div className="simple_header">
                  <h3 className="col_nombre">
                    Nombre <button className="btn_sort">↑↓</button>
                  </h3>
                  <h3 className="col_fecha">
                    Fecha <button className="btn_sort">↑↓</button>
                  </h3>
                  <button
                    className="btn_advanced"
                    onClick={() => setFiltrosAvanzados(false)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z"
                        stroke="#5aedf1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Filtros Avanzados
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* === ADVANCED VIEW === */}
                <div className="advanced_filters">
                  <div className="filters_row">
                    <div className="filters">
                      <span className="filter_label">Año</span>
                      <select
                        className="filter_select"
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                      >
                        <option value="Cualquier Año">Cualquier Año</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                    </div>

                    {/* === DATE FILTERS === */}
                    <div className="filters">
                      <h2 className="filter_label">Mes</h2>
                      <select
                        className="filter_select"
                        value={mes}
                        onChange={(e) => setMes(e.target.value)}
                      >
                        <option value="Cualquier Mes">Cualquier Mes</option>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filters">
                      <h2 className="filter_label">Día</h2>
                      <select
                        className="filter_select"
                        value={dia}
                        onChange={(e) => setDia(e.target.value)}
                      >
                        <option value="Cualquier Día">Cualquier Día</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  {/* === SORTING OPTIONS === */}
                  <div className="filter_right">
                    <div className="sort_row">
                      <h2 className="filter_label">Ordenar por</h2>
                      <select className="filter_select">
                        <option>Nombre A-Z</option>
                        <option>Nombre Z-A</option>
                        <option>Fecha ↑</option>
                        <option>Fecha ↓</option>
                      </select>
                      <button className="btn_apply">Aplicar</button>
                    </div>
                  </div>
                  <button
                    className="btn_advanced"
                    onClick={() => setFiltrosAvanzados(true)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                    >
                      <path
                        d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z"
                        stroke="#5aedf1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Filtros Avanzados
                  </button>
                </div>

                {/* === CHECKBOXES === */}
                <div className="checkbox_label">Tipo de Documento</div>
                <div className="checkbox_row">
                  {CATEGORIAS_FILTRO.map((cat) => (
                    <label key={cat} className="checkbox_item">
                      <input
                        type="checkbox"
                        value={cat}
                        checked={tiposSeleccionados.includes(cat)}
                        onChange={() => handleTipoChange(cat)}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* === FILE LIST === */}
          <div className="files_list">
            {loading && <p>Cargando…</p>}
            {errorMsg && <p style={{ color: "#ff6b6b" }}>{errorMsg}</p>}
            {!loading && !errorMsg && files.length === 0 && (
              <p>No hay archivos. Crea una carpeta o sube un documento.</p>
            )}
            {showFiles.map((file) => (
              <div key={file.id} className="file_row">
                <span>{file.type === "folder" ? "📁" : "📄"}</span>
                <span className="file_name">{file.name}</span>
                <span className="file_date">{file.date}</span>
                <div className="file_actions">
                  {file.type !== "folder" && file.id_doc && (
                    <a
                      className="btn_upd"
                      href={documentsService.downloadDocumentUrl(file.id_doc)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Descargar
                    </a>
                  )}
                  <button className="btn_mov">Mover</button>
                  <button className="btn_del">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === BOTTOM BAR === */}
        <div className="bottom_bar">
          <button className="btn_new_folder" onClick={handleNuevaCarpeta}>
            Nueva Carpeta
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}