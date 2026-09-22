import React, { useMemo } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';
import { useLser01Header } from './Lser01HeaderContext';

interface Lser01ConfigDrawerProps {
  open: boolean;
  onClose: () => void;
}

const sectionTitleSx = {
  fontWeight: 800,
  color: '#0f172a',
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
} as const;

/**
 * Pre-fills the LSER-01 header before printing. Females are not pre-loaded: they are written in
 * the chute. Only APT bulls are offered, since an unfit bull will be rejected when the sheet is loaded.
 */
export const Lser01ConfigDrawer: React.FC<Lser01ConfigDrawerProps> = ({ open, onClose }) => {
  const { header, setHeaderField, resetHeader } = useLser01Header();
  const { data: bulls = [], isLoading } = usePreServiceBulls();

  const aptBullTags = useMemo(
    () => bulls.filter((b) => b.is_apt).map((b) => b.caravan_number).sort(),
    [bulls]
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, p: 0, bgcolor: '#ffffff', boxSizing: 'border-box' } }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#0f172a', color: '#ffffff', display: 'flex' }}>
            <TuneIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
              Configuración LSER-01
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Pre-carga del encabezado del lote de servicio
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>1. Lote y toro</Typography>
          <TextField
            label="Nombre del Lote de Servicio"
            size="small"
            fullWidth
            value={header.lote}
            onChange={(e) => setHeaderField('lote', e.target.value)}
            placeholder="Ej: Entore Vaquillonas Toro 004"
          />
          <Autocomplete
            options={aptBullTags}
            loading={isLoading}
            value={header.toro_caravana || null}
            onChange={(_, value) => setHeaderField('toro_caravana', value ?? '')}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Caravana del Toro"
                size="small"
                helperText={`${aptBullTags.length} toro(s) aptos disponibles`}
              />
            )}
          />
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>2. Servicio</Typography>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Fecha Inicio"
              type="date"
              size="small"
              fullWidth
              value={header.planned_start_date}
              onChange={(e) => setHeaderField('planned_start_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fecha Fin"
              type="date"
              size="small"
              fullWidth
              value={header.planned_end_date}
              onChange={(e) => setHeaderField('planned_end_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <TextField
            label="Responsable"
            size="small"
            fullWidth
            value={header.responsable}
            onChange={(e) => setHeaderField('responsable', e.target.value)}
          />
        </Box>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '8px' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#475569', display: 'block', mb: 0.5 }}>
            Al cargar la planilla
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.4, fontSize: '0.7rem' }}>
            • Se crean el lote de servicio, su orden y el movimiento de cada animal.
            <br />
            • Las categorías del lote salen de las registradas en el toro y los vientres.
            <br />
            • Si una fila tiene un problema no se guarda nada: se repara en una pantalla intermedia.
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<RestartAltIcon />}
          onClick={resetHeader}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', height: '38px', bgcolor: '#ffffff' }}
        >
          Restablecer a Planilla en Blanco
        </Button>
        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={onClose}
          sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 700, textTransform: 'none', borderRadius: '6px', height: '38px', '&:hover': { bgcolor: '#1e293b' } }}
        >
          Aplicar y Cerrar
        </Button>
      </Box>
    </Drawer>
  );
};

export default Lser01ConfigDrawer;
