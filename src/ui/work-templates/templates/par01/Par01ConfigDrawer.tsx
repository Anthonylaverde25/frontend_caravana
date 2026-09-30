import React, { useMemo } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useBirthOrders } from '@/features/birth-orders/hooks/useBirthOrders';
import { usePar01Print } from './Par01PrintContext';

interface Par01ConfigDrawerProps {
  open: boolean;
  onClose: () => void;
}

const sectionTitleSx = { fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' } as const;

/**
 * The PAR-01 print setup: a blank sheet (a few free fields for the header) or the sheet of a birth
 * order, whose header and females come from the order and are not asked again.
 */
export const Par01ConfigDrawer: React.FC<Par01ConfigDrawerProps> = ({ open, onClose }) => {
  const { mode, setMode, blankPages, setBlankPages, birthOrderId, setBirthOrderId, header, setHeaderField, reset } = usePar01Print();
  const { data: orders = [], isLoading } = useBirthOrders();
  // Open orders go out on paper; drafts are previewed. Registered ones never had paper.
  const printable = useMemo(() => orders.filter((o) => o.kind === 'PLANNED' && (o.is_open || o.is_editable)), [orders]);
  const selected = printable.find((o) => o.id === birthOrderId) ?? orders.find((o) => o.id === birthOrderId) ?? null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: 0, bgcolor: '#ffffff', boxSizing: 'border-box' } }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#0f172a', color: '#ffffff', display: 'flex' }}>
            <TuneIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
              Configuración PAR-01
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Planilla en blanco o la de una orden de parición
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>
            1. Modo de impresión
          </Typography>
          <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
            <FormControlLabel
              value="blank"
              control={<Radio size="small" />}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Planilla en blanco
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    En la recorrida se escribe todo. Al cargarla se crea su orden, ya ejecutada.
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="from_order"
              control={<Radio size="small" />}
              sx={{ mt: 1 }}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Desde una orden de parición
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sale con el código y los vientres pendientes, por fecha probable de parto.
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>

          {mode === 'blank' ? (
            <TextField
              label="Cantidad de hojas"
              type="number"
              size="small"
              value={blankPages}
              onChange={(e) => setBlankPages(Number(e.target.value))}
              inputProps={{ min: 1, max: 20 }}
              sx={{ maxWidth: 180 }}
            />
          ) : (
            <Autocomplete
              options={printable}
              loading={isLoading}
              value={selected}
              getOptionLabel={(o) => `${o.code} · ${o.pending_head_count} pendientes · ${o.status_label}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, order) => setBirthOrderId(order?.id ?? null)}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Orden de parición" helperText={`${printable.length} orden(es) emitidas o en borrador`} />
              )}
            />
          )}
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>
            2. Encabezado
          </Typography>
          {mode === 'from_order' ? (
            <Alert severity="info" sx={{ borderRadius: '6px' }}>
              El encabezado sale de la orden: código, lote(s), período y responsable. La fecha de recorrida se escribe a mano.
            </Alert>
          ) : (
            <>
              <TextField label="Lote(s)" size="small" value={header.lote} onChange={(e) => setHeaderField('lote', e.target.value)} />
              <TextField label="Período" size="small" value={header.periodo} onChange={(e) => setHeaderField('periodo', e.target.value)} />
              <TextField label="Responsable" size="small" value={header.responsable} onChange={(e) => setHeaderField('responsable', e.target.value)} />
            </>
          )}
        </Box>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '8px' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#475569', display: 'block', mb: 0.5 }}>
            Al cargar la planilla
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.4, fontSize: '0.7rem' }}>
            • Cada vientre con resultado marcado se registra: la cría nace en el lote de su madre.
            <br />• Sin resultado marcado, el vientre sigue pendiente para la próxima recorrida.
            <br />• El padre no va en la planilla: se confirma en la revisión, o después en Sires pendientes.
            <br />• Si una fila tiene un problema no se guarda nada: se repara en la revisión.
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

export default Par01ConfigDrawer;
