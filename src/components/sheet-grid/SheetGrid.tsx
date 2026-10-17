import React from 'react';
import { Table, TableContainer } from '@mui/material';

export type SheetGridHeight = number | string | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number | string>>;

interface SheetGridProps {
  /** Wide enough for every column: below it the grid scrolls sideways inside its own frame. */
  minWidth: number;
  maxHeight?: SheetGridHeight;
  children: React.ReactNode;
}

/** The frame of a data grid: a thin bordered box with a sticky header and its own scroll. */
export const SheetGrid: React.FC<SheetGridProps> = ({ minWidth, maxHeight, children }) => (
  <TableContainer sx={{ maxHeight, border: '1px solid', borderColor: 'divider', borderRadius: '4px' }}>
    <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse', minWidth }}>
      {children}
    </Table>
  </TableContainer>
);

export default SheetGrid;
