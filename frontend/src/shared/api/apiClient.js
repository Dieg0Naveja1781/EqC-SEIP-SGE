// Cliente HTTP central que habla con el backend Django.
// Lee la URL base desde Vite env (VITE_API_URL) o usa localhost por defecto.

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// Devuelve el id_profesor guardado en localStorage por authService.
// Se manda como header X-Profesor-Id al backend para evitar depender
// de la cookie de sesión en desarrollo (sólo se usa si DEBUG=True
// del lado del backend).
function getProfesorId() {
  try {
    const raw = localStorage.getItem("profesor");
    const profe = raw ? JSON.parse(raw) : null;
    return profe?.id_profesor ?? null;
  } catch {
    return null;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }
  return response.text();
}

async function request(endpoint, options = {}) {
  const { isDownload, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  const csrfToken = getCookie("csrftoken");
  const profesorId = getProfesorId();

  const headers = {
    Accept: "application/json",
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    ...(profesorId ? { "X-Profesor-Id": String(profesorId) } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      credentials: "include",
      headers,
    });
  } catch (err) {
    throw { status: 0, data: { error: "No se pudo conectar con el servidor" } };
  }

  if (isDownload && response.ok) {
    return response.blob();
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw { status: response.status, data };
  }
  return data;
}

export const apiClient = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, body) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: (endpoint, body) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
  upload: (endpoint, formData, method = "POST") =>
    request(endpoint, { method, body: formData }),
  download: (endpoint) => request(endpoint, { method: "GET", isDownload: true }),
};

export const API_BASE = API_BASE_URL;
