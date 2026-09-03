import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Chip,
  Collapse,
  TextField,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { Tor01Metadata } from './types';

interface ScanTor01MetadataHeaderProps {
  metadata: Tor01Metadata;
  onChange: <K extends keyof Tor01Metadata>(field: K, value: Tor01Metadata[K]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ScanTor01MetadataHeader: React.FC<ScanTor01MetadataHeaderProps> = ({
  metadata,
  onChange,
  isOpen,
  onToggle,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#fcfcfd',
      }}
    >
      {/* Clickable Header Bar with Summary Chips */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={onToggle}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Box
            sx={{
              pl: 1.5,
              borderLeft: '3px solid #0a6ed1',
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              Parámetros de Revisación Andrológica (TOR-01)
            </Typography>
          </Box>

          <Chip
            size="small"
            label={
              metadata.farm_name
                ? `Campo: ${metadata.farm_name}`
                : 'Sin Establecimiento'
            }
            color={metadata.farm_name ? 'primary' : 'default'}
            variant="outlined"
            sx={{
              fontWeight: 700,
              height: 24,
              fontSize: '0.75rem',
              borderRadius: '4px',
            }}
          />

          {metadata.veterinarian_name && (
            <Chip
              size="small"
              label={`Vet: ${metadata.veterinarian_name} ${metadata.veterinarian_license ? `(${metadata.veterinarian_license})` : ''}`}
              color="info"
              variant="outlined"
              sx={{
                fontWeight: 700,
                height: 24,
                fontSize: '0.75rem',
                borderRadius: '4px',
              }}
            />
          )}

          <Chip
            size="small"
            label={`Ronda R${metadata.sample_round || 1}`}
            color="warning"
            variant="outlined"
            sx={{
              fontWeight: 700,
              height: 24,
              fontSize: '0.75rem',
              borderRadius: '4px',
            }}
          />

          {metadata.evaluation_date && (
            <Chip
              size="small"
              label={`Fecha: ${metadata.evaluation_date}`}
              variant="outlined"
              sx={{
                fontWeight: 600,
                height: 24,
                fontSize: '0.75rem',
                borderRadius: '4px',
              }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {isOpen ? 'Ocultar Parámetros' : 'Editar Metadatos'}
          </Typography>
          {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Stack>
      </Box>

      {/* Collapsible Form Grid */}
      <Collapse in={isOpen}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(6, 1fr)',
            },
            gap: 2,
            pt: 2.5,
            mt: 1.5,
            borderTop: '1px dashed',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          }}
        >
          {/* 1. Establecimiento */}
          <TextField
            label="Establecimiento / Campo"
            placeholder="Ej: La Juanita"
            value={metadata.farm_name}
            onChange={(e) => onChange('farm_name', e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* 2. RENSPA */}
          <TextField
            label="RENSPA"
            placeholder="02.001.0.00001/01"
            value={metadata.renspa}
            onChange={(e) => onChange('renspa', e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* 3. Fecha de Evaluación */}
          <TextField
            label="Fecha de Evaluación"
            type="date"
            value={metadata.evaluation_date}
            onChange={(e) => onChange('evaluation_date', e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* 4. Veterinario */}
          <TextField
            label="Médico Veterinario Actuante"
            placeholder="Dr. Esteban Rossi"
            value={metadata.veterinarian_name}
            onChange={(e) => onChange('veterinarian_name', e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* 5. Matrícula Profesional */}
          <TextField
            label="Matrícula Profesional (MP)"
            placeholder="MP: 4892-BA"
            value={metadata.veterinarian_license}
            onChange={(e) => onChange('veterinarian_license', e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* 6. Ronda de Raspaje */}
          <TextField
            select
            label="Ronda de Raspaje ETS"
            value={metadata.sample_round || 1}
            onChange={(e) => onChange('sample_round', Number(e.target.value))}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value={1}>R1 (Primer Raspaje)</MenuItem>
            <MenuItem value={2}>R2 (Segundo Raspaje)</MenuItem>
          </TextField>
        </Box>

        {/* Quick Carrillo Banner */}
        <Box
          sx={{
            mt: 2,
            p: 1.25,
            borderRadius: '6px',
            bgcolor: isDark ? alpha('#0284c7', 0.1) : '#f0f9ff',
            border: '1px solid',
            borderColor: isDark ? alpha('#0284c7', 0.3) : '#bae6fd',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369a1' }}>
            Criterio Carrillo (1988):
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            • CE mínima: <strong>≥ 28.0 cm</strong> (descarte zootécnico automático si es inferior)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            • CC óptima de servicio: <strong>3.0 a 3.5</strong> (escala 1 a 5)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            • Muestreo Sanitario: <strong>2 raspajes ETS negativos</strong> + Serología BPA Brucelosis limpia
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ScanTor01MetadataHeader;
