import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { PageOrientation } from '@/contexts/WorkTemplatePrintContext';
import type { EntryOrder, EntryOrderAnimal, EntryOrderReceiptSheet } from '@/features/entry-orders/types';
import { breedAndCoatOf } from './useIng03Sheet';

const BOX = '☐';

const boxCellSx = { textAlign: 'center', fontSize: '0.95rem !important', lineHeight: 1, px: '0 !important' } as const;
const headCellStyle: React.CSSProperties = { border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 8px' };
const bandHeadStyle: React.CSSProperties = { ...headCellStyle, backgroundColor: '#000', textAlign: 'center' };
const valueCellStyle: React.CSSProperties = { border: '2px solid #000', padding: '3px 10px', verticalAlign: 'middle', textAlign: 'center' };
const monoSx = { fontWeight: 900, color: '#000', fontFamily: 'monospace', whiteSpace: 'nowrap' } as const;

const HeadLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#000' }) => (
  <Typography variant="caption" sx={{ fontWeight: 900, color, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block' }}>
    {children}
  </Typography>
);

type ColumnKey = 'n' | 'caravana' | 'sexo' | 'raza' | 'pelaje' | 'llego' | 'no_llega' | 'ec' | 'peso';

interface Column {
  key: ColumnKey;
  label: string;
  width?: string;
  center?: boolean;
}

/**
 * The grid of the sheet, the same in both orientations: one caravan per line, its breed and its
 * coat each in their own column, two boxes, the body condition and — on a sheet weighed per animal — the weight. A sheet weighed with one average has
 * no weight column: its weight is a single cell in the header.
 */
const columnsOf = (averaged: boolean): Column[] =>
  averaged
    ? [
        { key: 'n', label: '#', width: '5%', center: true },
        { key: 'caravana', label: 'Caravana', width: '22%' },
        { key: 'sexo', label: 'Sexo', width: '7%', center: true },
        { key: 'raza', label: 'Raza', width: '18%' },
        { key: 'pelaje', label: 'Pelaje', width: '14%' },
        { key: 'llego', label: 'Llegó', width: '10%', center: true },
        { key: 'no_llega', label: 'No llega', width: '10%', center: true },
        { key: 'ec', label: 'EC (1 a 5)', center: true }
      ]
    : [
        { key: 'n', label: '#', width: '5%', center: true },
        { key: 'caravana', label: 'Caravana', width: '19%' },
        { key: 'sexo', label: 'Sexo', width: '6%', center: true },
        { key: 'raza', label: 'Raza', width: '14%' },
        { key: 'pelaje', label: 'Pelaje', width: '11%' },
        { key: 'llego', label: 'Llegó', width: '8%', center: true },
        { key: 'no_llega', label: 'No llega', width: '8%', center: true },
        { key: 'ec', label: 'EC (1 a 5)', width: '8%', center: true },
        { key: 'peso', label: 'Peso (kg)' }
      ];

export interface Ing03PageProps {
  code: string;
  title: string;
  order: EntryOrder;
  sheet: EntryOrderReceiptSheet;
  /** The listed caravans of this page, followed by `blankRows` free lines. */
  animals: EntryOrderAnimal[];
  blankRows: number;
  firstRowNumber: number;
  pageNumber: number;
  /** Portrait is the traditional sheet; landscape lays the same grid out like a spreadsheet. */
  orientation?: PageOrientation;
}

/**
 * One A4 page of the ING-03, the receipt sheet of a DTE. It does not repeat the purchase — that is
 * the ING-02, and the scan brings it back from the order code — only what identifies the page (order,
 * DTE, sheet R-number, "Hoja N de M") and the batch and seller in one line, for whoever finds it
 * loose. One caravan per line: the chute marks Llegó or No llega and writes the body condition (EC)
 * and, when weighed per animal, the weight; a sheet weighed with one average has a PESO PROMEDIO
 * cell in the header instead. A line left unmarked is a caravan that arrives later. The free lines
 * are for animals the DTE does not list.
 *
 * Landscape keeps the same lines per page — so "Hoja N de M" and the pages the system expects back
 * do not depend on how it was printed — with the header in one band and the grid wider.
 */
export const Ing03Page: React.FC<Ing03PageProps> = ({
  code,
  title,
  order,
  sheet,
  animals,
  blankRows,
  firstRowNumber,
  pageNumber,
  orientation = 'portrait'
}) => {
  const lines: (EntryOrderAnimal | null)[] = [...animals, ...Array.from({ length: blankRows }, () => null)];
  const last = pageNumber === sheet.page_count;
  const landscape = orientation === 'landscape';
  const averaged = sheet.weighing_mode === 'AVERAGE';
  const columns = columnsOf(averaged);
  const identity = `${order.code} · DTE ${sheet.dte_number} · ${sheet.label} · Hoja ${pageNumber} de ${sheet.page_count}`;
  const instructions = [
    'UNA CARAVANA POR FILA',
    'Marcar LLEGÓ o NO LLEGA',
    'Sin marcar = llega después',
    'EC: estado corporal de 1 a 5, de 0,5 en 0,5 (opcional)',
    averaged ? 'Peso: un único PESO PROMEDIO arriba, para todas las que llegan' : 'Peso opcional',
    `Animal que llega sin figurar en el DTE: renglón libre, con su caravana, sexo (M / H), raza, pelaje${averaged ? ' y EC' : ', EC y peso'}`
  ].join(' • ');

  const cellOf = (column: Column, animal: EntryOrderAnimal | null, index: number): React.ReactNode => {
    switch (column.key) {
      case 'n':
        return firstRowNumber + index;
      case 'caravana':
        return animal?.identification ?? '';
      case 'sexo':
        return animal?.sex ?? '';
      case 'raza':
        return animal ? breedAndCoatOf(order, animal).breed : '';
      case 'pelaje':
        return animal ? breedAndCoatOf(order, animal).coat : '';
      case 'llego':
      case 'no_llega':
        return BOX;
      default:
        return '';
    }
  };

  const cellSx = (column: Column) => ({
    ...(column.center ? { textAlign: 'center' } : {}),
    ...(column.key === 'n'
      ? { fontWeight: 700, fontSize: '0.62rem', ...(landscape ? { bgcolor: '#eef1f5', color: '#475569' } : {}) }
      : column.key === 'caravana'
        ? { fontFamily: 'monospace', fontWeight: 800 }
        : column.key === 'raza' || column.key === 'pelaje'
          ? { fontWeight: 700, fontSize: '0.62rem !important' }
          : column.key === 'sexo'
            ? { fontWeight: 700 }
            : column.key === 'llego' || column.key === 'no_llega'
              ? boxCellSx
              : {})
  });

  const averageCell = (
    <td style={{ border: '3px solid #000', padding: '3px 10px', backgroundColor: '#fffbeb', textAlign: 'right' }}>
      <Typography sx={{ ...monoSx, fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>______ kg</Typography>
    </td>
  );

  const grid = (
    <Table
      sx={{
        borderCollapse: 'collapse',
        width: '100%',
        tableLayout: 'fixed',
        '& .MuiTableCell-root': {
          border: landscape ? '1px solid #64748b' : '1px solid #000',
          padding: '2px 5px',
          fontSize: '0.66rem',
          color: '#000',
          height: landscape ? 22 : 25,
          boxSizing: 'border-box'
        }
      }}
    >
      <TableHead>
        <TableRow
          sx={{
            backgroundColor: landscape ? '#e2e8f0' : '#fafafa',
            '& .MuiTableCell-root': { fontWeight: 800, textTransform: 'uppercase', fontSize: '0.56rem', ...(landscape ? { borderBottom: '2px solid #000' } : {}) }
          }}
        >
          {columns.map((column) => (
            <TableCell key={column.key} sx={{ width: column.width, ...(column.center ? { textAlign: 'center' } : {}) }}>
              {column.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {lines.map((animal, index) => (
          <TableRow key={animal ? `caravan-${animal.caravan_id}` : `free-${index}`}>
            {columns.map((column) => (
              <TableCell key={column.key} sx={cellSx(column)}>
                {cellOf(column, animal, index)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const reasonBox = (
    <Table sx={{ borderCollapse: 'collapse', width: '100%', '& .MuiTableCell-root': { border: '1px solid #000', color: '#000', padding: '2px 5px' } }}>
      <TableHead>
        <TableRow sx={{ backgroundColor: '#fafafa' }}>
          <TableCell sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.56rem' }}>Motivo de las que no llegan</TableCell>
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

  const batchAndSeller = (
    <Typography sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#002B49' }}>
      {order.batch_name ?? '—'} · {order.provider.name ?? '—'}
    </Typography>
  );

  const dateBlank = (
    <Typography sx={{ ...monoSx, fontSize: landscape ? '0.72rem' : '0.8rem', fontWeight: 700 }}>
      {landscape ? '__ / __ / ____' : averaged ? '___ / ___ / ______' : '____ / ____ / ________'}
    </Typography>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px', border: '2px solid #000', color: '#000', tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <td style={{ ...bandHeadStyle, width: '17%' }}><HeadLabel color="#fff">Orden de ingreso</HeadLabel></td>
                <td style={{ ...bandHeadStyle, width: '7%' }}><HeadLabel color="#fff">Template code</HeadLabel></td>
                <td style={{ ...bandHeadStyle, width: '7%' }}><HeadLabel color="#fff">Hoja de recepción</HeadLabel></td>
                <td style={{ ...bandHeadStyle, width: '10%' }}><HeadLabel color="#fff">Hoja N de M</HeadLabel></td>
                <td style={{ ...bandHeadStyle, width: '15%' }}><HeadLabel color="#fff">N° de DTE</HeadLabel></td>
                <td style={{ ...headCellStyle }}><HeadLabel>Lote externo · Proveedor</HeadLabel></td>
                <td style={{ ...headCellStyle, width: '13%' }}><HeadLabel>Fecha de recepción</HeadLabel></td>
                {averaged && <td style={{ ...headCellStyle, width: '11%', backgroundColor: '#fde68a' }}><HeadLabel>Peso promedio (kg)</HeadLabel></td>}
              </tr>
              <tr style={{ height: 30 }}>
                <td style={{ ...valueCellStyle, padding: '3px 6px' }}><Typography sx={{ ...monoSx, fontSize: '0.82rem' }}>{order.code}</Typography></td>
                <td style={{ ...valueCellStyle, padding: '3px 4px' }}><Typography sx={{ ...monoSx, fontSize: '0.8rem' }}>{code}</Typography></td>
                <td style={valueCellStyle}><Typography sx={{ ...monoSx, fontSize: '0.9rem' }}>{sheet.label}</Typography></td>
                <td style={valueCellStyle}>
                  <Typography sx={{ ...monoSx, fontSize: '0.78rem' }}>
                    HOJA {pageNumber} DE {sheet.page_count}
                  </Typography>
                </td>
                <td style={{ ...valueCellStyle, padding: '3px 6px', border: '3px solid #000', backgroundColor: '#f8fafc' }}>
                  <Typography sx={{ ...monoSx, fontSize: '0.82rem' }}>{sheet.dte_number}</Typography>
                </td>
                <td style={{ border: '1px solid #000', padding: '3px 10px' }}>{batchAndSeller}</td>
                <td style={{ border: '1px solid #000', padding: '3px 8px' }}>{dateBlank}</td>
                {averaged && averageCell}
              </tr>
            </tbody>
          </table>

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

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
          <tbody>
            <tr>
              <td style={{ ...bandHeadStyle, width: '36%' }}><HeadLabel color="#fff">Orden de ingreso</HeadLabel></td>
              <td style={{ ...bandHeadStyle, width: '16%' }}><HeadLabel color="#fff">Template code</HeadLabel></td>
              <td style={{ ...bandHeadStyle, width: '24%' }}><HeadLabel color="#fff">Hoja de recepción</HeadLabel></td>
              <td style={{ ...bandHeadStyle, width: '24%' }}><HeadLabel color="#fff">Hoja N de M</HeadLabel></td>
            </tr>
            <tr style={{ height: 30 }}>
              <td style={valueCellStyle}><Typography sx={{ ...monoSx, fontSize: '0.92rem', letterSpacing: '0.5px' }}>{order.code}</Typography></td>
              <td style={valueCellStyle}><Typography sx={{ ...monoSx, fontSize: '0.9rem', letterSpacing: '1px' }}>{code}</Typography></td>
              <td style={valueCellStyle}><Typography sx={{ ...monoSx, fontSize: '0.92rem' }}>{sheet.label}</Typography></td>
              <td style={valueCellStyle}>
                <Typography sx={{ ...monoSx, fontSize: '0.85rem' }}>
                  HOJA {pageNumber} DE {sheet.page_count}
                </Typography>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
          <tbody>
            <tr>
              <td style={{ ...headCellStyle, width: averaged ? '24%' : '30%', backgroundColor: '#000' }}><HeadLabel color="#fff">N° de DTE</HeadLabel></td>
              <td style={{ ...headCellStyle, width: averaged ? '32%' : '42%' }}><HeadLabel>Lote externo · Proveedor</HeadLabel></td>
              <td style={{ ...headCellStyle, width: averaged ? '24%' : '28%' }}><HeadLabel>Fecha de recepción</HeadLabel></td>
              {averaged && <td style={{ ...headCellStyle, width: '20%', backgroundColor: '#fde68a' }}><HeadLabel>Peso promedio (kg)</HeadLabel></td>}
            </tr>
            <tr style={{ height: 32 }}>
              <td style={{ border: '3px solid #000', padding: '3px 10px', backgroundColor: '#f8fafc' }}>
                <Typography sx={{ ...monoSx, fontSize: averaged ? '0.88rem' : '1rem' }}>{sheet.dte_number}</Typography>
              </td>
              <td style={{ border: '1px solid #000', padding: '3px 10px' }}>{batchAndSeller}</td>
              <td style={{ border: '1px solid #000', padding: '3px 10px' }}>{dateBlank}</td>
              {averaged && averageCell}
            </tr>
          </tbody>
        </table>

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
