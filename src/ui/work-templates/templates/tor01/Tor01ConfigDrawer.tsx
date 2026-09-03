import React from 'react';
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Divider,
  Button,
  Paper,
  Tooltip,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';

interface Tor01ConfigDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const Tor01ConfigDrawer: React.FC<Tor01ConfigDrawerProps> = ({ open, onClose }) => {
  const {
    selectedFarmId,
    setSelectedFarmId,
    allFarms = [],
    customCaravans = [],
    setCustomCaravans,
    clearCustomCaravans,
  } = useWorkTemplatePrint();

  const { data: bulls = [] } = usePreServiceBulls();

  // Pre-load all registered bulls from the company into the print sheet
  const handleLoadExistingBulls = () => {
    if (bulls.length === 0) return;

    const mapped = bulls.map((b) => ({
      id: b.caravan_id,
      identification: b.caravan_number,
      ce: b.scrotal_circumference_cm ? String(b.scrotal_circumference_cm) : '',
      observations: b.observations || '',
    }));

    setCustomCaravans(mapped);
  };

  // Generate blank template pages (12, 24, 36, or 48 rows)
  const handleGenerateBlankRows = (count: number) => {
    const blanks = Array.from({ length: count }).map((_, i) => ({
      id: `blank-${i + 1}`,
      identification: '',
      observations: '',
    }));
    setCustomCaravans(blanks);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 440 },
          p: 0,
          bgcolor: '#ffffff',
          boxSizing: 'border-box',
        },
      }}
    >
      {/* Drawer Header (Slate Benchmark ING-01 Style) */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#0f172a', color: '#ffffff', display: 'flex' }}>
            <TuneIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
              Configuración TOR-01
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Ajustes de establecimiento, torada y pre-carga de manga
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Body */}
      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Metadatos de Establecimiento / Campo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            1. Establecimiento / Campo
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            value={selectedFarmId || ''}
            onChange={(e) => setSelectedFarmId(e.target.value ? Number(e.target.value) : null)}
            label="Seleccionar Establecimiento"
            variant="outlined"
          >
            <MenuItem value="">
              <em>Todos los Establecimientos</em>
            </MenuItem>
            {allFarms.map((f: { id: number; name: string; renspa?: string }) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name} {f.renspa ? `(${f.renspa})` : ''}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {/* Modalidad de Impresión */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              2. Modalidad de Impresión
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
              Pre-cargue los toros registrados en el sistema o genere hojas en blanco para llevar a la manga.
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleLoadExistingBulls}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:identification</FuseSvgIcon>}
              sx={{
                borderColor: '#cbd5e1',
                color: '#0f172a',
                fontWeight: 600,
                fontSize: '0.8125rem',
                textTransform: 'none',
                bgcolor: '#ffffff',
                borderRadius: '6px',
                py: 1,
                justify: 'flex-start',
                '&:hover': {
                  borderColor: '#0a6ed1',
                  bgcolor: '#f0f7ff',
                },
              }}
            >
              Pre-cargar Toros de la Empresa ({bulls.length} Toros)
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => handleGenerateBlankRows(12)}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px' }}
              >
                1 Pág. (12)
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => handleGenerateBlankRows(24)}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px' }}
              >
                2 Pág. (24)
              </Button>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => handleGenerateBlankRows(36)}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px' }}
              >
                3 Pág. (36)
              </Button>
            </Box>

            {customCaravans.length > 0 && (
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#ecfdf5', borderColor: '#a7f3d0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857', display: 'block', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                    TOROS PRE-CARGADOS
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#065f46', fontSize: '0.82rem' }}>
                    {customCaravans.length} animales ({Math.ceil(customCaravans.length / 12)} hoja{Math.ceil(customCaravans.length / 12) > 1 ? 's' : ''} A4)
                  </Typography>
                </Box>
                <Tooltip title="Restablecer planilla">
                  <IconButton
                    size="small"
                    onClick={clearCustomCaravans}
                    sx={{ color: '#047857', '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' } }}
                  >
                    <RestartAltIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>
            )}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {/* Clinical Reference Box */}
        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '8px' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#475569', display: 'block', mb: 0.5 }}>
            Estándar Zootécnico (Carrillo, 1988)
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.4, fontSize: '0.7rem' }}>
            • Circunferencia Escrotal mínima requerida: ≥ 28.0 cm (toritos 2 años) / ≥ 30 cm (adultos).
            <br />
            • Condición Corporal óptima: 3.0 a 3.5.
            <br />
            • Protocolo Venéreas: 2 raspajes prepuciales negativos para habilitación.
            <br />
            • Brucelosis: Sangrado serológico con descarte obligatorio de reactores positivos.
          </Typography>
        </Paper>
      </Box>

      {/* Drawer Actions (ING-01 Slate Benchmark Footer) */}
      <Box sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {(selectedFarmId || customCaravans.length > 0) && (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<RestartAltIcon sx={{ fontSize: '1.1rem !important' }} />}
            onClick={() => {
              setSelectedFarmId(null);
              clearCustomCaravans();
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderColor: '#fca5a5',
              bgcolor: '#ffffff',
              borderRadius: '6px',
              height: '38px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#fef2f2',
                borderColor: '#f87171',
              },
            }}
          >
            Restablecer a Planilla en Blanco
          </Button>
        )}

        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={onClose}
          sx={{
            bgcolor: '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8125rem',
            textTransform: 'none',
            borderRadius: '6px',
            height: '38px',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#1e293b',
            },
          }}
        >
          Aplicar y Cerrar
        </Button>
      </Box>
    </Drawer>
  );
};

export default Tor01ConfigDrawer;
