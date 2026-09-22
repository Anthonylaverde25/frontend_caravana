import React from 'react';
import {
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type WeaningBatchFilterStatus = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'KNOWS_TO_EAT';

interface WeaningBatchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: WeaningBatchFilterStatus;
  onFilterChange: (status: WeaningBatchFilterStatus) => void;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  knowsToEatCount: number;
  isDark: boolean;
}

export const WeaningBatchFilterBar: React.FC<WeaningBatchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  totalCount,
  activeCount,
  inactiveCount,
  knowsToEatCount,
  isDark,
}) => {
  const pills: { id: WeaningBatchFilterStatus; label: string; count: number }[] = [
    { id: 'ALL', label: 'Todos', count: totalCount },
    { id: 'ACTIVE', label: 'Activos', count: activeCount },
    { id: 'INACTIVE', label: 'Inactivos', count: inactiveCount },
    { id: 'KNOWS_TO_EAT', label: 'Acostumbrados a Batea', count: knowsToEatCount },
  ];

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      sx={{
        p: 2,
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        bgcolor: isDark ? '#1e293b' : '#ffffff',
      }}
    >
      {/* Search Input */}
      <TextField
        size="small"
        placeholder="Buscar por nombre de lote, campo o notas..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FuseSvgIcon size={18} sx={{ color: 'text.secondary' }}>
                heroicons-outline:magnifying-glass
              </FuseSvgIcon>
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchChange('')}>
                <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          minWidth: { xs: '100%', sm: 300, md: 360 },
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
          },
        }}
      />

      {/* Filter Pills */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
        {pills.map((pill) => {
          const isSelected = filterStatus === pill.id;
          return (
            <Chip
              key={pill.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <span>{pill.label}</span>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: '10px',
                      bgcolor: isSelected
                        ? 'rgba(255, 255, 255, 0.25)'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : '#e2e8f0',
                      color: isSelected ? '#ffffff' : 'text.secondary',
                    }}
                  >
                    {pill.count}
                  </Typography>
                </Box>
              }
              clickable
              onClick={() => onFilterChange(pill.id)}
              sx={{
                fontWeight: 600,
                fontSize: '0.78rem',
                height: 32,
                borderRadius: '6px',
                bgcolor: isSelected
                  ? '#8b5cf6'
                  : isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : '#f1f5f9',
                color: isSelected ? '#ffffff' : 'text.primary',
                border: '1px solid',
                borderColor: isSelected
                  ? '#8b5cf6'
                  : isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : '#e2e8f0',
                '&:hover': {
                  bgcolor: isSelected ? '#7c3aed' : 'action.hover',
                },
              }}
            />
          );
        })}
      </Box>
    </Stack>
  );
};

export default WeaningBatchFilterBar;
