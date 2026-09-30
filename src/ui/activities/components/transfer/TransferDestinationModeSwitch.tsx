import React from 'react';
import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import type { TransferDestinationMode } from '../../hooks/useTransferDestinations';
import { useTransferPalette } from './transferPalette';

interface TransferDestinationModeSwitchProps {
  value: TransferDestinationMode;
  onChange: (mode: TransferDestinationMode) => void;
  disabled?: boolean;
}

const OPTIONS: { value: TransferDestinationMode; label: string; hint: string; Icon: typeof Inventory2OutlinedIcon }[] = [
  {
    value: 'single',
    label: 'Un destino para todos',
    hint: 'Toda la tropa va al mismo lote.',
    Icon: Inventory2OutlinedIcon,
  },
  {
    value: 'per_animal',
    label: 'Por animal · Manga',
    hint: 'Se asigna acá, o se deja en blanco para decidirlo en la manga.',
    Icon: GroupsOutlinedIcon,
  },
];

/**
 * One destination for the whole troop, or one per animal.
 *
 * A segmented control rather than two radios: these are two ways of working, not two values
 * of a field, and the one in force decides what the rest of the screen even asks for. Seeing
 * which of the two is active at a glance is the whole point.
 *
 * Worded exactly like `Cact01DestinationSelector` on the print screen: the same question
 * asked twice in different words is two questions as far as the operator is concerned.
 */
export const TransferDestinationModeSwitch: React.FC<TransferDestinationModeSwitchProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const palette = useTransferPalette();
  const active = OPTIONS.find((option) => option.value === value);

  return (
    <Stack spacing={0.75}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={value}
        onChange={(_, next: TransferDestinationMode | null) => next && onChange(next)}
        sx={{
          bgcolor: palette.softBg,
          border: '1px solid',
          borderColor: palette.cardBorder,
          borderRadius: '8px',
          p: '3px',
          gap: '3px',
          '& .MuiToggleButtonGroup-grouped': {
            border: 0,
            borderRadius: '6px !important',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            px: 1.75,
            py: 0.75,
            color: 'text.secondary',
            '&.Mui-selected': {
              bgcolor: palette.sapGreen,
              color: '#ffffff',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.18)',
              '&:hover': { bgcolor: palette.sapGreenHover },
            },
          },
        }}
      >
        {OPTIONS.map(({ value: option, label, Icon }) => (
          <ToggleButton key={option} value={option} disabled={disabled}>
            <Icon sx={{ fontSize: 17, mr: 0.75 }} />
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Only the mode in force explains itself: printing both hints side by side made the
          operator read two rules to find the one that applied. */}
      <Box sx={{ pl: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {active?.hint}
        </Typography>
      </Box>
    </Stack>
  );
};

export default TransferDestinationModeSwitch;
