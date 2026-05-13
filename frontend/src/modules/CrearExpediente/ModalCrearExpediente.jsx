import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import './ModalCrearExpediente.css'; // Importamos el nuevo archivo CSS

export function ModalCrearExpediente({ isOpen, onClose }) {
  const [files, setFiles] = useState([
    { id: 1, name: 'Mondongo.pdf' },
    { id: 2, name: 'Diego Armando Naveja Lopéz.pdf' }
  ]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2 className="modal-title">Crear Nuevo Expediente</h2>
        
        <input className="modal-input" placeholder="Nombre del expediente" />
        <input className="modal-input" placeholder="Convocatoria-Ej. Curi Skibidiego" />

        <div className="modal-date-container">
          <div style={{ textAlign: 'left' }}>
            <small style={{ fontWeight: 800, display: 'block' }}>Fecha de Expedición</small>
            <span>08/05/2019</span>
          </div>
          <button className="modal-hoy-btn">Hoy</button>
        </div>

        <p style={{ fontSize: '14px', marginBottom: '10px', fontWeight: 600 }}>
          Adjuntar Archivos al Expediente
        </p>
        <button className="modal-action-btn">Explorar Archivos</button>

        <div className="modal-file-table">
          <div className="modal-table-header">Documentos Seleccionados</div>
          {files.map(f => (
            <div className="modal-file-item" key={f.id}>
              <span>{f.name}</span>
              <Trash2 
                size={16} 
                color="#00bcd4" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setFiles(files.filter(file => file.id !== f.id))}
              />
            </div>
          ))}
        </div>

        <button className="modal-submit-btn">Crear Expediente</button>
        
        <p 
          style={{ fontWeight: 700, cursor: 'pointer', fontSize: '14px' }} 
          onClick={onClose}
        >
          Regresar al listado de archivos
        </p>
      </div>
    </div>
  );
}