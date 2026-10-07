import React from 'react';
import { Typography } from '@mui/material';
import type { EntryOrder, EntryOrderReceiptSheet } from '@/features/entry-orders/types';
import Ing03TroopBand from './Ing03TroopBand';

const headCellStyle: React.CSSProperties = { border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '3px 8px' };
const bandHeadStyle: React.CSSProperties = { ...headCellStyle, backgroundColor: '#000', textAlign: 'center' };
const valueCellStyle: React.CSSProperties = { border: '2px solid #000', padding: '3px 10px', verticalAlign: 'middle', textAlign: 'center' };
const monoSx = { fontWeight: 900, color: '#000', fontFamily: 'monospace', whiteSpace: 'nowrap' } as const;

const HeadLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#000' }) => (
  <Typography variant="caption" sx={{ fontWeight: 900, color, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block' }}>
    {children}
  </Typography>
);

interface Ing03HeaderProps {
  code: string;
  order: EntryOrder;
  sheet: EntryOrderReceiptSheet;
  pageNumber: number;
  landscape: boolean;
}

/**
 * What identifies an ING-03 page — order, template, sheet R-number, "Hoja N de M", DTE — and what
 * the chute fills once per page: the date and, on a sheet weighed with one average, that average.
 * It also prints the head of the DTE to count against and the TROPA band: the sex, category and
 * breed every line inherits, or what each line can write. Landscape lays the identity out in one
 * band; portrait in two tables.
 */
export const Ing03Header: React.FC<Ing03HeaderProps> = ({ code, order, sheet, pageNumber, landscape }) => {
  const averaged = sheet.weighing_mode === 'AVERAGE';
  const troopBand = <Ing03TroopBand order={order} written={sheet.reference_mode !== 'CODE'} landscape={landscape} />;

  const averageCell = (
    <td style={{ border: '3px solid #000', padding: '3px 10px', backgroundColor: '#fffbeb', textAlign: 'right' }}>
      <Typography sx={{ ...monoSx, fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>______ kg</Typography>
    </td>
  );

  const batchAndSeller = (
    <>
      <Typography sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#002B49' }}>
        {order.batch_name ?? '—'} · {order.provider.name ?? '—'}
      </Typography>
      <Typography sx={{ fontWeight: 800, fontSize: '0.66rem', color: '#000' }}>
        Cabezas del DTE: {sheet.dte_head_count} · a recibir: {sheet.expected_head_count}
      </Typography>
    </>
  );

  const dateBlank = (
    <Typography sx={{ ...monoSx, fontSize: landscape ? '0.72rem' : '0.8rem', fontWeight: 700 }}>
      {landscape ? '__ / __ / ____' : averaged ? '___ / ___ / ______' : '____ / ____ / ________'}
    </Typography>
  );

  if (landscape) {
    return (
      <>
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
        {troopBand}
      </>
    );
  }

  return (
    <>
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

        {troopBand}
    </>
  );
};

export default Ing03Header;
