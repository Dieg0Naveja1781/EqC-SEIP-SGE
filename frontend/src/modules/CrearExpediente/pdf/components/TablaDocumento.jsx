import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../pdfStyles';

const CLAVES_EXCLUIDAS = new Set(['_categoria', 'tamano_bytes']);

function esNumero(v) {
  if (typeof v === 'number') return true;
  if (typeof v === 'boolean') return false;
  if (typeof v !== 'string') return false;
  const trimmed = v.trim();
  if (trimmed === '') return false;
  return !isNaN(Number(trimmed));
}

function partirMetadatos(metadatos = {}) {
  const datos = [];
  const numericos = [];
  for (const [k, v] of Object.entries(metadatos)) {
    if (CLAVES_EXCLUIDAS.has(k)) continue;
    if (v === null || v === undefined || v === '') continue;
    if (esNumero(v)) numericos.push([k, String(v)]);
    else datos.push([k, String(v)]);
  }
  return { datos, numericos };
}

function Fila({ etiqueta, valor }) {
  return (
    <View style={pdfStyles.tableRow}>
      <Text style={pdfStyles.th}>{etiqueta}</Text>
      <Text style={pdfStyles.td}>{valor}</Text>
    </View>
  );
}

export function TablaDocumento({ doc, nombreCategoria }) {
  const { datos, numericos } = partirMetadatos(doc.metadatos);
  return (
    <View style={pdfStyles.table}>
      <Text style={pdfStyles.tableHeader}>{nombreCategoria}</Text>

      <Text style={pdfStyles.subHeader}>Datos</Text>
      <Fila etiqueta="Título" valor={doc.titulo_doc || '—'} />
      {datos.map(([k, v]) => (
        <Fila key={k} etiqueta={k} valor={v} />
      ))}

      {numericos.length > 0 && (
        <>
          <Text style={pdfStyles.subHeader}>Datos numéricos</Text>
          {numericos.map(([k, v]) => (
            <Fila key={k} etiqueta={k} valor={v} />
          ))}
        </>
      )}
    </View>
  );
}
