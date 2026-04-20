import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

/**
 * Componente que protege rutas requiriendo autenticación
 * 
 * Ejemplo de uso:
 * <Route 
 *   path="/perfil" 
 *   element={<ProtectedRoute><UserData /></ProtectedRoute>} 
 * />
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderizar el componente
  return children;
};

export default ProtectedRoute;
