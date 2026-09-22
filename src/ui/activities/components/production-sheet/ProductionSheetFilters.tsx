import { Box, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';

export type ManagementFilter = 'ALL' | 'CONFINED' | 'EXTENSIVE' | 'UNDECLARED';

interface ProductionSheetFiltersProps {
  managementFilter: ManagementFilter;
  onManagementFilterChange: (value: ManagementFilter) => void;
  hideEmptyBatches: boolean;
  onHideEmptyBatchesChange: (value: boolean) => void;
}

/**
 * Filters of the production sheet.
 *
 * Filtering by management system is what makes it possible to compare the weight gain
 * of penned batches against grazing ones — the concrete payoff of keeping the
 * management system apart from the batch type.
 *
 * Now that the management system is asked for in every productive activity, batches
 * that predate the question are visible as their own option instead of quietly falling
 * out of both sides of the filter. That turns the gap into a work list.
 */
export default function ProductionSheetFilters({
  managementFilter,
  onManagementFilterChange,
  hideEmptyBatches,
  onHideEmptyBatchesChange
}: ProductionSheetFiltersProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        select
        size="small"
        label="Sistema de manejo"
        value={managementFilter}
        onChange={(e) => onManagementFilterChange(e.target.value as ManagementFilter)}
        sx={{ minWidth: 180, bgcolor: 'white' }}
        helperText={
          managementFilter === 'UNDECLARED'
            ? 'Lotes a los que nadie les declaró el manejo'
            : managementFilter === 'ALL'
              ? ''
              : 'Sólo lotes que declararon su manejo'
        }
        FormHelperTextProps={{ sx: { fontSize: '0.6rem', ml: 0 } }}
      >
        <MenuItem value="ALL">Todos</MenuItem>
        <MenuItem value="EXTENSIVE">A campo (extensivo)</MenuItem>
        <MenuItem value="CONFINED">A corral (confinado)</MenuItem>
        <MenuItem value="UNDECLARED">Sin declarar</MenuItem>
      </TextField>

      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={hideEmptyBatches}
            onChange={(e) => onHideEmptyBatchesChange(e.target.checked)}
          />
        }
        label={
          <Box sx={{ userSelect: 'none' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.1 }}>
              Ocultar lotes vacíos
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Los lotes vacíos siguen siendo reutilizables
            </Typography>
          </Box>
        }
      />
    </Stack>
  );
}
