import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface BullPhysicalExamSectionProps {
  scrotalCircumference: string;
  onScrotalCircumferenceChange: (val: string) => void;
  bodyConditionScore: string;
  onBodyConditionScoreChange: (val: string) => void;
  libido: string;
  onLibidoChange: (val: string) => void;
  aplomoNotes: string;
  onAplomoNotesChange: (val: string) => void;
  observations: string;
  onObservationsChange: (val: string) => void;
}

export const BullPhysicalExamSection: React.FC<BullPhysicalExamSectionProps> = ({
  scrotalCircumference,
  onScrotalCircumferenceChange,
  bodyConditionScore,
  onBodyConditionScoreChange,
  libido,
  onLibidoChange,
  aplomoNotes,
  onAplomoNotesChange,
  observations,
  onObservationsChange,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const primaryColor = isDark ? '#60a5fa' : '#0a6ed1';
  const successColor = isDark ? '#34d399' : '#107e3e';
  const errorColor = isDark ? '#f87171' : '#dc2626';

  const ceValue = parseFloat(scrotalCircumference);
  const isCeValid = !isNaN(ceValue) && ceValue >= 28;
  const isCeBelowThreshold = !isNaN(ceValue) && ceValue < 28;

  const cePresets = ['28', '30', '32', '34', '36', '38'];
  const ccPresets = ['2.5', '3.0', '3.5', '4.0'];

  const aplomoPresets = [
    { label: '✓ Correctos / Normales', value: 'Correctos, miembros y pezuñas sanas sin lesiones.' },
    { label: 'Lesión Podal Leve', value: 'Lesión podal leve en miembro posterior, requiere cura.' },
    { label: 'Garrones Rectos', value: 'Conformación de garrones rectos con desgaste anormal.' },
    { label: 'Descarte Locomotor', value: 'Artritis / defecto severo locomotor incompatible con entore.' },
  ];

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
        1. Biometría Andrológica & Evaluación Física
      </Typography>

      <Grid container spacing={2}>
        {/* Circunferencia Escrotal */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                Circunferencia Escrotal (CE)
              </Typography>
              {isCeValid && (
                <Chip
                  size="small"
                  label="✓ Apto (≥ 28 cm)"
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    bgcolor: alpha(successColor, 0.15),
                    color: successColor,
                  }}
                />
              )}
              {isCeBelowThreshold && (
                <Chip
                  size="small"
                  label="⚠ Insuficiente (< 28 cm)"
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    bgcolor: alpha(errorColor, 0.15),
                    color: errorColor,
                  }}
                />
              )}
            </Box>

            <TextField
              fullWidth
              variant="filled"
              type="number"
              inputProps={{ step: '0.5', min: '15', max: '60' }}
              value={scrotalCircumference}
              onChange={(e) => onScrotalCircumferenceChange(e.target.value)}
              placeholder="Ej. 34.0"
              size="small"
              sx={{
                '& .MuiFilledInput-root': {
                  borderRadius: '6px',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                },
              }}
            />

            {/* 1-Click CE Presets */}
            <Stack direction="row" spacing={0.75} sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', alignSelf: 'center', mr: 0.5 }}>
                Rápido:
              </Typography>
              {cePresets.map((preset) => (
                <Chip
                  key={preset}
                  size="small"
                  clickable
                  label={`${preset} cm`}
                  onClick={() => onScrotalCircumferenceChange(preset)}
                  color={scrotalCircumference === preset ? 'primary' : 'default'}
                  variant={scrotalCircumference === preset ? 'filled' : 'outlined'}
                  sx={{
                    height: 24,
                    fontSize: '0.72rem',
                    fontWeight: scrotalCircumference === preset ? 700 : 500,
                    borderRadius: '4px',
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Condición Corporal */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                Condición Corporal (Escala 1 a 5)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Óptimo entore: 3.0 - 3.5
              </Typography>
            </Box>

            {/* 1-Click CC Buttons */}
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              {ccPresets.map((cc) => {
                const isSelected = bodyConditionScore === cc;
                return (
                  <Box
                    key={cc}
                    onClick={() => onBodyConditionScoreChange(cc)}
                    sx={{
                      flex: 1,
                      py: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: isSelected ? primaryColor : isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
                      bgcolor: isSelected
                        ? alpha(primaryColor, 0.15)
                        : isDark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : '#ffffff',
                      color: isSelected ? primaryColor : 'text.primary',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.85rem',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: primaryColor,
                        bgcolor: alpha(primaryColor, 0.08),
                      },
                    }}
                  >
                    CC {cc}
                  </Box>
                );
              })}
            </Stack>

            <TextField
              variant="filled"
              size="small"
              placeholder="O ingresar valor manual (ej. 3.25)..."
              value={bodyConditionScore}
              onChange={(e) => onBodyConditionScoreChange(e.target.value)}
              sx={{
                mt: 1.25,
                width: '100%',
                '& .MuiFilledInput-root': {
                  borderRadius: '6px',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                  fontSize: '0.8rem',
                },
              }}
            />
          </Box>
        </Grid>

        {/* Líbido (1-Click ToggleButtonGroup instead of 2-click dropdown) */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>
              Líbido / Deseo de Servicio (Prueba de salto o conducta en manga)
            </Typography>

            <ToggleButtonGroup
              value={libido}
              exclusive
              onChange={(_, val) => val && onLibidoChange(val)}
              fullWidth
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  py: 0.75,
                  borderRadius: '6px !important',
                  mx: 0.5,
                  border: '1px solid !important',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1) !important' : '#cbd5e1 !important',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: `${alpha(primaryColor, 0.15)} !important`,
                    color: `${primaryColor} !important`,
                    borderColor: `${primaryColor} !important`,
                    fontWeight: 700,
                  },
                },
              }}
            >
              <ToggleButton value="BAJA">Líbido Baja</ToggleButton>
              <ToggleButton value="MEDIA">Líbido Media</ToggleButton>
              <ToggleButton value="ALTA">Líbido Alta</ToggleButton>
              <ToggleButton value="MUY_ALTA">Muy Alta</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>

        {/* Aplomos & Conformación Locomotora (Presets de 1 clic) */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>
              Aplomos & Locomoción (Inspección podal en manga)
            </Typography>

            {/* Quick 1-click buttons */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
              {aplomoPresets.map((preset) => {
                const isSelected = aplomoNotes === preset.value;
                return (
                  <Chip
                    key={preset.label}
                    size="small"
                    clickable
                    label={preset.label}
                    onClick={() => onAplomoNotesChange(preset.value)}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      borderRadius: '6px',
                    }}
                  />
                );
              })}
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={2}
              variant="filled"
              value={aplomoNotes}
              onChange={(e) => onAplomoNotesChange(e.target.value)}
              placeholder="Describir aplomos o miembros..."
              size="small"
              sx={{
                '& .MuiFilledInput-root': {
                  borderRadius: '6px',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                  fontSize: '0.82rem',
                },
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BullPhysicalExamSection;
