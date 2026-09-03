import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Alert,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  alpha,
} from '@mui/material';
import { Pathogen } from '@/core/pre-service/domain/BullHealthEvaluation';

interface BullDiagnosisSectionProps {
  includeDiagnosis: boolean;
  onToggleDiagnosis: (enabled: boolean) => void;
  selectedPathogenId: string;
  onPathogenChange: (val: string) => void;
  diagnosisStatus: string;
  onDiagnosisStatusChange: (val: string) => void;
  treatmentNotes: string;
  onTreatmentNotesChange: (val: string) => void;
  pathogens: Pathogen[];
}

export const BullDiagnosisSection: React.FC<BullDiagnosisSectionProps> = ({
  includeDiagnosis,
  onToggleDiagnosis,
  selectedPathogenId,
  onPathogenChange,
  diagnosisStatus,
  onDiagnosisStatusChange,
  treatmentNotes,
  onTreatmentNotesChange,
  pathogens,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const successColor = isDark ? '#34d399' : '#107e3e';
  const warningColor = isDark ? '#fb923c' : '#e6600d';
  const primaryColor = isDark ? '#60a5fa' : '#0a6ed1';

  const selectedPathogen = pathogens.find((p) => String(p.id) === selectedPathogenId);

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          2. Estado Sanitario & Diagnóstico Clínico
        </Typography>
      </Box>

      {/* 1-Click Fast Toggle: Sano vs Con Afección */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        <Box
          onClick={() => {
            onToggleDiagnosis(false);
            onPathogenChange('');
          }}
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: '8px',
            border: '1.5px solid',
            borderColor: !includeDiagnosis ? successColor : isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
            bgcolor: !includeDiagnosis
              ? alpha(successColor, 0.12)
              : isDark
              ? 'rgba(255, 255, 255, 0.02)'
              : '#f8fafc',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
            '&:hover': {
              borderColor: successColor,
            },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: !includeDiagnosis ? 800 : 600,
              color: !includeDiagnosis ? successColor : 'text.secondary',
              fontSize: '0.85rem',
            }}
          >
            ✓ Sano / Sin Afección Clínica
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Apto sanitariamente para el entore
          </Typography>
        </Box>

        <Box
          onClick={() => onToggleDiagnosis(true)}
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: '8px',
            border: '1.5px solid',
            borderColor: includeDiagnosis ? warningColor : isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
            bgcolor: includeDiagnosis
              ? alpha(warningColor, 0.12)
              : isDark
              ? 'rgba(255, 255, 255, 0.02)'
              : '#f8fafc',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s ease',
            '&:hover': {
              borderColor: warningColor,
            },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: includeDiagnosis ? 800 : 600,
              color: includeDiagnosis ? warningColor : 'text.secondary',
              fontSize: '0.85rem',
            }}
          >
            ⚠ Reportar Patología / Enfermedad
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            Venérea, locomotora o sistémica
          </Typography>
        </Box>
      </Box>

      {/* Expanded Clinical Pathogen Picker when enabled */}
      {includeDiagnosis && (
        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          }}
        >
          <Grid container spacing={2}>
            {/* Pathogen Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Patógeno o Cuadro Clínico"
                variant="filled"
                value={selectedPathogenId}
                onChange={(e) => onPathogenChange(e.target.value)}
                sx={{
                  '& .MuiFilledInput-root': {
                    borderRadius: '6px',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                  },
                }}
              >
                <MenuItem value="">
                  <em>Seleccionar patología del catálogo...</em>
                </MenuItem>
                {pathogens.map((pathogen) => (
                  <MenuItem key={pathogen.id} value={String(pathogen.id)}>
                    {pathogen.name} {pathogen.is_disqualifying ? '(Descalificante)' : '(Tratable)'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Diagnosis Status (1-Click Toggle instead of dropdown) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <ToggleButtonGroup
                value={diagnosisStatus}
                exclusive
                onChange={(_, val) => val && onDiagnosisStatusChange(val)}
                fullWidth
                size="small"
                sx={{
                  height: 48,
                  '& .MuiToggleButton-root': {
                    borderRadius: '6px !important',
                    border: '1px solid !important',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1) !important' : '#cbd5e1 !important',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    lineHeight: 1.1,
                    '&.Mui-selected': {
                      bgcolor: `${alpha(primaryColor, 0.15)} !important`,
                      color: `${primaryColor} !important`,
                      borderColor: `${primaryColor} !important`,
                      fontWeight: 700,
                    },
                  },
                }}
              >
                <ToggleButton value="IN_TREATMENT">En Tratamiento</ToggleButton>
                <ToggleButton value="CONFIRMED_POSITIVE">Positivo</ToggleButton>
                <ToggleButton value="SUSPECTED">Sospechoso</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {/* Warning if Disqualifying */}
            {selectedPathogen?.is_disqualifying && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error" sx={{ borderRadius: '6px', fontSize: '0.8rem', py: 0.5 }}>
                  <strong>Aviso Sanitario:</strong> {selectedPathogen.name} es una afección descalificante (Carrillo, 1988). El reproductor quedará registrado inmediatamente como <strong>RECHAZO / DESCARTE (UNFIT)</strong>.
                </Alert>
              </Grid>
            )}

            {/* Therapeutic Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Protocolo Terapéutico / Indicaciones Veterinarias"
                variant="filled"
                value={treatmentNotes}
                onChange={(e) => onTreatmentNotesChange(e.target.value)}
                placeholder="Fármaco, dosis, tiempo de aislamiento..."
                sx={{
                  '& .MuiFilledInput-root': {
                    borderRadius: '6px',
                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                    fontSize: '0.82rem',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default BullDiagnosisSection;
