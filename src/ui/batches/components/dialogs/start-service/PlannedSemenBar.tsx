import { useState } from 'react';
import { Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SemenCoverageAlert from '@/ui/semen/components/coverage/SemenCoverageAlert';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';

interface PlannedSemenBarProps {
  options: SemenOption[];
  byId: Map<number, SemenOption>;
  plannedStraws: Record<number, number>;
  onApplyToAll: (itemId: number | null) => void;
}

/** "Aplicar a todos" for the typical IATF with one semen, and the coverage of what is planned (IA4, IA5). */
export default function PlannedSemenBar({ options, byId, plannedStraws, onApplyToAll }: PlannedSemenBarProps) {
  const [itemId, setItemId] = useState<number | ''>('');

  return (
    <Stack spacing={1}>
      <Paper elevation={0} sx={{ p: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Semen previsto
        </Typography>
        <TextField
          select
          size="small"
          value={itemId}
          onChange={(e) => setItemId(e.target.value === '' ? '' : Number(e.target.value))}
          SelectProps={{ displayEmpty: true }}
          sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.8rem' } }}
        >
          <MenuItem value="" sx={{ fontSize: '0.8rem' }}>
            {options.length === 0 ? 'No hay semen activo en el inventario' : 'Elegí un semen'}
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.itemId} value={option.itemId} sx={{ fontSize: '0.8rem' }}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Button
          size="small"
          variant="outlined"
          disabled={itemId === ''}
          onClick={() => onApplyToAll(itemId === '' ? null : itemId)}
          startIcon={<FuseSvgIcon size={15}>heroicons-outline:arrow-down-on-square-stack</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: 32 }}
        >
          Aplicar a todos los seleccionados
        </Button>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Opcional: lo que quede en blanco se decide en la manga.
        </Typography>
      </Paper>
      <SemenCoverageAlert straws={plannedStraws} byId={byId} />
    </Stack>
  );
}
