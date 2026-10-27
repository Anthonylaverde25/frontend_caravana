import { useState } from 'react';
import { Button, Chip, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { SireIdentificationMethod } from '@/features/paternity/hooks/usePendingPaternities';
import { METHOD_LABELS } from './paternityModel';

interface PaternityToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  orders: { key: string; name: string }[];
  order: string;
  onOrder: (key: string) => void;
  pendingCount: number;
  chosenCount: number;
  shownCount: number;
  selectedCount: number;
  onSelectShown: () => void;
  onClearSelection: () => void;
  onApplyMethod: (method: SireIdentificationMethod) => void;
}

/**
 * Above the paternity sheet: search, service order filter, what is already chosen and the same
 * identification method for the marked calves.
 */
export default function PaternityToolbar(props: PaternityToolbarProps) {
  const { search, onSearch, orders, order, onOrder, pendingCount, chosenCount, shownCount, selectedCount } = props;
  const [method, setMethod] = useState<SireIdentificationMethod | ''>('');

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
        <TextField
          size="small"
          placeholder="Buscar cría o madre…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={16} color="action">
                  heroicons-outline:magnifying-glass
                </FuseSvgIcon>
              </InputAdornment>
            ),
          }}
        />
        <TextField select size="small" label="Orden de servicio" value={order} onChange={(e) => onOrder(e.target.value)} sx={{ minWidth: 260 }}>
          <MenuItem value="all">Todas</MenuItem>
          {orders.map((o) => (
            <MenuItem key={o.key} value={o.key}>
              {o.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ px: 1.5, py: 1, borderRadius: '6px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip size="small" label={`${pendingCount} pendientes`} sx={{ fontWeight: 700 }} />
          <Chip size="small" color="primary" label={`${chosenCount} con padre elegido`} sx={{ fontWeight: 700 }} />
          <Typography variant="caption" color="text.secondary">
            {shownCount} visibles · {selectedCount} marcadas
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {selectedCount > 0 && (
            <>
              <TextField
                select
                size="small"
                label="Método para las marcadas"
                value={method}
                onChange={(e) => setMethod(e.target.value as SireIdentificationMethod)}
                sx={{ minWidth: 220 }}
              >
                {(Object.keys(METHOD_LABELS) as SireIdentificationMethod[]).map((m) => (
                  <MenuItem key={m} value={m}>
                    {METHOD_LABELS[m]}
                  </MenuItem>
                ))}
              </TextField>
              <Button size="small" variant="outlined" disabled={method === ''} onClick={() => method && props.onApplyMethod(method)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Aplicar
              </Button>
              <Button size="small" color="inherit" onClick={props.onClearSelection} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                Desmarcar
              </Button>
            </>
          )}
          {shownCount > 0 && (
            <Button size="small" variant="outlined" onClick={props.onSelectShown} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Marcar visibles ({shownCount})
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
