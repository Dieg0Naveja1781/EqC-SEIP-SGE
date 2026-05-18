import React from 'react';
import { Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import './ModalCrearExpediente.css';
import { useArchiveData } from '../archives_list/useArchiveData';
import { ArchiveListCore } from '../archives_list/ArchiveListCore';
import { useCrearExpedienteForm } from './hooks/useCrearExpedienteForm';

function ArchiveExplorerPanel({ selectedFiles, onToggleSelect, onConfirm, onCancel }) {
  const archiveData = useArchiveData();

  const handleVerDocumento = (file) => {
    if (file.type === "folder") {
      const realId = file.id.replace("f-", "");
      archiveData.setFolderPath([...archiveData.folderPath, { id: realId, name: file.name }]);
      archiveData.setCurrentFolderId(realId);
    }
  };

  return (
    <div className="modal-right-panel">
      <div className="modal-explorer-header">
        <span>Seleccionar Archivos</span>
        <div className="modal-explorer-actions">
          <span className="modal-selection-count">{selectedFiles.size} seleccionado(s)</span>
          <button className="modal-confirm-selection-btn" onClick={onConfirm}>
            Confirmar
          </button>
          <button className="modal-cancel-explorer-btn" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
      </div>
      <ArchiveListCore
        archiveData={archiveData}
        onVerDocumento={handleVerDocumento}
        pickerMode={true}
        selectedFiles={selectedFiles}
        onToggleSelect={onToggleSelect}
      />
    </div>
  );
}

export function ModalCrearExpediente({ isOpen, onClose }) {
  const {
    nombreExpediente,
    setNombreExpediente,
    nombreConvocatoria,
    setNombreConvocatoria,
    files,
    setFiles,
    isExpanded,
    setIsExpanded,
    showExplorer,
    setShowExplorer,
    selectedFilesMap,
    setSelectedFilesMap,
    submitting,
    errorMsg,
    handleSubmit,
  } = useCrearExpedienteForm({ onCloseModal: onClose });

  if (!isOpen) return null;

  const handleToggleSelect = (file) => {
    setSelectedFilesMap(prev => {
      const next = new Map(prev);
      next.has(file.id) ? next.delete(file.id) : next.set(file.id, file);
      return next;
    });
  };

  const handleConfirmSelection = () => {
    const existingIds = new Set(files.map(f => f.id));
    const toAdd = Array.from(selectedFilesMap.values())
      .filter(f => !existingIds.has(f.id_doc))
      .map(f => ({ id: f.id_doc, name: f.name, id_doc: f.id_doc }));
    setFiles(prev => [...prev, ...toAdd]);
    setSelectedFilesMap(new Map());
    setShowExplorer(false);
  };

  const handleCancelExplorer = () => {
    setShowExplorer(false);
    setSelectedFilesMap(new Map());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card${showExplorer ? " modal-card--expanded" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
          <X size={24} />
        </button>

        {/* Panel izquierdo: formulario */}
        <div className="modal-left-panel">

          <div className="modal-header-section">
            <h2 className="modal-title">Crear Nuevo Expediente</h2>
            <div className="modal-inputs-group">
              <input
                type="text"
                className="modal-input"
                placeholder="Nombre del expediente"
                value={nombreExpediente}
                onChange={(e) => setNombreExpediente(e.target.value)}
              />
              <input
                type="text"
                className="modal-input"
                placeholder="Convocatoria Ejemplo: Webinar de Prácticas Pre Profesionales"
                value={nombreConvocatoria}
                onChange={(e) => setNombreConvocatoria(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-mid-section">
            <div className="upload-container">
              <button className="modal-action-btn" onClick={() => setShowExplorer(true)}>
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

          <div className="modal-footer-section">
            <button
              className="modal-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Generando…' : 'Crear Expediente'}
            </button>
            {errorMsg && <p className="modal-error">{errorMsg}</p>}
            <p className="modal-back-link" onClick={onClose}>
              Regresar al listado de archivos
            </p>
          </div>

        </div>

        {/* Panel derecho: explorador (solo cuando showExplorer) */}
        {showExplorer && (
          <ArchiveExplorerPanel
            selectedFiles={selectedFilesMap}
            onToggleSelect={handleToggleSelect}
            onConfirm={handleConfirmSelection}
            onCancel={handleCancelExplorer}
          />
        )}

      </div>
    </div>
  );
}
