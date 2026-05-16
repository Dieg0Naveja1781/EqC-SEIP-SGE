import { apiClient, API_BASE } from "./apiClient";

export const documentsService = {
  listCategories: () => apiClient.get("/categorias/"),

  listFolders: (idPadre = null) => {
    const qs = idPadre ? `?id_padre=${idPadre}` : "";
    return apiClient.get(`/carpetas/${qs}`);
  },

  createFolder: (nombre_carpeta, id_padre = null) =>
    apiClient.post("/carpetas/", { nombre_carpeta, id_padre }),

  listDocuments: (id_folder = null) => {
    const qs = id_folder ? `?id_folder=${id_folder}` : "";
    return apiClient.get(`/documentos/${qs}`);
  },

  uploadDocument: ({ archivo, titulo_doc, id_tipo, id_folder, fecha_expedicion, categoria, metadatos }) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("titulo_doc", titulo_doc);
    if (id_tipo) formData.append("id_tipo", id_tipo);
    if (id_folder) formData.append("id_folder", id_folder);
    if (fecha_expedicion) formData.append("fecha_expedicion", fecha_expedicion);
    if (categoria) formData.append("categoria", categoria);
    if (metadatos) formData.append("metadatos", JSON.stringify(metadatos));
    return apiClient.upload("/documentos/subir/", formData);
  },

  downloadDocument: (id_doc) =>
    apiClient.download(`/documentos/${id_doc}/descargar/`),

  buscarDocumentos: (query) =>
    apiClient.get(`/documentos/buscar/?q=${encodeURIComponent(query)}`),

  listExpedientes: () => apiClient.get("/expedientes/"),

  createExpediente: (nombre_convocatoria, descripcion = "") =>
    apiClient.post("/expedientes/", { nombre_convocatoria, descripcion }),

  // ---- CategorÃ­as personalizadas ----
  listCustomCategories: () => apiClient.get("/categorias-custom/"),

  createCustomCategory: (nombre, campos) =>
    apiClient.post("/categorias-custom/", { nombre, campos }),

  deleteCustomCategory: (id) => apiClient.delete(`/categorias-custom/${id}/`),
  deleteDocument: (id_doc) =>
  apiClient.delete(`/documentos/${id_doc}/eliminar/`),

  moverDocumento: (id_doc, id_destino) =>
    apiClient.post(`/documentos/${id_doc}/mover/`, { id_destino }),

  moverCarpeta: (id_carpeta, id_destino) =>
    apiClient.post(`/carpetas/${id_carpeta}/mover/`, { id_destino }),
};
