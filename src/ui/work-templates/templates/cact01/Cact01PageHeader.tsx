import React from 'react';
import { Box, Typography } from '@mui/material';
import type { Cact01PrintHeader } from './Cact01PrintContext';
import type { Cact01CategoryColumn } from './Cact01Page';

const headCellStyle: React.CSSProperties = {
  border: '1px solid #000',
  backgroundColor: '#f0f0f0',
  padding: '3px 8px',
};

const valueCellStyle: React.CSSProperties = {
  border: '1px solid #000',
  padding: '3px 10px',
  verticalAlign: 'middle',
};

const valueSx = { fontWeight: 700, fontSize: '0.8rem', color: '#002B49' } as const;

const formatDate = (isoDate: string): string => {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]} / ${match[2]} / ${match[1]}` : '____ / ____ / ________';
};

const HeadLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#000' }) => (
  <Typography variant="caption" sx={{ fontWeight: 900, color, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block' }}>
    {children}
  </Typography>
);

export interface Cact01PageHeaderProps {
  code: string;
  title: string;
  establishment: string;
  header: Cact01PrintHeader;
  showDestinationColumn: boolean;
  categoryColumn: Cact01CategoryColumn;
  totalHead: number | null;
  totalWeight: number | null;
  pageNumber: number | null;
  pageTotal: number | null;
}

/**
 * Everything above the table of animals, repeated on every page of the sheet: a page
 * separated from the rest still has to say where the troop comes from and where it goes.
 *
 * The average is printed CALCULATED, never as a box to fill: it is total over head, so a
 * third handwritten number would be a third chance for the OCR to disagree with itself
 * about the same fact.
 */
export const Cact01PageHeader: React.FC<Cact01PageHeaderProps> = ({
  code,
  title,
  establishment,
  header,
  showDestinationColumn,
  categoryColumn,
  totalHead,
  totalWeight,
  pageNumber,
  pageTotal,
}) => {
  const average = totalHead && totalHead > 0 && totalWeight != null ? Math.round(totalWeight / totalHead) : null;
  const penned = header.sistema_manejo === 'CORRAL';
  const pasture = header.sistema_manejo === 'PASTURA';

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.4rem' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.72rem' }}>
            Movimiento de hacienda entre actividades • Se pesa y se revisa a cada animal en la manga
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.65rem', textAlign: 'right' }}>
          DOCUMENTO DE REGISTRO OFICIAL
        </Typography>
      </Box>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
        <tbody>
          <tr>
            <td style={{ ...headCellStyle, width: '40%' }}><HeadLabel>Establecimiento ganadero</HeadLabel></td>
            <td style={{ ...headCellStyle, backgroundColor: '#000', width: '14%', textAlign: 'center' }}><HeadLabel color="#fff">Template code</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '26%', textAlign: 'center' }}><HeadLabel>Orden de transferencia</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '20%', textAlign: 'center' }}><HeadLabel>Hoja N de M</HeadLabel></td>
          </tr>
          <tr style={{ height: 28 }}>
            <td style={valueCellStyle}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#000' }}>{establishment}</Typography>
            </td>
            <td style={{ ...valueCellStyle, textAlign: 'center', backgroundColor: '#fafafa' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px' }}>{code}</Typography>
            </td>
            {/* The code is what the scan finds the order by. Digits and dashes only after the
                prefix, printed large and monospaced: no letter that reads as a number. Blank on
                a sheet printed without an order, which is still a valid sheet. */}
            <td style={{ ...valueCellStyle, textAlign: 'center', border: '2px solid #000' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                {header.orden_es_borrador ? 'BORRADOR — SIN EMITIR' : header.orden_transferencia || '\u00a0'}
              </Typography>
            </td>
            <td style={{ ...valueCellStyle, textAlign: 'center', border: '2px solid #000' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace' }}>
                HOJA {pageNumber ?? '___'} DE {pageTotal ?? '___'}
              </Typography>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Origin -> destination: the identity of the sheet. */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', border: '2px solid #000', color: '#000' }}>
        <tbody>
          <tr>
            <td style={{ ...headCellStyle, width: '40%', backgroundColor: '#0f172a' }}><HeadLabel color="#fff">Lote de origen</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '40%', backgroundColor: '#0f172a' }}>
              <HeadLabel color="#fff">{showDestinationColumn ? 'Lote de destino (ver columna por animal)' : 'Lote de destino (todos)'}</HeadLabel>
            </td>
            <td style={{ ...headCellStyle, width: '20%' }}><HeadLabel>Fecha</HeadLabel></td>
          </tr>
          <tr style={{ height: 38 }}>
            <td style={{ ...valueCellStyle, border: '3px solid #000', backgroundColor: '#f8fafc' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#000' }}>{header.lote_origen}</Typography>
            </td>
            <td style={{ ...valueCellStyle, border: '3px solid #000', backgroundColor: showDestinationColumn ? '#f1f5f9' : '#f8fafc' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: '#000' }}>
                {showDestinationColumn ? '— por animal —' : header.lote_destino}
              </Typography>
            </td>
            <td style={valueCellStyle}>
              <Typography sx={{ ...valueSx, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{formatDate(header.fecha_movimiento)}</Typography>
            </td>
          </tr>
          <tr>
            <td style={headCellStyle}><HeadLabel>Actividad de origen</HeadLabel></td>
            <td style={headCellStyle}><HeadLabel>Actividad de destino</HeadLabel></td>
            <td style={headCellStyle}><HeadLabel>Manejo</HeadLabel></td>
          </tr>
          <tr style={{ height: 28 }}>
            <td style={valueCellStyle}><Typography sx={valueSx}>{header.actividad_origen}</Typography></td>
            <td style={valueCellStyle}><Typography sx={valueSx}>{header.actividad_destino}</Typography></td>
            <td style={valueCellStyle}>
              {/* With one destination per animal there is no single answer here: the letter
                  goes in the M column of each row, the same way the batch name does. */}
              <Typography sx={{ ...valueSx, fontFamily: 'monospace', fontSize: '0.66rem', whiteSpace: 'nowrap' }}>
                {showDestinationColumn
                  ? '— por animal (col. M) —'
                  : `${penned ? '☒' : '☐'} CORRAL  ${pasture ? '☒' : '☐'} PASTURA`}
              </Typography>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
        <tbody>
          <tr>
            <td style={{ ...headCellStyle, width: '20%', textAlign: 'center' }}><HeadLabel>Total de cabezas</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '24%', textAlign: 'center' }}><HeadLabel>Peso total de la tropa (kg)</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '22%', textAlign: 'center', backgroundColor: '#e2e8f0' }}><HeadLabel>Promedio (calculado)</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '34%' }}><HeadLabel>Responsable / Firma</HeadLabel></td>
          </tr>
          <tr style={{ height: 32 }}>
            <td style={{ ...valueCellStyle, textAlign: 'center' }}>
              <Typography sx={{ ...valueSx, fontSize: '0.95rem' }}>{totalHead ?? ''}</Typography>
            </td>
            <td style={{ ...valueCellStyle, textAlign: 'center' }}>
              <Typography sx={{ ...valueSx, fontSize: '0.95rem' }}>{totalWeight != null ? Math.round(totalWeight) : ''}</Typography>
            </td>
            <td style={{ ...valueCellStyle, textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <Typography sx={{ ...valueSx, fontSize: '0.95rem', color: '#475569' }}>{average != null ? `${average} kg` : ''}</Typography>
            </td>
            <td style={valueCellStyle}><Typography sx={valueSx}>{header.responsable}</Typography></td>
          </tr>
        </tbody>
      </table>

      <Box sx={{ border: '1.5px solid #000', bgcolor: '#fffbeb', p: '4px 8px', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#92400e' }}>
          UN ANIMAL POR FILA • Anotar el PESO DEL DÍA con el que entra a la nueva actividad • Dentición sólo si cambió
        </Typography>
        <Typography sx={{ fontSize: '0.52rem', color: '#78350f' }}>
          {categoryColumn === 'none'
            ? 'Sexo y categoría vienen del sistema y son para identificar al animal: no los corrige esta planilla.'
            : categoryColumn === 'declared'
              ? 'Sexo y C/S actual identifican al animal. La C/S nueva la fija la orden; corregirla sólo si en la manga se decide otra.'
              : 'Sexo y C/S actual identifican al animal. En C/S nueva anotar la categoría o subcategoría SÓLO si cambia.'}{' '}
          Escanear todas las hojas juntas.
        </Typography>
      </Box>
    </>
  );
};

export default Cact01PageHeader;
