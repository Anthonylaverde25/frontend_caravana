import React, { useEffect, useMemo } from 'react';
import { Autocomplete, Box, Chip, Collapse, Stack, TextField, Typography } from '@mui/material';
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { Lser01HeaderError, Lser01Metadata } from './types';

interface ScanLser01MetadataHeaderProps {
  metadata: Lser01Metadata;
  onChange: <K extends keyof Lser01Metadata>(field: K, value: Lser01Metadata[K]) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  headerErrors?: Lser01HeaderError[];
}

const errorFor = (errors: Lser01HeaderError[], field: keyof Lser01Metadata): string | undefined =>
  errors.filter((e) => e.field === field).map((e) => e.message).join(' ') || undefined;

/**
 * Editable LSER-01 header: the Cría batch that enters service (picked, never typed), the single
 * bull and the service dates. The scan brings the pre-printed batch ID, or at least its name.
 */
export const ScanLser01MetadataHeader: React.FC<ScanLser01MetadataHeaderProps> = ({
  metadata,
  onChange,
  isOpen = true,
  onToggle,
  headerErrors = [],
}) => {
  const bullError = errorFor(headerErrors, 'toro_caravana');
  const batchError = errorFor(headerErrors, 'batch_id' as keyof Lser01Metadata);

  const { data: batches = [] } = useBatches(undefined, undefined, 'own');
  const criaBatches = useMemo(() => batches.filter((b) => b.isCria() && !b.provider_id), [batches]);
  const selectedBatch = criaBatches.find((b) => b.id === metadata.lote_id) ?? null;

  // The ID printed on the sheet is unreadable or missing: resolve the batch by the name read.
  useEffect(() => {
    if (metadata.lote_id !== null || !metadata.lote.trim()) return;
    const byName = criaBatches.find((b) => b.name.trim().toLowerCase() === metadata.lote.trim().toLowerCase());
    if (byName) onChange('lote_id', byName.id);
  }, [metadata.lote_id, metadata.lote, criaBatches, onChange]);

  const fields = (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 2,
        pt: 2.5,
      }}
    >
      <Autocomplete
        options={criaBatches}
        value={selectedBatch}
        getOptionLabel={(option) => `${option.name} (ID ${option.id})`}
        getOptionDisabled={(option) => option.hasActiveService()}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_, value) => {
          onChange('lote_id', value?.id ?? null);
          onChange('lote', value?.name ?? '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Lote que entra en servicio"
            size="small"
            required
            error={Boolean(batchError) || (metadata.lote_id === null && Boolean(metadata.lote))}
            helperText={
              batchError ??
              (metadata.lote_id === null && metadata.lote ? `Leído en la hoja: "${metadata.lote}". Elegí el lote.` : undefined)
            }
            InputLabelProps={{ shrink: true }}
          />
        )}
      />
      <TextField
        label="Caravana del Toro"
        value={metadata.toro_caravana}
        onChange={(e) => onChange('toro_caravana', e.target.value)}
        size="small"
        fullWidth
        required
        error={Boolean(bullError)}
        helperText={bullError}
        InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 800 } }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Responsable"
        value={metadata.responsable}
        onChange={(e) => onChange('responsable', e.target.value)}
        size="small"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Fecha Inicio de Servicio"
        type="date"
        value={metadata.planned_start_date}
        onChange={(e) => onChange('planned_start_date', e.target.value)}
        size="small"
        fullWidth
        required
        error={Boolean(errorFor(headerErrors, 'planned_start_date'))}
        helperText={errorFor(headerErrors, 'planned_start_date')}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Fecha Fin de Servicio"
        type="date"
        value={metadata.planned_end_date}
        onChange={(e) => onChange('planned_end_date', e.target.value)}
        size="small"
        fullWidth
        error={Boolean(errorFor(headerErrors, 'planned_end_date'))}
        helperText={errorFor(headerErrors, 'planned_end_date')}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Observaciones"
        value={metadata.observaciones}
        onChange={(e) => onChange('observaciones', e.target.value)}
        size="small"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
    </Box>
  );

  if (!onToggle) {
    return fields;
  }

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        onClick={onToggle}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Box sx={{ pl: 1.5, borderLeft: '3px solid #0a6ed1' }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
              Acta de Inicio de Servicio (LSER-01)
            </Typography>
          </Box>
          <Chip
            size="small"
            variant="outlined"
            color={metadata.toro_caravana ? 'primary' : 'default'}
            label={metadata.toro_caravana ? `Toro: ${metadata.toro_caravana}` : 'Sin toro'}
            sx={{ fontWeight: 700, height: 24, borderRadius: '4px' }}
          />
          {(selectedBatch || metadata.lote) && (
            <Chip
              size="small"
              variant="outlined"
              color={selectedBatch ? 'primary' : 'warning'}
              label={`Lote: ${selectedBatch?.name ?? metadata.lote}`}
              sx={{ fontWeight: 700, height: 24, borderRadius: '4px' }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {isOpen ? 'Ocultar Encabezado' : 'Editar Encabezado'}
          </Typography>
          {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Stack>
      </Box>
      <Collapse in={isOpen}>{fields}</Collapse>
    </Box>
  );
};

export default ScanLser01MetadataHeader;
