import { useState } from 'react';
import { crearExpedienteYGenerarPDF } from '../services/crearExpedienteService';

export function useCrearExpedienteForm({ onCloseModal }) {
  const [nombreExpediente, setNombreExpediente] = useState('');
  const [nombreConvocatoria, setNombreConvocatoria] = useState('');
  const [files, setFiles] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [selectedFilesMap, setSelectedFilesMap] = useState(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function reset() {
    setNombreExpediente('');
    setNombreConvocatoria('');
    setFiles([]);
    setIsExpanded(false);
    setShowExplorer(false);
    setSelectedFilesMap(new Map());
    setErrorMsg('');
  }

  async function handleSubmit() {
    setErrorMsg('');
    if (!nombreExpediente.trim()) {
      setErrorMsg('Escribe el nombre del expediente');
      return;
    }
    if (!nombreConvocatoria.trim()) {
      setErrorMsg('Escribe el nombre de la convocatoria');
      return;
    }
    if (files.length === 0) {
      setErrorMsg('Selecciona al menos un documento');
      return;
    }

    setSubmitting(true);
    try {
      await crearExpedienteYGenerarPDF({
        nombreExpediente: nombreExpediente.trim(),
        nombreConvocatoria: nombreConvocatoria.trim(),
        documentosSeleccionados: files,
      });
      reset();
      onCloseModal?.();
    } catch (e) {
      setErrorMsg(e?.message || e?.data?.error || 'Ocurrió un error al crear el expediente');
    } finally {
      setSubmitting(false);
    }
  }

  return {
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
  };
}
