import React, { useState } from 'react';
import { Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import './ModalCrearExpediente.css';

export function ModalCrearExpediente({ isOpen, onClose }) {
  // Estado para los archivos (puedes inicializarlo vacío [])
  const [files, setFiles] = useState([
    { id: 1, name: 'Mondongo.pdf' },
    { id: 2, name: 'Diego Armando Naveja Lopéz.pdf' },
    { id: 3, name: 'Evidencia_Proyecto_Final.png' },
    { id: 4, name: 'Certificado_Acreditacion.pdf' },
    { id: 5, name: 'Mondongo.pdf' },
    { id: 6, name: 'Diego Armando Naveja Lopéz.pdf' },
    { id: 7, name: 'Evidencia_Proyecto_Final.png' },
    { id: 8, name: 'Certificado_Acreditacion.pdf' }
  ]);

  // Estado para expandir/colapsar la lista de documentos
  const [isExpanded, setIsExpanded] = useState(false);

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Botón de cerrar (X) */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
          <X size={24} />
        </button>

        {/* 1. SECCIÓN SUPERIOR: Títulos e Inputs */}
        <div className="modal-header-section">
          <h2 className="modal-title">Crear Nuevo Expediente</h2>
          
          <div className="modal-inputs-group">
            <input 
              type="text" 
              className="modal-input" 
              placeholder="Nombre del expediente" 
            />
            <input 
              type="text" 
              className="modal-input" 
              placeholder="Convocatoria Ejemplo: Webinar de Prácticas Pre Profesionales" 
            />
          </div>
        </div>

        {/* 2. SECCIÓN CENTRAL: Explorar y Lista Desplegable */}
        <div className="modal-mid-section">
          <div className="upload-container">
            <button className="modal-action-btn">
              Explorar Archivos
            </button>
            <span className="upload-hint">Formato PDF solamente</span>
          </div>

          <div className="modal-file-table">
            <div 
              className="modal-table-header" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span>Documentos Seleccionados ({files.length})</span>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {isExpanded && (
              <div className="modal-file-list">
                {files.length > 0 ? (
                  files.map((file) => (
                    <div className="modal-file-item" key={file.id}>
                      <span className="file-name" title={file.name}>
                        {file.name}
                      </span>
                      <Trash2 
                        size={18} 
                        className="trash-icon"
                        onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                      />
                    </div>
                  ))
                ) : (
                  <div className="modal-file-empty">
                    No hay archivos seleccionados
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. SECCIÓN INFERIOR: Botón de acción y retorno */}
        <div className="modal-footer-section">
          <button className="modal-submit-btn">
            Crear Expediente
          </button>
          
          <p className="modal-back-link" onClick={onClose}>
            Regresar al listado de archivos
          </p>
        </div>

      </div>
    </div>
  );
}