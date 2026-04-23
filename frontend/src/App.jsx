import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { UserData } from "./modules/user-data/UserData";
import { ArchiveList } from "./modules/archives_list/archive_list";
import { MainPage } from './modules/main';
import Login from "./modules/auth/login/Login";
import Register from "./modules/auth/create_account/Register";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "20px", backgroundColor: "#333", color: "white" }}>
        <Link to="/" style={{ color: "white", marginRight: "10px" }}>
          Inicio
        </Link>
        <Link to="/main" style={{ color: 'white', marginRight: '10px' }}>
          Main Page
        </Link>
        <Link to="/perfil" style={{ color: "white", marginRight: "10px" }}>
          Ver Perfil de Usuario
        </Link>
        <Link to="/archive_list" style={{ color: "white", marginRight: "10px" }}>
          Gestión de Archivos
        </Link>
        <Link to="/login" style={{ color: "white", marginRight: "10px" }}>
          Iniciar Sesión
        </Link>
        <Link to="/register" style={{ color: "white" }}>
          Registro
        </Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={<h1>Bienvenido al Sistema de Expedientes</h1>}
        />
        <Route path="/main" element={<MainPage />} />
        <Route path="/perfil" element={<UserData />} />
        <Route path="/archive_list" element={<ArchiveList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
