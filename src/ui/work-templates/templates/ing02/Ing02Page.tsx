import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { EntryOrder } from '@/features/entry-orders/types';
import Ing02PageHeader, { boxes } from './Ing02PageHeader';

interface Ing02PageProps {
  code: string;
  title: string;
  /** Null prints the sheet blank, to fill in by hand. */
  order: EntryOrder | null;
}

/** Breed lines of a blank sheet: room for a mixed troop. */
const BLANK_BREED_LINES = 6;

const gridSx = {
  borderCollapse: 'collapse',
  width: '100%',
  mb: 1,
  '& .MuiTableCell-root': { border: '1px solid #000', padding: '2px 5px', fontSize: '0.66rem', color: '#000', height: 25, boxSizing: 'border-box' }
} as const;

const headRowSx = {
  backgroundColor: '#fafafa',
  '& .MuiTableCell-root': { fontWeight: 800, textTransform: 'uppercase', fontSize: '0.56rem' }
} as const;

/** The name of a grid, in the black band the sheets use for what the scan reads first. */
const GridTitle: React.FC<{ colSpan: number; children: React.ReactNode }> = ({ colSpan, children }) => (
  <TableRow>
    <TableCell
      colSpan={colSpan}
      sx={{ backgroundColor: '#000', color: '#fff !important', fontWeight: 900, fontSize: '0.58rem !important', letterSpacing: '0.5px', textTransform: 'uppercase', height: '18px !important' }}
    >
      {children}
    </TableCell>
  </TableRow>
);

const valueCellSx = { fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap' } as const;

const sexWord = (order: EntryOrder | null): string | null =>
  order ? { MALE: 'MACHOS', FEMALE: 'HEMBRAS', MIXED: 'AMBOS' }[order.sex_composition] : null;

const yesNo = (value: boolean | null | undefined): string | null => (value == null ? null : value ? 'SÍ' : 'NO');

/**
 * The single A4 page of the ING-02, laid out like every other sheet: title, header tables, the
 * grids and the signatures. It is the document of a purchase: the order is
 * born without caravans — they arrive with the DTE — so its grids hold the troop, its weights and
 * health, and one line per breed. Printed from an order it comes out complete; blank, every value
 * is a box to mark or a cell to write.
 */
export const Ing02Page: React.FC<Ing02PageProps> = ({ code, title, order }) => {
  const breedLines = order
    ? order.breeds.map((b) => ({ letter: b.letter, breed: b.breed_name ?? '', color: b.color_name ?? '—' }))
    : Array.from({ length: BLANK_BREED_LINES }, (_, i) => ({ letter: String.fromCharCode(65 + i), breed: '', color: '' }));
  const printed = (value: React.ReactNode) => (order ? (value ?? '—') : '');

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
              Compra de hacienda externa • La orden nace sin caravanas: se asignan al cargar el DTE
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.62rem', textAlign: 'right' }}>
            DOCUMENTO DE REGISTRO OFICIAL
          </Typography>
        </Box>

        <Ing02PageHeader code={code} order={order} />

        <Table sx={gridSx}>
          <TableHead>
            <GridTitle colSpan={7}>Tropa comprada</GridTitle>
            <TableRow sx={headRowSx}>
              <TableCell sx={{ width: '7%' }}>Cabezas</TableCell>
              <TableCell sx={{ width: '12%' }}>Categoría</TableCell>
              <TableCell sx={{ width: '24%' }}>Sexo (marcar)</TableCell>
              <TableCell sx={{ width: '7%' }}>Machos</TableCell>
              <TableCell sx={{ width: '7%' }}>Hembras</TableCell>
              <TableCell sx={{ width: '8%' }}>Edad (m)</TableCell>
              <TableCell>Estado (marcar)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={valueCellSx}>{printed(order?.head_count)}</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>{printed(order?.category.name)}</TableCell>
              <TableCell sx={valueCellSx}>{boxes(['MACHOS', 'HEMBRAS', 'AMBOS'], sexWord(order))}</TableCell>
              <TableCell sx={valueCellSx}>{order?.sex_composition === 'MIXED' ? order.male_count : ''}</TableCell>
              <TableCell sx={valueCellSx}>{order?.sex_composition === 'MIXED' ? order.female_count : ''}</TableCell>
              <TableCell sx={valueCellSx}>{order ? (order.age_range ?? '—') : '__ / __'}</TableCell>
              <TableCell sx={{ ...valueCellSx, fontSize: '0.6rem !important', whiteSpace: 'nowrap' }}>
                {boxes(['REGULAR', 'BUENO', 'MUY BUENO', 'EXCELENTE'], order?.condition_label ? order.condition_label.toUpperCase() : null)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table sx={gridSx}>
          <TableHead>
            <GridTitle colSpan={6}>Peso y sanidad</GridTitle>
            <TableRow sx={headRowSx}>
              <TableCell sx={{ width: '14%' }}>Peso aprox. (kg)</TableCell>
              <TableCell sx={{ width: '14%' }}>Peso mín. (kg)</TableCell>
              <TableCell sx={{ width: '14%' }}>Peso máx. (kg)</TableCell>
              <TableCell sx={{ width: '12%' }}>Desbaste (%)</TableCell>
              <TableCell sx={{ width: '20%' }}>Sabe comer (marcar)</TableCell>
              <TableCell>Garrapata · vacunado (marcar)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={valueCellSx}>{printed(order?.estimated_weight)}</TableCell>
              <TableCell sx={valueCellSx}>{printed(order?.min_weight)}</TableCell>
              <TableCell sx={valueCellSx}>{printed(order?.max_weight)}</TableCell>
              <TableCell sx={valueCellSx}>{printed(order?.shrink_percent)}</TableCell>
              <TableCell sx={valueCellSx}>{boxes(['SÍ', 'NO'], yesNo(order?.knows_to_eat))}</TableCell>
              <TableCell sx={valueCellSx}>{boxes(['SÍ', 'NO'], yesNo(order?.tick_vaccinated))}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Table sx={gridSx}>
          <TableHead>
            <GridTitle colSpan={3}>Razas</GridTitle>
            <TableRow sx={headRowSx}>
              <TableCell sx={{ width: '8%', textAlign: 'center' }}>Letra</TableCell>
              <TableCell sx={{ width: '46%' }}>Raza</TableCell>
              <TableCell>Pelaje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {breedLines.map((line) => (
              <TableRow key={line.letter}>
                <TableCell sx={{ textAlign: 'center', fontWeight: 800, fontFamily: 'monospace' }}>{line.letter}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{line.breed}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{line.color}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Table sx={gridSx}>
          <TableHead>
            <TableRow sx={headRowSx}>
              <TableCell>Observaciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ height: '52px !important', verticalAlign: 'top', fontWeight: 600 }}>{order?.observations ?? ''}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: '1.5px solid #000', color: '#000' }}>
          <tbody>
            <tr>
              {['Firma y Aclaración: Comprador', 'Firma y Aclaración: Responsable de la Recepción'].map((label) => (
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
            Orden de Ingreso de Hacienda Externa ({code}){order && order.status !== 'DRAFT' ? ` • Orden ${order.code}` : ''} • Jhoangel AI Microservice
          </Typography>
          <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.62rem' }}>
            HOJA 1 DE 1
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Ing02Page;
