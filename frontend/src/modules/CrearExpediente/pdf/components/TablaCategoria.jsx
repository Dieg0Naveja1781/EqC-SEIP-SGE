import React from 'react';
import { View } from '@react-pdf/renderer';
import { TablaDocumento } from './TablaDocumento';

export function TablaCategoria({ nombreCategoria, documentos }) {
  return (
    <View>
      {documentos.map((doc) => (
        <TablaDocumento
          key={doc.id_doc}
          doc={doc}
          nombreCategoria={nombreCategoria}
        />
      ))}
    </View>
  );
}
