import React from 'react';
import { SxProps, Table, TableContainer, Theme } from '@mui/material';

export type SheetGridHeight = number | string | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number | string>>;

interface SheetGridProps {
  /** Wide enough for every column: below it the grid scrolls sideways inside its own frame. */
  minWidth: number;
  maxHeight?: SheetGridHeight;
  borderless?: boolean;
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

/** The frame of a data grid: a thin bordered box with a sticky header and its own scroll. */
export const SheetGrid: React.FC<SheetGridProps> = ({ minWidth, maxHeight, borderless = false, sx, children }) => (
  <TableContainer
    sx={{
      maxHeight,
      height: borderless ? '100%' : undefined,
      overflow: 'auto',
      border: borderless ? 'none' : '1px solid',
      borderColor: 'divider',
      borderRadius: borderless ? 0 : '4px',
      ...sx
    }}
  >
    <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse', minWidth }}>
      {children}
    </Table>
  </TableContainer>
);

export default SheetGrid;
