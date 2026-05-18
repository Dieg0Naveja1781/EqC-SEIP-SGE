import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#999999',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  th: {
    width: '35%',
    padding: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#999999',
    backgroundColor: '#e6e6e6',
    fontWeight: 'bold',
  },
  td: {
    width: '65%',
    padding: 4,
    borderBottomWidth: 1,
    borderColor: '#999999',
  },
  tableHeader: {
    padding: 6,
    backgroundColor: '#003366',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeader: {
    padding: 4,
    backgroundColor: '#cccccc',
    fontWeight: 'bold',
  },
});
