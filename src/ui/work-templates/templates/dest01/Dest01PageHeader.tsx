import React from 'react';
import { Typography } from '@mui/material';
import type { Dest01DestinationMode, Dest01PrintHeader } from './Dest01PrintContext';

export const WEANING_TYPES_ON_SHEET = ['TRADICIONAL', 'ANTICIPADO', 'PRECOZ'];

const headCellStyle: React.CSSProperties = { border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 8px' };
const valueCellStyle: React.CSSProperties = { border: '1px solid #000', padding: '3px 10px', verticalAlign: 'middle' };
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

interface Dest01PageHeaderProps {
  code: string;
  establishment: string;
  header: Dest01PrintHeader;
  destinationMode: Dest01DestinationMode;
  pageNumber: number | null;
  pageTotal: number | null;
}

/**
 * The header of every DEST-01 page, repeated so a page found alone can still be identified: the
 * weaning order it fulfils, the weaning batch (or "— por animal —"), its management system, the
 * date and the weaning type.
 */
export const Dest01PageHeader: React.FC<Dest01PageHeaderProps> = ({ code, establishment, header, destinationMode, pageNumber, pageTotal }) => {
  const perAnimal = destinationMode === 'per_animal';

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
        <tbody>
          <tr>
            <td style={{ ...headCellStyle, width: '44%' }}><HeadLabel>Establecimiento ganadero</HeadLabel></td>
            <td style={{ ...headCellStyle, backgroundColor: '#000', width: '14%', textAlign: 'center' }}><HeadLabel color="#fff">Template code</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '24%', textAlign: 'center' }}><HeadLabel>Orden de destete</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '18%', textAlign: 'center' }}><HeadLabel>Hoja N de M</HeadLabel></td>
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
                {header.orden_es_borrador ? 'BORRADOR' : header.orden_destete || ' '}
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
            <td style={{ ...headCellStyle, width: '46%', backgroundColor: '#0f172a' }}>
              <HeadLabel color="#fff">Lote de destete (todas las crías · existente o nuevo)</HeadLabel>
            </td>
            <td style={{ ...headCellStyle, width: '26%' }}><HeadLabel>Manejo del lote (marcar)</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '28%' }}><HeadLabel>Fecha de destete</HeadLabel></td>
          </tr>
          <tr style={{ height: 38 }}>
            <td style={{ ...valueCellStyle, border: '3px solid #000', backgroundColor: '#f8fafc' }}>
              <Typography sx={{ fontWeight: 900, fontSize: perAnimal ? '0.85rem' : '1.02rem', color: '#000', fontStyle: perAnimal ? 'italic' : 'normal' }}>
                {perAnimal ? '— por animal —' : header.lote_destete}
              </Typography>
            </td>
            <td style={valueCellStyle}>
              <Typography sx={{ ...valueSx, fontFamily: 'monospace' }}>
                {perAnimal
                  ? 'Ver columna M'
                  : `${header.sistema_manejo === 'CORRAL' ? '☒' : '☐'} CORRAL   ${header.sistema_manejo === 'PASTURA' ? '☒' : '☐'} PASTURA`}
              </Typography>
            </td>
            <td style={valueCellStyle}>
              <Typography sx={valueSx}>{formatDate(header.fecha_destete)}</Typography>
            </td>
          </tr>
          <tr>
            <td style={headCellStyle}><HeadLabel>Tipo de destete (marcar)</HeadLabel></td>
            <td style={headCellStyle}><HeadLabel>Lote de cría (origen)</HeadLabel></td>
            <td style={headCellStyle}><HeadLabel>Responsable / Firma</HeadLabel></td>
          </tr>
          <tr style={{ height: 30 }}>
            <td style={valueCellStyle}>
              <Typography sx={{ ...valueSx, fontFamily: 'monospace', letterSpacing: '0.3px', fontSize: '0.74rem' }}>
                {WEANING_TYPES_ON_SHEET.map((type) => `${header.tipo_destete === type ? '☒' : '☐'} ${type}`).join('   ')}
              </Typography>
            </td>
            <td style={valueCellStyle}>
              <Typography sx={valueSx}>{header.lote_origen}</Typography>
            </td>
            <td style={valueCellStyle}>
              <Typography sx={valueSx}>{header.responsable}</Typography>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Dest01PageHeader;
