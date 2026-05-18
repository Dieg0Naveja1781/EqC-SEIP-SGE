import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';
import { TablaDatosUsuario } from './components/TablaDatosUsuario';
import { TablaCategoria } from './components/TablaCategoria';

export function ExpedientePDFDocument({
  tituloConvocatoria,
  usuario,
  documentosPorCategoria,
}) {
  const categorias = Object.entries(documentosPorCategoria);
  return (
    <Document title={tituloConvocatoria} author={usuario?.full_name || ''}>
      <Page size="LETTER" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>{tituloConvocatoria}</Text>

        <TablaDatosUsuario usuario={usuario} />

        <Text style={pdfStyles.section}>Producción</Text>
        {categorias.length === 0 ? (
          <View>
            <Text style={{ textAlign: 'center', color: '#666' }}>
              Sin documentos asociados
            </Text>
          </View>
        ) : (
          categorias.map(([categoria, docs]) => (
            <TablaCategoria
              key={categoria}
              nombreCategoria={categoria}
              documentos={docs}
            />
          ))
        )}
      </Page>
    </Document>
  );
}
