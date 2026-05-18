import { documentsService } from '../../../shared/api/documentsService';
import { userService } from '../../../shared/api/userService';
import { descargarExpedientePDF } from '../pdf/descargarExpedientePDF';

function agruparPorCategoria(docs) {
  return docs.reduce((acc, d) => {
    const cat = d.nombre_categoria || d.metadatos?._categoria || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
    return acc;
  }, {});
}

export async function crearExpedienteYGenerarPDF({
  nombreExpediente,
  nombreConvocatoria,
  documentosSeleccionados,
}) {
  const respExp = await documentsService.createExpediente(nombreConvocatoria, '');
  if (!respExp?.success) {
    throw new Error(respExp?.error || 'No se pudo crear el expediente');
  }
  const idExp = respExp.expediente.id_exp;

  let orden = 0;
  for (const doc of documentosSeleccionados) {
    const r = await documentsService.agregarDocumentoAExpediente(idExp, doc.id_doc, orden++);
    if (!r?.success) {
      throw new Error(
        `Expediente creado pero falló al agregar "${doc.name}": ${r?.error || 'error desconocido'}`,
      );
    }
  }

  const [perfilResp, todosDocs] = await Promise.all([
    userService.getProfile(),
    documentsService.listDocuments(),
  ]);
  if (!perfilResp?.success) {
    throw new Error('Expediente creado, pero no se pudo obtener el perfil para el PDF');
  }

  const setIds = new Set(documentosSeleccionados.map((d) => d.id_doc));
  const docsCompletos = (todosDocs?.documentos || []).filter((d) => setIds.has(d.id_doc));
  const documentosPorCategoria = agruparPorCategoria(docsCompletos);

  await descargarExpedientePDF({
    nombreArchivo: nombreExpediente,
    tituloConvocatoria: nombreConvocatoria,
    usuario: perfilResp.profile,
    documentosPorCategoria,
  });

  return { idExp };
}
