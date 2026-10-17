import React from 'react';
import { Box, Typography } from '@mui/material';
import { Lser01PrintHeader } from './Lser01HeaderContext';

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

const formatDate = (isoDate: string): string => {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]} / ${match[2]} / ${match[1]}` : '____ / ____ / ________';
};

const HeadLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#000' }) => (
  <Typography variant="caption" sx={{ fontWeight: 900, color, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block' }}>
    {children}
  </Typography>
);

interface Lser01SheetHeaderProps {
  title: string;
  code: string;
  establishment: string;
  header: Lser01PrintHeader;
}

/**
 * LSER-01 header: the batch that enters service (name + ID, pre-printed so the scan resolves the
 * exact batch), the single bull, the dates and the person responsible.
 */
export const Lser01SheetHeader: React.FC<Lser01SheetHeaderProps> = ({ title, code, establishment, header }) => (
  <>
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.4rem' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.72rem' }}>
          Inicio de servicio sobre el lote • Genera la orden de servicio y el ingreso del toro al cargarse
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.65rem', textAlign: 'right' }}>
        DOCUMENTO DE REGISTRO OFICIAL
      </Typography>
    </Box>

    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
      <tbody>
        <tr>
          <td style={{ ...headCellStyle, width: '75%' }}>
            <HeadLabel>Establecimiento ganadero</HeadLabel>
          </td>
          <td style={{ ...headCellStyle, backgroundColor: '#000', width: '25%', textAlign: 'center' }}>
            <HeadLabel color="#fff">Template code</HeadLabel>
          </td>
        </tr>
        <tr style={{ height: 28 }}>
          <td style={valueCellStyle}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#000' }}>{establishment}</Typography>
          </td>
          <td style={{ ...valueCellStyle, textAlign: 'center', backgroundColor: '#fafafa' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px' }}>
              {code}
            </Typography>
          </td>
        </tr>
      </tbody>
    </table>

    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', border: '2px solid #000', color: '#000' }}>
      <tbody>
        <tr>
          <td style={{ ...headCellStyle, width: '55%' }}>
            <HeadLabel>Lote en servicio (ID)</HeadLabel>
          </td>
          <td style={{ ...headCellStyle, width: '45%', backgroundColor: '#0f172a' }}>
            <HeadLabel color="#fff">Caravana del toro (único)</HeadLabel>
          </td>
        </tr>
        <tr style={{ height: 40 }}>
          <td style={valueCellStyle}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#002B49' }}>
              {header.lote ? `${header.lote}  •  ID ${header.lote_id ?? ''}` : ''}
            </Typography>
          </td>
          <td style={{ ...valueCellStyle, border: '3px solid #000', backgroundColor: '#f8fafc' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', fontFamily: 'monospace', color: '#000', letterSpacing: '1px' }}>
              {header.toro_caravana || ''}
            </Typography>
          </td>
        </tr>
        <tr>
          <td style={headCellStyle}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%' }}><HeadLabel>Fecha inicio de servicio</HeadLabel></td>
                  <td style={{ width: '50%' }}><HeadLabel>Fecha fin de servicio</HeadLabel></td>
                </tr>
              </tbody>
            </table>
          </td>
          <td style={headCellStyle}>
            <HeadLabel>Responsable / Firma</HeadLabel>
          </td>
        </tr>
        <tr style={{ height: 30 }}>
          <td style={valueCellStyle}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#002B49' }}>{formatDate(header.planned_start_date)}</Typography>
                  </td>
                  <td style={{ width: '50%' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#002B49' }}>{formatDate(header.planned_end_date)}</Typography>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
          <td style={valueCellStyle}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#002B49' }}>{header.responsable || ''}</Typography>
          </td>
        </tr>
      </tbody>
    </table>

    <Box sx={{ border: '1.5px solid #000', bgcolor: '#fffbeb', p: '4px 8px', mb: 1.5 }}>
      <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#92400e' }}>
        UN SOLO TORO POR PLANILLA • Los vientres del lote vienen impresos: tachar el que no esté • Agregar en los renglones libres el que aparezca en la manga
      </Typography>
      <Typography sx={{ fontSize: '0.52rem', color: '#78350f' }}>
        Una caravana que no pertenezca al lote bloquea la carga: transferirla antes. Los vientres no se mueven; el toro ingresa al lote y debe estar APTO.
      </Typography>
    </Box>
  </>
);

export default Lser01SheetHeader;
