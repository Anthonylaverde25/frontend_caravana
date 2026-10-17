import type { ReactNode } from 'react';
import { Box, Button, IconButton, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PHASE_LABELS } from '../../utils/serviceOrderPhase';
import {
  TRAY_DEADLINE_COLOR,
  TRAY_DEADLINE_LABELS,
  TRAY_DEADLINES,
  TRAY_PHASE_COLOR,
  TRAY_PHASES,
} from '../../utils/diagnosisTray';
import type { DiagnosisTrayFiltersModel } from './useDiagnosisTrayFilters';

interface DiagnosisTrayFiltersProps {
  model: DiagnosisTrayFiltersModel;
  /** Rendered at the end of the bar, e.g. the view switch. */
  endSlot?: ReactNode;
}

interface FilterOption {
  value: string;
  label: string;
  color: string | null;
  count: number;
}

const dotSx = (color: string | null) => ({ width: 8, height: 8, borderRadius: '50%', bgcolor: color ?? 'transparent', flexShrink: 0 });
const countSx = { fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' } as const;
const controlSx = { bgcolor: 'background.paper', borderRadius: '6px' } as const;

interface TrayFilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

/** An outlined select whose value reads "<label> | ● <option> <count>". */
function TrayFilterSelect({ label, value, options, onChange }: TrayFilterSelectProps) {
  return (
    <Select
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ 'aria-label': `Filtrar por ${label.toLowerCase()}` }}
      renderValue={(selected) => {
        const option = options.find((o) => o.value === selected) ?? options[0];
        return (
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary' }}>{label}</Typography>
            <Box sx={{ width: '1px', height: 18, bgcolor: 'divider' }} />
            {option.color && <Box sx={dotSx(option.color)} />}
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, flexGrow: 1 }}>{option.value === 'ALL' ? 'Todos' : option.label}</Typography>
            <Box component="span" sx={{ ...countSx, bgcolor: 'action.hover', borderRadius: '4px', px: 0.75, py: 0.25 }}>
              {option.count}
            </Box>
          </Stack>
        );
      }}
      sx={{ ...controlSx, minWidth: 220 }}
    >
      {options.map((option, index) => (
        <MenuItem key={option.value} value={option.value} divider={index === 0} sx={{ gap: 1.25, fontSize: '0.85rem', opacity: option.count === 0 && option.value !== value ? 0.6 : 1 }}>
          <Box sx={dotSx(option.color)} />
          <Box component="span" sx={{ flexGrow: 1 }}>
            {option.label}
          </Box>
          <Box component="span" sx={countSx}>
            {option.count}
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}

/** Search by order or batch, phase and deadline filters, and how many orders they let through. */
export default function DiagnosisTrayFilters({ model, endSlot }: DiagnosisTrayFiltersProps) {
  const { filters } = model;

  const phaseOptions: FilterOption[] = [
    { value: 'ALL', label: 'Todos los estados', color: null, count: model.phaseTotal },
    ...TRAY_PHASES.map((phase) => ({ value: phase, label: PHASE_LABELS[phase], color: `${TRAY_PHASE_COLOR[phase]}.main`, count: model.phaseCounts[phase] })),
  ];
  const deadlineOptions: FilterOption[] = [
    { value: 'ALL', label: 'Todos los plazos', color: null, count: model.deadlineTotal },
    ...TRAY_DEADLINES.map((deadline) => ({
      value: deadline,
      label: TRAY_DEADLINE_LABELS[deadline],
      color: TRAY_DEADLINE_COLOR[deadline] === 'grey' ? 'grey.400' : `${TRAY_DEADLINE_COLOR[deadline]}.main`,
      count: model.deadlineCounts[deadline],
    })),
  ];

  return (
    <Stack role="search" direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
      <TextField
        size="small"
        placeholder="Buscar por orden o lote"
        value={filters.search}
        onChange={(e) => model.setSearch(e.target.value)}
        slotProps={{
          htmlInput: { 'aria-label': 'Buscar orden o lote' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={18} sx={{ color: 'text.secondary' }}>
                  heroicons-outline:magnifying-glass
                </FuseSvgIcon>
              </InputAdornment>
            ),
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" aria-label="Borrar búsqueda" onClick={() => model.setSearch('')}>
                  <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{ ...controlSx, width: { xs: '100%', sm: 320 } }}
      />
      <TrayFilterSelect label="Estado" value={filters.phase} options={phaseOptions} onChange={(v) => model.setPhase(v as typeof filters.phase)} />
      <TrayFilterSelect label="Plazo" value={filters.deadline} options={deadlineOptions} onChange={(v) => model.setDeadline(v as typeof filters.deadline)} />
      {model.activeCount > 0 && (
        <Button variant="text" onClick={model.reset} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Limpiar filtros
        </Button>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Typography variant="body2" color="text.secondary">
        {model.visibleCount} de {model.totalCount} órdenes
      </Typography>
      {endSlot}
    </Stack>
  );
}
