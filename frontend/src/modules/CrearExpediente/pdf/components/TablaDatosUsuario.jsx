import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../pdfStyles';

function Row({ etiqueta, valor }) {
  return (
    <View style={pdfStyles.tableRow}>
      <Text style={pdfStyles.th}>{etiqueta}</Text>
      <Text style={pdfStyles.td}>{valor !== undefined && valor !== null && valor !== '' ? String(valor) : '—'}</Text>
    </View>
  );
}

function Tabla({ titulo, filas }) {
  return (
    <View style={pdfStyles.table}>
      <Text style={pdfStyles.tableHeader}>{titulo}</Text>
      {filas.map(([etiqueta, valor]) => (
        <Row key={etiqueta} etiqueta={etiqueta} valor={valor} />
      ))}
    </View>
  );
}

export function TablaDatosUsuario({ usuario }) {
  return (
    <View>
      <Tabla
        titulo="Datos del Investigador"
        filas={[
          ['Nombre', usuario.full_name],
          ['RFC', usuario.rfc],
          ['CURP', usuario.curp],
          ['Correo', usuario.correo_profe],
          ['Teléfono', usuario.numero_profe],
        ]}
      />
      <Tabla
        titulo="Estudios realizados"
        filas={[
          ['Profesión', usuario.profesion],
          ['Nivel', usuario.nivel_estudios],
          ['Universidad', usuario.universidad],
        ]}
      />
      <Tabla
        titulo="Datos laborales"
        filas={[
          ['Empresa', usuario.empresa],
          ['Puesto', usuario.puesto],
          ['Ubicación', usuario.ubicacion],
        ]}
      />
    </View>
  );
}
