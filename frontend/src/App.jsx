import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { UserData } from "./modules/user-data/UserData"; // Importar módulo de datos de usuario
import { ArchiveList } from "./modules/archives_list/archive_list";
import { MainPage } from './modules/main'; // Importar módulo de la página principal

function App() {
  return (
    <BrowserRouter>
      {/* Esto es un menú de navegación simple para probar */}
      <nav style={{ padding: "20px", backgroundColor: "#333", color: "white" }}>
        <Link to="/" style={{ color: "white", marginRight: "10px" }}>
          Inicio
        </Link>
        <Link to="/perfil" style={{ color: "white", marginRight: "10px" }}>
          Ver Perfil de Usuario
        </Link>
        <Link to="/archive_list" style={{ color: "white" }}>
          Gestión de Archivos
        </Link>
        <Link to="/main" style={{ color: 'white', marginRight: '10px' }}>Main Page</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<h1>Bienvenido al Sistema de Expedientes</h1>}
        />
        <Route path="/main" element={<MainPage />} />
        <Route path="/perfil" element={<UserData />} />
        <Route path="/archive_list" element={<ArchiveList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
