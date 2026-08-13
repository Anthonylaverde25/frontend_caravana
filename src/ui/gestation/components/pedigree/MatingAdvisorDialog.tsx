import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Autocomplete,
  TextField,
  Paper,
  Chip,
  Alert,
  Divider,
  Avatar,
  alpha,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import {
  simulateMating,
  MatingSimulationResult,
  InbreedingRisk,
} from '@/core/caravans/domain/services/pedigreeAnalysis';

interface MatingAdvisorDialogProps {
  open: boolean;
  onClose: () => void;
  caravans: Caravan[];
  initialDamId?: number | null;
  initialSireId?: number | null;
}

const getRiskColor = (risk: InbreedingRisk) => {
  switch (risk) {
    case 'OPTIMAL':
      return { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '🟢' };
    case 'VERY_LOW':
      return { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: '🟢' };
    case 'MODERATE':
      return { bg: '#fefce8', border: '#fde047', text: '#854d0e', icon: '🟡' };
    case 'HIGH':
      return { bg: '#fff7ed', border: '#fdba74', text: '#9a3412', icon: '🟠' };
    case 'CRITICAL':
      return { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '🔴' };
  }
};

export default function MatingAdvisorDialog({
  open,
  onClose,
  caravans,
  initialDamId,
  initialSireId,
}: MatingAdvisorDialogProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const caravansMap = useMemo(() => {
    const map = new Map<number, Caravan>();
    caravans.forEach((c) => map.set(c.id, c));
    return map;
  }, [caravans]);

  const females = useMemo(() => caravans.filter((c) => c.sex === 'H'), [caravans]);
  const males = useMemo(() => caravans.filter((c) => c.sex === 'M'), [caravans]);

  const [selectedDam, setSelectedDam] = useState<Caravan | null>(null);
  const [selectedSire, setSelectedSire] = useState<Caravan | null>(null);

  useEffect(() => {
    if (initialDamId) {
      const found = caravansMap.get(initialDamId);
      if (found && found.sex === 'H') setSelectedDam(found);
    }
    if (initialSireId) {
      const found = caravansMap.get(initialSireId);
      if (found && found.sex === 'M') setSelectedSire(found);
    }
  }, [initialDamId, initialSireId, caravansMap, open]);

  const simulation: MatingSimulationResult | null = useMemo(() => {
    if (!selectedDam || !selectedSire) return null;
    return simulateMating(selectedDam.id, selectedSire.id, caravansMap);
  }, [selectedDam, selectedSire, caravansMap]);

  const riskColors = simulation ? getRiskColor(simulation.risk) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', width: 36, height: 36 }}>
            🧬
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Simulador de Apareamiento y Consanguinidad
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Predicción de coeficiente de consanguinidad ($F_X$) para planificar entores y servicios
            </Typography>
          </Box>
        </Stack>
        <Chip
          label="Mating Advisor"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Pair Selector */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              1. Seleccione la Pareja a Evaluar
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              {/* Female selector */}
              <Autocomplete
                size="small"
                disablePortal
                slotProps={{
                  popper: {
                    sx: { zIndex: 1500 },
                  },
                }}
                options={females}
                value={selectedDam}
                onChange={(_, val) => setSelectedDam(val)}
                getOptionLabel={(option) =>
                  `#${option.identification} — ${option.category || 'Vientre'} (${option.breed || 'Sin Raza'})`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Vientre / Hembra (Madre)"
                    placeholder="Buscar caravana hembra..."
                  />
                )}
              />

              {/* Male selector */}
              <Autocomplete
                size="small"
                disablePortal
                slotProps={{
                  popper: {
                    sx: { zIndex: 1500 },
                  },
                }}
                options={males}
                value={selectedSire}
                onChange={(_, val) => setSelectedSire(val)}
                getOptionLabel={(option) =>
                  `#${option.identification} — ${option.category || 'Toro'} (${option.breed || 'Sin Raza'})`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Reproductor / Macho (Padre)"
                    placeholder="Buscar caravana macho..."
                  />
                )}
              />
            </Box>
          </Paper>

          {/* Simulation Results */}
          {simulation && riskColors ? (
            <Stack spacing={2.5}>
              {/* Metric Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: riskColors.border,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : riskColors.bg,
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Consanguinidad Proyectada de la Futura Cría ($F_X$)
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: riskColors.text, lineHeight: 1.1 }}>
                        {simulation.projectedInbreeding}%
                      </Typography>
                    </Box>

                    <Chip
                      label={simulation.riskLabel}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        px: 1.5,
                        py: 2,
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                        border: '1px solid',
                        borderColor: riskColors.border,
                        color: riskColors.text,
                      }}
                    />
                  </Stack>

                  <Divider />

                  {/* Common Ancestors List */}
                  {simulation.commonAncestors.length > 0 ? (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main', display: 'block', mb: 0.5 }}>
                        ⚠️ Ancestros Comunes Detectados en Ambas Líneas Genealógicas:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {simulation.commonAncestors.map((ancestor, i) => (
                          <Chip
                            key={i}
                            label={`Ancestro: ${ancestor}`}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                      ✅ No se detectan ancestros comunes entre las líneas del padre y la madre.
                    </Typography>
                  )}
                </Stack>
              </Paper>

              {/* Agronomic Recommendation */}
              <Alert
                severity={
                  simulation.agronomicRecommendation.status === 'RECOMMENDED'
                    ? 'success'
                    : simulation.agronomicRecommendation.status === 'CAUTION'
                    ? 'warning'
                    : 'error'
                }
                sx={{ borderRadius: '8px' }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {simulation.agronomicRecommendation.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                  {simulation.agronomicRecommendation.description}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, fontStyle: 'italic' }}>
                  📖 {simulation.agronomicRecommendation.bibliographicNote}
                </Typography>
              </Alert>
            </Stack>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: '8px',
                borderStyle: 'dashed',
                color: 'text.secondary',
              }}
            >
              <Box sx={{ fontSize: '2rem', mb: 1 }}>🧬</Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Seleccione un Vientre y un Reproductor
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', maxWidth: 400, mx: 'auto', mt: 0.5 }}>
                El algoritmo calculará de forma recursiva los caminos genealógicos de ambos animales para determinar si comparten ancestros comunes.
              </Typography>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="text"
          onClick={() => {
            setSelectedDam(null);
            setSelectedSire(null);
          }}
          disabled={!selectedDam && !selectedSire}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Limpiar Selección
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ textTransform: 'none', fontWeight: 700, px: 3 }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
