import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { useBulkTransferCaravans } from '@/features/caravans/hooks/useBulkTransferCaravans';

interface BatchGraphTesterPanelProps {
  open: boolean;
  onClose: () => void;
  batch: any;
  batchCaravans: any[];
}

const caravanRepository = new ApiCaravanRepository();

export default function BatchGraphTesterPanel({
  open,
  onClose,
  batch,
  batchCaravans,
}: BatchGraphTesterPanelProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { mutateAsync: transferCaravans } = useBulkTransferCaravans();

  // Quick inline inputs
  const [quickTag, setQuickTag] = useState<string>('TEST-' + Math.floor(100 + Math.random() * 900));
  const [quickDate, setQuickDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quickWeight, setQuickWeight] = useState<number>(185);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);

  // Quick Inject Ingress
  const handleQuickInject = async () => {
    if (!quickTag.trim() || !quickDate || !batch?.id) {
      toast.error('Completa caravana y fecha para inyectar');
      return;
    }

    setIsInjecting(true);
    try {
      await caravanRepository.upsert({
        identification: quickTag.trim(),
        entry_weight: Number(quickWeight),
        entry_date: quickDate,
        batch_id: batch.id,
        sex: 'M',
        teeth: 0,
        category: 'novillito',
      });

      queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });

      toast.success(`Caravana ${quickTag} inyectada al ${quickDate} (${quickWeight} kg)`);
      setQuickTag('TEST-' + Math.floor(100 + Math.random() * 900));
    } catch (err: any) {
      console.error('Error al inyectar:', err);
      toast.error(err.response?.data?.message || err.message || 'Error al inyectar');
    } finally {
      setIsInjecting(false);
    }
  };

  // Preset Scenario Runner: Ingress -> Weighting -> Egress Step
  const [isRunningScenario, setIsRunningScenario] = useState<boolean>(false);

  const handleRunFullScenario = async () => {
    if (!batch?.id) return;
    setIsRunningScenario(true);
    const prefix = 'SCENARIO-' + Math.floor(10 + Math.random() * 90);

    try {
      toast.info('Paso 1/3: Inyectando 4 caravanas de prueba (Fecha: 2026-02-01)...');
      const tags = [`${prefix}-L1`, `${prefix}-L2`, `${prefix}-P1`, `${prefix}-P2`];
      const weights = [155, 155, 205, 205]; // 2 ligeros, 2 pesados = promedio 180kg

      await caravanRepository.bulkUpsert(
        tags.map((tag, idx) => ({
          identification: tag,
          entry_weight: weights[idx],
          entry_date: '2026-02-01',
          batch_id: batch.id,
          sex: idx >= 2 ? 'M' : 'H',
          teeth: 0,
          category: 'novillito',
        }))
      );

      // Invalidate intermediate
      await queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      await queryClient.invalidateQueries({ queryKey: ['caravans'] });

      toast.info('Paso 2/3: Registrando pesaje de control general (Fecha: 2026-03-15)...');
      // Fetch fresh caravans to get IDs
      const freshCaravans = await caravanRepository.findAll(undefined, 'own');
      const createdItems = freshCaravans.filter((c: any) => tags.includes(c.identification));

      // Record increased weights
      if (createdItems.length > 0) {
        await caravanRepository.bulkRecordWeights(
          createdItems.map((c: any, idx: number) => ({
            caravan_id: c.id,
            weight: weights[idx] + 20, // +20 kg gain
            weighing_date: '2026-03-15',
            notes: 'Control de crecimiento de prueba',
          }))
        );
      }

      await queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      await queryClient.invalidateQueries({ queryKey: ['caravans'] });

      toast.info('Paso 3/3: Egresando la mitad pesada a Lote Reserva (Fecha: 2026-04-20)...');
      const heavyItems = createdItems.filter((c: any) => c.identification.includes('-P'));
      if (heavyItems.length > 0) {
        await transferCaravans({
          caravanIds: heavyItems.map((c: any) => c.id),
          targetBatchId: null, // Lote Reserva
          movementDate: '2026-04-20',
          reason: 'Egreso de prueba: Salto vertical en curva',
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      await queryClient.invalidateQueries({ queryKey: ['caravans'] });
      await queryClient.invalidateQueries({ queryKey: ['batches'] });

      toast.success('¡Escenario de prueba completado! Observa la curva y el escalón vertical.');
    } catch (err: any) {
      console.error('Error al ejecutar escenario:', err);
      toast.error(err.response?.data?.message || err.message || 'Error al ejecutar escenario');
    } finally {
      setIsRunningScenario(false);
    }
  };

  const filledInputStyle = {
    '& .MuiFilledInput-root': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      borderRadius: '6px',
      border: '1px solid',
      borderColor: 'divider',
      '&.Mui-focused': {
        borderColor: 'primary.main',
      },
      '&:before, &:after': { display: 'none' },
    },
  };

  return (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Box
        sx={{
          p: 2.5,
          my: 2,
          borderRadius: '8px',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.08)' : '#eff6ff',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe',
        }}
      >
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: '6px',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                }}
              >
                <FuseSvgIcon size={18}>heroicons-outline:beaker</FuseSvgIcon>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Simulador de Curva y Comportamiento del Gráfico
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                  Inyecta ingresos y egresos con fechas arbitrarias para observar la matemática del grafo.
                </Typography>
              </Box>
            </Stack>

            <IconButton size="small" onClick={onClose}>
              <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
            </IconButton>
          </Stack>

          {/* Quick inline strip */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: '6px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : '#ffffff',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
              INYECCIÓN RÁPIDA DE ANIMAL EN LOTE
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' },
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <TextField
                size="small"
                label="Caravana"
                value={quickTag}
                onChange={(e) => setQuickTag(e.target.value)}
                variant="filled"
                fullWidth
                sx={filledInputStyle}
              />

              <TextField
                size="small"
                type="date"
                label="Fecha Ingreso"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                variant="filled"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={filledInputStyle}
              />

              <TextField
                size="small"
                type="number"
                label="Peso (kg)"
                value={quickWeight}
                onChange={(e) => setQuickWeight(Number(e.target.value))}
                variant="filled"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                }}
                sx={filledInputStyle}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleQuickInject}
                disabled={isInjecting}
                startIcon={
                  isInjecting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <FuseSvgIcon size={16}>heroicons-outline:bolt</FuseSvgIcon>
                  )
                }
                sx={{
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '6px',
                  boxShadow: 'none',
                  py: 1,
                  bgcolor: '#16a34a',
                  '&:hover': { bgcolor: '#15803d' },
                }}
              >
                Inyectar Ingreso
              </Button>
            </Box>
          </Box>

          {/* Preset Buttons & Guides */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="small"
              onClick={handleRunFullScenario}
              disabled={isRunningScenario}
              startIcon={
                isRunningScenario ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <FuseSvgIcon size={16}>heroicons-outline:sparkles</FuseSvgIcon>
                )
              }
              sx={{
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '6px',
                boxShadow: 'none',
                bgcolor: '#0a6ed1',
                '&:hover': { bgcolor: '#08549e' },
              }}
            >
              Simular Ciclo Completo (Ingreso 2026-02-01 → Control 2026-03-15 → Salto 2026-04-20)
            </Button>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              💡 <b>Tip de lectura:</b> La línea azul dibuja el promedio (kg/cab) con saltos verticales en los traslados; la línea violeta punteada es la masa total en kilos que se conserva.
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Collapse>
  );
}
