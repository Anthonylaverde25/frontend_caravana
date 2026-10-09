import React from 'react';
import { Box, TextField, InputAdornment, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface QuickActionsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const QuickActionsSearchBar: React.FC<QuickActionsSearchBarProps> = ({ value, onChange }) => {
  return (
    <Box sx={{ p: 1.5, pb: 1 }}>
      <TextField
        fullWidth
        size="small"
        autoFocus
        placeholder="Buscar acción (ej: caravana, parto, lote...)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FuseSvgIcon size={16} sx={{ color: 'text.secondary' }}>
                heroicons-outline:magnifying-glass
              </FuseSvgIcon>
            </InputAdornment>
          ),
          sx: {
            borderRadius: '8px',
            fontSize: '0.8125rem',
            backgroundColor: (theme) => alpha(theme.palette.action.hover, 0.5),
            '& fieldset': {
              borderColor: (theme) => alpha(theme.palette.divider, 0.8),
            },
          },
        }}
      />
    </Box>
  );
};
