import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useBatches } from '@/features/batches/hooks/useBatches';
import type { Dest01BatchTarget, Dest01HeaderError } from './types';

/** CORRAL / PASTURA as marked on the sheet, as the three states of a batch. */
export const managementOf = (written: string): boolean | null => {
  const value = written.trim().toUpperCase();

  if (value === 'C' || value.includes('CORRAL')) return true;
  if (value === 'P' || value.includes('PASTURA')) return false;

  return null;
};

interface ScanDest01BatchTargetProps {
  /** Batch name read on the sheet. */
  sheetName: string;
  /** The management box of the header, as read. */
  sheetManagement?: string;
  /** The weaning order already declared it: shown, not asked again. */
  inheritedFromOrder?: string | null;
  target: Dest01BatchTarget;
  onChange: (target: Dest01BatchTarget) => void;
  headerErrors?: Dest01HeaderError[];
}

const normalize = (name: string): string => name.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * Where the weaned calves go. The name read on the sheet proposes an existing weaning batch when
 * it matches one, or a new batch otherwise; what is sent is only what the operator leaves selected.
 * A new batch named like a batch of another type (the breeding batch itself, say) is allowed: the
 * screen says so before confirming and advises another name, without forcing it.
 */
export const ScanDest01BatchTarget: React.FC<ScanDest01BatchTargetProps> = ({
  sheetName,
  sheetManagement = '',
  inheritedFromOrder = null,
  target,
  onChange,
  headerErrors = [],
}) => {
  const { data: batches = [], isLoading } = useBatches(undefined, 'WEANING');
  const { data: allBatches = [] } = useBatches();

  const weaningBatches = useMemo(
    () => batches.filter((b) => b.is_active && b.batch_type_code === 'WEANING'),
    [batches]
  );

  useEffect(() => {
    if (target.touched || isLoading) return;
    const match = weaningBatches.find((b) => normalize(b.name) === normalize(sheetName));
    if (inheritedFromOrder) return;
    const proposal: Dest01BatchTarget = match
      ? { mode: 'existing', batchId: match.id, name: match.name, isConfined: null, touched: false }
      : { mode: 'new', batchId: null, name: sheetName.trim(), isConfined: managementOf(sheetManagement), touched: false };
    if (
      proposal.mode !== target.mode ||
      proposal.batchId !== target.batchId ||
      proposal.name !== target.name ||
      proposal.isConfined !== target.isConfined
    ) {
      onChange(proposal);
    }
  }, [sheetName, sheetManagement, inheritedFromOrder, weaningBatches, isLoading, target, onChange]);

  const selectedBatch = weaningBatches.find((b) => b.id === target.batchId) ?? null;

  // Batches of another type that share the name of the batch about to be created. They can never
  // receive the calves, so the new one is still created, as a weaning batch, beside them.
  const sameNameOthers = useMemo(
    () =>
      target.mode === 'new' && target.name.trim() !== ''
        ? allBatches.filter(
            (b) => b.is_active && b.batch_type_code !== 'WEANING' && normalize(b.name) === normalize(target.name)
          )
        : [],
    [allBatches, target.mode, target.name]
  );
  const error = headerErrors.filter((e) => e.field === 'lote_destete').map((e) => e.message).join(' ');

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: error ? 'rgba(220, 38, 38, 0.04)' : undefined }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Box sx={{ minWidth: 220 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1, display: 'block', lineHeight: 1.6 }}>
            Lote de destete
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {inheritedFromOrder ? (
              <>
                Lo declara la orden <strong>{inheritedFromOrder}</strong>
              </>
            ) : (
              <>
                En la planilla: <strong>{sheetName || 'sin nombre'}</strong>
              </>
            )}
          </Typography>
        </Box>

        <RadioGroup
          row
          value={target.mode}
          onChange={(e) => onChange({ ...target, mode: e.target.value as Dest01BatchTarget['mode'], touched: true })}
          sx={inheritedFromOrder ? { pointerEvents: 'none', opacity: 0.7 } : undefined}
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
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <TextField
                size="small"
                fullWidth
                required
                label="Nombre del lote nuevo"
                value={target.name}
                onChange={(e) => onChange({ ...target, name: e.target.value, touched: true })}
                error={Boolean(error)}
                helperText={error || 'Se crea al confirmar.'}
                color={sameNameOthers.length > 0 ? 'warning' : undefined}
                focused={sameNameOthers.length > 0 || undefined}
              />
              <Chip
                label="Tipo: Destete"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mt: 1, flexShrink: 0, fontWeight: 600 }}
              />
              <TextField
                select
                size="small"
                required
                label="Manejo"
                value={target.isConfined === null ? '' : target.isConfined ? 'C' : 'P'}
                onChange={(e) => onChange({ ...target, isConfined: e.target.value === 'C', touched: true })}
                error={target.isConfined === null}
                helperText={target.isConfined === null ? 'Corral o pastura' : ' '}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="C">Corral</MenuItem>
                <MenuItem value="P">Pastura</MenuItem>
              </TextField>
            </Stack>
          )}
        </Box>
      </Stack>

      {sameNameOthers.map((other) => (
        <Alert key={other.id} severity="warning" sx={{ mt: 1.5, borderRadius: '6px' }}>
          Ya existe un lote llamado <strong>{other.name}</strong>
          {other.activity_name ? ` (${other.activity_name}${other.batch_type_name ? ` · ${other.batch_type_name}` : ''})` : ''}
          {other.caravans_count != null ? `, con ${other.caravans_count} animales` : ''}. <strong>No es un lote de destete</strong>{' '}
          y no puede recibir las crías.
          Al confirmar se crea <strong>otro lote, de tipo Destete</strong>, con el mismo nombre. Conviene cambiarle el
          nombre para no confundir los dos lotes.
        </Alert>
      ))}
    </Box>
  );
};

export default ScanDest01BatchTarget;
