import React from 'react';
import './DeleteCategoryModal.css';

export default function DeleteCategoryModal({ 
  isOpen, 
  categoryName, 
  onConfirm, 
  onCancel,
  isLoading = false 
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="category-modal-backdrop" onClick={onCancel} />
      
      {/* Modal */}
      <div className="category-modal" role="alertdialog" aria-modal="true">
        {/* Header */}
        <div className="category-modal-header">
          <div className="category-modal-icon-wrapper">
            <svg
              className="category-modal-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 9v2m0 4v2m-8.485-8.485A9 9 0 1121.414 2.586a9 9 0 01-9.899 19.828" />
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="16" />
            </svg>
          </div>
          <h2 className="category-modal-title">Eliminar categoría</h2>
        </div>

        {/* Content */}
        <div className="category-modal-content">
          <p className="category-modal-warning">
            ⚠️ Estás a punto de eliminar permanentemente la categoría:
          </p>
          <div className="category-modal-name-highlight">
            <strong>"{categoryName}"</strong>
          </div>
          <p className="category-modal-description">
            Esta acción <strong>no se puede deshacer</strong>. Si has usado esta categoría 
            en documentos, los documentos seguirán existiendo pero perderán esta categorización.
          </p>
        </div>

        {/* Footer with Actions */}
        <div className="category-modal-footer">
          <button
            className="category-modal-button category-modal-button-cancel"
            onClick={onCancel}
            disabled={isLoading}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="category-modal-button category-modal-button-delete"
            onClick={onConfirm}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <span className="spinner-mini"></span>
                Eliminando...
              </>
            ) : (
              <>
                🗑️ Eliminar categoría
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
