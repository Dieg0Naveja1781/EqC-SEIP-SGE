import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginId, setLoginId] = useState(null);
  const [error, setError] = useState(null);

  // Verificar si hay sesión al cargar la app
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedLoginId = localStorage.getItem('login_id');

    if (storedUser && storedLoginId) {
      try {
        setUser(JSON.parse(storedUser));
        setLoginId(storedLoginId);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('login_id');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(username, password);
      
      if (response.success) {
        setUser(response.user);
        setLoginId(response.login_id);
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err) {
      const message = 'Error al conectar con el servidor';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        const errorMsg = response.message || 'Error al registrar';
        setError(errorMsg);
        return { success: false, message: errorMsg, errors: response.errors };
      }
    } catch (err) {
      const message = 'Error al conectar con el servidor';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setLoginId(null);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Error during logout:', err);
      // Limpiar de todas formas
      setUser(null);
      setLoginId(null);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      const response = await authService.getProfile();
      return response;
    } catch (err) {
      console.error('Error getting profile:', err);
      return null;
    }
  };

  const value = {
    user,
    loading,
    loginId,
    error,
    login,
    register,
    logout,
    getProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
