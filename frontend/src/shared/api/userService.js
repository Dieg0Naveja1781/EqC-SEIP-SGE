import { apiClient } from "./apiClient";

export const userService = {
  getProfile: () => apiClient.get("/usuarios/perfil/"),

  updateProfile: (data) => apiClient.put("/usuarios/perfil/actualizar/", data),

  changePassword: (password_actual, password_nuevo) =>
    apiClient.post("/usuarios/cambiar-password/", {
      password_actual,
      password_nuevo,
    }),
};
