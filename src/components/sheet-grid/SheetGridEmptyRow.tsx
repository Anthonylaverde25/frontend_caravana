import React from 'react';
import { TableCell, TableRow } from '@mui/material';
import { useGridCellStyles } from './useGridCellStyles';

interface SheetGridEmptyRowProps {
  colSpan: number;
  children: React.ReactNode;
}

/** The only row of a grid with nothing to show. */
export const SheetGridEmptyRow: React.FC<SheetGridEmptyRowProps> = ({ colSpan, children }) => {
  const { cellSx } = useGridCellStyles();

  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ ...cellSx, borderRight: 0, py: 6, color: 'text.disabled', fontStyle: 'italic', fontSize: '0.85rem' }}>
        {children}
      </TableCell>
    </TableRow>
  );
};

export default SheetGridEmptyRow;
