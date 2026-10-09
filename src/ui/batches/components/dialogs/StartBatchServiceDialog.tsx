import React, { useState, useMemo, useEffect } from 'react';
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
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useStartBatchService } from '@/features/batches/hooks/useStartBatchService';
import { StartBatchFemalesStep } from './start-service/StartBatchFemalesStep';
import { StartBatchSiresStep } from './start-service/StartBatchSiresStep';
import { StartBatchParametersStep } from './start-service/StartBatchParametersStep';

interface StartBatchServiceDialogProps {
  open: boolean;
  onClose: () => void;
  batch: any;
  onSuccess?: () => void;
}

const steps = [
  'Vientres del Lote Base',
  'Selección de Torada',
  'Parámetros del Entore',
];

export const StartBatchServiceDialog: React.FC<StartBatchServiceDialogProps> = ({
  open,
  onClose,
  batch,
  onSuccess,
}) => {
  const { activeCompanyId } = useCompany();
  const [activeStep, setActiveStep] = useState(0);

  // Queries
  const { data: allCaravans = [], isLoading: isLoadingCaravans } = useCaravans(
    open ? activeCompanyId : null,
    'all'
  );

  // Hembras residentes del lote base
  const batchFemales = useMemo(() => {
    if (!batch?.id) return [];
    return allCaravans.filter(
      (c: any) =>
        c.batch_id === batch.id &&
        (c.sex === 'H' || c.sex === 'F' || (c.sex as string) === 'HEMBRA')
    );
  }, [allCaravans, batch?.id]);

  // Toros disponibles en la empresa
  const availableMales = useMemo(() => {
    return allCaravans.filter(
      (c: any) => c.sex === 'M' || (c.sex as string) === 'MACHO'
    );
  }, [allCaravans]);

  // Estados de Selección
  const [selectedFemaleIds, setSelectedFemaleIds] = useState<number[]>([]);
  const [selectedMaleIds, setSelectedMaleIds] = useState<number[]>([]);
  const [femaleSearch, setFemaleSearch] = useState('');
  const [maleSearch, setMaleSearch] = useState('');

  // Estados de Parámetros
  const [serviceBatchName, setServiceBatchName] = useState('');
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
      setServiceBatchName(`${batch.name} - Servicio ${new Date().getFullYear()}`);
    }
  }, [open, batch]);

  // Autoseleccionar todas las hembras del lote por defecto
  useEffect(() => {
    if (batchFemales.length > 0) {
      setSelectedFemaleIds(batchFemales.map((c) => c.id!));
    }
  }, [batchFemales]);

  // Autoajuste de modalidad según cantidad de toros
  useEffect(() => {
    if (selectedMaleIds.length === 1) {
      setServiceType('single');
    } else if (selectedMaleIds.length > 1 && serviceType === 'single') {
      setServiceType('multi');
    }
  }, [selectedMaleIds.length, serviceType]);

  const startMutation = useStartBatchService(batch?.id);

  const canGoNext = useMemo(() => {
    if (activeStep === 0) return selectedFemaleIds.length > 0;
    if (activeStep === 1) return selectedMaleIds.length > 0;
    return Boolean(serviceBatchName.trim() && plannedStartDate);
  }, [activeStep, selectedFemaleIds.length, selectedMaleIds.length, serviceBatchName, plannedStartDate]);

  const handleNext = () => {
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
        service_batch_name: serviceBatchName,
        male_caravan_ids: selectedMaleIds,
        selected_female_caravan_ids: selectedFemaleIds,
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
      maxWidth="md"
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
              Iniciar Servicio de Entore: {batch.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Actividad Cría • Temporada Reproductiva Estacionada
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
                  batchFemales={batchFemales}
                  selectedFemaleIds={selectedFemaleIds}
                  setSelectedFemaleIds={setSelectedFemaleIds}
                  femaleSearch={femaleSearch}
                  setFemaleSearch={setFemaleSearch}
                />
              )}

              {activeStep === 1 && (
                <StartBatchSiresStep
                  availableMales={availableMales}
                  selectedMaleIds={selectedMaleIds}
                  setSelectedMaleIds={setSelectedMaleIds}
                  femaleCount={selectedFemaleIds.length}
                  maleSearch={maleSearch}
                  setMaleSearch={setMaleSearch}
                />
              )}

              {activeStep === 2 && (
                <StartBatchParametersStep
                  batchName={batch.name}
                  serviceBatchName={serviceBatchName}
                  setServiceBatchName={setServiceBatchName}
                  plannedStartDate={plannedStartDate}
                  setPlannedStartDate={setPlannedStartDate}
                  plannedEndDate={plannedEndDate}
                  setPlannedEndDate={setPlannedEndDate}
                  serviceType={serviceType}
                  setServiceType={setServiceType}
                  observations={observations}
                  setObservations={setObservations}
                  femaleCount={selectedFemaleIds.length}
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
            disabled={!canGoNext || startMutation.isPending}
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
    </Dialog>
  );
};

export default StartBatchServiceDialog;
