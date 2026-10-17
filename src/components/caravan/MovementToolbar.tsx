import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface MovementToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  totalCount: number;
}

export const MOVEMENT_TYPES = [
  { value: 'ALL', label: 'Todos los Tipos' },
  { value: 'ENTRY', label: 'Entradas' },
  { value: 'TRANSFER', label: 'Transferencias' },
  { value: 'EXIT', label: 'Salidas' },
  { value: 'ORIGIN', label: 'Orígenes' },
];

export default function MovementToolbar({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  totalCount,
}: MovementToolbarProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
      >
        {/* Buscador */}
        <TextField
          size="small"
          hiddenLabel
          placeholder="Buscar por caravana, tipo, RENSPA u observaciones..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flexGrow: 1,
            maxWidth: { md: 440 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              fontSize: '0.85rem',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={18} color="action">
                  heroicons-outline:magnifying-glass
                </FuseSvgIcon>
              </InputAdornment>
            ),
          }}
        />

        {/* Filtro por Tipo de Evento & Contador */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
            <Select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              input={
                <OutlinedInput
                  size="small"
                  startAdornment={
                    <InputAdornment position="start">
                      <FuseSvgIcon size={18} color="action">
                        heroicons-outline:arrows-right-left
                      </FuseSvgIcon>
                    </InputAdornment>
                  }
                />
              }
              sx={{
                borderRadius: '6px',
                fontSize: '0.85rem',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#d1d5db',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#9ca3af',
                },
              }}
            >
              {MOVEMENT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.85rem' }}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip
            size="small"
            variant="outlined"
            label={`${totalCount} ${totalCount === 1 ? 'movimiento' : 'movimientos'}`}
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 28,
              borderRadius: '6px',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
              color: 'text.secondary',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
