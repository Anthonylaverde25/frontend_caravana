import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Par01PrintFemale, Par01PrintHeader } from './Par01PrintContext';
import Par01PageHeader from './Par01PageHeader';

const BOX = '☐';
/**
 * One box per column, under a header in words: with the letter printed beside each box ("☐V ☐M ☐A"),
 * the scan paired crosses with the wrong letter. The sex is not a box: it is ONE handwritten letter
 * (M / H), the convention of the M cell of DEST-01 and CACT-01 — sex boxes were misread even apart.
 * Parió (V) · Nació muerto (NM) · Murió (M, al pie) · No parió (N, alerta de parto vencido).
 */
const OUTCOME_OPTIONS = ['Parió', 'Nació muerto', 'Murió', 'No parió'];
const OVERDUE_COLUMN = 'No parió';

const shortDate = (iso: string): string => iso.slice(0, 10).split('-').reverse().slice(0, 2).join('/');
const boxCellSx = { textAlign: 'center', fontSize: '0.95rem !important', lineHeight: 1, px: '0 !important' } as const;

export interface Par01PageProps {
  code: string;
  title: string;
  establishment: string;
  header: Par01PrintHeader;
  /** Pre-loaded females of this page, followed by `blankRows` empty lines. */
  females: Par01PrintFemale[];
  blankRows: number;
  firstRowNumber: number;
  pageNumber: number | null;
  pageTotal: number | null;
}

/**
 * One A4 page of the PAR-01 sheet: a row per pregnant female. The outcome is four boxes — parió,
 * nació muerto, murió, no parió — so it is declared, never deduced from a tag being written; the sex
 * is a letter; breed and coat (pelaje) are written in their own columns. The abortion is not on the sheet: it is registered in Monitoreo Gestacional. A female
 * reprinted after an N carries "N dd/mm" printed grey in its box: printed, not a mark.
 * Every row has the same columns: a calving the order did not list is written in a free line and
 * declared with the "Fuera de orden" box, never with a section of its own. There is no sire column
 * (it is confirmed apart), no teeth column (a newborn has 0), and nothing only informative.
 */
export const Par01Page: React.FC<Par01PageProps> = ({
  code,
  title,
  establishment,
  header,
  females,
  blankRows,
  firstRowNumber,
  pageNumber,
  pageTotal
}) => {
  const lines: (Par01PrintFemale | null)[] = [...females, ...Array.from({ length: blankRows }, () => null)];

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
        '@media print': { boxShadow: 'none', border: 'none', borderRadius: 0, p: '9mm', m: 0, minHeight: '297mm', height: '297mm' }
      }}
    >
      <Box>
        <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.3rem' }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.7rem' }}>
              Recorrida de parición • Cumple la orden del encabezado • La cría queda en el lote de su madre
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.62rem', textAlign: 'right' }}>
            DOCUMENTO DE REGISTRO OFICIAL
          </Typography>
        </Box>

        <Par01PageHeader code={code} establishment={establishment} header={header} pageNumber={pageNumber} pageTotal={pageTotal} />

        <Box sx={{ border: '1.5px solid #000', bgcolor: '#fffbeb', p: '3px 8px', mb: 1 }}>
          <Typography sx={{ fontSize: '0.56rem', fontWeight: 800, color: '#92400e' }}>
            UN VIENTRE POR FILA • Sin marcar = todavía no le toca o sin novedad • NACIÓ MUERTO = el ternero nació sin vida • MURIÓ = nació
            vivo y murió al pie • NO PARIÓ = pasó su fecha y no parió (avisa riesgo) • Sexo: M o H, también si murió • Raza y pelaje de la cría • Fecha del parto, o del
            día en que se vio que no parió • El aborto no va acá: Monitoreo Gestacional • Parto fuera de la orden: fila libre y «Fuera de
            orden»
          </Typography>
        </Box>

        <Table
          sx={{
            borderCollapse: 'collapse',
            width: '100%',
            '& .MuiTableCell-root': { border: '1px solid #000', padding: '2px 4px', fontSize: '0.64rem', color: '#000', height: 25, boxSizing: 'border-box' }
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa', '& .MuiTableCell-root': { fontWeight: 800, textTransform: 'uppercase', fontSize: '0.52rem' } }}>
              <TableCell rowSpan={2} sx={{ width: '4%', textAlign: 'center' }}>#</TableCell>
              <TableCell rowSpan={2} sx={{ width: '14%' }}>Caravana madre</TableCell>
              <TableCell colSpan={OUTCOME_OPTIONS.length} sx={{ textAlign: 'center', height: '14px !important' }}>Resultado</TableCell>
              <TableCell rowSpan={2} sx={{ width: '12%' }}>Caravana cría</TableCell>
              <TableCell rowSpan={2} sx={{ width: '6%', textAlign: 'center' }}>Sexo (M/H)</TableCell>
              <TableCell rowSpan={2} sx={{ width: '6%' }}>Peso (kg)</TableCell>
              <TableCell rowSpan={2} sx={{ width: '9%' }}>Raza</TableCell>
              <TableCell rowSpan={2} sx={{ width: '9%' }}>Pelaje</TableCell>
              <TableCell rowSpan={2} sx={{ width: '10%' }}>Fecha</TableCell>
              <TableCell rowSpan={2} sx={{ textAlign: 'center' }}>Fuera de orden</TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: '#fafafa', '& .MuiTableCell-root': { fontWeight: 800, textTransform: 'uppercase', fontSize: '0.46rem', textAlign: 'center', height: '14px !important', px: '1px' } }}>
              {OUTCOME_OPTIONS.map((label) => (
                <TableCell key={label} sx={{ width: '5.5%', lineHeight: 1.05 }}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((female, index) => (
              <TableRow key={female ? `f-${female.motherId}` : `blank-${index}`}>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.6rem' }}>{firstRowNumber + index}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{female?.motherIdentification ?? ''}</TableCell>
                {OUTCOME_OPTIONS.map((label) => (
                  <TableCell key={label} sx={boxCellSx}>
                    {BOX}
                    {label === OVERDUE_COLUMN && female?.overdueReportedAt && (
                      <Box component="span" sx={{ display: 'block', color: '#9ca3af', fontSize: '0.4rem', fontWeight: 700, lineHeight: 1 }}>
                        N {shortDate(female.overdueReportedAt)}
                      </Box>
                    )}
                  </TableCell>
                ))}
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell sx={boxCellSx}>{BOX}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: '1.5px solid #000', color: '#000' }}>
          <tbody>
            <tr>
              {['Firma y Aclaración: Recorredor', 'Firma y Aclaración: Responsable de la Parición'].map((label) => (
                <td key={label} style={{ border: '1px solid #000', padding: '10px 12px 4px 12px', width: '50%', height: 40, verticalAlign: 'bottom' }}>
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
        <Box sx={{ pt: 1, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.62rem' }}>
            Planilla de Parición ({code}){header.orden_paricion ? ` • Orden ${header.orden_paricion}` : ''} • Jhoangel AI Microservice
          </Typography>
          <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.62rem' }}>
            HOJA {pageNumber ?? '___'} DE {pageTotal ?? '___'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Par01Page;
