import { useEffect, useRef, useState } from "react";
import { documentsService } from "../../shared/api/documentsService";

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const CURRENT_YEAR = new Date().getFullYear();
export const YEARS_ARRAY = Array.from({ length: CURRENT_YEAR - 2000 + 1 }, (_, i) => 2000 + i);

export function formatFecha(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX");
  } catch {
    return iso;
  }
}

export function parseDate(str) {
  if (!str) return new Date(0);
  const partes = str.split("/");
  if (partes.length === 3) {
    return new Date(`${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`);
  }
  return new Date(str);
}

export function useArchiveData({ initialFolderId = null, initialFolderPath = [] } = {}) {
  const [tipoFiltroFecha, setTipoFiltroFecha] = useState("Ninguno");
  const [rangoInicio, setRangoInicio] = useState("");
  const [rangoFin, setRangoFin] = useState("");
  const [inicioMes, setInicioMes] = useState("");
  const [inicioAnio, setInicioAnio] = useState("");
  const [finMes, setFinMes] = useState("");
  const [finAnio, setFinAnio] = useState("");
  const [files, setFiles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriasCustom, setCategoriasCustom] = useState([]);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("Fecha ↓");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [elementoAMover, setElementoAMover] = useState(null);
  const [carpetasDestino, setCarpetasDestino] = useState([]);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState("");
  const [moving, setMoving] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const renameHighlightTimeoutRef = useRef(null);
  const [currentFolderId, setCurrentFolderId] = useState(initialFolderId);
  const [folderPath, setFolderPath] = useState(initialFolderPath);
  const [deletePrompt, setDeletePrompt] = useState({ open: false, file: null });
  const deletePromptRef = useRef(null);

  const handleDownload = async (id_doc) => {
    try {
      const file = files.find((f) => f.id_doc === id_doc);
      const fileName = file?.name ? `${file.name}.pdf` : `documento_${id_doc}.pdf`;
      const blob = await documentsService.downloadDocument(id_doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Error al descargar el documento. Verifica tu sesión.");
    }
  };

  const handleDelete = async (file) => {
    const isFolder = file.type === "folder";
    try {
      let res;
      if (isFolder) {
        res = await documentsService.deleteCarpeta(file.id.replace("f-", ""));
      } else {
        res = await documentsService.deleteDocument(file.id_doc);
      }
      if (res?.success) {
        cargarDatos();
      } else {
        alert(res?.error || "No se pudo eliminar");
      }
    } catch (err) {
      alert(err?.response?.data?.error || `Error eliminando ${isFolder ? "carpeta" : "documento"}`);
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
    const fileToDelete = deletePrompt.file;
    setDeletePrompt({ open: false, file: null });
    if (fileToDelete) await handleDelete(fileToDelete);
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

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [carpetasRes, docsRes, catsRes, catsCustomRes] = await Promise.all([
        documentsService.listFolders(currentFolderId).catch(() => ({ carpetas: [] })),
        documentsService.listDocuments(currentFolderId).catch(() => ({ documentos: [] })),
        documentsService.listCategories().catch(() => ({ categorias: [] })),
        documentsService.listCustomCategories().catch(() => ({ categorias_custom: [] })),
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

  useEffect(() => () => {
    if (renameHighlightTimeoutRef.current) {
      clearTimeout(renameHighlightTimeoutRef.current);
    }
  }, []);

  const handleNuevaCarpeta = () => setShowModal(true);

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

  const handleMover = async (e, file) => {
    e.stopPropagation();
    setElementoAMover(file);
    try {
      const res = await documentsService.listFolders("all");
      if (res?.success) setCarpetasDestino(res.carpetas);
    } catch {
      // silencioso si falla la carga de destinos
    }
    setShowMoveModal(true);
  };

  const handleConfirmMove = async () => {
    if (!elementoAMover) return;
    setMoving(true);
    try {
      const id_destino = destinoSeleccionado === "" ? null : parseInt(destinoSeleccionado, 10);
      let res;
      if (elementoAMover.type === "folder") {
        res = await documentsService.moverCarpeta(elementoAMover.id.replace("f-", ""), id_destino);
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

  const handleCancelMove = () => {
    setShowMoveModal(false);
    setElementoAMover(null);
    setDestinoSeleccionado("");
  };

  const handleOpenRename = (e, file) => {
    e.stopPropagation();
    setRenameTarget(file);
    setRenameValue(file?.name || "");
    setShowRenameModal(true);
  };

  const handleCancelRename = () => {
    setShowRenameModal(false);
    setRenameTarget(null);
    setRenameValue("");
  };

  const handleConfirmRename = () => {
    if (!renameTarget) return;

    setHighlightedRowId(renameTarget.id);
    if (renameHighlightTimeoutRef.current) {
      clearTimeout(renameHighlightTimeoutRef.current);
    }
    renameHighlightTimeoutRef.current = setTimeout(() => {
      setHighlightedRowId(null);
      renameHighlightTimeoutRef.current = null;
    }, 1000);

    handleCancelRename();
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
    const titulo = window.prompt("Título del documento:", archivo.name.replace(/\.pdf$/i, ""));
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

  const handleTipoChange = (categoria) => {
    setTiposSeleccionados((prev) =>
      prev.includes(categoria) ? prev.filter((t) => t !== categoria) : [...prev, categoria]
    );
  };

  const toggleSortNombre = () =>
    setOrdenarPor((prev) => (prev === "Nombre A-Z" ? "Nombre Z-A" : "Nombre A-Z"));

  const toggleSortFecha = () =>
    setOrdenarPor((prev) => (prev === "Fecha ↑" ? "Fecha ↓" : "Fecha ↑"));

  const archivosFiltrados =
    tiposSeleccionados.length === 0
      ? files
      : files.filter(
          (f) =>
            f.type === "folder" ||
            tiposSeleccionados.includes(f.categoria) ||
            tiposSeleccionados.includes(f.metadatos?._categoria)
        );

  const filtradosFecha = archivosFiltrados.filter((f) => {
    if (f.type === "folder") return true;
    const fechaObj = f.fecha_expedicion ? parseDate(f.fecha_expedicion) : null;
    if (tipoFiltroFecha === "Ninguno") return true;
    if (!fechaObj) return !rangoInicio && !rangoFin;
    if (tipoFiltroFecha === "Por Mes") {
      if (fechaObj.getFullYear() !== CURRENT_YEAR) return false;
      const fileMes = fechaObj.getMonth() + 1;
      if (rangoInicio && fileMes < parseInt(rangoInicio)) return false;
      if (rangoFin && fileMes > parseInt(rangoFin)) return false;
    } else if (tipoFiltroFecha === "Por Año") {
      const fileAnio = fechaObj.getFullYear();
      if (rangoInicio && fileAnio < parseInt(rangoInicio)) return false;
      if (rangoFin && fileAnio > parseInt(rangoFin)) return false;
    } else if (tipoFiltroFecha === "Por Mes y Año") {
      const fileVal = fechaObj.getFullYear() * 12 + fechaObj.getMonth();
      if (inicioAnio && inicioMes) {
        const iniVal = parseInt(inicioAnio) * 12 + (parseInt(inicioMes) - 1);
        if (fileVal < iniVal) return false;
      }
      if (finAnio && finMes) {
        const finVal = parseInt(finAnio) * 12 + (parseInt(finMes) - 1);
        if (fileVal > finVal) return false;
      }
    }
    return true;
  });

  const showFiles = [...filtradosFecha].sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    if (ordenarPor === "Nombre A-Z") return a.name.localeCompare(b.name);
    if (ordenarPor === "Nombre Z-A") return b.name.localeCompare(a.name);
    if (ordenarPor === "Fecha ↑") return parseDate(a.fecha_expedicion) - parseDate(b.fecha_expedicion);
    if (ordenarPor === "Fecha ↓") return parseDate(b.fecha_expedicion) - parseDate(a.fecha_expedicion);
    return 0;
  });

  return {
    files, categorias, categoriasCustom,
    loading, uploading, errorMsg,
    currentFolderId, folderPath, setCurrentFolderId, setFolderPath,
    tipoFiltroFecha, setTipoFiltroFecha,
    rangoInicio, setRangoInicio,
    rangoFin, setRangoFin,
    inicioMes, setInicioMes,
    inicioAnio, setInicioAnio,
    finMes, setFinMes,
    finAnio, setFinAnio,
    tiposSeleccionados,
    filtrosAvanzados, setFiltrosAvanzados,
    ordenarPor, setOrdenarPor,
    showModal, setShowModal,
    folderName, setFolderName,
    showMoveModal,
    elementoAMover,
    carpetasDestino,
    destinoSeleccionado, setDestinoSeleccionado,
    moving,
    showRenameModal,
    renameTarget,
    renameValue, setRenameValue,
    highlightedRowId,
    deletePrompt, setDeletePrompt,
    deletePromptRef,
    fileInputRef,
    showFiles,
    cargarDatos,
    handleDownload,
    handleDelete,
    handleOpenDeletePrompt,
    handleCancelDelete,
    handleConfirmDelete,
    handleNuevaCarpeta,
    handleConfirmFolder,
    handleCancelFolder,
    handleMover,
    handleConfirmMove,
    handleCancelMove,
    handleOpenRename,
    handleCancelRename,
    handleConfirmRename,
    handleSubirArchivoClick,
    handleArchivoSeleccionado,
    handleTipoChange,
    toggleSortNombre,
    toggleSortFecha,
  };
}
