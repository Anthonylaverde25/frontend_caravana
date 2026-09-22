import React from 'react';
import { Box, Chip, Collapse, Stack, TextField, Typography } from '@mui/material';
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
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

/** Editable LSER-01 header: the batch name, the single bull and the service dates. */
export const ScanLser01MetadataHeader: React.FC<ScanLser01MetadataHeaderProps> = ({
  metadata,
  onChange,
  isOpen = true,
  onToggle,
  headerErrors = [],
}) => {
  const bullError = errorFor(headerErrors, 'toro_caravana');

  const fields = (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 2,
        pt: 2.5,
      }}
    >
      <TextField
        label="Nombre del Lote de Servicio"
        value={metadata.lote}
        onChange={(e) => onChange('lote', e.target.value)}
        size="small"
        fullWidth
        required
        error={Boolean(errorFor(headerErrors, 'lote'))}
        helperText={errorFor(headerErrors, 'lote')}
        InputLabelProps={{ shrink: true }}
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
              Lote de Servicio de Toro Único (LSER-01)
            </Typography>
          </Box>
          <Chip
            size="small"
            variant="outlined"
            color={metadata.toro_caravana ? 'primary' : 'default'}
            label={metadata.toro_caravana ? `Toro: ${metadata.toro_caravana}` : 'Sin toro'}
            sx={{ fontWeight: 700, height: 24, borderRadius: '4px' }}
          />
          {metadata.lote && (
            <Chip size="small" variant="outlined" label={`Lote: ${metadata.lote}`} sx={{ fontWeight: 700, height: 24, borderRadius: '4px' }} />
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
