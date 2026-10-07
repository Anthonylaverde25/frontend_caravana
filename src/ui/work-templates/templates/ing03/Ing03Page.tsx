import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { PageOrientation } from '@/contexts/WorkTemplatePrintContext';
import type { EntryOrder, EntryOrderReceiptSheet } from '@/features/entry-orders/types';
import Ing03Grid from './Ing03Grid';
import Ing03Header from './Ing03Header';
import { ing03ColumnsOf, ing03InstructionsOf, ing03LayoutOf } from './ing03Columns';

export interface Ing03PageProps {
  code: string;
  title: string;
  order: EntryOrder;
  sheet: EntryOrderReceiptSheet;
  /** Lines of this page. */
  rows: number;
  firstRowNumber: number;
  pageNumber: number;
  /** Portrait is the traditional sheet; landscape lays the same grid out like a spreadsheet. */
  orientation?: PageOrientation;
}

/**
 * One A4 page of the ING-03, the receipt sheet of a DTE. It does not repeat the purchase — that is
 * the ING-02, and the scan brings it back from the order code — only what identifies the page (order,
 * DTE, sheet R-number, "Hoja N de M"), the batch and seller, and the head of the DTE the chute counts
 * against. One blank line per animal that arrives: the chute writes its caravan, the body condition
 * (EC), when weighed per animal the weight, and marks the boxes of an injured eye, ear or limb; a
 * sheet weighed with one average has a PESO PROMEDIO cell in the header instead. Sex, category and
 * breed only get a column when the order leaves them to each animal — category and breed in words
 * or by code, as the sheet says; the rest is printed once in the TROPA band. A line left blank is a
 * head that has not arrived; the shaded free lines are for animals of more.
 *
 * Landscape keeps the same lines per page — so "Hoja N de M" and the pages the system expects back
 * do not depend on how it was printed — with the header in one band and the grid wider.
 */
export const Ing03Page: React.FC<Ing03PageProps> = ({
  code,
  title,
  order,
  sheet,
  rows,
  firstRowNumber,
  pageNumber,
  orientation = 'portrait'
}) => {
  const lines = Array.from({ length: rows }, (_, index) => firstRowNumber + index);
  const last = pageNumber === sheet.page_count;
  const landscape = orientation === 'landscape';
  const layout = ing03LayoutOf(order, sheet);
  const columns = ing03ColumnsOf(layout);
  const identity = `${order.code} · DTE ${sheet.dte_number} · ${sheet.label} · Hoja ${pageNumber} de ${sheet.page_count}`;
  const instructions = ing03InstructionsOf(layout);

  const grid = <Ing03Grid columns={columns} lines={lines} expected={sheet.expected_head_count} landscape={landscape} />;

  const reasonBox = (
    <Table sx={{ borderCollapse: 'collapse', width: '100%', '& .MuiTableCell-root': { border: '1px solid #000', color: '#000', padding: '2px 5px' } }}>
      <TableHead>
        <TableRow sx={{ backgroundColor: '#fafafa' }}>
          <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.56rem' }}>Observaciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell sx={{ height: landscape ? '30px !important' : '40px !important' }} />
        </TableRow>
      </TableBody>
    </Table>
  );

  const signatures = (
    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', color: '#000' }}>
      <tbody>
        <tr>
          {['Firma y Aclaración: Encargado de Manga', 'Firma y Aclaración: Responsable de la Recepción'].map((label) => (
            <td key={label} style={{ border: '1px solid #000', padding: '10px 12px 4px 12px', width: '50%', height: landscape ? 34 : 40, verticalAlign: 'bottom' }}>
              <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.6rem' }}>
                  {label}
                </Typography>
              </div>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );

  const footer = (
    <Box sx={{ pt: landscape ? 0.5 : 1, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.62rem' }}>
        Recepción de DTE ({code}) • Anexo de ING-02 • Jhoangel AI Microservice
      </Typography>
      <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.62rem', fontFamily: 'monospace' }}>
        {identity}
      </Typography>
    </Box>
  );

  const instructionStrip = (
    <Box sx={{ border: '1.5px solid #000', bgcolor: '#fffbeb', p: '3px 8px', mb: landscape ? 0.75 : 1 }}>
      <Typography sx={{ fontSize: '0.56rem', fontWeight: 800, color: '#92400e' }}>{instructions}</Typography>
    </Box>
  );

  const titleBlock = (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: landscape ? '1.15rem' : '1.3rem' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.7rem' }}>
        Anexo de la ING-02 de la orden {order.code} • Los datos de la compra están en la orden
      </Typography>
    </Box>
  );

  const paperSx = {
    p: landscape ? '8mm' : '9mm',
    width: landscape ? '297mm' : '210mm',
    maxWidth: '100%',
    mx: 'auto',
    minHeight: landscape ? '210mm' : '297mm',
    bgcolor: '#ffffff',
    borderRadius: '4px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
    border: '1px solid #d8dde6',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '@media print': {
      boxShadow: 'none',
      border: 'none',
      borderRadius: 0,
      p: landscape ? '8mm' : '9mm',
      m: 0,
      minHeight: landscape ? '210mm' : '297mm',
      height: landscape ? '210mm' : '297mm'
    }
  } as const;

  if (landscape) {
    return (
      <Paper className="print-page" elevation={0} sx={paperSx}>
        <Box>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {titleBlock}
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.62rem', textAlign: 'right' }}>
              DOCUMENTO DE REGISTRO OFICIAL
            </Typography>
          </Box>

          {/* The whole header in one band: identity of the page, then what the chute writes. */}
          <Ing03Header code={code} order={order} sheet={sheet} pageNumber={pageNumber} landscape />

          {instructionStrip}
          {grid}
        </Box>

        <Box sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch', mb: 0.75 }}>
            <Box sx={{ flex: 1, visibility: last ? 'visible' : 'hidden' }}>{reasonBox}</Box>
            <Box sx={{ flex: 1.4 }}>{signatures}</Box>
          </Box>
          {footer}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className="print-page" elevation={0} sx={paperSx}>
      <Box>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {titleBlock}
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.62rem', textAlign: 'right' }}>
            DOCUMENTO DE REGISTRO OFICIAL
          </Typography>
        </Box>

        <Ing03Header code={code} order={order} sheet={sheet} pageNumber={pageNumber} landscape={false} />

        {instructionStrip}
        {grid}

        {last && <Box sx={{ mt: 1 }}>{reasonBox}</Box>}
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <Box sx={{ mb: 1 }}>{signatures}</Box>
        {footer}
      </Box>
    </Paper>
  );
};

export default Ing03Page;
