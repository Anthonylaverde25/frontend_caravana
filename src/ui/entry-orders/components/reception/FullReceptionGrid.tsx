import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useGridCellStyles } from '@/ui/birth-orders/components/grid/useGridCellStyles';
import FullReceptionRow from './FullReceptionRow';
import type { ReceptionRows, ReceptionTroopContext } from './useReceptionRows';

interface FullReceptionGridProps {
  draft: ReceptionRows;
  troop: ReceptionTroopContext;
}

// Every column but the caravan has its width: the caravan takes the rest.
const HEADERS: { label: string; width?: number; center?: boolean }[] = [
  { label: 'Caravana' },
  { label: 'Sexo', width: 110 },
  { label: 'Categoría', width: 150 },
  { label: 'Raza', width: 150 },
  { label: 'Pelaje', width: 140 },
  { label: 'Peso (kg)', width: 100 },
  { label: 'EC (1 a 5)', width: 90 },
  { label: 'Ojo', width: 56, center: true },
  { label: 'Oreja', width: 62, center: true },
  { label: 'Aplomo', width: 72, center: true }
];

/**
 * The animals of the full-screen reception as a spreadsheet, with the PAR-01 review's look: one row
 * per head expected from the start — like the blank lines of the ING-03 — every cell visible, the
 * data the order fixes filled in grey. Writing or pasting caravans fills the rows in order.
 */
export const FullReceptionGrid: React.FC<FullReceptionGridProps> = ({ draft, troop }) => {
  const { cellSx, headerBg } = useGridCellStyles();
  const head = { ...cellSx, bgcolor: headerBg, fontWeight: 700, px: 1.25, py: 1, fontSize: '0.74rem' };

  return (
    <TableContainer sx={{ maxHeight: { xs: 480, lg: 'calc(100vh - 260px)' }, border: '1px solid', borderColor: 'divider', borderRadius: '4px' }}>
      <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse', minWidth: 1100 }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ ...head, width: 40 }}>
              #
            </TableCell>
            {HEADERS.map((h) => (
              <TableCell key={h.label} align={h.center ? 'center' : 'left'} sx={{ ...head, ...(h.width ? { width: h.width } : { minWidth: 200 }) }}>
                {h.label}
              </TableCell>
            ))}
            <TableCell sx={{ ...head, width: 48, borderRight: 0 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {draft.rows.map((row, index) => (
            <FullReceptionRow key={row.key} row={row} index={index} draft={draft} troop={troop} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FullReceptionGrid;
