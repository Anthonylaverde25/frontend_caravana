import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Agriculture as AgricultureIcon,
  Pets as PetsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';
import Cact01SuccessSummary from './Cact01SuccessSummary';

interface ScanSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  templateCode: string;
  result: any;
}

export const ScanSuccessDialog: React.FC<ScanSuccessDialogProps> = ({
  open,
  onClose,
  onReset,
  templateCode,
  result,
}) => {
  const navigate = useNavigate();

  const isTor01 = templateCode === 'TOR-01';
  const isLser01 = templateCode === 'LSER-01';
  const isDest01 = templateCode === 'DEST-01';
  const isCact01 = templateCode === 'CACT-01';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '8px', p: 1 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 900,
        }}
      >
        <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 28 }} />
        {isCact01
          ? '¡Cambio de Actividad Registrado Exitosamente!'
          : isDest01
          ? '¡Destete Registrado Exitosamente!'
          : isLser01
          ? '¡Lote de Servicio Creado Exitosamente!'
          : isTor01
            ? '¡Planilla Andrológica Procesada Exitosamente!'
            : '¡Tropa Ingresada Exitosamente!'}
      </DialogTitle>

      <DialogContent dividers>
        {result && isCact01 ? (
          <Cact01SuccessSummary result={result} />
        ) : result && isDest01 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success" sx={{ borderRadius: '6px' }}>
              Se destetaron <strong>{result.calves_count}</strong> cría(s) y quedaron en el lote de destete{' '}
              <strong>{result.batch_name}</strong>{result.batch_created ? ', creado en esta carga' : ''}.
            </Alert>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '6px' }}>
              <Stack spacing={1.2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Lote de destete:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {result.batch_name} {result.batch_created ? '(nuevo)' : '(existente)'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Crías destetadas:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {result.calves_count} ({result.males_count} machos · {result.females_count} hembras)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Crías pesadas:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{result.weighed_count}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Peso promedio de las pesadas:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {result.average_weight != null ? `${result.average_weight} kg` : '—'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        ) : result && isLser01 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success" sx={{ borderRadius: '6px' }}>
              Se creó el lote de servicio <strong>{result.batch_name}</strong> con{' '}
              <strong>{result.females_count}</strong> vientre(s), su orden de servicio y los movimientos de hacienda.
            </Alert>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: '6px' }}>
              <Stack spacing={1.2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Lote de servicio:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{result.batch_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Orden de servicio:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                    {result.service_order_code ?? '—'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Vientres ingresados:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{result.females_count}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        ) : result && isTor01 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success" sx={{ borderRadius: '6px' }}>
              Se procesó correctamente la revisación andrológica de{' '}
              <strong>{result.total_bulls_processed || 0}</strong> toros y se registraron{' '}
              <strong>{result.total_samples_created || 0}</strong> muestras de laboratorio (Raspaje ETS y Serología).
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={1.2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Evaluación:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {result.evaluation_date}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Toros en Manga:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {result.total_bulls_processed}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Muestras Biológicas Creadas:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0284c7' }}>
                    {result.total_samples_created} tubos
                  </Typography>
                </Box>

                {result.summary && (
                  <Box sx={{ pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Resumen Zootécnico & Físico:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ px: 1, py: 0.5, bgcolor: '#dcfce7', borderRadius: '4px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#15803d' }}>
                          ✓ Aptos: {result.summary.apt}
                        </Typography>
                      </Box>
                      <Box sx={{ px: 1, py: 0.5, bgcolor: '#fee2e2', borderRadius: '4px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#b91c1c' }}>
                          ✕ Rechazo: {result.summary.unfit}
                        </Typography>
                      </Box>
                      <Box sx={{ px: 1, py: 0.5, bgcolor: '#fef3c7', borderRadius: '4px' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#b45309' }}>
                          ⚠️ Tratamiento: {result.summary.under_treatment}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>
        ) : result ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success" sx={{ borderRadius: 0 }}>
              Se registraron correctamente <strong>{result.total_processed}</strong> animales en el lote{' '}
              <strong>{result.batch?.name}</strong>.
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 0,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Stack spacing={1.2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Lote Asignado:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {result.batch?.name}
                  </Typography>
                </Box>
                {(result.batch?.activity_name || result.batch?.activity_code) && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Actividad Asignada:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#16a34a' }}>
                      {result.batch?.activity_name || result.batch?.activity_code}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Establecimiento / Finca:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {result.batch?.farm_name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Peso Promedio del Lote:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {result.batch?.current_weight} kg
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={() => {
            onClose();
            onReset();
          }}
          variant="outlined"
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px' }}
        >
          Escanear Otra Planilla
        </Button>

        {isCact01 ? (
          <Button
            onClick={() => navigate('/activities')}
            variant="contained"
            color="primary"
            startIcon={<AgricultureIcon />}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '6px' }}
          >
            Ver Planilla de Actividades
          </Button>
        ) : isDest01 ? (
          <Button
            onClick={() => navigate('/gestation/weaning-batches')}
            variant="contained"
            color="primary"
            startIcon={<AgricultureIcon />}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '6px' }}
          >
            Ver Lotes de Destete
          </Button>
        ) : isTor01 || isLser01 ? (
          <Button
            onClick={() => navigate('/gestation/pre-service')}
            variant="contained"
            color="primary"
            startIcon={<PetsIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '6px',
              bgcolor: '#0a6ed1',
              '&:hover': { bgcolor: '#0854a0' },
            }}
          >
            Ir a Pre-Servicio
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/batches')}
            variant="contained"
            color="primary"
            startIcon={<AgricultureIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: '6px',
            }}
          >
            Ver Lotes
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ScanSuccessDialog;
