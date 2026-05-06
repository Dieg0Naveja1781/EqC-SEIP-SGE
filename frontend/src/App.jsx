import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importación de Módulos (Cada uno en su carpeta correspondiente)
import LandingPage from "./modules/landing-page/pages/landing.jsx";
import { MainPage } from "./modules/main";
import { UserData } from "./modules/user-data/UserData";
import { ChangePassword } from "./modules/user-data/ChangePassword";
import { ArchiveList } from "./modules/archives_list/archive_list";
import { SubirDoc } from './modules/upload-files/SubirDoc';
import Login from "./modules/auth/login/Login";
import Register from "./modules/auth/create_account/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA RAÍZ: Muestra la Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* RUTAS INTERNAS DEL SISTEMA */}
        {/* Aquí deben agregar las rutas para cada uno de los módulos */}
        <Route path="/main" element={<MainPage />} />
        <Route path="/perfil" element={<UserData />} />
        <Route path="/perfil/cambiar-password" element={<ChangePassword />} />
        <Route path="/archive_list" element={<ArchiveList />} />
        <Route path="/subir_doc" element={<SubirDoc />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
