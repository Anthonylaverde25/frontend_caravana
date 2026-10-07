import React from 'react';
import { Typography } from '@mui/material';
import type { EntryOrder } from '@/features/entry-orders/types';
import { ing03TroopBandOf } from './ing03Columns';

interface Ing03TroopBandProps {
  order: EntryOrder;
  /** Breed and category written in words on this sheet, or by code. */
  written: boolean;
  landscape: boolean;
}

/**
 * The TROPA band of the ING-03 header: sex, category and breed/coat printed once when the order
 * fixes them for every animal, so the chute can check what comes off the truck against what was
 * bought. When a datum is left to each line it says so, with what a line can write — the breeds and
 * categories expected, or their letters and numbers on a sheet by code.
 */
export const Ing03TroopBand: React.FC<Ing03TroopBandProps> = ({ order, written, landscape }) => {
  const cells = ing03TroopBandOf(order, written);

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: landscape ? '6px' : '10px', border: '2px solid #000', color: '#000', tableLayout: 'fixed' }}>
      <tbody>
        <tr>
          <td style={{ border: '1px solid #000', backgroundColor: '#000', padding: '3px 8px', width: landscape ? '13%' : '17%', verticalAlign: 'middle' }}>
            <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '0.62rem', textTransform: 'uppercase', lineHeight: 1.15 }}>Tropa</Typography>
            <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.5rem', lineHeight: 1.15 }}>vale para todos los renglones</Typography>
          </td>
          {cells.map((cell) => (
            <td key={cell.label} style={{ border: '1px solid #000', padding: '3px 8px', backgroundColor: cell.perLine ? '#fffbeb' : '#f8fafc', verticalAlign: 'middle' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '0.54rem', textTransform: 'uppercase', color: '#475569', lineHeight: 1.2 }}>{cell.label}</Typography>
              <Typography
                sx={{
                  fontWeight: cell.perLine ? 700 : 900,
                  fontSize: cell.perLine ? '0.6rem' : '0.78rem',
                  color: cell.perLine ? '#92400e' : '#000',
                  textTransform: cell.perLine ? 'none' : 'uppercase',
                  lineHeight: 1.2
                }}
              >
                {cell.value}
              </Typography>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default Ing03TroopBand;
