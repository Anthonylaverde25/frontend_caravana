import React from 'react';
import { Box, Chip, Collapse, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Dest01HeaderError, Dest01Metadata } from './types';

export const WEANING_TYPES = ['TRADICIONAL', 'ANTICIPADO', 'PRECOZ'] as const;

interface ScanDest01MetadataHeaderProps {
  metadata: Dest01Metadata;
  onChange: <K extends keyof Dest01Metadata>(field: K, value: Dest01Metadata[K]) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  headerErrors?: Dest01HeaderError[];
}

const errorFor = (errors: Dest01HeaderError[], field: keyof Dest01Metadata): string | undefined =>
  errors.filter((e) => e.field === field).map((e) => e.message).join(' ') || undefined;

/** Editable DEST-01 header. The weaning batch itself is chosen in ScanDest01BatchTarget. */
export const ScanDest01MetadataHeader: React.FC<ScanDest01MetadataHeaderProps> = ({
  metadata,
  onChange,
  isOpen = true,
  onToggle,
  headerErrors = [],
}) => {
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
        select
        label="Tipo de Destete"
        value={WEANING_TYPES.includes(metadata.tipo_destete as (typeof WEANING_TYPES)[number]) ? metadata.tipo_destete : ''}
        onChange={(e) => onChange('tipo_destete', e.target.value)}
        size="small"
        fullWidth
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="">Sin indicar</MenuItem>
        {WEANING_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Lote de Cría (Origen)"
        value={metadata.lote_origen}
        onChange={(e) => onChange('lote_origen', e.target.value)}
        size="small"
        fullWidth
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
