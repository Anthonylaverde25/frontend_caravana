import { Paper, Stack, TextField, InputAdornment, Box, Button, IconButton, Tooltip, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type FilterStatus = 'ALL' | 'WITH_LINEAGE' | 'DEEP_TREE' | 'INBREEDING_ALERT' | 'OPTIMAL';

interface PedigreeFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (status: FilterStatus) => void;
  totalRecordsCount: number;
  onSelectAllCritical: () => void;
  onSelectAllAlerts: () => void;
  isDark: boolean;
}

const FILTER_ITEMS: { id: FilterStatus; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'WITH_LINEAGE', label: 'Con linaje' },
  { id: 'DEEP_TREE', label: 'Árbol 2G / 3G+' },
  { id: 'INBREEDING_ALERT', label: 'Alertas endogamia' },
  { id: 'OPTIMAL', label: 'Exogamia (0%)' },
];

export default function PedigreeFilterBar({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  totalRecordsCount,
  onSelectAllCritical,
  onSelectAllAlerts,
  isDark,
}: PedigreeFilterBarProps) {
  const active = isDark ? '#60a5fa' : '#0a6ed1';

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
        spacing={1.5}
      >
        {/* Search input */}
        <TextField
          size="small"
          placeholder="Buscar por caravana, raza, lote, padre o madre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flexGrow: 1,
            maxWidth: { md: 380 },
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

        {/* Quick filters (segmented control) + bulk select actions */}
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
            {FILTER_ITEMS.map((item) => {
              const isSelected = filterStatus === item.id;
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
                    color: isSelected ? active : (isDark ? '#94a3b8' : '#64748b'),
                    bgcolor: isSelected ? alpha(active, 0.12) : 'transparent',
                    '&:hover': {
                      bgcolor: isSelected
                        ? alpha(active, 0.16)
                        : (isDark ? 'rgba(255, 255, 255, 0.07)' : '#edf1f5'),
                    },
                    transition: 'background-color 160ms ease, color 160ms ease',
                  }}
                >
                  {item.id === 'ALL' ? `Todos (${totalRecordsCount})` : item.label}
                </Button>
              );
            })}
          </Box>

          {/* Bulk selection helpers (icon-only, revealed on hover) */}
          <Tooltip title="Seleccionar críticos (consanguinidad >12.5%)" arrow>
            <IconButton
              size="small"
              onClick={onSelectAllCritical}
              sx={{
                color: isDark ? '#f87171' : '#dc2626',
                '&:hover': { bgcolor: alpha(isDark ? '#f87171' : '#dc2626', 0.1) },
              }}
            >
              <FuseSvgIcon size={18}>heroicons-outline:shield-exclamation</FuseSvgIcon>
            </IconButton>
          </Tooltip>

          <Tooltip title="Seleccionar alertas (consanguinidad ≥6.25%)" arrow>
            <IconButton
              size="small"
              onClick={onSelectAllAlerts}
              sx={{
                color: isDark ? '#fb923c' : '#d97706',
                '&:hover': { bgcolor: alpha(isDark ? '#fb923c' : '#d97706', 0.1) },
              }}
            >
              <FuseSvgIcon size={18}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
}
