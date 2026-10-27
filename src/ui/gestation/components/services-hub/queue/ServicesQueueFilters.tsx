import { InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ServicesQueueModel } from './useServicesQueue';

interface ServicesQueueFiltersProps {
  model: ServicesQueueModel;
  batchOptions: { id: number; name: string }[];
}

const fieldSx = { bgcolor: 'action.hover' } as const;

/** Search and batch filters of the queue; the phase filter is the strip above. */
export default function ServicesQueueFilters({ model, batchOptions }: ServicesQueueFiltersProps) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
      <TextField
        variant="filled"
        size="small"
        placeholder="Buscar por código o lote…"
        value={model.filters.search}
        onChange={(event) => model.setSearch(event.target.value)}
        sx={{ ...fieldSx, minWidth: { md: 320 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        select
        variant="filled"
        size="small"
        label="Lote"
        value={model.filters.batchId}
        onChange={(event) => model.setBatchId(event.target.value === 'ALL' ? 'ALL' : Number(event.target.value))}
        sx={{ ...fieldSx, minWidth: 200 }}
      >
        <MenuItem value="ALL">Todos los lotes</MenuItem>
        {batchOptions.map((batch) => (
          <MenuItem key={batch.id} value={batch.id}>
            {batch.name}
          </MenuItem>
        ))}
      </TextField>
      <Typography variant="caption" color="text.secondary" sx={{ ml: { md: 'auto !important' } }}>
        {model.visibleCount} de {model.totalCount} órdenes · ordenadas por cercanía al cierre
      </Typography>
    </Stack>
  );
}
