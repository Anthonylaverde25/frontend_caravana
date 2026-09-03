import React from 'react';
import {
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Box,
  Button,
  Typography,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type PreServiceFilterStatus = 'ALL' | 'APT' | 'IN_TREATMENT' | 'UNFIT' | 'PENDING_EVALUATION';

export type PreServiceLabFilter =
  | 'ALL'
  | 'PENDING_SCRAPE'
  | 'PENDING_SEROLOGY'
  | 'PENDING_ANY'
  | 'CLEARED';

interface PreServiceFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: PreServiceFilterStatus;
  onStatusFilterChange: (status: PreServiceFilterStatus) => void;
  labFilter: PreServiceLabFilter;
  onLabFilterChange: (lab: PreServiceLabFilter) => void;
  totalCount: number;
  aptCount: number;
  inTreatmentCount: number;
  unfitCount: number;
  pendingCount: number;
  pendingScrapeCount: number;
  pendingSerologyCount: number;
  pendingAnyLabCount: number;
  clearedLabCount: number;
}

export const PreServiceFilterBar: React.FC<PreServiceFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  labFilter,
  onLabFilterChange,
  totalCount,
  aptCount,
  inTreatmentCount,
  unfitCount,
  pendingCount,
  pendingScrapeCount,
  pendingSerologyCount,
  pendingAnyLabCount,
  clearedLabCount,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const activeColor = isDark ? '#60a5fa' : '#0a6ed1';
  const successColor = isDark ? '#34d399' : '#107e3e';
  const warningColor = isDark ? '#fb923c' : '#e6600d';
  const errorColor = isDark ? '#f87171' : '#dc2626';

  const scrapeColor = isDark ? '#fbbf24' : '#b45309';
  const serologyColor = isDark ? '#60a5fa' : '#1d4ed8';

  const statusItems: { id: PreServiceFilterStatus; label: string; count: number; color?: string }[] = [
    { id: 'ALL', label: 'Todos', count: totalCount },
    { id: 'APT', label: 'Aptos', count: aptCount, color: successColor },
    { id: 'IN_TREATMENT', label: 'En Tratamiento', count: inTreatmentCount, color: warningColor },
    { id: 'UNFIT', label: 'Rechazo / Descarte', count: unfitCount, color: errorColor },
    { id: 'PENDING_EVALUATION', label: 'Pend. Físico', count: pendingCount },
  ];

  const labItems: { id: PreServiceLabFilter; label: string; count: number; color: string; badge?: string }[] = [
    { id: 'ALL', label: 'Todos los Toros', count: totalCount, color: activeColor },
    { id: 'PENDING_SCRAPE', label: 'Pend. Raspaje ETS', count: pendingScrapeCount, color: scrapeColor },
    { id: 'PENDING_SEROLOGY', label: 'Pend. Serología Sangre', count: pendingSerologyCount, color: serologyColor },
    { id: 'PENDING_ANY', label: 'Cualquier Lab Pendiente', count: pendingAnyLabCount, color: warningColor },
    { id: 'CLEARED', label: 'Lab Negativo / Limpio', count: clearedLabCount, color: successColor },
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
      <Stack spacing={1.75}>
        {/* Top Row: Search Input + General Status Filters */}
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', lg: 'center' }}
          spacing={1.5}
        >
          {/* Search Input */}
          <TextField
            size="small"
            placeholder="Buscar por caravana, aplomos o notas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              flexGrow: 1,
              maxWidth: { lg: 380 },
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

          {/* General Status Segmented Pills */}
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
              overflowX: 'auto',
            }}
          >
            {statusItems.map((item) => {
              const isSelected = statusFilter === item.id;
              const buttonColor = item.color && isSelected ? item.color : activeColor;

              return (
                <Button
                  key={item.id}
                  size="small"
                  onClick={() => onStatusFilterChange(item.id)}
                  sx={{
                    minWidth: 0,
                    px: 1.25,
                    height: 26,
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 700 : 500,
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

        <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9' }} />

        {/* Bottom Row: Laboratory & Biological Sampling Dedicated Filters */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.25}
          flexWrap="wrap"
          useFlexGap
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FuseSvgIcon size={16} color="action">
              heroicons-outline:beaker
            </FuseSvgIcon>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.68rem',
                letterSpacing: 0.5,
                color: 'text.secondary',
              }}
            >
              Filtro de Laboratorio:
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              p: 0.25,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
              flexWrap: 'wrap',
            }}
          >
            {labItems.map((item) => {
              const isSelected = labFilter === item.id;
              const pillColor = item.color;

              return (
                <Button
                  key={item.id}
                  size="small"
                  onClick={() => onLabFilterChange(item.id)}
                  sx={{
                    minWidth: 0,
                    px: 1.25,
                    height: 24,
                    borderRadius: '5px',
                    fontSize: '0.7rem',
                    fontWeight: isSelected ? 700 : 500,
                    textTransform: 'none',
                    lineHeight: 1.1,
                    color: isSelected
                      ? pillColor
                      : isDark
                      ? '#94a3b8'
                      : '#64748b',
                    bgcolor: isSelected ? alpha(pillColor, 0.14) : 'transparent',
                    border: isSelected ? `1px solid ${alpha(pillColor, 0.35)}` : '1px solid transparent',
                    '&:hover': {
                      bgcolor: isSelected
                        ? alpha(pillColor, 0.2)
                        : isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : '#edf1f5',
                    },
                    transition: 'all 160ms ease',
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

export default PreServiceFilterBar;
