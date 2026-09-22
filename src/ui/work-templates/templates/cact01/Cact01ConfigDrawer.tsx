import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Box, Button, Divider, Drawer, IconButton, Paper, Stack, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useCact01Print } from './Cact01PrintContext';
import Cact01ModeSelector from './Cact01ModeSelector';
import Cact01SourcePicker from './Cact01SourcePicker';
import Cact01DestinationSelector from './Cact01DestinationSelector';
import Cact01HeaderSection from './Cact01HeaderSection';

interface Cact01ConfigDrawerProps {
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

/** Thin orchestrator of the CACT-01 print setup: mode, source, destination and header. */
export const Cact01ConfigDrawer: React.FC<Cact01ConfigDrawerProps> = ({ open, onClose }) => {
  const { mode, setMode, setSourceBatchId, reset } = useCact01Print();
  const [searchParams] = useSearchParams();
  const fromBatch = mode === 'from_batch';

  // Arriving from /activities with a batch already in mind. Applied once: a later
  // change of mind in the drawer must not be undone by the URL that opened it.
  const didApplyQueryParam = useRef(false);

  useEffect(() => {
    if (didApplyQueryParam.current) return;

    const requested = Number(searchParams.get('sourceBatchId'));

    if (!Number.isFinite(requested) || requested <= 0) return;

    setSourceBatchId(requested);
    setMode('from_batch');
    didApplyQueryParam.current = true;
  }, [searchParams, setMode, setSourceBatchId]);

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
              Configuración CACT-01
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Planilla en blanco o pre-cargada desde un lote de origen
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
          <Cact01ModeSelector />
        </Box>

        {fromBatch && (
          <>
            <Divider sx={{ borderColor: '#e2e8f0' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="subtitle2" sx={sectionTitleSx}>2. Animales del lote de origen</Typography>
              <Cact01SourcePicker />
            </Box>
          </>
        )}

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>{fromBatch ? '3' : '2'}. Destino</Typography>
          <Cact01DestinationSelector />
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>{fromBatch ? '4' : '3'}. Encabezado</Typography>
          <Cact01HeaderSection />
        </Box>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '8px' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#475569', display: 'block', mb: 0.5 }}>
            Al cargar la planilla
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.4, fontSize: '0.7rem' }}>
            • Se escanean todas las hojas y se confirman juntas.
            <br />
            • Primero se registran los pesos, con los animales todavía en el lote de origen, y después se mueven:
            así la curva separa el engorde real del cambio de composición.
            <br />
            • Sexo y categoría se cotejan contra el sistema y avisan, pero no se modifican.
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

export default Cact01ConfigDrawer;
