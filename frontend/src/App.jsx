import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importación de Módulos (Cada uno en su carpeta correspondiente)
import { LandingPage } from "./modules/landing-page/LandingPage"; 
import { MainPage } from "./modules/main";
import { UserData } from "./modules/user-data/UserData";
import { ArchiveList } from "./modules/archives_list/archive_list";

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
        <Route path="/archive_list" element={<ArchiveList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
