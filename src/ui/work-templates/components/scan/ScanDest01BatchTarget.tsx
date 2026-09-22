import React, { useEffect, useMemo } from 'react';
import {
  Autocomplete,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useBatches } from '@/features/batches/hooks/useBatches';
import type { Dest01BatchTarget, Dest01HeaderError } from './types';

interface ScanDest01BatchTargetProps {
  /** Batch name read on the sheet. */
  sheetName: string;
  target: Dest01BatchTarget;
  onChange: (target: Dest01BatchTarget) => void;
  headerErrors?: Dest01HeaderError[];
}

const normalize = (name: string): string => name.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Where the weaned calves go. The name read on the sheet proposes an existing weaning batch when
 * it matches one, or a new batch otherwise; what is sent is only what the operator leaves selected.
 */
export const ScanDest01BatchTarget: React.FC<ScanDest01BatchTargetProps> = ({ sheetName, target, onChange, headerErrors = [] }) => {
  const { data: batches = [], isLoading } = useBatches(undefined, 'WEANING');

  const weaningBatches = useMemo(
    () => batches.filter((b) => b.is_active && b.batch_type_code === 'WEANING'),
    [batches]
  );

  useEffect(() => {
    if (target.touched || isLoading) return;
    const match = weaningBatches.find((b) => normalize(b.name) === normalize(sheetName));
    const proposal: Dest01BatchTarget = match
      ? { mode: 'existing', batchId: match.id, name: match.name, touched: false }
      : { mode: 'new', batchId: null, name: sheetName.trim(), touched: false };
    if (proposal.mode !== target.mode || proposal.batchId !== target.batchId || proposal.name !== target.name) {
      onChange(proposal);
    }
  }, [sheetName, weaningBatches, isLoading, target, onChange]);

  const selectedBatch = weaningBatches.find((b) => b.id === target.batchId) ?? null;
  const error = headerErrors.filter((e) => e.field === 'lote_destete').map((e) => e.message).join(' ');

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: error ? 'rgba(220, 38, 38, 0.04)' : undefined }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Box sx={{ minWidth: 220 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1, display: 'block', lineHeight: 1.6 }}>
            Lote de destete
          </Typography>
          <Typography variant="caption" color="text.secondary">
            En la planilla: <strong>{sheetName || 'sin nombre'}</strong>
          </Typography>
        </Box>

        <RadioGroup
          row
          value={target.mode}
          onChange={(e) => onChange({ ...target, mode: e.target.value as Dest01BatchTarget['mode'], touched: true })}
        >
          <FormControlLabel value="existing" control={<Radio size="small" />} label="Lote existente" disabled={weaningBatches.length === 0} />
          <FormControlLabel value="new" control={<Radio size="small" />} label="Crear lote nuevo" />
        </RadioGroup>

        <Box sx={{ flexGrow: 1, minWidth: 260 }}>
          {target.mode === 'existing' ? (
            <Autocomplete
              options={weaningBatches}
              loading={isLoading}
              value={selectedBatch}
              getOptionLabel={(b) => `${b.name}${b.caravans_count != null ? ` (${b.caravans_count} animales)` : ''}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, batch) => onChange({ ...target, batchId: batch?.id ?? null, name: batch?.name ?? '', touched: true })}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Lote de destete activo" required error={Boolean(error)} helperText={error || undefined} />
              )}
            />
          ) : (
            <TextField
              size="small"
              fullWidth
              required
              label="Nombre del lote nuevo"
              value={target.name}
              onChange={(e) => onChange({ ...target, name: e.target.value, touched: true })}
              error={Boolean(error)}
              helperText={error || 'Se crea como lote de destete al confirmar.'}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default ScanDest01BatchTarget;
