import React from 'react';
import { Checkbox, IconButton, Stack, TableCell, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGridCellStyles } from './useGridCellStyles';

interface SheetGridGroupRowProps {
  /** Every column of the grid. */
  colSpan: number;
  name: string;
  /** The count after the name ("3 de 5", "4 vientre(s)"). */
  caption?: React.ReactNode;
  /** Pushed to the right end of the row. */
  trailing?: React.ReactNode;
  /** The group checkbox, in the checkbox column of the grid. */
  check?: { checked: boolean; indeterminate: boolean; disabled?: boolean; onChange: (checked: boolean) => void };
  /** A foldable group shows its chevron. */
  fold?: { open: boolean; disabled?: boolean; onToggle: () => void };
}

/** The heading row of a group (a batch, usually): its own checkbox, bold name and count. */
export const SheetGridGroupRow: React.FC<SheetGridGroupRowProps> = ({ colSpan, name, caption, trailing, check, fold }) => {
  const { cellSx, groupBg } = useGridCellStyles();

  return (
    <TableRow>
      {check && (
        <TableCell align="center" sx={{ ...cellSx, bgcolor: groupBg }}>
          <Checkbox
            size="small"
            checked={check.checked}
            indeterminate={check.indeterminate}
            disabled={check.disabled}
            onChange={(e) => check.onChange(e.target.checked)}
          />
        </TableCell>
      )}
      <TableCell colSpan={check ? colSpan - 1 : colSpan} sx={{ ...cellSx, bgcolor: groupBg, px: fold ? 0.5 : 1.25, py: 0.5, height: 40 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {fold && (
            <IconButton size="small" onClick={fold.onToggle} disabled={fold.disabled}>
              <FuseSvgIcon size={16}>{fold.open ? 'heroicons-outline:chevron-down' : 'heroicons-outline:chevron-right'}</FuseSvgIcon>
            </IconButton>
          )}
          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{name}</Typography>
          <Typography component="div" variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
            {caption}
          </Typography>
          {trailing}
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default SheetGridGroupRow;
