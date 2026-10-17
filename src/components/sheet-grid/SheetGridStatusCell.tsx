import React from 'react';
import { Box, TableCell, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGridCellStyles } from './useGridCellStyles';

interface SheetGridStatusCellProps {
  /** What blocks the row (from the server): a red circle. */
  error?: string;
  /** What deserves a look but does not block it: an amber triangle. */
  warning?: string;
  /** What the row should know: a grey circle. */
  info?: string;
  /** Shown while the row has nothing to tell, e.g. the "Quitar fila" button. */
  children?: React.ReactNode;
}

const TONES = [
  { key: 'error', color: 'error.main', icon: 'heroicons-outline:exclamation-circle' },
  { key: 'warning', color: 'warning.main', icon: 'heroicons-outline:exclamation-triangle' },
  { key: 'info', color: 'text.secondary', icon: 'heroicons-outline:information-circle' }
] as const;

/** The last column of a grid row: the most serious notice of the row, its message in the tooltip. */
export const SheetGridStatusCell: React.FC<SheetGridStatusCellProps> = (props) => {
  const { cellSx } = useGridCellStyles();
  const tone = TONES.find((t) => props[t.key]);

  return (
    <TableCell align="center" sx={{ ...cellSx, borderRight: 0, width: 48 }}>
      {tone ? (
        <Tooltip title={props[tone.key]}>
          <Box component="span" sx={{ color: tone.color, display: 'inline-flex' }}>
            <FuseSvgIcon size={18}>{tone.icon}</FuseSvgIcon>
          </Box>
        </Tooltip>
      ) : (
        props.children
      )}
    </TableCell>
  );
};

export default SheetGridStatusCell;
