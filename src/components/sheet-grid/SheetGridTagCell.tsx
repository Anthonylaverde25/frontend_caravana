import React from 'react';
import { Box, Stack, TableCell, Typography } from '@mui/material';
import { useGridCellStyles } from './useGridCellStyles';

interface SheetGridTagCellProps {
  tag: string;
  /** One short line under the tag (category, stage, current verdict). */
  caption?: React.ReactNode;
  /** A small mark after the tag, e.g. an icon with a tooltip. */
  adornment?: React.ReactNode;
  error?: boolean;
}

/** The identification cell: the ear tag in bold monospace and, below it, one caption line. */
export const SheetGridTagCell: React.FC<SheetGridTagCellProps> = ({ tag, caption, adornment, error = false }) => {
  const { cellSx, errorRing } = useGridCellStyles();

  return (
    <TableCell sx={{ ...cellSx, ...(error ? errorRing : {}) }}>
      <Box sx={{ px: 1.25, py: 0.5, minHeight: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: 'primary.main', lineHeight: 1.3 }}>{tag}</Typography>
          {adornment}
        </Stack>
        {caption && (
          <Typography component="div" variant="caption" noWrap sx={{ color: 'text.secondary', fontSize: '0.66rem', lineHeight: 1.3 }}>
            {caption}
          </Typography>
        )}
      </Box>
    </TableCell>
  );
};

export default SheetGridTagCell;
