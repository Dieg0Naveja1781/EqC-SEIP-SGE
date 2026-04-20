import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./modules/auth/login/Login";
import Register from "./modules/auth/create_account/Register";
import { UserData } from "./modules/user-data/UserData";
import { ArchiveList } from "./modules/archives_list/archive_list";
import { MainPage } from './modules/main';

function AppContent() {
  return (
    <BrowserRouter>
      {/* Navbar con navegación - Se muestra en todas partes */}
      <nav style={{ padding: "20px", backgroundColor: "#333", color: "white" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <a href="/" style={{ color: "white", marginRight: "10px", textDecoration: 'none' }}>
              Inicio
            </a>
            <a href="/main" style={{ color: 'white', marginRight: '10px', textDecoration: 'none' }}>
              Main Page
            </a>
            <a href="/perfil" style={{ color: "white", marginRight: "10px", textDecoration: 'none' }}>
              Ver Perfil de Usuario
            </a>
            <a href="/archive_list" style={{ color: "white", textDecoration: 'none' }}>
              Gestión de Archivos
            </a>
          </div>
          <div>
            <a href="/login" style={{ color: "white", marginRight: "10px", textDecoration: 'none' }}>
              Login
            </a>
            <a href="/register" style={{ color: "white", textDecoration: 'none' }}>
              Registrarse
            </a>
          </div>
        </div>
      </nav>

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={<h1>Bienvenido al Sistema de Expedientes</h1>}
        />

        {/* Rutas Protegidas */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <UserData />
            </ProtectedRoute>
          }
        />
        <Route
          path="/archive_list"
          element={
            <ProtectedRoute>
              <ArchiveList />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto - Redirige a inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
