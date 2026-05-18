import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { ExpedientePDFDocument } from './ExpedientePDFDocument';

export async function descargarExpedientePDF({
  nombreArchivo,
  tituloConvocatoria,
  usuario,
  documentosPorCategoria,
}) {
  const blob = await pdf(
    <ExpedientePDFDocument
      tituloConvocatoria={tituloConvocatoria}
      usuario={usuario}
      documentosPorCategoria={documentosPorCategoria}
    />
  ).toBlob();

  const safe = (nombreArchivo || '').replace(/[\\/:*?"<>|]/g, '_').trim() || 'expediente';
  saveAs(blob, `${safe}.pdf`);
}
