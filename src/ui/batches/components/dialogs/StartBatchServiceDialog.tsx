import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useStartBatchService } from '@/features/batches/hooks/useStartBatchService';
import { useSemenOptions } from '@/features/semen/hooks/useSemenOptions';
import { StartBatchFemalesStep } from './start-service/StartBatchFemalesStep';
import { StartBatchSiresStep } from './start-service/StartBatchSiresStep';
import { StartBatchParametersStep } from './start-service/StartBatchParametersStep';
import AiParametersStep from './start-service/AiParametersStep';
import { useStartServiceWizard } from './start-service/useStartServiceWizard';
import BatchQuickTransferDialog from '../details/BatchQuickTransferDialog';

interface StartBatchServiceDialogProps {
  open: boolean;
  onClose: () => void;
  batch: { id?: number; name?: string; farm_name?: string } | null;
  onSuccess?: () => void;
}

/**
 * "Iniciar servicio" (orchestrator): steps by method, validation on click and the mutation. An AI
 * service starting today or earlier goes straight to loading its inseminations (semen S-B, DB3).
 */
export const StartBatchServiceDialog: React.FC<StartBatchServiceDialogProps> = ({ open, onClose, batch, onSuccess }) => {
  const { activeCompanyId } = useCompany();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { data: allCaravans = [], isLoading: isLoadingCaravans } = useCaravans(open ? activeCompanyId : null, 'all');
  const semen = useSemenOptions();
  const w = useStartServiceWizard(open, batch?.id, allCaravans);
  const [settingApart, setSettingApart] = useState<number[] | null>(null);
  const startMutation = useStartBatchService(batch?.id);
  const isLastStep = w.activeStep === w.steps.length - 1;

  const handleNext = () => {
    const error = w.stepError();
    if (error) {
      enqueueSnackbar(error, { variant: 'warning' });
      return;
    }
    if (!isLastStep) {
      w.setActiveStep((prev) => prev + 1);
      return;
    }
    if (!batch?.id) return;
    startMutation.mutate(
      { id: batch.id, ...w.payload() },
      {
        onSuccess: (order: { id: number; service_method?: string }) => {
          onClose();
          onSuccess?.();
          const today = new Date().toISOString().split('T')[0];
          if (order?.service_method === 'AI' && w.plannedStartDate <= today) {
            navigate(`/gestation/service-orders/${order.id}/inseminations`);
          }
        },
      }
    );
  };

  if (!batch) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1 } }}>
      <DialogTitle sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '6px', display: 'flex' }}>
            <FuseSvgIcon size={20}>heroicons-outline:fire</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
              Iniciar Servicio: {batch.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              El servicio es una orden sobre este lote: no se crea otro lote
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stepper activeStep={w.activeStep} alternativeLabel>
            {w.steps.map((label) => (
              <Step key={label}>
                <StepLabel>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {isLoadingCaravans ? (
            <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <>
              {w.activeStep === 0 && (
                <StartBatchFemalesStep
                  batchName={batch.name ?? ''}
                  serviceableFemales={w.serviceableFemales}
                  pregnantCount={w.pregnantCount}
                  isControlledService={w.isControlledService}
                  setIsControlledService={w.setIsControlledService}
                  selectedFemaleIds={w.selectedFemaleIds}
                  setSelectedFemaleIds={w.setSelectedFemaleIds}
                  femaleSearch={w.femaleSearch}
                  setFemaleSearch={w.setFemaleSearch}
                  onSetApart={setSettingApart}
                  method={w.method}
                  onMethodChange={w.changeMethod}
                  picksIndividually={w.picksIndividually}
                  semen={
                    w.isAi
                      ? {
                          options: semen.options,
                          byId: semen.byId,
                          planned: w.plannedSemen,
                          plannedStraws: w.plannedStraws,
                          onPlan: (ids, itemId) => w.setPlannedSemen((prev) => ({ ...prev, ...Object.fromEntries(ids.map((id) => [id, itemId])) })),
                        }
                      : undefined
                  }
                />
              )}

              {!w.isAi && w.activeStep === 1 && (
                <StartBatchSiresStep
                  availableMales={w.availableMales}
                  selectedMaleIds={w.selectedMaleIds}
                  setSelectedMaleIds={w.setSelectedMaleIds}
                  femaleCount={w.exposedCount}
                  maleSearch={w.maleSearch}
                  setMaleSearch={w.setMaleSearch}
                />
              )}

              {!w.isAi && w.activeStep === 2 && (
                <StartBatchParametersStep
                  batchName={batch.name ?? ''}
                  plannedStartDate={w.plannedStartDate}
                  setPlannedStartDate={w.setPlannedStartDate}
                  plannedEndDate={w.plannedEndDate}
                  setPlannedEndDate={w.setPlannedEndDate}
                  serviceType={w.serviceType}
                  setServiceType={w.setServiceType}
                  observations={w.observations}
                  setObservations={w.setObservations}
                  femaleCount={w.exposedCount}
                  maleCount={w.selectedMaleIds.length}
                />
              )}

              {w.isAi && w.activeStep === 1 && (
                <AiParametersStep
                  batchName={batch.name ?? ''}
                  femaleCount={w.exposedCount}
                  plannedStraws={w.plannedStraws}
                  byId={semen.byId}
                  plannedStartDate={w.plannedStartDate}
                  setPlannedStartDate={w.setPlannedStartDate}
                  observations={w.observations}
                  setObservations={w.setObservations}
                />
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => w.setActiveStep((prev) => Math.max(0, prev - 1))}
          disabled={w.activeStep === 0 || startMutation.isPending}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          Atrás
        </Button>
        <Stack direction="row" spacing={1.5}>
          <Button variant="text" onClick={onClose} disabled={startMutation.isPending} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={startMutation.isPending}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '6px',
              bgcolor: isLastStep ? '#16a34a' : 'primary.main',
              '&:hover': { bgcolor: isLastStep ? '#15803d' : 'primary.dark' },
            }}
            startIcon={
              startMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : isLastStep ? (
                <FuseSvgIcon size={18}>heroicons-outline:check-circle</FuseSvgIcon>
              ) : undefined
            }
          >
            {isLastStep ? (startMutation.isPending ? 'Iniciando Servicio...' : w.isAi ? 'Iniciar IA' : 'Iniciar Servicio') : 'Siguiente'}
          </Button>
        </Stack>
      </DialogActions>
      <BatchQuickTransferDialog open={settingApart !== null} onClose={() => setSettingApart(null)} batch={batch} initialSelectedIds={settingApart ?? undefined} />
    </Dialog>
  );
};

export default StartBatchServiceDialog;
