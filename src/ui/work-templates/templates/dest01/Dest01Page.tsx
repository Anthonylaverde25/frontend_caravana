import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Dest01CategoryColumn, Dest01DestinationMode, Dest01PrintCalf, Dest01PrintHeader } from './Dest01PrintContext';
import Dest01PageHeader from './Dest01PageHeader';

const SYSTEM_GREY = '#6b7280';

export interface Dest01PageProps {
  code: string;
  title: string;
  establishment: string;
  header: Dest01PrintHeader;
  destinationMode: Dest01DestinationMode;
  categoryColumn: Dest01CategoryColumn;
  /** Pre-loaded calves of this page, followed by `blankRows` empty lines. */
  calves: Dest01PrintCalf[];
  blankRows: number;
  firstRowNumber: number;
  pageNumber: number | null;
  pageTotal: number | null;
}

/**
 * One A4 page of the DEST-01 sheet. The columns follow the order: C/S nueva only when the category
 * may change (printed when declared, blank when it is decided at the chute), and Lote destino with
 * its M cell only when each calf has its own weaning batch. The current C/S is printed in grey, only
 * to find the calf: what counts is what the system has for its tag, sex included — which is why the
 * sex is not printed beside the tag, where a scan could read it as part of it.
 */
export const Dest01Page: React.FC<Dest01PageProps> = ({
  code,
  title,
  establishment,
  header,
  destinationMode,
  categoryColumn,
  calves,
  blankRows,
  firstRowNumber,
  pageNumber,
  pageTotal,
}) => {
  const lines: (Dest01PrintCalf | null)[] = [...calves, ...Array.from({ length: blankRows }, () => null)];
  const perAnimal = destinationMode === 'per_animal';
  const withCategory = categoryColumn !== 'none';

  return (
    <Paper
      className="print-page"
      elevation={0}
      sx={{
        p: '9mm',
        width: '210mm',
        maxWidth: '100%',
        mx: 'auto',
        minHeight: '297mm',
        bgcolor: '#ffffff',
        borderRadius: '4px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
        border: '1px solid #d8dde6',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '@media print': { boxShadow: 'none', border: 'none', borderRadius: 0, p: '9mm', m: 0, minHeight: '297mm', height: '297mm' },
      }}
    >
      <Box>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.3rem' }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.7rem' }}>
              Desmadre de crías al pie • Cumple la orden de destete del encabezado y registra el movimiento de cada cría
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.62rem', textAlign: 'right' }}>
            DOCUMENTO DE REGISTRO OFICIAL
          </Typography>
        </Box>

        <Dest01PageHeader
          code={code}
          establishment={establishment}
          header={header}
          destinationMode={destinationMode}
          pageNumber={pageNumber}
          pageTotal={pageTotal}
        />

        <Box sx={{ border: '1.5px solid #000', bgcolor: '#fffbeb', p: '3px 8px', mb: 1 }}>
          <Typography sx={{ fontSize: '0.56rem', fontWeight: 800, color: '#92400e' }}>
            UNA CRÍA POR FILA • Mismo encabezado en todas las hojas • Peso y caravana de la madre opcionales
            {perAnimal ? ' • Lote destino de cada cría en su fila, con M: C = corral, P = pastura' : ''}
            {categoryColumn === 'at_chute' ? ' • C/S nueva: vacía = no cambia' : ''}
          </Typography>
        </Box>

        <Table
          sx={{
            borderCollapse: 'collapse',
            width: '100%',
            '& .MuiTableCell-root': { border: '1px solid #000', padding: '2px 5px', fontSize: '0.66rem', color: '#000', height: 25, boxSizing: 'border-box' },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa', '& .MuiTableCell-root': { fontWeight: 800, textTransform: 'uppercase', fontSize: '0.56rem' } }}>
              <TableCell sx={{ width: '4%', textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ width: perAnimal ? '15%' : '19%' }}>Caravana cría</TableCell>
              <TableCell sx={{ width: perAnimal ? '13%' : '17%' }}>Caravana madre</TableCell>
              <TableCell sx={{ width: '11%' }}>C/S actual</TableCell>
              {withCategory && <TableCell sx={{ width: '14%' }}>C/S nueva</TableCell>}
              <TableCell sx={{ width: '9%' }}>Peso (kg)</TableCell>
              {perAnimal && <TableCell sx={{ width: '15%' }}>Lote destino</TableCell>}
              {perAnimal && <TableCell sx={{ width: '3%', textAlign: 'center' }}>M</TableCell>}
              <TableCell>Observaciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((calf, index) => (
              <TableRow key={calf ? `calf-${calf.calfId}` : `blank-${index}`}>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.62rem' }}>{firstRowNumber + index}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{calf?.calfIdentification ?? ''}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{calf?.motherIdentification ?? ''}</TableCell>
                <TableCell sx={{ color: `${SYSTEM_GREY} !important`, fontSize: '0.6rem !important' }}>{calf?.currentCategory ?? ''}</TableCell>
                {withCategory && (
                  <TableCell sx={{ fontWeight: 700 }}>{categoryColumn === 'declared' ? (calf?.targetCategory ?? (calf ? '—' : '')) : ''}</TableCell>
                )}
                <TableCell />
                {perAnimal && <TableCell sx={{ fontWeight: 700, fontSize: '0.62rem !important' }}>{calf?.destinationLabel ?? ''}</TableCell>}
                {perAnimal && <TableCell sx={{ textAlign: 'center', fontWeight: 800 }}>{calf?.destinationLabel ? calf.management : ''}</TableCell>}
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: '1.5px solid #000', color: '#000' }}>
          <tbody>
            <tr>
              {['Firma y Aclaración: Encargado de Manga', 'Firma y Aclaración: Responsable del Destete'].map((label) => (
                <td key={label} style={{ border: '1px solid #000', padding: '10px 12px 4px 12px', width: '50%', height: 40, verticalAlign: 'bottom' }}>
                  <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.6rem' }}>{label}</Typography>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <Box sx={{ pt: 1, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.62rem' }}>
            Destete y Lote de Destete ({code}){header.orden_destete ? ` • Orden ${header.orden_destete}` : ''} • Jhoangel AI Microservice
          </Typography>
          <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.62rem' }}>
            HOJA {pageNumber ?? '___'} DE {pageTotal ?? '___'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Dest01Page;
