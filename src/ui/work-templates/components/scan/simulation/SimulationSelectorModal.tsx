import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Box,
  Stack,
  Chip,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Grid,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { AVAILABLE_SIMULATION_TEMPLATES, getSimulationPreset } from './simulationPresets';
import { SimulationPreset, SimulationScenario } from './types';

interface SimulationSelectorModalProps {
  open: boolean;
  onClose: () => void;
  currentTemplateCode?: string;
  onSelectPreset: (preset: SimulationPreset) => void;
}

const SCENARIO_LABELS: Record<SimulationScenario, { label: string; color: 'success' | 'warning' | 'error' | 'info'; icon: string }> = {
  HAPPY_PATH: { label: 'Flujo Válido (Happy Path)', color: 'success', icon: 'heroicons-outline:check-badge' },
  WARNINGS: { label: 'Con Advertencias (Warnings)', color: 'warning', icon: 'heroicons-outline:exclamation-triangle' },
  REPAIR_ERROR: { label: 'Errores / Reparación', color: 'error', icon: 'heroicons-outline:x-circle' },
  MULTI_PAGE: { label: 'Multi-Página (Múltiples Hojas)', color: 'info', icon: 'heroicons-outline:document-duplicate' },
};

export const SimulationSelectorModal: React.FC<SimulationSelectorModalProps> = ({
  open,
  onClose,
  currentTemplateCode = 'ING-01',
  onSelectPreset,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(currentTemplateCode);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>('HAPPY_PATH');

  // Keep selectedCode synced when dialog opens with a specific template
  React.useEffect(() => {
    if (open && currentTemplateCode) {
      setSelectedCode(currentTemplateCode);
      setSelectedScenario('HAPPY_PATH');
    }
  }, [open, currentTemplateCode]);

  const selectedTemplateInfo = useMemo(() => {
    return AVAILABLE_SIMULATION_TEMPLATES.find((t) => t.code === selectedCode) || AVAILABLE_SIMULATION_TEMPLATES[0];
  }, [selectedCode]);

  // Adjust scenario if not available in template
  React.useEffect(() => {
    if (!selectedTemplateInfo.availableScenarios.includes(selectedScenario)) {
      setSelectedScenario(selectedTemplateInfo.availableScenarios[0] || 'HAPPY_PATH');
    }
  }, [selectedTemplateInfo, selectedScenario]);

  const activePreset = useMemo(() => {
    return getSimulationPreset(selectedCode, selectedScenario);
  }, [selectedCode, selectedScenario]);

  const handleApply = () => {
    onSelectPreset(activePreset);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 2,
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Canonical Dialog Header */}
      <DialogTitle
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AutoAwesomeIcon color="secondary" />
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'text.primary' }}>
              Centro de Simulaciones de Planillas (QA & Testing)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Inyecta datos y documentos escaneados realistas sin necesidad del microservicio de IA.
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      {/* Dialog Body */}
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Alert severity="info" sx={{ py: 0.5, borderRadius: '6px', fontSize: '0.82rem' }}>
          Selecciona la plantilla ganadera y el escenario a evaluar. El sistema inyectará la metadata, las filas correspondientes y generará dinámicamente el <strong>documento original escaneado en SVG</strong> para su verificación cruzada.
        </Alert>

        {/* 1. Template Selection Grid */}
        <Box>
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
            1. SELECCIONA EL DOCUMENTO / PLANTILLA DE TRABAJO ({AVAILABLE_SIMULATION_TEMPLATES.length})
          </Typography>
          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
            {AVAILABLE_SIMULATION_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.code === selectedCode;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tmpl.code}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: '8px',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'action.hover' : 'background.paper',
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: 'primary.light' },
                    }}
                  >
                    <CardActionArea onClick={() => setSelectedCode(tmpl.code)} sx={{ p: 1.5, height: '100%' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                        <Chip
                          label={tmpl.code}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            bgcolor: isSelected ? 'primary.main' : 'action.selected',
                            color: isSelected ? 'primary.contrastText' : 'text.primary',
                          }}
                        />
                        <Chip
                          label={tmpl.categoryLabel}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }}
                        />
                      </Stack>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.3 }}>
                        {tmpl.title}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* 2. Scenario / Flow Selection */}
        <Box>
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
            2. SELECCIONA EL FLUJO O ESCENARIO A TESTEAR
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            {selectedTemplateInfo.availableScenarios.map((scen) => {
              const isSelected = selectedScenario === scen;
              const meta = SCENARIO_LABELS[scen];
              return (
                <Button
                  key={scen}
                  variant={isSelected ? 'contained' : 'outlined'}
                  color={meta.color}
                  size="small"
                  onClick={() => setSelectedScenario(scen)}
                  startIcon={<FuseSvgIcon size={18}>{meta.icon}</FuseSvgIcon>}
                  sx={{
                    borderRadius: '6px',
                    fontWeight: isSelected ? 800 : 600,
                    textTransform: 'none',
                    px: 2,
                    py: 0.8,
                  }}
                >
                  {meta.label}
                </Button>
              );
            })}
          </Stack>
        </Box>

        {/* 3. Preset Summary Card */}
        <Card variant="outlined" sx={{ bgcolor: 'action.hover', borderRadius: '8px', borderStyle: 'dashed' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {activePreset.scenarioLabel}
              </Typography>
              <Chip
                label={`${activePreset.rows.length} Animales / Registros`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.82rem' }}>
              {activePreset.scenarioDescription}
            </Typography>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'background.paper',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: 'divider',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
            >
              <strong>Contexto inyectado:</strong> {JSON.stringify(activePreset.context)}
            </Box>
          </CardContent>
        </Card>
      </DialogContent>

      {/* Canonical Dialog Actions */}
      <DialogActions
        sx={{
          p: 2,
          px: 3,
          bgcolor: 'background.default',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button variant="text" onClick={onClose} sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleApply}
          sx={{
            px: 3.5,
            fontWeight: 800,
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
          }}
        >
          ⚡ Inyectar Simulación en Banco de Pruebas
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimulationSelectorModal;
