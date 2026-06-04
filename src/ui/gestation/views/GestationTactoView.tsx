import { useMemo, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Button,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Grid
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useServiceOrders, useRegisterGestationDiagnosis, useCompleteServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { toast } from 'sonner';
import ServiceOrderWorkCard from '../components/ServiceOrderWorkCard';

// Helper to get Spanish labels for gestation stages
const getStageLabel = (stage?: string) => {
  switch (stage) {
    case 'head': return 'Cabeza';
    case 'body': return 'Cuerpo';
    case 'tail': return 'Cola';
    default: return '-';
  }
};

interface DiagnosisModalState {
  open: boolean;
  caravanId: number;
  caravanIdent: string;
  category: string;
  serviceOrderId: number;
  maleCaravanIds: number[];
}

function GestationTactoView() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeCompanyId } = useCompany();

  // 1. Fetch data from hooks
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);
  const { data: orders = [], isLoading: isLoadingOrders } = useServiceOrders();
  const { data: dbBatches = [], isLoading: isLoadingBatches } = useBatches();
  
  const registerDiagnosisMutation = useRegisterGestationDiagnosis();
  const completeOrderMutation = useCompleteServiceOrder();

  // 2. Local UI States
  const [closingOrderId, setClosingOrderId] = useState<number | null>(null);
  const [closeStep, setCloseStep] = useState<'move' | 'confirm' | null>(null);
  const [targetBatchId, setTargetBatchId] = useState<number | 'none'>('none');

  const [diagnosisModal, setDiagnosisModal] = useState<DiagnosisModalState>({
    open: false,
    caravanId: 0,
    caravanIdent: '',
    category: '',
    serviceOrderId: 0,
    maleCaravanIds: []
  });

  const [isPregnant, setIsPregnant] = useState<boolean>(true);
  const [diagnosisDate, setDiagnosisDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [gestationStage, setGestationStage] = useState<string>('head');
  const [gestationMonths, setGestationMonths] = useState<number>(3);
  const [confirmedSireId, setConfirmedSireId] = useState<number | 'none'>('none');

  // Mappings
  const batchMap = useMemo(() => new Map(dbBatches.map(b => [b.id, b.name])), [dbBatches]);
  const caravanMap = useMemo(() => new Map(caravans.map(c => [c.id, c])), [caravans]);

  const getBatchName = (batchId: number) => batchMap.get(batchId) || `Lote #${batchId}`;
  
  // Filter active service orders (approved only)
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status === 'APPROVED');
  }, [orders]);

  // Handle dialog opening
  const handleOpenDiagnosis = (caravanId: number, serviceOrderId: number, maleCaravanIds: number[]) => {
    const caravan = caravanMap.get(caravanId);
    setDiagnosisModal({
      open: true,
      caravanId,
      caravanIdent: caravan?.identification || `#${caravanId}`,
      category: caravan?.category || 'N/A',
      serviceOrderId,
      maleCaravanIds
    });
    
    // Reset inputs
    setIsPregnant(true);
    setDiagnosisDate(new Date().toISOString().split('T')[0]);
    setGestationStage('head');
    setGestationMonths(3);
    
    // Auto-select sire if there is only one bull in the service order
    if (maleCaravanIds.length === 1) {
      setConfirmedSireId(maleCaravanIds[0]);
    } else {
      setConfirmedSireId('none');
    }
  };

  const handleCloseDiagnosis = () => {
    setDiagnosisModal({
      open: false,
      caravanId: 0,
      caravanIdent: '',
      category: '',
      serviceOrderId: 0,
      maleCaravanIds: []
    });
  };

  // Submit diagnosis request
  const handleSubmitDiagnosis = async () => {
    try {
      await registerDiagnosisMutation.mutateAsync({
        caravanId: diagnosisModal.caravanId,
        serviceOrderId: diagnosisModal.serviceOrderId,
        isPregnant,
        gestationStage: isPregnant ? gestationStage : null,
        gestationMonths: isPregnant ? gestationMonths : null,
        confirmedSireId: isPregnant && confirmedSireId !== 'none' ? confirmedSireId : null,
        diagnosisDate
      });

      toast.success('Diagnóstico registrado exitosamente');
      handleCloseDiagnosis();
    } catch (e: any) {
      toast.error(`Error al registrar diagnóstico: ${e.response?.data?.message || e.message}`);
    }
  };

  // Initiate service order closing workflow
  const handleInitiateCloseOrder = (orderId: number) => {
    const orderObj = orders.find(o => o.id === orderId);
    if (!orderObj) return;

    // Map female caravans of the order
    const orderFemales = orderObj.female_caravan_ids
      .map(id => caravans.find(c => c.id === id))
      .filter(Boolean);

    // Filter empty/unpregnant females (active_gestation === null)
    const emptyFemales = orderFemales.filter(c => c.active_gestation === null);

    setClosingOrderId(orderId);
    if (emptyFemales.length > 0) {
      setCloseStep('move');
    } else {
      setCloseStep('confirm');
    }
  };

  // Complete service order request
  const handleCompleteOrder = async () => {
    if (!closingOrderId) return;

    try {
      await completeOrderMutation.mutateAsync({
        id: closingOrderId,
        targetBatchId: targetBatchId !== 'none' ? targetBatchId : null
      });
      toast.success('Orden de servicio completada exitosamente');
      // Reset states
      setClosingOrderId(null);
      setCloseStep(null);
      setTargetBatchId('none');
    } catch (e: any) {
      toast.error(`Error al completar la orden: ${e.response?.data?.message || e.message}`);
    }
  };



  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === closingOrderId) || null;
  }, [closingOrderId, orders]);

  const emptyCount = useMemo(() => {
    if (!selectedOrder) return 0;
    const orderFemales = selectedOrder.female_caravan_ids
      .map(id => caravans.find(c => c.id === id))
      .filter(Boolean);
    return orderFemales.filter(c => c.active_gestation === null).length;
  }, [selectedOrder, caravans]);

  if (isLoadingCaravans || isLoadingOrders || isLoadingBatches) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando listado de tactos y órdenes...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Tacto y Diagnósticos de Preñez"
      subtitle="Supervise e ingrese los resultados gestacionales de los vientres agrupados por Orden de Servicio o Rotación."
      actions={
        <Button
          variant="text"
          startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>}
          onClick={() => navigate('/gestation')}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Volver al Dashboard
        </Button>
      }
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Órdenes de Servicio Reproductivo en Ejecución
          </Typography>
        </Stack>

        {activeOrders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: 1,
              borderColor: 'divider',
              borderRadius: '8px',
              bgcolor: 'background.paper',
            }}
          >
            <FuseSvgIcon size={48} className="text-disabled mb-2">heroicons-outline:document-text</FuseSvgIcon>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
              No hay órdenes de servicio activas.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              Crea o ejecuta una orden de monta en la sección de "Rotación de Toros" para poder diagnosticar vientres.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {activeOrders.map((order) => (
              <Grid size={{ xs: 12, md: 6 }} key={order.id}>
                <ServiceOrderWorkCard
                  order={order}
                  caravans={caravans}
                  batchName={getBatchName(order.batch_id)}
                  onOpenDiagnosis={(caravanId, serviceOrderId, maleCaravanIds) =>
                    handleOpenDiagnosis(caravanId, serviceOrderId, maleCaravanIds)
                  }
                  onPrintSheet={(ord) => {
                    navigate(`/work-templates/REP-01?orderId=${ord.id}`);
                  }}
                  onBulkEntry={(orderId) => navigate(`/gestation/service-orders/${orderId}/bulk-tacto`)}
                  onCompleteOrder={handleInitiateCloseOrder}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {/* DIAGNOSIS DIALOG */}
      <Dialog 
        open={diagnosisModal.open} 
        onClose={handleCloseDiagnosis}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Diagnóstico de Preñez: Caravana {diagnosisModal.caravanIdent}
          </Typography>
          <IconButton onClick={handleCloseDiagnosis} size="small">
            <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {/* Pregnancy Switch / Toggle */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontSize: '0.8rem', fontWeight: 700, mb: 1 }}>Resultado del Tacto / Ecografía</FormLabel>
              <RadioGroup
                row
                value={isPregnant ? 'pregnant' : 'empty'}
                onChange={(e) => setIsPregnant(e.target.value === 'pregnant')}
              >
                <FormControlLabel value="pregnant" control={<Radio size="small" />} label="Preñada" />
                <FormControlLabel value="empty" control={<Radio size="small" />} label="Vacía" />
              </RadioGroup>
            </FormControl>

            {/* Diagnosis Date */}
            <TextField
              required
              label="Fecha del Diagnóstico"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={diagnosisDate}
              onChange={(e) => setDiagnosisDate(e.target.value)}
            />

            {isPregnant && (
              <>
                {/* Gestation Stage */}
                <FormControl fullWidth size="small">
                  <InputLabel id="stage-select-label">Estadio Estimado (Parición)</InputLabel>
                  <Select
                    labelId="stage-select-label"
                    value={gestationStage}
                    label="Estadio Estimado (Parición)"
                    onChange={(e) => {
                      const stage = e.target.value;
                      setGestationStage(stage);
                      // Auto-set default months
                      if (stage === 'head') setGestationMonths(3);
                      else if (stage === 'body') setGestationMonths(2);
                      else if (stage === 'tail') setGestationMonths(1);
                    }}
                  >
                    <MenuItem value="head">Cabeza (Más de 2 meses)</MenuItem>
                    <MenuItem value="body">Cuerpo (Entre 1 y 2 meses)</MenuItem>
                    <MenuItem value="tail">Cola (Menos de 1 mes)</MenuItem>
                  </Select>
                </FormControl>

                {/* Gestation Months */}
                <TextField
                  type="number"
                  label="Meses de Preñez Estimados"
                  size="small"
                  inputProps={{ min: 0.5, max: 9.5, step: 0.5 }}
                  value={gestationMonths}
                  onChange={(e) => setGestationMonths(Number(e.target.value))}
                />

                {/* Sire Confirmation */}
                <FormControl fullWidth size="small">
                  <InputLabel id="sire-select-label">Toro Confirmado (Padre)</InputLabel>
                  <Select
                    labelId="sire-select-label"
                    value={confirmedSireId}
                    label="Toro Confirmado (Padre)"
                    onChange={(e) => setConfirmedSireId(e.target.value as number | 'none')}
                  >
                    <MenuItem value="none"><em>-- Colectivo / Indeterminado --</em></MenuItem>
                    {diagnosisModal.maleCaravanIds.map(id => {
                      const bull = caravanMap.get(id);
                      return (
                        <MenuItem key={id} value={id}>
                           {bull?.identification || `Toro #${id}`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDiagnosis} 
            variant="text" 
            size="small" 
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitDiagnosis} 
            color={isPregnant ? 'success' : 'primary'} 
            variant="contained" 
            size="small" 
            disabled={registerDiagnosisMutation.isPending}
            sx={{ textTransform: 'none', color: '#fff', px: 3 }}
          >
            {registerDiagnosisMutation.isPending ? 'Guardando...' : 'Guardar Diagnóstico'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIÁLOGO DE TRASLADO DE VIENTRES VACÍOS */}
      <Dialog
        open={closingOrderId !== null && closeStep === 'move'}
        onClose={() => {
          setClosingOrderId(null);
          setCloseStep(null);
          setTargetBatchId('none');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Vientres Vacíos Detectados
          </Typography>
          <IconButton
            onClick={() => {
              setClosingOrderId(null);
              setCloseStep(null);
              setTargetBatchId('none');
            }}
            size="small"
          >
            <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Se detectaron <strong>{emptyCount}</strong> vientres vacíos (sin preñez activa) en esta orden.
              Para poder cerrarla, debes transferirlos a otro lote lógico.
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel id="target-batch-select-label">Lote de Destino</InputLabel>
              <Select
                labelId="target-batch-select-label"
                value={targetBatchId}
                label="Lote de Destino"
                onChange={(e) => setTargetBatchId(e.target.value as number | 'none')}
              >
                <MenuItem value="none" disabled>
                  <em>-- Selecciona un Lote --</em>
                </MenuItem>
                {dbBatches
                  .filter(b => selectedOrder && b.id !== selectedOrder.batch_id)
                  .map(batch => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setClosingOrderId(null);
              setCloseStep(null);
              setTargetBatchId('none');
            }}
            variant="text"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (targetBatchId === 'none') {
                toast.error('Por favor, selecciona un lote de destino para continuar.');
                return;
              }
              setCloseStep('confirm');
            }}
            color="primary"
            variant="contained"
            size="small"
            sx={{ textTransform: 'none', color: '#fff', px: 3 }}
          >
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

      {/* CONFIRM COMPLETE SERVICE ORDER DIALOG */}
      <Dialog
        open={closingOrderId !== null && closeStep === 'confirm'}
        onClose={() => {
          setClosingOrderId(null);
          setCloseStep(null);
          setTargetBatchId('none');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Confirmar Cierre de Orden
          </Typography>
          <IconButton
            onClick={() => {
              setClosingOrderId(null);
              setCloseStep(null);
              setTargetBatchId('none');
            }}
            size="small"
          >
            <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              ¿Estás seguro de que deseas cerrar esta orden de servicio? Esta acción es irreversible y marcará la orden como finalizada.
            </Typography>
            {targetBatchId !== 'none' && (
              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700, display: 'block' }}>
                * Se trasladarán {emptyCount} vientres vacíos al lote: "{dbBatches.find(b => b.id === targetBatchId)?.name}".
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setClosingOrderId(null);
              setCloseStep(null);
              setTargetBatchId('none');
            }}
            variant="text"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCompleteOrder}
            color="error"
            variant="contained"
            size="small"
            disabled={completeOrderMutation.isPending}
            sx={{ textTransform: 'none', color: '#fff', px: 3 }}
          >
            {completeOrderMutation.isPending ? 'Cerrando...' : 'Cerrar Orden'}
          </Button>
        </DialogActions>
      </Dialog>
    </ViewLayout>
  );
}

export default GestationTactoView;
