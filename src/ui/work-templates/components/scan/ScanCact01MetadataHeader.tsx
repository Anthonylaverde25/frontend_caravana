import React from 'react';
import { Autocomplete, Box, Chip, Collapse, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { Cact01HeaderError, Cact01Metadata, Cact01Warning } from './types';

interface SourceBatchOption {
  id: number;
  name: string;
  activityName: string;
  count: number;
}

interface ScanCact01MetadataHeaderProps {
  metadata: Cact01Metadata;
  onChange: <K extends keyof Cact01Metadata>(field: K, value: Cact01Metadata[K]) => void;
  sourceBatchId: number | null;
  onSourceBatchChange: (batchId: number | null) => void;
  sourceBatchOptions: SourceBatchOption[];
  /** False when the name printed on the sheet matched no batch of the company. */
  sourceMatched?: boolean;
  warnings?: Cact01Warning[];
  isOpen?: boolean;
  onToggle?: () => void;
  headerErrors?: Cact01HeaderError[];
}

const errorFor = (errors: Cact01HeaderError[], field: string): string | undefined =>
  errors.filter((e) => e.field === field).map((e) => e.message).join(' ') || undefined;

/**
 * Editable CACT-01 header. The destinations are resolved in ScanCact01DestinationsPanel.
 *
 * The two activity fields are CONTROL, not sources of truth: a batch never changes its
 * activity, so what they buy is the ACTIVITY_MISMATCH warning — "the paper says
 * Invernada, this batch is Recría" — instead of a silent disagreement. The truth is the
 * batch the operator picked right above them.
 */
export const ScanCact01MetadataHeader: React.FC<ScanCact01MetadataHeaderProps> = ({
  metadata,
  onChange,
  sourceBatchId,
  onSourceBatchChange,
  sourceBatchOptions,
  sourceMatched = true,
  warnings = [],
  isOpen = true,
  onToggle,
  headerErrors = [],
}) => {
  const activityWarning = warnings.find((w) => w.code === 'ACTIVITY_MISMATCH');
  const selected = sourceBatchOptions.find((option) => option.id === sourceBatchId) ?? null;

  const fields = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2, pt: 2.5 }}>
      <Autocomplete
        options={sourceBatchOptions}
        value={selected}
        onChange={(_, option) => onSourceBatchChange(option?.id ?? null)}
        getOptionLabel={(option) => `${option.name} (${option.count} cab.)`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Lote de origen"
            size="small"
            required
            error={Boolean(errorFor(headerErrors, 'lote_origen')) || Boolean(metadata.lote_origen && !sourceMatched)}
            helperText={
              errorFor(headerErrors, 'lote_origen') ??
              (metadata.lote_origen && !sourceMatched
                ? `No encontramos un lote llamado "${metadata.lote_origen}". Elegilo de la lista.`
                : `El papel dice: "${metadata.lote_origen || 'sin nombre'}"`)
            }
          />
        )}
      />

      <TextField
        label="Fecha del Movimiento"
        type="date"
        value={metadata.fecha_movimiento}
        onChange={(e) => onChange('fecha_movimiento', e.target.value)}
        size="small"
        fullWidth
        required
        error={Boolean(errorFor(headerErrors, 'fecha_movimiento'))}
        helperText={errorFor(headerErrors, 'fecha_movimiento')}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        select
        label="Sistema de Manejo (casillero)"
        value={metadata.sistema_manejo}
        onChange={(e) => onChange('sistema_manejo', e.target.value)}
        size="small"
        fullWidth
        helperText="Propuesta para los lotes que se creen. Nunca pisa un lote existente."
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="">Sin marcar</MenuItem>
        <MenuItem value="CORRAL">A corral (confinado)</MenuItem>
        <MenuItem value="PASTURA">A campo (pastura)</MenuItem>
      </TextField>

      <TextField
        label="Actividad de Origen (control)"
        value={metadata.actividad_origen}
        onChange={(e) => onChange('actividad_origen', e.target.value)}
        size="small"
        fullWidth
        error={Boolean(activityWarning)}
        helperText={activityWarning?.message ?? 'Se compara con la actividad del lote elegido.'}
      />

      <TextField
        label="Actividad de Destino (control)"
        value={metadata.actividad_destino}
        onChange={(e) => onChange('actividad_destino', e.target.value)}
        size="small"
        fullWidth
        helperText="Se compara con la actividad de cada lote de destino."
      />

      <TextField
        label="Responsable / Firma"
        value={metadata.responsable}
        onChange={(e) => onChange('responsable', e.target.value)}
        size="small"
        fullWidth
      />

      <TextField
        label="Total de Cabezas (recuadro)"
        value={metadata.total_cabezas}
        onChange={(e) => onChange('total_cabezas', e.target.value)}
        size="small"
        fullWidth
        helperText="Control contra las filas."
      />

      <TextField
        label="Peso Total de la Tropa (recuadro)"
        value={metadata.peso_total}
        onChange={(e) => onChange('peso_total', e.target.value)}
        size="small"
        fullWidth
        helperText="Control contra las filas."
      />

      <TextField
        label="Observaciones"
        value={metadata.observaciones}
        onChange={(e) => onChange('observaciones', e.target.value)}
        size="small"
        fullWidth
        multiline
        maxRows={3}
      />
    </Box>
  );

  return (
    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ cursor: onToggle ? 'pointer' : 'default' }}
        onClick={onToggle}
      >
        <Box sx={{ pl: 1.5, borderLeft: '3px solid #0a6ed1' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
            Encabezado del movimiento
          </Typography>
        </Box>
        {!isOpen && selected && (
          <Chip size="small" variant="outlined" label={`Origen: ${selected.name}`} sx={{ fontWeight: 700 }} />
        )}
        <Box sx={{ flexGrow: 1 }} />
        {onToggle && (isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />)}
      </Stack>

      {onToggle ? <Collapse in={isOpen}>{fields}</Collapse> : fields}
    </Box>
  );
};

export default ScanCact01MetadataHeader;
