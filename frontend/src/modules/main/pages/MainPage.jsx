import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../../shared/components/DashboardLayout";
import LastSessionTable from "../components/LastSessionTable";
import { documentsService } from "../../../shared/api/documentsService";
import "../styles/MainPage.css";

const recentFolders = [
  { id: "folder-1", name: "Planeacion" },
  { id: "folder-2", name: "Evidencias" },
  { id: "folder-3", name: "Actas" },
  { id: "folder-4", name: "Convenios" },
  { id: "folder-5", name: "Reportes" },
];

function SearchBar() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setHistory(savedHistory);
  }, []);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    console.log("Llamando a API con query:", searchQuery);
    try {
      const response = await documentsService.buscarDocumentos(searchQuery);
      console.log("Respuesta de API:", response);
      if (response.success) {
        setResults(response.documentos);
        // Guardar en historial
        const newHistory = [searchQuery, ...history.filter(h => h !== searchQuery)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      }
    } catch (error) {
      console.error("Error buscando documentos:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleHistoryClick = (histQuery) => {
    setQuery(histQuery);
    handleSearch(histQuery);
  };

  const handleResultClick = (doc) => {
    navigate(`/archive_view?id=${doc.id_doc}`);
  };

  return (
    <div className="search-section">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar documentos..."
          className="search-input"
        />
        <button type="submit" className="search-button">Buscar</button>
      </form>
      {history.length > 0 && (
        <div className="search-history">
          <p>Últimas búsquedas:</p>
          {history.map((hist, index) => (
            <button key={index} onClick={() => handleHistoryClick(hist)} className="history-item">
              {hist}
            </button>
          ))}
        </div>
      )}
      {results.length > 0 && (
        <div className="search-results">
          <h3>Resultados:</h3>
          <ul>
            {results.map((doc) => (
              <li key={doc.id_doc} onClick={() => handleResultClick(doc)} className="result-item">
                {doc.titulo_doc} ({doc.nombre_categoria})
              </li>
            ))}
          </ul>
        </div>
      )}
      {results.length === 0 && query.trim() !== "" && (
        <div className="no-results">
          <p>Sin resultados</p>
        </div>
      )}
    </div>
  );
}

function FolderIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
    >
      <g
        transform="translate(0,512) scale(0.1,-0.1)"
        fill="currentColor"
        stroke="currentColor"
      >
        <path d="M330 4731 c-110 -15 -203 -73 -264 -165 -70 -106 -66 29 -66 -2006 0
-2036 -5 -1900 66 -2007 44 -65 105 -114 182 -145 l57 -23 2255 0 2255 0 57
23 c77 31 138 80 182 145 70 107 66 -5 66 1782 0 1787 4 1675 -66 1782 -44 65
-105 114 -182 145 l-57 23 -1110 3 -1110 3 -50 76 c-105 162 -187 238 -326
302 -145 68 -98 65 -1009 67 -454 1 -850 -1 -880 -5z m1800 -184 c36 -15 95
-50 132 -77 63 -46 81 -70 307 -409 132 -197 246 -363 253 -368 7 -4 461 -10
1010 -13 l996 -5 44 -31 c26 -19 54 -53 71 -84 l27 -52 0 -1398 0 -1398 -27
-52 c-17 -31 -45 -65 -71 -84 l-44 -31 -2268 0 -2268 0 -44 31 c-26 19 -54 53
-71 84 l-27 52 0 1847 0 1847 25 51 c25 50 71 94 117 113 14 5 375 8 898 7
l875 -2 65 -28z m2742 -453 c26 -19 54 -53 71 -84 24 -47 27 -63 27 -149 l0
-98 -59 30 c-34 17 -87 32 -127 37 -38 5 -478 10 -979 10 l-910 0 -90 136
c-49 75 -92 140 -93 145 -2 6 440 8 1056 7 l1060 -3 44 -31z" />
        <path d="M354 979 c-71 -20 -67 -119 5 -139 50 -14 4352 -14 4402 0 26 7 40
19 49 40 19 45 -2 87 -49 100 -46 13 -4362 12 -4407 -1z" />
      </g>
    </svg>
  );
}

function MainPage() {
  const navigate = useNavigate();
  const [recentFolders, setRecentFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Obtener todas las carpetas y ordenarlas por fecha de creación descendente
        const foldersResponse = await documentsService.listFolders();
        if (foldersResponse?.success && foldersResponse?.carpetas) {
          const sortedFolders = [...foldersResponse.carpetas]
            .sort((a, b) => {
              const dateA = new Date(a.fecha_creacion).getTime();
              const dateB = new Date(b.fecha_creacion).getTime();
              return dateB - dateA; // Descendente: más recientes primero
            })
            .slice(0, 5); // Tomar los últimos 5
          setRecentFolders(sortedFolders);
        }

        // Obtener todos los documentos y ordenarlos por fecha de creación descendente
        const docsResponse = await documentsService.listDocuments();
        if (docsResponse?.success && docsResponse?.documentos) {
          const sortedDocs = [...docsResponse.documentos]
            .sort((a, b) => {
              const dateA = new Date(a.fecha_creacion).getTime();
              const dateB = new Date(b.fecha_creacion).getTime();
              return dateB - dateA; // Descendente: más recientes primero
            })
            .slice(0, 10); // Tomar los últimos 10
          setDocuments(sortedDocs);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFolderClick = (folderId) => {
    navigate(`/archive_list`, { state: { folderId } });
  };

  return (
    <DashboardLayout title="Página Principal">
      <div className="main-page-wrap">
        <main className="main-page">
          <SearchBar />
          <section className="main-section">
            <h2 className="section-title">Ultimas carpetas</h2>
            {loading ? (
              <div className="folder-grid" style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                Cargando carpetas...
              </div>
            ) : recentFolders.length === 0 ? (
              <div className="folder-grid" style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                No hay carpetas disponibles
              </div>
            ) : (
              <div className="folder-grid" role="list">
                {recentFolders.map((folder) => (
                  <button
                    key={folder.id_folder}
                    type="button"
                    className="folder-card"
                    role="listitem"
                    onClick={() => handleFolderClick(folder.id_folder)}
                  >
                    <FolderIcon className="folder-icon" />
                    <span className="folder-label">{folder.nombre_carpeta}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
          <LastSessionTable records={documents} loading={loading} />
        </main>
      </div>
    </DashboardLayout>
  );
}

export default MainPage;
