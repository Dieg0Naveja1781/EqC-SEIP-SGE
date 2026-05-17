import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./Styles/archive_list.css";
import { useTheme } from "../../shared/context/ThemeContext";
import { documentsService } from "../../shared/api/documentsService";
import { DashboardLayout } from "../../shared/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import descargasIcon from "../../assets/descargas.svg";
import basuraIcon from "../../assets/basura.svg";
import archivoIcon from "../../assets/archivo.svg";
import nuevaCarpetaIcon from "../../assets/nueva-carpeta.svg";

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

// Parsea fechas en formato YYYY-MM-DD o DD/MM/YYYY
function parseDate(str) {
  if (!str) return new Date(0);
  const partes = str.split("/");
  if (partes.length === 3) {
    return new Date(`${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`);
  }
  return new Date(str);
}

export function ArchiveList() {
  const location = useLocation();
  const selectedFolderId = location.state?.folderId;
  const selectedFolderName = location.state?.folderName;
  const [anio, setAnio] = useState("Cualquier Año");
  const [mes, setMes] = useState("Cualquier Mes");
  const [dia, setDia] = useState("Cualquier Día");
  const [files, setFiles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriasCustom, setCategoriasCustom] = useState([]);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("Fecha ↓");
  const navigate = useNavigate();
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [elementoAMover, setElementoAMover] = useState(null);
  const [carpetasDestino, setCarpetasDestino] = useState([]);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState("");
  const [moving, setMoving] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(selectedFolderId || null);
  const [folderPath, setFolderPath] = useState(selectedFolderId && selectedFolderName ? [{ id: selectedFolderId, name: selectedFolderName }] : []);
  const [deletePrompt, setDeletePrompt] = useState({ open: false, file: null });
  const deletePromptRef = useRef(null);

  const handleVerDocumento = (file) => {
    if (file.type === "folder") {
      const realId = file.id.replace("f-", "");
      setFolderPath([...folderPath, { id: realId, name: file.name }]);
      setCurrentFolderId(realId);
    } else if (file.type === "pdf") {
      navigate("/archive_view", { state: { documento: file } });
    }
  };

  // Filtra por tipo de documento, si no hay ninguno seleccionado muestra todo
  const archivosFiltrados = tiposSeleccionados.length === 0
    ? files
    : files.filter((f) =>
      f.type === "folder" ||
      tiposSeleccionados.includes(f.categoria) ||
      tiposSeleccionados.includes(f.metadatos?._categoria)
    );

  // Descargar documento
  const handleDownload = async (id_doc) => {
    try {
      // Buscar el archivo en la lista para obtener su nombre real
      const file = files.find((f) => f.id_doc === id_doc);
      const fileName = file && file.name ? `${file.name}.pdf` : `documento_${id_doc}.pdf`;

      const blob = await documentsService.downloadDocument(id_doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando documento", error);
      alert("Error al descargar el documento. Verifica tu sesión.");
    }
  };


  // Eliminar documento
  const handleDelete = async (id_doc) => {
    try {
      const res = await documentsService.deleteDocument(id_doc);

      if (res?.success) {
        cargarDatos();
      } else {
        alert(res?.error || "No se pudo eliminar");
      }

    } catch (err) {
      console.error("Error eliminando documento", err);

      alert(
        err?.response?.data?.error ||
        "Error eliminando documento"
      );
    }
  };

  const handleOpenDeletePrompt = (e, file) => {
    e.stopPropagation();
    setDeletePrompt((prev) =>
      prev.open && prev.file?.id === file.id
        ? { open: false, file: null }
        : { open: true, file }
    );
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setDeletePrompt({ open: false, file: null });
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    if (!deletePrompt.file?.id_doc) {
      setDeletePrompt({ open: false, file: null });
      return;
    }

    const idDoc = deletePrompt.file.id_doc;
    setDeletePrompt({ open: false, file: null });
    await handleDelete(idDoc);
  };

  useEffect(() => {
    if (!deletePrompt.open) return;

    const handleClickOutside = (event) => {
      if (deletePromptRef.current && !deletePromptRef.current.contains(event.target)) {
        setDeletePrompt({ open: false, file: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [deletePrompt.open]);

  // Filtrado por fecha
  const filtradosFecha = archivosFiltrados.filter((f) => {
    // Las carpetas no tienen fecha de expedición, siempre se muestran
    if (f.type === "folder") return true;
    // Obtener la fecha del archivo
    const fechaISO = f.fecha_expedicion || null;
    let fechaObj = null;
    if (fechaISO) {
      fechaObj = parseDate(fechaISO);
    }

    // Si no tiene fecha de expedición y hay algún filtro activo, no pasa
    if (!fechaObj) {
      return anio === "Cualquier Año" && mes === "Cualquier Mes" && dia === "Cualquier Día";
    }

    const fileAnio = fechaObj.getFullYear().toString();
    const fileMes = MONTHS[fechaObj.getMonth()];
    const fileDia = fechaObj.getDate();

    if (anio !== "Cualquier Año" && fileAnio !== anio) return false;
    if (mes !== "Cualquier Mes" && fileMes !== mes) return false;
    if (dia !== "Cualquier Día" && fileDia !== Number(dia)) return false;

    return true;
  });

  // Ordena los archivos filtrados según el criterio seleccionado en el estado "ordenarPor"
  const showFiles = [...filtradosFecha].sort((a, b) => {
    // Las carpetas siempre van primero
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    // Para ordenar por nombre, usamos localeCompare para comparar los nombres de los archivos
    if (ordenarPor === "Nombre A-Z") {
      return a.name.localeCompare(b.name);
    }
    if (ordenarPor === "Nombre Z-A") {
      return b.name.localeCompare(a.name);
    }
    // Para ordenar por fecha, convertimos las fechas a objetos Date y restamos para obtener el orden correcto
    if (ordenarPor === "Fecha ↑") {
      return parseDate(a.fecha_expedicion) - parseDate(b.fecha_expedicion);
    }
    if (ordenarPor === "Fecha ↓") {
      return parseDate(b.fecha_expedicion) - parseDate(a.fecha_expedicion);
    }
    return 0;
  });

  const handleTipoChange = (categoria) => {
    setTiposSeleccionados((prev) =>
      prev.includes(categoria)
        ? prev.filter((t) => t !== categoria)
        : [...prev, categoria]
    );
  };

  // Funciones para los botones de ordenamiento, alternan entre los estados correspondientes
  const toggleSortNombre = () => {
    setOrdenarPor((prev) => (prev === "Nombre A-Z" ? "Nombre Z-A" : "Nombre A-Z")); // Si el estado actual es "Nombre A-Z", cambia a "Nombre Z-A", y viceversa
  };

  const toggleSortFecha = () => {
    setOrdenarPor((prev) => (prev === "Fecha ↑" ? "Fecha ↓" : "Fecha ↑")); // Si el estado actual es "Fecha ↑", cambia a "Fecha ↓", y viceversa
  };

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [carpetasRes, docsRes, catsRes, catsCustomRes] = await Promise.all([
        documentsService.listFolders(currentFolderId).catch(() => ({ carpetas: [] })),
        documentsService.listDocuments(currentFolderId).catch(() => ({ documentos: [] })),
        documentsService.listCategories().catch(() => ({ categorias: [] })),
        documentsService.listCustomCategories().catch(() => ({ categorias_custom: [] })),
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
        titulo_doc: d.titulo_doc,
        categoria: d.nombre_categoria || null,
        fecha_creacion: d.fecha_creacion,
        metadatos: d.metadatos || {},
        descripcion: d.descripcion || "",
        fecha_expedicion: d.fecha_expedicion || null,
      }));

        setFiles([...carpetas, ...docs]);
        setCategorias(catsRes?.categorias || []);
        setCategoriasCustom(catsCustomRes?.categorias_custom || []);
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
  }, [currentFolderId]);

  const handleNuevaCarpeta = () => {
    setShowModal(true);
  };

  const handleConfirmFolder = async () => {
    if (!folderName.trim()) return;
    try {
      const res = await documentsService.createFolder(folderName.trim(), currentFolderId);
      if (res?.success) {
        cargarDatos();
        setShowModal(false);
        setFolderName("");
      } else {
        alert(res?.error || "No se pudo crear la carpeta");
      }
    } catch (err) {
      alert(err?.data?.error || "Error al crear la carpeta");
    }
  };

  const handleCancelFolder = () => {
    setShowModal(false);
    setFolderName("");
  };

  // Abre el modal de mover y carga las carpetas disponibles como destino
  const handleMover = async (e, file) => {
    e.stopPropagation();
    setElementoAMover(file);
    try {
      const res = await documentsService.listFolders("all");
      if (res?.success) {
        setCarpetasDestino(res.carpetas);
      }
    } catch(err) {
      console.error("Error al cargar carpetas destino", err);
    }
    setShowMoveModal(true);
  };

  // Confirma el movimiento llamando al servicio correspondiente
  const handleConfirmMove = async () => {
    if (!elementoAMover) return;
    setMoving(true);
    try {
      const id_destino = destinoSeleccionado === "" ? null : parseInt(destinoSeleccionado, 10);
      let res;
      if (elementoAMover.type === "folder") {
        const id_carpeta = elementoAMover.id.replace("f-", "");
        res = await documentsService.moverCarpeta(id_carpeta, id_destino);
      } else {
        res = await documentsService.moverDocumento(elementoAMover.id_doc, id_destino);
      }

      if (res?.success) {
        setShowMoveModal(false);
        setElementoAMover(null);
        setDestinoSeleccionado("");
        cargarDatos();
      } else {
        alert(res?.error || "Error al mover el archivo");
      }
    } catch (err) {
      alert(err?.data?.error || "Error al mover");
    } finally {
      setMoving(false);
    }
  };

  // Cancela el modal de mover
  const handleCancelMove = () => {
    setShowMoveModal(false);
    setElementoAMover(null);
    setDestinoSeleccionado("");
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

    const ext = archivo.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" || (archivo.type && archivo.type !== "application/pdf")) {
      alert("Solo se permiten archivos PDF (.pdf)");
      return;
    }

    const titulo = window.prompt(
      "Título del documento:",
      archivo.name.replace(/\.pdf$/i, ""),
    );
    if (!titulo) return;

    const cat = categorias[0];
    if (!cat?.id_tipo) {
      alert("No hay categorías de documento disponibles.");
      return;
    }

    setUploading(true);
    try {
      const res = await documentsService.uploadDocument({
        archivo,
        titulo_doc: titulo,
        id_tipo: cat.id_tipo,
        categoria: cat.nombre_categoria,
        id_folder: currentFolderId,
        metadatos: {},
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
          accept="application/pdf,.pdf"
          style={{ display: "none" }}
          onChange={handleArchivoSeleccionado}
        />

        {/* === CONTENT === */}
        <div className="content">
         
          {/* === BREADCRUMBS === */}
          <div className="breadcrumbs" style={{ padding: "10px 0", fontSize: "16px", color: "#ccc" }}>
            <span
              onClick={() => { setFolderPath([]); setCurrentFolderId(null); }}
              style={{ cursor: "pointer", color: "#5aedf1", fontWeight: "bold" }}
            >
              Raíz
            </span>
            {folderPath.map((f, i) => (
              <React.Fragment key={f.id}>
                <span style={{ margin: "0 8px", color: "#666" }}> {">"} </span>
                <span
                  onClick={() => {
                    const newPath = folderPath.slice(0, i + 1);
                    setFolderPath(newPath);
                    setCurrentFolderId(f.id);
                  }}
                  style={{
                    cursor: i === folderPath.length - 1 ? "default" : "pointer",
                    color: i === folderPath.length - 1 ? "#fff" : "#5aedf1",
                    fontWeight: i === folderPath.length - 1 ? "normal" : "bold"
                  }}
                >
                  {f.name}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* === FILTER PANEL === */}
          <div className="filters_panel">
            {/* === SIMPLIFIED VIEW === */}
            {filtrosAvanzados ? (
              <div className="simple_view">
                <div className="simple_header">
                  {/* Boton para ordenar alfabeticamente */}
                  <h3 className="col_nombre">
                    Nombre <button className="btn_sort" onClick={toggleSortNombre}>
                      {ordenarPor === "Nombre A-Z" ? "↓" : ordenarPor === "Nombre Z-A" ? "↑" : "↑↓"}
                    </button>
                  </h3>
                  {/* Boton para ordenar por fecha */}
                  <h3 className="col_fecha">
                    Fecha <button className="btn_sort" onClick={toggleSortFecha}>
                      {ordenarPor === "Fecha ↑" ? "↑" : ordenarPor === "Fecha ↓" ? "↓" : "↑↓"}
                    </button>
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
                      <select
                        className="filter_select"
                        value={ordenarPor} // El valor del select se controla con el estado "ordenarPor"
                        onChange={(e) => setOrdenarPor(e.target.value)} // Cuando se selecciona una opción, actualizamos el estado "ordenarPor"
                      >
                        <option value="Nombre A-Z">Nombre A-Z</option>
                        <option value="Nombre Z-A">Nombre Z-A</option>
                        <option value="Fecha ↑">Fecha ↑</option>
                        <option value="Fecha ↓">Fecha ↓</option>
                      </select>
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
                <div className="checkbox_label">Categoria del Documento</div>
                <div className="checkbox_row">
                  {/* Mapea las categorias obtenidas del backend para crear un checkbox para cada una */}
                  {categorias.filter((cat) => cat.nombre_categoria !== "Personalizada").map((cat) => (
                    <label key={cat.id_tipo} className="checkbox_item">
                      <input
                        type="checkbox"
                        value={cat.nombre_categoria}
                        checked={tiposSeleccionados.includes(cat.nombre_categoria)}
                        onChange={() => handleTipoChange(cat.nombre_categoria)}
                      />
                      {cat.nombre_categoria}
                    </label>
                  ))}
                </div>
                {/* Categorías personalizadas */}
                {categoriasCustom.length > 0 && (
                  <>
                    <div className="checkbox_label" style={{ marginTop: "10px" }}>Categorías Personalizadas</div>
                    <div className="checkbox_row">
                      {categoriasCustom.map((cat) => (
                        <label key={cat.id} className="checkbox_item">
                          <input
                            type="checkbox"
                            value={cat.nombre}
                            checked={tiposSeleccionados.includes(cat.nombre)}
                            onChange={() => handleTipoChange(cat.nombre)}
                          />
                          {cat.nombre}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* === SCROLLABLE FILES CONTAINER === */}
          <div className="files_scroll_container">
            {/* === FILE LIST === */}
            <div className="files_list">
              {loading && <p>Cargando…</p>}
              {errorMsg && <p style={{ color: "#ff6b6b" }}>{errorMsg}</p>}
              {!loading && !errorMsg && files.length === 0 && (
                <p>No hay archivos. Crea una carpeta o sube un documento.</p>
              )}
              {showFiles.map((file) => (
                <div key={file.id} className="file_row" onClick={() => handleVerDocumento(file)} style={{ cursor: file.type === "pdf" ? "pointer" : "default" }}>
                  <span>{file.type === "folder" ? "📁" : "📄"}</span>
                  <span className="file_name">{file.name}</span>
                  <span className="file_date">{file.date}</span>
                  <div className="file_actions">
                    {file.type !== "folder" && file.id_doc && (
                      <button
                        className="btn_upd"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file.id_doc);
                        }}
                        aria-label="Descargar"
                        data-tooltip="Descargar"
                      >
                        <img src={descargasIcon} alt="" aria-hidden="true" className="btn_icon" />
                      </button>
                    )}
                    <button
                      className="btn_mov" aria-label="Mover" data-tooltip="Mover"
                      onClick={(e) => handleMover(e, file)}
                    >
                      <img src={archivoIcon} alt="" aria-hidden="true" className="btn_icon" />
                    </button>
                    <div className="delete_action_wrapper" ref={deletePrompt.open && deletePrompt.file?.id === file.id ? deletePromptRef : null}>
                      <button
                        className="btn_del" aria-label="Eliminar" data-tooltip="Eliminar"
                        onClick={(e) => handleOpenDeletePrompt(e, file)}
                      >
                        <img src={basuraIcon} alt="" aria-hidden="true" className="btn_icon" />
                      </button>
                      {deletePrompt.open && deletePrompt.file?.id === file.id && (
                        <div className="delete_confirmation_popover" role="dialog" aria-label="Confirmar eliminación">
                          <span className="delete_confirmation_title">Confirmar</span>
                          <div className="delete_confirmation_actions">
                            <button
                              type="button"
                              className="delete_confirmation_button delete_confirmation_button_cancel"
                              onClick={handleCancelDelete}
                              aria-label="Cancelar eliminación"
                            />
                            <button
                              type="button"
                              className="delete_confirmation_button delete_confirmation_button_confirm"
                              onClick={handleConfirmDelete}
                              aria-label="Confirmar eliminación"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* === BOTTOM BAR === */}
            <div className="bottom_bar">
              <button className="btn_new_folder" onClick={handleNuevaCarpeta} aria-label="Nueva Carpeta" data-tooltip="Nueva Carpeta">
                <img src={nuevaCarpetaIcon} alt="" aria-hidden="true" className="btn_folder_icon" />
              </button>
            </div>
          </div>
        </div>

        {/* === MODAL NUEVA CARPETA === */}
        {showModal && (
          <div className="modal_overlay">
            <div className="modal_content">
              <h3>Crear Nueva Carpeta</h3>
              <input
                type="text"
                placeholder="Nombre de la carpeta"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="modal_input"
                autoFocus
              />
              <div className="modal_buttons">
                <button className="btn_cancel" onClick={handleCancelFolder}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="btn_confirm" onClick={handleConfirmFolder}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === MODAL MOVER === */}
        {showMoveModal && (
          <div className="modal_overlay">
            <div className="modal_content">
              <h3>Mover "{elementoAMover?.name}"</h3>
              <select
                className="modal_input"
                value={destinoSeleccionado}
                onChange={(e) => setDestinoSeleccionado(e.target.value)}
              >
                <option value="">Selecciona una carpeta destino</option>
                {carpetasDestino.map((c) => (
                  <option key={c.id_folder} value={c.id_folder}>
                    {c.nombre_carpeta}
                  </option>
                ))}
              </select>
              <div className="modal_buttons">
                <button className="btn_cancel" onClick={handleCancelMove} disabled={moving}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="btn_confirm" onClick={handleConfirmMove} disabled={moving || !destinoSeleccionado}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
