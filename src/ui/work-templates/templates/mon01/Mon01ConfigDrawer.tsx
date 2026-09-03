import React, { useMemo } from 'react';
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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { parseIntaCsvText } from '../../utils/intaCsvParser';

interface Mon01ConfigDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const Mon01ConfigDrawer: React.FC<Mon01ConfigDrawerProps> = ({ open, onClose }) => {
  const {
    batchId,
    order,
    customCaravans = [],
    setCustomCaravans,
    clearCustomCaravans,
  } = useWorkTemplatePrint();

  const { data: batches = [] } = useBatches(undefined, undefined, 'own');

  // Filter service batches or cria batches
  const availableBatches = useMemo(() => {
    return batches.filter((b) => b.isService() || b.activity_name?.toUpperCase().includes('CRIA') || b.name.toUpperCase().includes('CRIA'));
  }, [batches]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const parsedItems = parseIntaCsvText(content);
        if (parsedItems.length > 0) {
          setCustomCaravans(parsedItems);
        } else {
          alert('No se pudieron extraer caravanas válidas del archivo seleccionado. Verifique el formato CSV / TXT.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
          boxSizing: 'border-box'
        }
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#0f172a', color: '#ffffff', display: 'flex' }}>
            <TuneIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
              Configuración MON-01
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Ajustes de lote de servicio, orden y pre-carga INTA
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Body */}
      <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
        <Stack spacing={3}>
          {/* Section: Contexto del Servicio */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5, display: 'block' }}>
              1. Lote de Servicio & Asignaciones
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '8px' }}>
              <Stack spacing={2}>
                <TextField
                  select
                  label="Lote de Servicio (Destino)"
                  value={batchId || ''}
                  size="small"
                  fullWidth
                  disabled={Boolean(order?.batch_id)}
                  helperText={order?.batch_id ? "Fijado automáticamente por la Orden de Servicio" : "Selecciona el lote de reproducción"}
                >
                  <MenuItem value="">-- Seleccionar Lote --</MenuItem>
                  {availableBatches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name} (#{b.id})
                    </MenuItem>
                  ))}
                </TextField>

                {order && (
                  <TextField
                    label="Código de Orden de Servicio"
                    value={order.code}
                    size="small"
                    fullWidth
                    disabled
                  />
                )}
              </Stack>
            </Paper>
          </Box>

          <Divider />

          {/* Section: Pre-carga Masiva de Caravanas (INTA CSV) */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5, display: 'block' }}>
              2. Pre-carga Masiva de Vientres (INTA / Balanza)
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '8px' }}>
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem' }}>
                  Carga un archivo CSV o TXT exportado de balanza o lector INTA para reemplazar o pre-cargar los vientres en la planilla.
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  fullWidth
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Cargar Archivo INTA (CSV/TXT)
                  <input type="file" accept=".csv,.txt" hidden onChange={handleFileUpload} />
                </Button>

                {customCaravans.length > 0 && (
                  <Box sx={{ p: 1.5, bgcolor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 700 }}>
                      ✓ {customCaravans.length} caravanas pre-cargadas
                    </Typography>
                    <Tooltip title="Limpiar datos pre-cargados">
                      <IconButton size="small" onClick={clearCustomCaravans} sx={{ color: '#065f46' }}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Box>

      {/* Drawer Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={() => {
            clearCustomCaravans();
            onClose();
          }}
          startIcon={<RestartAltIcon />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Restablecer
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#0a6ed1', '&:hover': { bgcolor: '#0854a0' }, px: 3 }}
        >
          Aplicar Cambios
        </Button>
      </Box>
    </Drawer>
  );
};

export default Mon01ConfigDrawer;
