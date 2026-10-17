import React, { useState, useMemo, useEffect } from 'react';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';
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
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useStartBatchService } from '@/features/batches/hooks/useStartBatchService';
import { StartBatchFemalesStep } from './start-service/StartBatchFemalesStep';
import { StartBatchSiresStep } from './start-service/StartBatchSiresStep';
import { StartBatchParametersStep } from './start-service/StartBatchParametersStep';
import BatchQuickTransferDialog from '../details/BatchQuickTransferDialog';

interface StartBatchServiceDialogProps {
  open: boolean;
  onClose: () => void;
  batch: { id?: number; name?: string; farm_name?: string } | null;
  onSuccess?: () => void;
}

const steps = ['Vientres del Lote', 'Selección de Torada', 'Parámetros del Servicio'];

export const StartBatchServiceDialog: React.FC<StartBatchServiceDialogProps> = ({
  open,
  onClose,
  batch,
  onSuccess,
}) => {
  const { activeCompanyId } = useCompany();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);

  // Queries
  const { data: allCaravans = [], isLoading: isLoadingCaravans } = useCaravans(
    open ? activeCompanyId : null,
    'all'
  );

  // Females of the batch: the empty ones are serviceable, the pregnant ones stay out.
  const batchFemales = useMemo(() => {
    if (!batch?.id) return [];
    return allCaravans.filter(
      (c: Caravan) => c.batch_id === batch.id && (c.sex === 'H' || (c.sex as string) === 'F' || (c.sex as string) === 'HEMBRA')
    );
  }, [allCaravans, batch?.id]);
  const serviceableFemales = useMemo(
    () => batchFemales.filter((c: Caravan) => !c.active_gestation && isBreedingCandidate(c)),
    [batchFemales]
  );
  const pregnantCount = batchFemales.length - serviceableFemales.length;

  // Toros disponibles en la empresa
  const availableMales = useMemo(() => {
    return allCaravans.filter(
      (c: Caravan) => (c.sex === 'M' || (c.sex as string) === 'MACHO') && isBreedingCandidate(c)
    );
  }, [allCaravans]);

  // Natural service exposes the whole batch; controlled service / AI picks a subset.
  const [isControlledService, setIsControlledService] = useState(false);
  const [selectedFemaleIds, setSelectedFemaleIds] = useState<number[]>([]);
  const [selectedMaleIds, setSelectedMaleIds] = useState<number[]>([]);
  const [femaleSearch, setFemaleSearch] = useState('');
  const [maleSearch, setMaleSearch] = useState('');

  // Estados de Parámetros
  const [plannedStartDate, setPlannedStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [plannedEndDate, setPlannedEndDate] = useState(() => {
    const end = new Date();
    end.setDate(end.getDate() + 90);
    return end.toISOString().split('T')[0];
  });
  const [serviceType, setServiceType] = useState<'single' | 'multi' | 'rotation'>('multi');
  const [observations, setObservations] = useState('');

  // Sincronización inicial al abrir
  useEffect(() => {
    if (open && batch) {
      setActiveStep(0);
      setIsControlledService(false);
    }
  }, [open, batch]);

  // Every serviceable female starts selected; a controlled service only picks among the ones
  // the owner did not exclude from breeding.
  useEffect(() => {
    setSelectedFemaleIds(serviceableFemales.filter((c) => c.is_breeding_eligible).map((c) => c.id!));
  }, [serviceableFemales]);
  const [settingApart, setSettingApart] = useState<number[] | null>(null);

  const exposedCount = isControlledService ? selectedFemaleIds.length : serviceableFemales.length;

  // Autoajuste de modalidad según cantidad de toros
  useEffect(() => {
    if (selectedMaleIds.length === 1) {
      setServiceType('single');
    } else if (selectedMaleIds.length > 1 && serviceType === 'single') {
      setServiceType('multi');
    }
  }, [selectedMaleIds.length, serviceType]);

  const startMutation = useStartBatchService(batch?.id);

  // The primary button is never disabled for missing data: it validates on click.
  const stepError = (): string | null => {
    if (activeStep === 0 && exposedCount === 0) return 'No hay vientres vacíos para exponer al servicio.';
    if (activeStep === 1 && selectedMaleIds.length === 0) return 'Seleccioná al menos un toro.';
    if (activeStep === 2 && !plannedStartDate) return 'Indicá la fecha de inicio del servicio.';
    return null;
  };

  const handleNext = () => {
    const error = stepError();
    if (error) {
      enqueueSnackbar(error, { variant: 'warning' });
      return;
    }
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = () => {
    if (!batch?.id) return;

    startMutation.mutate(
      {
        id: batch.id,
        male_caravan_ids: selectedMaleIds,
        is_controlled_service: isControlledService,
        selected_female_caravan_ids: isControlledService ? selectedFemaleIds : undefined,
        planned_start_date: plannedStartDate,
        planned_end_date: plannedEndDate,
        service_type: serviceType,
        observations: observations,
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  if (!batch) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '8px', boxShadow: 1 },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: '6px',
              display: 'flex',
            }}
          >
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
          {/* Stepper Superior */}
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
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
              {activeStep === 0 && (
                <StartBatchFemalesStep
                  batchName={batch.name}
                  serviceableFemales={serviceableFemales}
                  pregnantCount={pregnantCount}
                  isControlledService={isControlledService}
                  setIsControlledService={setIsControlledService}
                  selectedFemaleIds={selectedFemaleIds}
                  setSelectedFemaleIds={setSelectedFemaleIds}
                  femaleSearch={femaleSearch}
                  setFemaleSearch={setFemaleSearch}
                  onSetApart={setSettingApart}
                />
              )}

              {activeStep === 1 && (
                <StartBatchSiresStep
                  availableMales={availableMales}
                  selectedMaleIds={selectedMaleIds}
                  setSelectedMaleIds={setSelectedMaleIds}
                  femaleCount={exposedCount}
                  maleSearch={maleSearch}
                  setMaleSearch={setMaleSearch}
                />
              )}

              {activeStep === 2 && (
                <StartBatchParametersStep
                  batchName={batch.name}
                  plannedStartDate={plannedStartDate}
                  setPlannedStartDate={setPlannedStartDate}
                  plannedEndDate={plannedEndDate}
                  setPlannedEndDate={setPlannedEndDate}
                  serviceType={serviceType}
                  setServiceType={setServiceType}
                  observations={observations}
                  setObservations={setObservations}
                  femaleCount={exposedCount}
                  maleCount={selectedMaleIds.length}
                />
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: 'divider', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0 || startMutation.isPending}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          Atrás
        </Button>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="text"
            onClick={onClose}
            disabled={startMutation.isPending}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
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
              bgcolor: activeStep === steps.length - 1 ? '#16a34a' : 'primary.main',
              '&:hover': {
                bgcolor: activeStep === steps.length - 1 ? '#15803d' : 'primary.dark',
              },
            }}
            startIcon={
              startMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : activeStep === steps.length - 1 ? (
                <FuseSvgIcon size={18}>heroicons-outline:check-circle</FuseSvgIcon>
              ) : undefined
            }
          >
            {activeStep === steps.length - 1
              ? startMutation.isPending
                ? 'Iniciando Servicio...'
                : 'Iniciar Servicio'
              : 'Siguiente'}
          </Button>
        </Stack>
      </DialogActions>
      <BatchQuickTransferDialog
        open={settingApart !== null}
        onClose={() => setSettingApart(null)}
        batch={batch}
        initialSelectedIds={settingApart ?? undefined}
      />
    </Dialog>
  );
};

export default StartBatchServiceDialog;
