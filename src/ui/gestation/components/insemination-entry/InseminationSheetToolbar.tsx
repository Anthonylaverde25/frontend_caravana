import { Button, Chip, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { INSEMINATION_FILTERS, INSEMINATION_FILTER_LABELS, type InseminationFilter } from './inseminationEntryModel';

interface InseminationSheetToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  filter: InseminationFilter;
  onFilter: (filter: InseminationFilter) => void;
  counts: Record<InseminationFilter, number>;
  shownSelectable: number;
  selectedCount: number;
  onSelectShown: () => void;
  onClearSelection: () => void;
}

const toggleSx = { px: 1.25, py: 0.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' } as const;

/** Above the insemination sheet: search, filters with their counts and the marked rows. */
export default function InseminationSheetToolbar(props: InseminationSheetToolbarProps) {
  const { search, onSearch, filter, onFilter, counts, shownSelectable, selectedCount } = props;

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1} alignItems={{ xl: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar vientre…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ minWidth: { sm: 200 }, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={16} color="action">heroicons-outline:magnifying-glass</FuseSvgIcon>
              </InputAdornment>
            ),
          }}
        />
        <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, value) => value && onFilter(value)}>
          {INSEMINATION_FILTERS.map((f) => (
            <ToggleButton key={f} value={f} sx={toggleSx}>
              {INSEMINATION_FILTER_LABELS[f]} ({counts[f]})
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 1.5, py: 1, borderRadius: '6px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip size="small" color="primary" label={`${selectedCount} marcadas para registrar`} sx={{ fontWeight: 700 }} />
          <Typography variant="caption" color="text.secondary">
            Marcá los vientres que pasaron por la manga; todo viene precargado.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          {selectedCount > 0 && (
            <Button size="small" color="inherit" onClick={props.onClearSelection} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Desmarcar
            </Button>
          )}
          {shownSelectable > 0 && (
            <Button size="small" variant="outlined" onClick={props.onSelectShown} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Marcar visibles ({shownSelectable})
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
