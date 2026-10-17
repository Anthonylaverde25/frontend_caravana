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
import { useLser01Roster } from './useLser01Roster';

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
 * Pre-fills the LSER-01 header before printing. The batch is picked from the own Cría batches
 * without a running service, and its empty females come pre-printed on the rows. Only APT bulls
 * are offered, since an unfit bull will be rejected when the sheet is loaded.
 */
export const Lser01ConfigDrawer: React.FC<Lser01ConfigDrawerProps> = ({ open, onClose }) => {
  const { header, setHeaderField, resetHeader } = useLser01Header();
  const { data: bulls = [], isLoading } = usePreServiceBulls();
  const { eligibleBatches, batch, females } = useLser01Roster(header.lote_id);

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
              Acta de inicio de servicio sobre un lote
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
          <Autocomplete
            options={eligibleBatches}
            value={batch}
            getOptionLabel={(option) => `${option.name} (ID ${option.id})`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, value) => {
              setHeaderField('lote_id', value?.id ?? null);
              setHeaderField('lote', value?.name ?? '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Lote de Cría que entra en servicio"
                size="small"
                helperText={
                  batch
                    ? `${females.length} vientre(s) vacío(s) se imprimen en la planilla`
                    : `${eligibleBatches.length} lote(s) de Cría sin servicio en curso`
                }
              />
            )}
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
            • Se crea la orden de servicio sobre el lote: no se crea ningún lote nuevo y los vientres no se mueven.
            <br />
            • El toro ingresa al lote. Una caravana que no esté en el lote bloquea la carga.
            <br />
            • Un vientre del lote que no figure en la planilla queda igualmente en servicio (aviso).
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
