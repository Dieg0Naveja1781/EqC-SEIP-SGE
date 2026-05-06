import { apiClient } from "./apiClient";

export const authService = {
  login: (correo_profe, password) =>
    apiClient.post("/usuarios/login/", { correo_profe, password }),

  register: (payload) =>
    apiClient.post("/usuarios/registro/", payload),

  logout: () => apiClient.post("/usuarios/logout/", {}),
};

export function saveSessionProfesor(profesor) {
  if (!profesor) return;
  localStorage.setItem("profesor", JSON.stringify(profesor));
}

export function getSessionProfesor() {
  try {
    const raw = localStorage.getItem("profesor");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSessionProfesor() {
  localStorage.removeItem("profesor");
}
