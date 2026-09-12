import React from 'react';
import {
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Box,
  Button,
  IconButton,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type DiagnosticFilterStatus = 'ALL' | 'VERIFIED' | 'UNVERIFIED' | 'POSITIVES' | 'VOIDED';
export type DiagnosticFilterChannel = 'ALL' | 'PORTAL_VET' | 'OWNER_DIGITIZED';

interface DiagnosticProtocolsFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: DiagnosticFilterStatus;
  onStatusFilterChange: (status: DiagnosticFilterStatus) => void;
  channelFilter: DiagnosticFilterChannel;
  onChannelFilterChange: (channel: DiagnosticFilterChannel) => void;
  totalCount: number;
  verifiedCount: number;
  unverifiedCount: number;
  positivesCount: number;
  voidedCount: number;
  portalCount: number;
  digitizedCount: number;
  onResetFilters: () => void;
}

export const DiagnosticProtocolsFilterBar: React.FC<DiagnosticProtocolsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  channelFilter,
  onChannelFilterChange,
  totalCount,
  verifiedCount,
  unverifiedCount,
  positivesCount,
  voidedCount,
  portalCount,
  digitizedCount,
  onResetFilters,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const activeColor = isDark ? '#60a5fa' : '#0a6ed1';
  const successColor = isDark ? '#34d399' : '#107e3e';
  const warningColor = isDark ? '#fb923c' : '#e6600d';
  const errorColor = isDark ? '#f87171' : '#dc2626';
  const neutralColor = isDark ? '#94a3b8' : '#64748b';

  const statusItems: { id: DiagnosticFilterStatus; label: string; count: number; color?: string }[] = [
    { id: 'ALL', label: 'Todos', count: totalCount },
    { id: 'VERIFIED', label: 'Verificados', count: verifiedCount, color: successColor },
    { id: 'UNVERIFIED', label: 'Sin Aval', count: unverifiedCount, color: warningColor },
    { id: 'POSITIVES', label: 'Con Positivos', count: positivesCount, color: errorColor },
    { id: 'VOIDED', label: 'Anulados', count: voidedCount, color: neutralColor },
  ];

  const channelItems: { id: DiagnosticFilterChannel; label: string; count: number; icon: string }[] = [
    { id: 'ALL', label: 'Todos los Canales', count: totalCount, icon: 'heroicons-outline:squares-2x2' },
    { id: 'PORTAL_VET', label: 'Portal M.V.', count: portalCount, icon: 'heroicons-outline:shield-check' },
    { id: 'OWNER_DIGITIZED', label: 'Digitalizado Productor', count: digitizedCount, icon: 'heroicons-outline:document-arrow-up' },
  ];

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || channelFilter !== 'ALL';

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
        {/* Top Row: Search Input + Status Pills */}
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', lg: 'center' }}
          spacing={1.5}
        >
          {/* Search Input */}
          <TextField
            size="small"
            placeholder="Buscar por N° de protocolo, profesional o laboratorio..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              flexGrow: 1,
              maxWidth: { lg: 420 },
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
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                    <FuseSvgIcon size={14}>heroicons-outline:x-mark</FuseSvgIcon>
                  </IconButton>
                </InputAdornment>
              ) : null,
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
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    py: 0.5,
                    px: 1.25,
                    whiteSpace: 'nowrap',
                    bgcolor: isSelected
                      ? isDark
                        ? alpha(buttonColor, 0.2)
                        : alpha(buttonColor, 0.1)
                      : 'transparent',
                    color: isSelected ? buttonColor : 'text.secondary',
                    boxShadow: isSelected && !isDark ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    '&:hover': {
                      bgcolor: isSelected
                        ? isDark
                          ? alpha(buttonColor, 0.25)
                          : alpha(buttonColor, 0.15)
                        : isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <span>{item.label}</span>
                  <Box
                    component="span"
                    sx={{
                      ml: 0.75,
                      px: 0.75,
                      py: 0.1,
                      borderRadius: '999px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: isSelected
                        ? buttonColor
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : '#e2e8f0',
                      color: isSelected ? '#ffffff' : 'text.secondary',
                    }}
                  >
                    {item.count}
                  </Box>
                </Button>
              );
            })}
          </Box>
        </Stack>

        <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9' }} />

        {/* Bottom Row: Channel Pills + Reset Button */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              overflowX: 'auto',
            }}
          >
            {channelItems.map((item) => {
              const isSelected = channelFilter === item.id;
              return (
                <Button
                  key={item.id}
                  size="small"
                  onClick={() => onChannelFilterChange(item.id)}
                  startIcon={<FuseSvgIcon size={16}>{item.icon}</FuseSvgIcon>}
                  sx={{
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    py: 0.4,
                    px: 1.25,
                    whiteSpace: 'nowrap',
                    border: '1px solid',
                    borderColor: isSelected
                      ? activeColor
                      : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : '#e2e8f0',
                    bgcolor: isSelected
                      ? isDark
                        ? alpha(activeColor, 0.15)
                        : alpha(activeColor, 0.08)
                      : isDark
                      ? 'rgba(255, 255, 255, 0.02)'
                      : '#ffffff',
                    color: isSelected ? activeColor : 'text.secondary',
                    '&:hover': {
                      borderColor: activeColor,
                      bgcolor: isDark ? alpha(activeColor, 0.2) : alpha(activeColor, 0.12),
                    },
                  }}
                >
                  <span>{item.label}</span>
                  <Box
                    component="span"
                    sx={{
                      ml: 0.75,
                      px: 0.6,
                      py: 0.05,
                      borderRadius: '999px',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      bgcolor: isSelected
                        ? activeColor
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : '#e2e8f0',
                      color: isSelected ? '#ffffff' : 'text.secondary',
                    }}
                  >
                    {item.count}
                  </Box>
                </Button>
              );
            })}
          </Box>

          {hasActiveFilters && (
            <Button
              size="small"
              variant="text"
              onClick={onResetFilters}
              startIcon={<FuseSvgIcon size={14}>heroicons-outline:arrow-path</FuseSvgIcon>}
              sx={{
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Restablecer filtros
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default DiagnosticProtocolsFilterBar;
