import React from 'react';
import { Typography } from '@mui/material';
import type { Par01PrintHeader } from './Par01PrintContext';

const headCellStyle: React.CSSProperties = { border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 8px' };
const valueCellStyle: React.CSSProperties = { border: '1px solid #000', padding: '3px 10px', verticalAlign: 'middle' };
const valueSx = { fontWeight: 700, fontSize: '0.8rem', color: '#002B49' } as const;

const HeadLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#000' }) => (
  <Typography variant="caption" sx={{ fontWeight: 900, color, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block' }}>
    {children}
  </Typography>
);

interface Par01PageHeaderProps {
  code: string;
  establishment: string;
  header: Par01PrintHeader;
  pageNumber: number | null;
  pageTotal: number | null;
}

/**
 * The header of every PAR-01 page, repeated so a page found alone can still be identified: the birth
 * order it fulfils, the lots, the calving window and the day of the round. There is no destination
 * box: each calf stays in its mother's batch.
 */
export const Par01PageHeader: React.FC<Par01PageHeaderProps> = ({ code, establishment, header, pageNumber, pageTotal }) => (
  <>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
      <tbody>
        <tr>
          <td style={{ ...headCellStyle, width: '44%' }}>
            <HeadLabel>Establecimiento ganadero</HeadLabel>
          </td>
          <td style={{ ...headCellStyle, backgroundColor: '#000', width: '14%', textAlign: 'center' }}>
            <HeadLabel color="#fff">Template code</HeadLabel>
          </td>
          <td style={{ ...headCellStyle, width: '24%', textAlign: 'center' }}>
            <HeadLabel>Orden de parición</HeadLabel>
          </td>
          <td style={{ ...headCellStyle, width: '18%', textAlign: 'center' }}>
            <HeadLabel>Hoja N de M</HeadLabel>
          </td>
        </tr>
        <tr style={{ height: 30 }}>
          <td style={valueCellStyle}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#000' }}>{establishment}</Typography>
          </td>
          <td style={{ ...valueCellStyle, textAlign: 'center', backgroundColor: '#fafafa' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px' }}>{code}</Typography>
          </td>
          <td style={{ ...valueCellStyle, textAlign: 'center', border: '2px solid #000' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', color: '#000', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              {header.orden_es_borrador ? 'BORRADOR' : header.orden_paricion || ' '}
            </Typography>
          </td>
          <td style={{ ...valueCellStyle, textAlign: 'center', border: '2px solid #000' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#000', fontFamily: 'monospace' }}>
              HOJA {pageNumber ?? '___'} DE {pageTotal ?? '___'}
            </Typography>
          </td>
        </tr>
      </tbody>
    </table>

    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
      <tbody>
        <tr>
          <td style={{ ...headCellStyle, width: '34%' }}>
            <HeadLabel>Lote(s) de los vientres</HeadLabel>
          </td>
          <td style={{ ...headCellStyle, width: '30%' }}>
            <HeadLabel>Período de parición</HeadLabel>
          </td>
          <td style={{ ...headCellStyle, width: '36%', backgroundColor: '#0f172a' }}>
            <HeadLabel color="#fff">Fecha de recorrida</HeadLabel>
          </td>
        </tr>
        <tr style={{ height: 34 }}>
          <td style={valueCellStyle}>
            <Typography sx={valueSx}>{header.lote}</Typography>
          </td>
          <td style={valueCellStyle}>
            <Typography sx={valueSx}>{header.periodo}</Typography>
          </td>
          <td style={{ ...valueCellStyle, border: '3px solid #000', backgroundColor: '#f8fafc' }}>
            <Typography sx={{ ...valueSx, fontSize: '0.95rem' }}>____ / ____ / ________</Typography>
          </td>
        </tr>
        <tr>
          <td style={headCellStyle}>
            <HeadLabel>Responsable / Firma</HeadLabel>
          </td>
          <td colSpan={2} style={headCellStyle}>
            <HeadLabel>Destino de las crías</HeadLabel>
          </td>
        </tr>
        <tr style={{ height: 28 }}>
          <td style={valueCellStyle}>
            <Typography sx={valueSx}>{header.responsable}</Typography>
          </td>
          <td colSpan={2} style={valueCellStyle}>
            <Typography sx={{ ...valueSx, fontSize: '0.72rem' }}>EN EL LOTE DE SU MADRE (lo toma el sistema al cargar la planilla)</Typography>
          </td>
        </tr>
      </tbody>
    </table>
  </>
);

export default Par01PageHeader;
