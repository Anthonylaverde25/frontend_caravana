import React from 'react';
import { Box, Chip, Collapse, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Dest01HeaderError, Dest01Metadata, Dest01Row } from './types';
import { systemFilledInputSx } from './ScanCact01CategoryCell';
import { useDest01SourceBatch, type Dest01SourceBatch } from '../../hooks/useDest01SourceBatch';

export const WEANING_TYPES = ['TRADICIONAL', 'ANTICIPADO', 'PRECOZ'] as const;

interface ScanDest01MetadataHeaderProps {
  metadata: Dest01Metadata;
  onChange: <K extends keyof Dest01Metadata>(field: K, value: Dest01Metadata[K]) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  headerErrors?: Dest01HeaderError[];
  /** The weaning order declares the type: shown, not asked again. */
  weaningTypeFromOrder?: string | null;
  /** The calves read: where they sit today is the source batch. */
  rows?: Dest01Row[];
}

/** Shown when the paper left the source blank and the screen filled it. */
const SOURCE_FILLED_HINT = 'No lo leyó el escaneo: es el lote en el que el sistema tiene a las crías.';

const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`;

/** The calves the source batch does not account for: unknown tags and calves in no batch. */
const leftOut = (source: Dest01SourceBatch): string =>
  [
    source.notFound > 0 ? `${plural(source.notFound, 'caravana no existe', 'caravanas no existen')} en el sistema` : null,
    source.withoutBatch > 0 ? `${plural(source.withoutBatch, 'cría no está', 'crías no están')} en ningún lote` : null,
  ]
    .filter(Boolean)
    .join(' y ');

/**
 * The source batch field. When the calves share one batch, that batch is the answer: shown
 * read only (grey when the paper left it blank, so it is not taken for what was written), and
 * with a warning when the paper names another one. Otherwise it stays the paper's free text.
 */
const SourceBatchField: React.FC<{ value: string; onChange: (value: string) => void; source: Dest01SourceBatch }> = ({
  value,
  onChange,
  source,
}) => {
  const missing = leftOut(source);

  if (source.status === 'single' && source.batch) {
    const blankOnPaper = value.trim() === '';
    const inBatch = source.distribution[0]?.count ?? 0;
    const helper = [
      source.writtenDiffers
        ? `En la planilla dice «${value.trim()}», pero las crías están en este lote y salen de él.`
        : inBatch === 1
          ? 'La cría está en este lote.'
          : `Las ${inBatch} crías están en este lote.`,
      missing ? `${missing.charAt(0).toUpperCase()}${missing.slice(1)}.` : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Tooltip title={blankOnPaper ? SOURCE_FILLED_HINT : ''}>
        <TextField
          label="Lote de Cría (Origen)"
          value={source.batch.name}
          size="small"
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{ readOnly: true }}
          color={source.writtenDiffers ? 'warning' : undefined}
          focused={source.writtenDiffers || undefined}
          helperText={helper}
          FormHelperTextProps={{ sx: source.writtenDiffers ? { color: 'warning.main' } : undefined }}
          sx={blankOnPaper ? systemFilledInputSx : undefined}
        />
      </Tooltip>
    );
  }

  const helper =
    source.status === 'mixed'
      ? `Las crías están en varios lotes: ${source.distribution.map((share) => `${share.name} (${share.count})`).join(' · ')}.${missing ? ` Además, ${missing}.` : ''}`
      : undefined;

  return (
    <TextField
      label="Lote de Cría (Origen)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      placeholder={source.status === 'mixed' ? 'Varios lotes' : undefined}
      helperText={helper}
      InputLabelProps={{ shrink: true }}
    />
  );
};

const errorFor = (errors: Dest01HeaderError[], field: keyof Dest01Metadata): string | undefined =>
  errors.filter((e) => e.field === field).map((e) => e.message).join(' ') || undefined;

/** Editable DEST-01 header. The weaning batch itself is chosen in ScanDest01BatchTarget. */
export const ScanDest01MetadataHeader: React.FC<ScanDest01MetadataHeaderProps> = ({
  metadata,
  onChange,
  isOpen = true,
  onToggle,
  headerErrors = [],
  weaningTypeFromOrder = null,
  rows = [],
}) => {
  const source = useDest01SourceBatch(rows, metadata.lote_origen);
  const typeRead = metadata.tipo_destete.trim();
  const typeIsKnown = WEANING_TYPES.includes(typeRead as (typeof WEANING_TYPES)[number]);
  // Two boxes crossed, or a word that is none of the three: marked on its cell, to choose one.
  const typeProblem = typeRead !== '' && !typeIsKnown ? `Se leyó «${typeRead}»: elegí un solo tipo o dejalo vacío.` : undefined;

  const fields = (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2, pt: 2.5 }}>
      <TextField
        label="Fecha de Destete"
        type="date"
        value={metadata.fecha_destete}
        onChange={(e) => onChange('fecha_destete', e.target.value)}
        size="small"
        fullWidth
        required
        error={Boolean(errorFor(headerErrors, 'fecha_destete'))}
        helperText={errorFor(headerErrors, 'fecha_destete')}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Orden de Destete (código)"
        value={metadata.orden_destete}
        onChange={(e) => onChange('orden_destete', e.target.value.toUpperCase())}
        size="small"
        fullWidth
        placeholder="Sin orden: planilla en blanco"
        error={Boolean(errorFor(headerErrors, 'orden_destete'))}
        helperText={errorFor(headerErrors, 'orden_destete')}
        InputLabelProps={{ shrink: true }}
        InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 700 } }}
      />
      <TextField
        select
        label="Tipo de Destete"
        value={typeIsKnown ? metadata.tipo_destete : ''}
        onChange={(e) => onChange('tipo_destete', e.target.value)}
        size="small"
        fullWidth
        disabled={Boolean(weaningTypeFromOrder)}
        error={Boolean(typeProblem || errorFor(headerErrors, 'tipo_destete'))}
        helperText={weaningTypeFromOrder ? `Lo declara la orden: ${weaningTypeFromOrder}` : typeProblem ?? errorFor(headerErrors, 'tipo_destete')}
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="">Sin indicar</MenuItem>
        {WEANING_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </MenuItem>
        ))}
      </TextField>
      <SourceBatchField value={metadata.lote_origen} onChange={(value) => onChange('lote_origen', value)} source={source} />
      <TextField
        label="Responsable"
        value={metadata.responsable}
        onChange={(e) => onChange('responsable', e.target.value)}
        size="small"
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Observaciones"
        value={metadata.observaciones}
        onChange={(e) => onChange('observaciones', e.target.value)}
        size="small"
        fullWidth
        sx={{ gridColumn: { lg: 'span 2' } }}
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
              Destete de Crías (DEST-01)
            </Typography>
          </Box>
          <Chip size="small" variant="outlined" label={`Fecha: ${metadata.fecha_destete || '—'}`} sx={{ fontWeight: 700, height: 24, borderRadius: '4px' }} />
          {metadata.tipo_destete && (
            <Chip size="small" variant="outlined" label={metadata.tipo_destete} sx={{ fontWeight: 700, height: 24, borderRadius: '4px' }} />
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

export default ScanDest01MetadataHeader;
