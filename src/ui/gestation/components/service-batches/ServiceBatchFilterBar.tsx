import React from 'react';
import {
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Box,
  Button,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type ServiceBatchFilterStatus = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'CRITICAL_RATIO';

interface ServiceBatchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: ServiceBatchFilterStatus;
  onFilterChange: (status: ServiceBatchFilterStatus) => void;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  criticalCount: number;
  isDark: boolean;
}

export const ServiceBatchFilterBar: React.FC<ServiceBatchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  totalCount,
  activeCount,
  inactiveCount,
  criticalCount,
  isDark,
}) => {
  const active = isDark ? '#60a5fa' : '#0a6ed1';
  const warning = isDark ? '#fb923c' : '#e6600d';

  const filterItems: { id: ServiceBatchFilterStatus; label: string; count: number; color?: string }[] = [
    { id: 'ALL', label: 'Todos', count: totalCount },
    { id: 'ACTIVE', label: 'En Servicio', count: activeCount },
    { id: 'INACTIVE', label: 'Concluidos', count: inactiveCount },
    { id: 'CRITICAL_RATIO', label: 'Ratio Crítico (<2%)', count: criticalCount, color: warning },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
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
        spacing={1.5}
      >
        {/* Search Input */}
        <TextField
          size="small"
          placeholder="Buscar por nombre de lote, categoría de vientres o notas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flexGrow: 1,
            maxWidth: { md: 380 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              fontSize: '0.85rem',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
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

        {/* Segmented Pill Filter Bar */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              p: 0.25,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
            }}
          >
            {filterItems.map((item) => {
              const isSelected = filterStatus === item.id;
              const buttonColor = item.color && isSelected ? item.color : active;

              return (
                <Button
                  key={item.id}
                  size="small"
                  onClick={() => onFilterChange(item.id)}
                  sx={{
                    minWidth: 0,
                    px: 1.25,
                    height: 26,
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 600 : 500,
                    textTransform: 'none',
                    lineHeight: 1.2,
                    color: isSelected
                      ? buttonColor
                      : isDark
                      ? '#94a3b8'
                      : '#64748b',
                    bgcolor: isSelected ? alpha(buttonColor, 0.12) : 'transparent',
                    '&:hover': {
                      bgcolor: isSelected
                        ? alpha(buttonColor, 0.16)
                        : isDark
                        ? 'rgba(255, 255, 255, 0.07)'
                        : '#edf1f5',
                    },
                    transition: 'background-color 160ms ease, color 160ms ease',
                  }}
                >
                  {item.label} ({item.count})
                </Button>
              );
            })}
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ServiceBatchFilterBar;
