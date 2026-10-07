import React from 'react';
import { TableCell, TableRow } from '@mui/material';

/** The grids of the ING-02: black borders, one row height, the same as every other sheet. */
export const gridSx = {
  borderCollapse: 'collapse',
  width: '100%',
  mb: 1,
  '& .MuiTableCell-root': { border: '1px solid #000', padding: '2px 5px', fontSize: '0.66rem', color: '#000', height: 25, boxSizing: 'border-box' }
} as const;

export const headRowSx = {
  backgroundColor: '#fafafa',
  '& .MuiTableCell-root': { fontWeight: 800, textTransform: 'uppercase', fontSize: '0.56rem' }
} as const;

export const valueCellSx = { fontWeight: 700, fontFamily: 'monospace', whiteSpace: 'nowrap' } as const;

/** The name of a grid, in the black band the sheets use for what the scan reads first. */
export const GridTitle: React.FC<{ colSpan: number; children: React.ReactNode }> = ({ colSpan, children }) => (
  <TableRow>
    <TableCell
      colSpan={colSpan}
      sx={{ backgroundColor: '#000', color: '#fff !important', fontWeight: 900, fontSize: '0.58rem !important', letterSpacing: '0.5px', textTransform: 'uppercase', height: '18px !important' }}
    >
      {children}
    </TableCell>
  </TableRow>
);
