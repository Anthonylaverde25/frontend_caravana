import React from 'react';
import { Typography } from '@mui/material';
import type { EntryOrder } from '@/features/entry-orders/types';

const headCellStyle: React.CSSProperties = { border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 8px' };
const valueCellStyle: React.CSSProperties = { border: '1px solid #000', padding: '3px 10px', verticalAlign: 'middle' };
const valueSx = { fontWeight: 700, fontSize: '0.8rem', color: '#002B49' } as const;

export const dateOnSheet = (isoDate: string | null | undefined): string => {
  const match = (isoDate ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/);

  return match ? `${match[3]} / ${match[2]} / ${match[1]}` : '____ / ____ / ________';
};

/** "☒ BUENO ☐ REGULAR": the boxes to mark, with the declared one already marked. */
export const boxes = (options: string[], marked: string | null): string =>
  options.map((option) => `${marked === option ? '☒' : '☐'} ${option}`).join('   ');

const HeadLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#000' }) => (
  <Typography variant="caption" sx={{ fontWeight: 900, color, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block' }}>
    {children}
  </Typography>
);

interface Ing02PageHeaderProps {
  code: string;
  /** Null prints the header blank. */
  order: EntryOrder | null;
}

const bandHeadStyle: React.CSSProperties = { ...headCellStyle, backgroundColor: '#000', textAlign: 'center' };

/**
 * The header of the ING-02: the identification band (entry order, template code, page) and the
 * purchase itself, with the batch the troop lands in as the highlighted box. Only what the paper
 * has to carry: the buyer is the company the sheet belongs to, and the auction termination and the
 * person responsible stay on the screen.
 */
export const Ing02PageHeader: React.FC<Ing02PageHeaderProps> = ({ code, order }) => {
  const draft = order?.status === 'DRAFT';

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
        <tbody>
          <tr>
            <td style={{ ...bandHeadStyle, width: '62%' }}><HeadLabel color="#fff">Orden de ingreso</HeadLabel></td>
            <td style={{ ...bandHeadStyle, width: '20%' }}><HeadLabel color="#fff">Template code</HeadLabel></td>
            <td style={{ ...bandHeadStyle, width: '18%' }}><HeadLabel color="#fff">Hoja N de M</HeadLabel></td>
          </tr>
          <tr style={{ height: 30 }}>
            <td style={{ ...valueCellStyle, textAlign: 'center', border: '2px solid #000' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.92rem', color: '#000', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                {draft ? 'BORRADOR' : (order?.code ?? ' ')}
              </Typography>
            </td>
            <td style={{ ...valueCellStyle, textAlign: 'center', border: '2px solid #000' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px' }}>{code}</Typography>
            </td>
            <td style={{ ...valueCellStyle, textAlign: 'center', border: '2px solid #000' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#000', fontFamily: 'monospace' }}>HOJA 1 DE 1</Typography>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
        <tbody>
          <tr>
            <td style={{ ...headCellStyle, width: '38%', backgroundColor: '#000' }}>
              <HeadLabel color="#fff">Lote externo (nombre)</HeadLabel>
            </td>
            <td style={{ ...headCellStyle, width: '38%' }}><HeadLabel>Proveedor / Vendedor</HeadLabel></td>
            <td style={{ ...headCellStyle, width: '24%' }}><HeadLabel>CUIT del proveedor</HeadLabel></td>
          </tr>
          <tr style={{ height: 38 }}>
            <td style={{ ...valueCellStyle, border: '3px solid #000', backgroundColor: '#f8fafc' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.02rem', color: '#000', fontFamily: 'monospace' }}>{order?.batch_name ?? ''}</Typography>
            </td>
            <td style={valueCellStyle}><Typography sx={valueSx}>{order?.provider.name ?? ''}</Typography></td>
            <td style={valueCellStyle}><Typography sx={{ ...valueSx, fontFamily: 'monospace' }}>{order?.provider.cuit ?? ''}</Typography></td>
          </tr>
          <tr>
            <td style={headCellStyle}><HeadLabel>Establecimiento de origen</HeadLabel></td>
            <td style={headCellStyle}><HeadLabel>RENSPA de origen</HeadLabel></td>
            <td style={headCellStyle}><HeadLabel>Fecha de compra</HeadLabel></td>
          </tr>
          <tr style={{ height: 30 }}>
            <td style={valueCellStyle}><Typography sx={valueSx}>{order?.farm.name ?? ''}</Typography></td>
            <td style={valueCellStyle}><Typography sx={{ ...valueSx, fontFamily: 'monospace' }}>{order?.farm.renspa ?? ''}</Typography></td>
            <td style={valueCellStyle}><Typography sx={{ ...valueSx, fontFamily: 'monospace' }}>{dateOnSheet(order?.purchase_date)}</Typography></td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Ing02PageHeader;
