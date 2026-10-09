import React from 'react';
import {
  Box,
  Stack,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  Chip,
  InputAdornment,
  IconButton,
  Typography,
  useTheme,
  alpha,
  Badge,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import {
  BatchFiltersState,
  BatchFilterSummaryKPIs,
  BatchOptionCount,
  BatchOperationalStatus,
  BatchLifecycleStatus,
} from './types';

interface BatchFiltersBarProps {
  filters: BatchFiltersState;
  onSearchChange: (search: string) => void;
  onActivityChange: (activityId: number | 'ALL') => void;
  onBatchTypeChange: (batchTypeId: number | 'ALL') => void;
  onFarmChange: (farmId: number | 'ALL') => void;
  onLifecycleStatusChange: (status: BatchLifecycleStatus) => void;
  onOperationalStatusChange: (status: BatchOperationalStatus) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
  activityOptions: BatchOptionCount[];
  batchTypeOptions: BatchOptionCount[];
  farmOptions: BatchOptionCount[];
  summaryKPIs: BatchFilterSummaryKPIs;
  totalAvailableBatches: number;
}

export const BatchFiltersBar: React.FC<BatchFiltersBarProps> = ({
  filters,
  onSearchChange,
  onActivityChange,
  onBatchTypeChange,
  onFarmChange,
  onLifecycleStatusChange,
  onOperationalStatusChange,
  onResetFilters,
  activeFiltersCount,
  activityOptions,
  batchTypeOptions,
  farmOptions,
  summaryKPIs,
  totalAvailableBatches,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
  const controlBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff';

  const operationalStatusOptions: {
    id: BatchOperationalStatus;
    label: string;
    icon: string;
  }[] = [
    { id: 'ALL', label: 'Todos los lotes', icon: 'heroicons-outline:rectangle-stack' },
    { id: 'IN_SERVICE', label: 'En Entore', icon: 'heroicons-outline:fire' },
    { id: 'WITH_ANIMALS', label: 'Con Hacienda', icon: 'heroicons-outline:users' },
    { id: 'EMPTY', label: 'Vacíos', icon: 'heroicons-outline:minus-circle' },
  ];

  return (
    <Box
      sx={{
        p: 2.5,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: isDark ? 'background.default' : '#f8fafc',
      }}
    >
      {/* Top Row: Search Input */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Buscar lote por nombre, actividad, establecimiento o notas..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={18} sx={{ color: 'text.secondary' }}>
                  heroicons-outline:magnifying-glass
                </FuseSvgIcon>
              </InputAdornment>
            ),
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                  <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            width: { xs: '100%', md: 460 },
            bgcolor: controlBg,
            borderRadius: '6px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor,
            },
          }}
        />
      </Box>

      {/* Second Row: Specific Category Selectors (Operational Status, Activity, Type, Farm, Lifecycle) + Reset Action */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        flexWrap="wrap"
        useFlexGap
      >
        {/* Operational Status Filter */}
        <FormControl size="small" sx={{ minWidth: 190, bgcolor: controlBg, borderRadius: '6px' }}>
          <Select
            value={filters.operationalStatus}
            onChange={(e) => onOperationalStatusChange(e.target.value as BatchOperationalStatus)}
            displayEmpty
            renderValue={(selected) => {
              if (selected === 'ALL') {
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FuseSvgIcon size={16} sx={{ color: 'text.secondary' }}>
                      heroicons-outline:rectangle-stack
                    </FuseSvgIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                      Todos los Lotes
                    </Typography>
                  </Stack>
                );
              }
              const opt = operationalStatusOptions.find((o) => o.id === selected);
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <FuseSvgIcon size={16} sx={{ color: 'primary.main' }}>
                    {opt?.icon || 'heroicons-outline:rectangle-stack'}
                  </FuseSvgIcon>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.main' }}>
                    {opt?.label || selected}
                  </Typography>
                </Stack>
              );
            }}
            sx={{
              borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor },
            }}
          >
            {operationalStatusOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <FuseSvgIcon size={16} sx={{ color: 'text.secondary' }}>
                    {opt.icon}
                  </FuseSvgIcon>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                    {opt.label}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Activity Filter */}
        <FormControl size="small" sx={{ minWidth: 200, bgcolor: controlBg, borderRadius: '6px' }}>
          <Select
            value={filters.activityId}
            onChange={(e) => {
              const val = e.target.value;
              onActivityChange(val === 'ALL' ? 'ALL' : Number(val));
            }}
            displayEmpty
            renderValue={(selected) => {
              if (selected === 'ALL') {
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FuseSvgIcon size={16} sx={{ color: 'text.secondary' }}>
                      heroicons-outline:tag
                    </FuseSvgIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                      Todas las Actividades
                    </Typography>
                  </Stack>
                );
              }
              const opt = activityOptions.find((o) => o.id === selected);
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <FuseSvgIcon size={16} sx={{ color: 'primary.main' }}>
                    heroicons-outline:tag
                  </FuseSvgIcon>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.main' }}>
                    {opt?.name || `Actividad #${selected}`}
                  </Typography>
                </Stack>
              );
            }}
            sx={{
              borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor },
            }}
          >
            <MenuItem value="ALL">
              <em>Todas las Actividades</em>
            </MenuItem>
            {activityOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ width: '100%' }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                    {opt.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={opt.count}
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: 'action.hover',
                    }}
                  />
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Batch Type Filter */}
        <FormControl size="small" sx={{ minWidth: 200, bgcolor: controlBg, borderRadius: '6px' }}>
          <Select
            value={filters.batchTypeId}
            onChange={(e) => {
              const val = e.target.value;
              onBatchTypeChange(val === 'ALL' ? 'ALL' : Number(val));
            }}
            displayEmpty
            renderValue={(selected) => {
              if (selected === 'ALL') {
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FuseSvgIcon size={16} sx={{ color: 'text.secondary' }}>
                      heroicons-outline:squares-2x2
                    </FuseSvgIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                      Todos los Tipos
                    </Typography>
                  </Stack>
                );
              }
              const opt = batchTypeOptions.find((o) => o.id === selected);
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <FuseSvgIcon size={16} sx={{ color: 'primary.main' }}>
                    heroicons-outline:squares-2x2
                  </FuseSvgIcon>
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.main' }}>
                    {opt?.name || `Tipo #${selected}`}
                  </Typography>
                </Stack>
              );
            }}
            sx={{
              borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor },
            }}
          >
            <MenuItem value="ALL">
              <em>Todos los Tipos de Lote</em>
            </MenuItem>
            {batchTypeOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ width: '100%' }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                    {opt.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={opt.count}
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      bgcolor: 'action.hover',
                    }}
                  />
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Farm Filter (if farms available) */}
        {farmOptions.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 190, bgcolor: controlBg, borderRadius: '6px' }}>
            <Select
              value={filters.farmId}
              onChange={(e) => {
                const val = e.target.value;
                onFarmChange(val === 'ALL' ? 'ALL' : Number(val));
              }}
              displayEmpty
              renderValue={(selected) => {
                if (selected === 'ALL') {
                  return (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FuseSvgIcon size={16} sx={{ color: 'text.secondary' }}>
                        heroicons-outline:building-office-2
                      </FuseSvgIcon>
                      <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                        Todos los Campos
                      </Typography>
                    </Stack>
                  );
                }
                const opt = farmOptions.find((o) => o.id === selected);
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FuseSvgIcon size={16} sx={{ color: 'primary.main' }}>
                      heroicons-outline:building-office-2
                    </FuseSvgIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
                      {opt?.name || `Campo #${selected}`}
                    </Typography>
                  </Stack>
                );
              }}
              sx={{
                borderRadius: '6px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor },
              }}
            >
              <MenuItem value="ALL">
                <em>Todos los Campos / Fincas</em>
              </MenuItem>
              {farmOptions.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ width: '100%' }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                      {opt.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={opt.count}
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: 'action.hover',
                      }}
                    />
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Lifecycle Status Filter (Active / Inactive) */}
        <FormControl size="small" sx={{ minWidth: 140, bgcolor: controlBg, borderRadius: '6px' }}>
          <Select
            value={filters.lifecycleStatus}
            onChange={(e) => onLifecycleStatusChange(e.target.value as BatchLifecycleStatus)}
            displayEmpty
            renderValue={(selected) => (
              <Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>
                {selected === 'ALL'
                  ? 'Todos los estados'
                  : selected === 'ACTIVE'
                  ? 'Solo Activos'
                  : 'Solo Inactivos'}
              </Typography>
            )}
            sx={{
              borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor },
            }}
          >
            <MenuItem value="ALL">Todos los estados</MenuItem>
            <MenuItem value="ACTIVE">Solo Activos</MenuItem>
            <MenuItem value="INACTIVE">Solo Inactivos</MenuItem>
          </Select>
        </FormControl>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            size="small"
            variant="outlined"
            onClick={onResetFilters}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>}
            sx={{
              borderRadius: '6px',
              textTransform: 'none',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'text.secondary',
              borderColor,
              bgcolor: controlBg,
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.secondary',
              },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <span>Limpiar filtros</span>
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
              />
            </Stack>
          </Button>
        )}
      </Stack>

      {/* Summary KPI Strip */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{
          mt: 2,
          pt: 1.5,
          borderTop: '1px dashed',
          borderColor,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap gap={1}>
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.5px',
            }}
          >
            Resultados:
          </Typography>

          <Chip
            size="small"
            variant="outlined"
            icon={<FuseSvgIcon size={14}>heroicons-outline:rectangle-stack</FuseSvgIcon>}
            label={`${summaryKPIs.totalBatches} de ${totalAvailableBatches} lotes`}
            sx={{
              fontSize: '0.74rem',
              fontWeight: 700,
              borderColor,
              bgcolor: controlBg,
            }}
          />

          <Chip
            size="small"
            variant="outlined"
            icon={<FuseSvgIcon size={14}>heroicons-outline:users</FuseSvgIcon>}
            label={`${summaryKPIs.totalHeads.toLocaleString()} Cabezas`}
            sx={{
              fontSize: '0.74rem',
              fontWeight: 700,
              borderColor,
              bgcolor: controlBg,
              color: 'primary.main',
            }}
          />

          {summaryKPIs.inServiceCount > 0 && (
            <Chip
              size="small"
              icon={
                <FuseSvgIcon size={14} sx={{ color: '#ea580c !important' }}>
                  heroicons-outline:fire
                </FuseSvgIcon>
              }
              label={`${summaryKPIs.inServiceCount} en Entore`}
              sx={{
                fontSize: '0.74rem',
                fontWeight: 800,
                bgcolor: alpha('#ea580c', 0.12),
                color: '#ea580c',
                border: '1px solid',
                borderColor: alpha('#ea580c', 0.35),
              }}
            />
          )}

          {summaryKPIs.averageWeightKg != null && (
            <Chip
              size="small"
              variant="outlined"
              icon={<FuseSvgIcon size={14}>heroicons-outline:scale</FuseSvgIcon>}
              label={`Promedio: ${summaryKPIs.averageWeightKg} kg/cab`}
              sx={{
                fontSize: '0.74rem',
                fontWeight: 600,
                borderColor,
                bgcolor: controlBg,
              }}
            />
          )}
        </Stack>

        {activeFiltersCount > 0 && (
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} aplicado{activeFiltersCount > 1 ? 's' : ''}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
