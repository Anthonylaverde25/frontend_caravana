import React from 'react';
import { Autocomplete, Box, Chip, Collapse, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { Cact01HeaderError, Cact01Metadata, Cact01Warning } from './types';
import type { Cact01SourceBatchState } from '../../hooks/useCact01SourceBatch';

interface SourceBatchOption {
  id: number;
  name: string;
  activityName: string;
  count: number;
}

interface ActivityOption {
  id: number;
  name: string;
  code: string;
}

interface ScanCact01MetadataHeaderProps {
  metadata: Cact01Metadata;
  onChange: <K extends keyof Cact01Metadata>(field: K, value: Cact01Metadata[K]) => void;
  /** Catalogue the destination activity is resolved against. */
  activities: ActivityOption[];
  sourceBatchId: number | null;
  onSourceBatchChange: (batchId: number | null) => void;
  sourceBatchOptions: SourceBatchOption[];
  /** What the name on the sheet and its animals say about the source batch. */
  sourceResolution?: Cact01SourceBatchState;
  /** The sheet carries a destination per animal: there is no sheet-wide one. */
  perAnimal?: boolean;
  warnings?: Cact01Warning[];
  isOpen?: boolean;
  onToggle?: () => void;
  headerErrors?: Cact01HeaderError[];
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

interface SourceHint {
  text: string;
  tone: 'normal' | 'warning' | 'error';
  /** The batches to pick from when the name and the animals disagree. */
  choices?: { id: number; name: string }[];
}

/**
 * The line under the source batch selector. It always quotes the paper, and says out loud when
 * the batch was inferred from the animals or when the paper and the animals disagree.
 */
function sourceHint(
  written: string,
  selectedId: number | null,
  source: Cact01SourceBatchState | undefined
): SourceHint {
  const paper = `El papel dice: "${written || 'sin nombre'}"`;
  const r = source?.resolution;

  if (!r) {
    return { text: source?.isResolving ? `${paper}. Buscando el lote…` : paper, tone: 'normal' };
  }

  const notFound = r.caravans_not_found > 0 ? `; ${plural(r.caravans_not_found, 'no se encontró', 'no se encontraron')}` : '';

  if (r.basis === 'caravans' && r.proposed && selectedId === r.proposed.id) {
    return {
      text: `${paper}, que no coincide con ningún lote. ${r.caravans_in_match} de ${plural(r.caravans_read, 'caravana está', 'caravanas están')} en "${r.proposed.name}"${notFound}. Confirmá que sea el lote correcto.`,
      tone: 'warning',
    };
  }

  if (r.basis === 'conflict' && r.name_match && r.caravans_match) {
    const settled = selectedId === r.name_match.id || selectedId === r.caravans_match.id;

    return {
      text: `El papel dice "${written}", pero ${r.caravans_in_match} de ${plural(r.caravans_found, 'caravana encontrada está', 'caravanas encontradas están')} en "${r.caravans_match.name}". Elegí cuál es el origen.`,
      tone: settled ? 'warning' : 'error',
      choices: [r.name_match, r.caravans_match].filter((batch) => source!.offered(batch)),
    };
  }

  const inferred = r.proposed ?? r.caravans_match;

  if (inferred && !source!.offered(inferred) && selectedId == null) {
    return {
      text: `${paper}. Las caravanas están en "${inferred.name}", pero ese lote no se ofrece como origen. Elegilo de la lista.`,
      tone: 'error',
    };
  }

  if (r.basis === 'none' && selectedId == null && (written || r.caravans_read > 0)) {
    const spread =
      r.distribution.length > 1
        ? ` Las caravanas están repartidas: ${r.distribution.map((d) => `${d.name} (${d.count})`).join(', ')}.`
        : '';

    return {
      text: `${written ? `No encontramos un lote llamado "${written}"` : 'La planilla no trae el lote de origen'}, ni uno donde estén la mayoría de las caravanas.${spread} Elegilo de la lista.`,
      tone: 'error',
    };
  }

  return { text: paper, tone: 'normal' };
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
  activities,
  sourceBatchId,
  onSourceBatchChange,
  sourceBatchOptions,
  sourceResolution,
  perAnimal = false,
  warnings = [],
  isOpen = true,
  onToggle,
  headerErrors = [],
}) => {
  const activityWarning = warnings.find((w) => w.code === 'ACTIVITY_MISMATCH');
  const selected = sourceBatchOptions.find((option) => option.id === sourceBatchId) ?? null;
  const sourceError = errorFor(headerErrors, 'lote_origen');
  const hint = sourceHint(metadata.lote_origen, sourceBatchId, sourceResolution);
  const sourceTone = sourceError ? 'error' : hint.tone;

  const fields = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2, pt: 2.5 }}>
      <Box>
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
              error={sourceTone === 'error'}
              color={sourceTone === 'warning' ? 'warning' : undefined}
              focused={sourceTone === 'warning' ? true : undefined}
              helperText={sourceError ?? hint.text}
              FormHelperTextProps={sourceTone === 'warning' ? { sx: { color: 'warning.dark' } } : undefined}
            />
          )}
        />
        {!sourceError && hint.choices && hint.choices.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            {hint.choices.map((choice) => (
              <Chip
                key={choice.id}
                size="small"
                label={choice.name}
                color={choice.id === sourceBatchId ? 'primary' : 'default'}
                variant={choice.id === sourceBatchId ? 'filled' : 'outlined'}
                onClick={() => onSourceBatchChange(choice.id)}
              />
            ))}
          </Stack>
        )}
      </Box>

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

      {/* Not a control field like the origin one: this is the restriction itself. Every
          destination of the sheet is resolved inside the activity chosen here, so it is
          picked from the catalogue and never typed. What the paper said stays visible
          underneath, which is how a disagreement becomes noticeable instead of silent. */}
      <TextField
        select
        required
        label="Actividad de Destino"
        value={metadata.actividad_destino_id ?? ''}
        onChange={(e) => {
          const id = e.target.value === '' ? null : Number(e.target.value);

          onChange('actividad_destino_id', id);
          onChange('actividad_destino', activities.find((a) => a.id === id)?.name ?? metadata.actividad_destino);
        }}
        size="small"
        fullWidth
        error={metadata.actividad_destino_id == null}
        helperText={
          metadata.actividad_destino_id == null
            ? metadata.actividad_destino
              ? `La planilla dice "${metadata.actividad_destino}". Confirmá la etapa productiva.`
              : 'Todo lote de destino tiene que pertenecer a esta etapa.'
            : `La planilla decía: ${metadata.actividad_destino || '—'}`
        }
      >
        <MenuItem value="">
          <em>Seleccionar etapa destino…</em>
        </MenuItem>
        {activities.map((activity) => (
          <MenuItem key={activity.id} value={activity.id}>
            {activity.name}
          </MenuItem>
        ))}
      </TextField>

      {/* Read only: what the paper declares about the destination, so a per-animal sheet is never
          mistaken for one with a destination for everybody. Destinations are resolved below. */}
      <TextField
        label="Lote de destino"
        value={perAnimal ? 'Por animal' : metadata.lote_destino || '—'}
        size="small"
        fullWidth
        InputProps={{ readOnly: true }}
        helperText={
          perAnimal
            ? 'No hay un lote destino para toda la planilla: se define en la fila de cada animal.'
            : 'El papel lo declara para todos los animales.'
        }
      />

      {/* The code the sheet was printed with. Editable because it is read off paper: a code
          misread here is an order that never gets its execution recorded. */}
      <TextField
        label="Orden de Transferencia"
        value={metadata.orden_transferencia}
        onChange={(e) => onChange('orden_transferencia', e.target.value.replace(/\s+/g, '').toUpperCase())}
        size="small"
        fullWidth
        placeholder="TR-AAAAMMDD-NNNN"
        error={Boolean(errorFor(headerErrors, 'orden_transferencia'))}
        helperText={errorFor(headerErrors, 'orden_transferencia') ?? 'Vacío si la planilla se llenó sin orden.'}
        inputProps={{ style: { fontFamily: 'monospace' } }}
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
