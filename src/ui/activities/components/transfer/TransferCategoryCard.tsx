import React from 'react';
import { Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import type { TransferOrderCategoryMode } from '@/features/transfer-orders/types';
import { useTransferPalette } from './transferPalette';

interface TransferCategoryCardProps {
  mode: TransferOrderCategoryMode;
  onModeChange: (mode: TransferOrderCategoryMode) => void;
  /** What the mode in force asks for: the targets, when DECLARED. */
  children?: React.ReactNode;
}

const OPTIONS: { value: TransferOrderCategoryMode; label: string; hint: string }[] = [
  {
    value: 'KEEP',
    label: 'No cambia',
    hint: 'Se imprime la categoría actual, en gris, para identificar al animal.'
  },
  {
    value: 'DECLARED',
    label: 'Ya la sé',
    hint: 'Se asigna acá y sale impresa en la planilla, en la columna C/S nueva.'
  },
  {
    value: 'AT_CHUTE',
    label: 'Se decide en la manga',
    hint: 'La columna C/S nueva sale en blanco. Se anota categoría o subcategoría; vacía = no cambia.'
  }
];

/**
 * Whether the animals change category with this movement, declared with the order.
 *
 * It is a fact only the desk knows, so it is asked, never inferred from the destination: it is
 * what decides how the category columns of the sheet are printed.
 */
export const TransferCategoryCard: React.FC<TransferCategoryCardProps> = ({ mode, onModeChange, children }) => {
  const palette = useTransferPalette();
  const active = OPTIONS.find((option) => option.value === mode);

  return (
    <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden', borderColor: palette.cardBorder }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 3 }}
        alignItems={{ sm: 'center' }}
        sx={{
          px: 2.5,
          py: 1.75,
          bgcolor: palette.softBg,
          borderBottom: children ? '1px solid' : 'none',
          borderColor: palette.cardBorder
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 150 }}>
          <CategoryOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1, lineHeight: 1.3 }}>
            Categoría
          </Typography>
        </Stack>

        <Stack spacing={0.75}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={mode}
            onChange={(_, next: TransferOrderCategoryMode | null) => next && onModeChange(next)}
            sx={{
              bgcolor: palette.softBg,
              border: '1px solid',
              borderColor: palette.cardBorder,
              borderRadius: '8px',
              p: '3px',
              gap: '3px',
              flexWrap: 'wrap',
              '& .MuiToggleButtonGroup-grouped': {
                border: 0,
                borderRadius: '6px !important',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                px: 1.75,
                py: 0.75,
                color: 'text.secondary',
                '&.Mui-selected': { bgcolor: 'background.paper', color: palette.active, boxShadow: 1 }
              }
            }}
          >
            {OPTIONS.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {active && (
            <Typography variant="caption" color="text.secondary">
              {active.hint}
            </Typography>
          )}
        </Stack>
      </Stack>

      {children && <Box sx={{ px: 2.5, py: 2.25 }}>{children}</Box>}
    </Paper>
  );
};

export default TransferCategoryCard;
