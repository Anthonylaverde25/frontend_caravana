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
  Tooltip
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { parseIntaCsvText } from '../../utils/intaCsvParser';

interface Ing01ConfigDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const Ing01ConfigDrawer: React.FC<Ing01ConfigDrawerProps> = ({ open, onClose }) => {
  const {
    selectedProviderId,
    setSelectedProviderId,
    selectedFarmId,
    setSelectedFarmId,
    selectedActivityId,
    setSelectedActivityId,
    activities = [],
    activeActivity,
    providers = [],
    allFarms = [],
    activeProvider,
    activeFarm,
    customCaravans = [],
    setCustomCaravans,
    clearCustomCaravans
  } = useWorkTemplatePrint();

  // Filter farms by selected provider
  const filteredFarms = useMemo(() => {
    if (!selectedProviderId) return allFarms;
    return allFarms.filter((f: any) => f.provider_id === selectedProviderId);
  }, [allFarms, selectedProviderId]);

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
              Configuración ING-01
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Ajustes opcionales de origen, destino y pre-carga INTA
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Body */}
      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Metadatos de Origen (Proveedor) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Metadatos de Origen (Proveedor)
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            label="Proveedor / Vendedor"
            value={selectedProviderId ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              setSelectedProviderId(val);
              setSelectedFarmId(null);
            }}
            variant="outlined"
          >
            <MenuItem value="">
              <em>-- Sin Proveedor (Manuscrito Libre) --</em>
            </MenuItem>
            {providers.map((p: any) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} {p.cuit ? `(CUIT: ${p.cuit})` : ''}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Establecimiento / Granja Origen"
            value={selectedFarmId ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              setSelectedFarmId(val);
            }}
            disabled={!selectedProviderId && filteredFarms.length === 0}
            variant="outlined"
          >
            <MenuItem value="">
              <em>-- Establecimiento Principal / Por Defecto --</em>
            </MenuItem>
            {filteredFarms.map((f: any) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name} {f.renspa ? `(RENSPA: ${f.renspa})` : ''}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Metadatos de Destino (Actividad del Lote) */}
        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Metadatos de Destino (Actividad)
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Asigne la actividad productiva para el lote propio receptor
            </Typography>
          </Box>

          <TextField
            select
            fullWidth
            size="small"
            label="Actividad Productiva del Lote"
            value={selectedActivityId ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              setSelectedActivityId(val);
            }}
            variant="outlined"
          >
            <MenuItem value="">
              <em>-- Sin Actividad Pre-asignada (Manuscrito Libre) --</em>
            </MenuItem>
            {activities.map((a: any) => (
              <MenuItem key={a.id} value={a.id}>
                {a.name} ({a.code})
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Pre-carga de Caravanas (CSV / TXT INTA) */}
        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Pre-carga de Caravanas (CSV / TXT INTA)
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
            Cargue un archivo exportado por balanza o lectora INTA (.csv o .txt) para pre-poblar los animales a verificar en el rodeo.
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon sx={{ fontSize: '1.1rem !important', color: '#0a6ed1' }} />}
            sx={{
              borderColor: '#cbd5e1',
              color: '#1e293b',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'none',
              bgcolor: '#ffffff',
              borderRadius: '6px',
              height: '38px',
              justifyContent: 'center',
              boxShadow: 'none',
              '&:hover': {
                borderColor: '#0a6ed1',
                bgcolor: '#f0f7ff'
              }
            }}
          >
            Cargar Archivo CSV / TXT INTA
            <input type="file" accept=".csv,.txt" hidden onChange={handleFileUpload} />
          </Button>

          {customCaravans.length > 0 && (
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#ecfdf5', borderColor: '#a7f3d0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857', display: 'block', fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                  CARAVANAS PRE-CARGADAS
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#065f46', fontSize: '0.82rem' }}>
                  {customCaravans.length} animales ({Math.ceil(customCaravans.length / 12)} hoja{Math.ceil(customCaravans.length / 12) > 1 ? 's' : ''} A4)
                </Typography>
              </Box>
              <Tooltip title="Limpiar caravanas">
                <IconButton
                  size="small"
                  onClick={clearCustomCaravans}
                  sx={{ color: '#047857', '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
          )}
        </Box>

        {/* Active Data Preview */}
        {(activeProvider || activeActivity) && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '8px' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'block', mb: 1 }}>
              Resumen de Pre-carga en Planilla
            </Typography>
            <Stack spacing={1}>
              {activeProvider && (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Proveedor: {activeProvider.name || '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontFamily: 'monospace' }}>
                    CUIT: {activeProvider.cuit || '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    Granja: {activeFarm?.name || (activeProvider.farms && activeProvider.farms.length > 0 ? activeProvider.farms[0].name : '-') || '-'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0a6ed1', fontFamily: 'monospace' }}>
                    RENSPA: {activeFarm?.renspa || (activeProvider.farms && activeProvider.farms.length > 0 ? activeProvider.farms[0].renspa : '-') || '-'}
                  </Typography>
                </>
              )}
              {activeActivity && (
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#16a34a' }}>
                  Actividad Destino: {activeActivity.name} ({activeActivity.code})
                </Typography>
              )}
            </Stack>
          </Paper>
        )}
      </Box>

      {/* Drawer Actions */}
      <Box sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {(selectedProviderId || selectedActivityId) && (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<RestartAltIcon sx={{ fontSize: '1.1rem !important' }} />}
            onClick={() => {
              setSelectedProviderId(null);
              setSelectedFarmId(null);
              setSelectedActivityId(null);
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
                borderColor: '#f87171'
              }
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
              bgcolor: '#1e293b'
            }
          }}
        >
          Aplicar y Cerrar
        </Button>
      </Box>
    </Drawer>
  );
};

export default Ing01ConfigDrawer;
