import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TransferDestinationModeSwitch from './TransferDestinationModeSwitch';
import { useTransferPalette } from './transferPalette';
import type { TransferDestinationMode } from '../../hooks/useTransferDestinations';

interface TransferDestinationHeaderProps {
  mode: TransferDestinationMode;
  onModeChange: (mode: TransferDestinationMode) => void;
  /**
   * The row under the mode strip: where the troop comes from and the stage it goes to.
   *
   * A slot rather than props, because what belongs there depends on the mode in force, and
   * the screen that owns the state is the one that knows.
   */
  children?: React.ReactNode;
}

/**
 * The band that opens the transfer: how the destination gets decided, and — once that is
 * answered — from which stage to which.
 *
 * One card on purpose. The mode and the destination activity used to sit in two stacked
 * panels that each explained the same rule, which read as two unrelated decisions instead of
 * one question and its consequence.
 */
export const TransferDestinationHeader: React.FC<TransferDestinationHeaderProps> = ({
  mode,
  onModeChange,
  children,
}) => {
  const palette = useTransferPalette();

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: '8px', overflow: 'hidden', borderColor: palette.cardBorder }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 3 }}
        alignItems={{ sm: 'center' }}
        sx={{
          px: 2.5,
          py: 1.75,
          bgcolor: palette.softBg,
          borderBottom: children ? '1px solid' : 'none',
          borderColor: palette.cardBorder,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 150 }}>
          <SwapHorizIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
          <Typography
            variant="overline"
            sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1, lineHeight: 1.3 }}
          >
            Modo de destino
          </Typography>
        </Stack>

        <TransferDestinationModeSwitch value={mode} onChange={onModeChange} />
      </Stack>

      {children && <Box sx={{ px: 2.5, py: 2.25 }}>{children}</Box>}
    </Paper>
  );
};

export default TransferDestinationHeader;
