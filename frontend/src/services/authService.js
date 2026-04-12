const API_URL = 'http://localhost:8000/api';

export const authService = {
  /**
   * Login del usuario
   * @param {string} username - Usuario o email
   * @param {string} password - Contraseña
   * @returns {Promise} Respuesta del servidor
   */
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Enviar cookies de sesión
        body: JSON.stringify({
          username: username,
          password: password,
          ip_address: '127.0.0.1', // Obtener IP real en producción
          user_agent: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Guardar información del usuario
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('login_id', data.login_id);
        return {
          success: true,
          user: data.user,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al iniciar sesión'
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  },

  /**
   * Logout del usuario
   * @returns {Promise} Respuesta del servidor
   */
  async logout() {
    try {
      const loginId = localStorage.getItem('login_id');
      
      if (!loginId) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          login_id: loginId
        })
      });

      const data = await response.json();
      
      // Limpiar datos locales
      localStorage.removeItem('user');
      localStorage.removeItem('login_id');
      
      return data;
    } catch (error) {
      console.error('Error en logout:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('login_id');
      return { success: false };
    }
  },

  /**
   * Obtener datos del usuario autenticado
   * @returns {Promise} Datos del usuario
   */
  async getProfile() {
    try {
      const response = await fetch(`${API_URL}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('No autenticado');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  },

  /**
   * Registrar nuevo usuario
   * @param {object} userData - Datos del usuario
   * @returns {Promise} Respuesta del servidor
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }
};