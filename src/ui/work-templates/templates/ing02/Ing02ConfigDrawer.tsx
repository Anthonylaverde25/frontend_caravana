import React from 'react';
import { Box, Button, Divider, Drawer, IconButton, Paper, Stack, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useIng02Print } from './Ing02PrintContext';
import Ing02ModeSelector from './Ing02ModeSelector';

interface Ing02ConfigDrawerProps {
  open: boolean;
  onClose: () => void;
}

const sectionTitleSx = {
  fontWeight: 800,
  color: '#0f172a',
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
} as const;

/** Thin orchestrator of the ING-02 print setup: blank sheet or the document of an entry order. */
export const Ing02ConfigDrawer: React.FC<Ing02ConfigDrawerProps> = ({ open, onClose }) => {
  const { setMode, setEntryOrderId } = useIng02Print();

  const reset = () => {
    setMode('blank');
    setEntryOrderId(null);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: 0, bgcolor: '#ffffff', boxSizing: 'border-box' } }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#0f172a', color: '#ffffff', display: 'flex' }}>
            <TuneIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
              Configuración ING-02
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Planilla en blanco o la de una orden de ingreso
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>1. Modo de impresión</Typography>
          <Ing02ModeSelector />
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '8px' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#475569', display: 'block', mb: 0.5 }}>
            Al cargar la planilla
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.4, fontSize: '0.7rem' }}>
            • Una hoja en blanco escaneada se revisa en el formulario de alta y crea la orden en espera de DTE.
            <br />
            • La hoja de una orden ya cargada no se vuelve a crear.
            <br />
            • Las caravanas no van en la hoja: entran al cargar el DTE.
            <br />
            • Lo que no se pudo leer se marca y se completa en el formulario.
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<RestartAltIcon />}
          onClick={reset}
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

export default Ing02ConfigDrawer;
