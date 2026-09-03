import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCreateServiceBatch } from '@/features/batches/hooks/useCreateServiceBatch';
import { useCompany } from '@/contexts/CompanyContext';
import { useSnackbar } from 'notistack';

import { Step1Definition } from './service-batch-wizard/Step1Definition';
import { Step2FemaleRecruitment } from './service-batch-wizard/Step2FemaleRecruitment';
import { Step3SireSelection } from './service-batch-wizard/Step3SireSelection';
import { Step4Summary } from './service-batch-wizard/Step4Summary';

interface CreateServiceBatchWizardDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const steps = [
  'Definición y Categorías',
  'Reclutamiento de Vientres',
  'Selección de Toros',
  'Resumen y Confirmación',
];

const nextStepButtonLabels = [
  'Siguiente: Reclutar Vientres',
  'Siguiente: Seleccionar Toros',
  'Siguiente: Resumen y Confirmación',
];

/**
 * CreateServiceBatchWizardDialog
 * Thin orchestrator component following Clean Architecture & Atomic Component standards.
 */
export const CreateServiceBatchWizardDialog: React.FC<CreateServiceBatchWizardDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { activeCompanyId } = useCompany();

  const [activeStep, setActiveStep] = useState(0);

  // Form State - Step 1
  const [name, setName] = useState('');
  const [femaleCategoryId, setFemaleCategoryId] = useState<number | ''>('');
  const [femaleSubcategoryId, setFemaleSubcategoryId] = useState<number | ''>('');
  const [maleCategoryId, setMaleCategoryId] = useState<number | ''>('');
  const [plannedStartDate, setPlannedStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [targetBullRatio, setTargetBullRatio] = useState(3.0);
  const [observaciones, setObservaciones] = useState('');
  const [autoCreateServiceOrder, setAutoCreateServiceOrder] = useState(true);

  // Selection States - Steps 2 & 3
  const [selectedFemaleIds, setSelectedFemaleIds] = useState<number[]>([]);
  const [selectedMaleIds, setSelectedMaleIds] = useState<number[]>([]);
  const [femaleSearch, setFemaleSearch] = useState('');
  const [femaleBatchFilter, setFemaleBatchFilter] = useState<string>('ALL');
  const [maleSearch, setMaleSearch] = useState('');
  const [maleBatchFilter, setMaleBatchFilter] = useState<string>('ALL');

  // Queries & Mutations
  const { categories, getSubcategoryOptions } = useAnimalCategories();
  const { data: allCaravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId, 'all');
  const { data: allBatches = [] } = useBatches(undefined, undefined, 'own');
  const createServiceBatchMutation = useCreateServiceBatch();

  // Categories Filtering
  const femaleCategories = useMemo(
    () => categories.filter((c) => c.sex === 'H' || (c.sex as string) === 'F' || c.sex === 'BOTH'),
    [categories]
  );
  const maleCategories = useMemo(
    () => categories.filter((c) => c.sex === 'M' || (c.sex as string) === 'MACHO' || c.sex === 'BOTH'),
    [categories]
  );

  const selectedFemaleCategory = useMemo(
    () => femaleCategories.find((c) => c.id === Number(femaleCategoryId)),
    [femaleCategories, femaleCategoryId]
  );

  const subcategoryOptions = useMemo(
    () => (femaleCategoryId ? getSubcategoryOptions(Number(femaleCategoryId)) : []),
    [femaleCategoryId, getSubcategoryOptions]
  );

  // Available Females - Strictly homogeneous category
  const eligibleFemales = useMemo(() => {
    return allCaravans.filter((c) => {
      const isFemale = c.sex === 'H' || (c.sex as string) === 'F' || (c.sex as string) === 'HEMBRA';
      if (!isFemale) return false;
      if (c.active_gestation?.is_current) return false;

      // Must belong strictly to the chosen female category
      if (!femaleCategoryId || Number(c.category_id) !== Number(femaleCategoryId)) {
        return false;
      }

      if (femaleSubcategoryId && Number(c.subcategory_id) !== Number(femaleSubcategoryId)) {
        return false;
      }

      return true;
    });
  }, [allCaravans, femaleCategoryId, femaleSubcategoryId]);

  const filteredFemales = useMemo(() => {
    return eligibleFemales.filter((c) => {
      if (femaleBatchFilter !== 'ALL' && c.batch_id !== Number(femaleBatchFilter)) {
        return false;
      }
      if (femaleSearch.trim() !== '') {
        const query = femaleSearch.toLowerCase();
        const tag = c.identification?.toLowerCase() || '';
        const breed = c.breed?.toLowerCase() || '';
        const batch = c.batch_name?.toLowerCase() || '';
        return tag.includes(query) || breed.includes(query) || batch.includes(query);
      }
      return true;
    });
  }, [eligibleFemales, femaleBatchFilter, femaleSearch]);

  // Available Males - Strictly homogeneous category
  const eligibleMales = useMemo(() => {
    return allCaravans.filter((c) => {
      const isMale = c.sex === 'M' || (c.sex as string) === 'MACHO';
      if (!isMale) return false;

      // Must belong strictly to the chosen male category
      if (!maleCategoryId || Number(c.category_id) !== Number(maleCategoryId)) {
        return false;
      }

      return true;
    });
  }, [allCaravans, maleCategoryId]);

  const filteredMales = useMemo(() => {
    return eligibleMales.filter((c) => {
      if (maleBatchFilter !== 'ALL' && c.batch_id !== Number(maleBatchFilter)) {
        return false;
      }
      if (maleSearch.trim() !== '') {
        const query = maleSearch.toLowerCase();
        const tag = c.identification?.toLowerCase() || '';
        const breed = c.breed?.toLowerCase() || '';
        const batch = c.batch_name?.toLowerCase() || '';
        return tag.includes(query) || breed.includes(query) || batch.includes(query);
      }
      return true;
    });
  }, [eligibleMales, maleBatchFilter, maleSearch]);

  // Calculated Bull Ratio
  const currentRatio = useMemo(() => {
    if (selectedFemaleIds.length === 0) return 0;
    return Number(((selectedMaleIds.length / selectedFemaleIds.length) * 100).toFixed(2));
  }, [selectedFemaleIds.length, selectedMaleIds.length]);

  // Reset Form
  const resetForm = () => {
    setActiveStep(0);
    setName('');
    setFemaleCategoryId('');
    setFemaleSubcategoryId('');
    setMaleCategoryId('');
    setPlannedStartDate(new Date().toISOString().split('T')[0]);
    setPlannedEndDate('');
    setTargetBullRatio(3.0);
    setObservaciones('');
    setSelectedFemaleIds([]);
    setSelectedMaleIds([]);
    setFemaleSearch('');
    setFemaleBatchFilter('ALL');
    setMaleSearch('');
    setMaleBatchFilter('ALL');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Step Validation & Navigation
  const handleNext = () => {
    if (activeStep === 0) {
      if (!name.trim()) {
        enqueueSnackbar('Ingrese el nombre del lote de servicio.', { variant: 'warning' });
        return;
      }
      if (!femaleCategoryId) {
        enqueueSnackbar('Seleccione la categoría homogénea de las hembras.', { variant: 'warning' });
        return;
      }
      if (!maleCategoryId) {
        enqueueSnackbar('Seleccione la categoría de los machos/toros.', { variant: 'warning' });
        return;
      }
    }
    if (activeStep === 1) {
      if (selectedFemaleIds.length === 0) {
        enqueueSnackbar('Debe seleccionar al menos un vientre para el lote de servicio.', { variant: 'warning' });
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Handlers for step 2 & 3 selections
  const handleToggleFemale = (id: number) => {
    setSelectedFemaleIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFilteredFemales = () => {
    const filteredIds = filteredFemales.map((f) => f.id).filter(Boolean) as number[];
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedFemaleIds.includes(id));
    if (allSelected) {
      setSelectedFemaleIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedFemaleIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleMale = (id: number) => {
    setSelectedMaleIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFilteredMales = () => {
    const filteredIds = filteredMales.map((m) => m.id).filter(Boolean) as number[];
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedMaleIds.includes(id));
    if (allSelected) {
      setSelectedMaleIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedMaleIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Final Submit
  const handleSubmit = async () => {
    try {
      await createServiceBatchMutation.mutateAsync({
        name: name.trim(),
        female_category_id: Number(femaleCategoryId),
        female_subcategory_id: femaleSubcategoryId ? Number(femaleSubcategoryId) : null,
        male_category_id: Number(maleCategoryId),
        female_caravan_ids: selectedFemaleIds,
        male_caravan_ids: selectedMaleIds,
        target_bull_ratio: targetBullRatio,
        planned_start_date: plannedStartDate || null,
        planned_end_date: plannedEndDate || null,
        observaciones: observaciones || null,
        auto_create_service_order: autoCreateServiceOrder,
      });

      enqueueSnackbar('¡Lote de Servicio creado exitosamente!', { variant: 'success' });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al crear el lote de servicio';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Header aligned with CreateBatchDialog standard */}
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          Nuevo Lote de Servicio (Entore)
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      {/* Dialog Content delegating to specialized step components */}
      <DialogContent sx={{ p: 3, bgcolor: 'background.paper', minHeight: 420 }}>
        {activeStep === 0 && (
          <Step1Definition
            name={name}
            setName={setName}
            femaleCategoryId={femaleCategoryId}
            setFemaleCategoryId={setFemaleCategoryId}
            femaleSubcategoryId={femaleSubcategoryId}
            setFemaleSubcategoryId={setFemaleSubcategoryId}
            maleCategoryId={maleCategoryId}
            setMaleCategoryId={setMaleCategoryId}
            plannedStartDate={plannedStartDate}
            setPlannedStartDate={setPlannedStartDate}
            plannedEndDate={plannedEndDate}
            setPlannedEndDate={setPlannedEndDate}
            targetBullRatio={targetBullRatio}
            setTargetBullRatio={setTargetBullRatio}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
            femaleCategories={femaleCategories}
            maleCategories={maleCategories}
            subcategoryOptions={subcategoryOptions}
            onFemaleCategoryChange={() => setSelectedFemaleIds([])}
            onMaleCategoryChange={() => setSelectedMaleIds([])}
          />
        )}

        {activeStep === 1 && (
          <Step2FemaleRecruitment
            filteredFemales={filteredFemales}
            selectedFemaleIds={selectedFemaleIds}
            isLoadingCaravans={isLoadingCaravans}
            femaleSearch={femaleSearch}
            setFemaleSearch={setFemaleSearch}
            femaleBatchFilter={femaleBatchFilter}
            setFemaleBatchFilter={setFemaleBatchFilter}
            selectedCategoryName={selectedFemaleCategory?.name}
            allBatches={allBatches}
            handleToggleFemale={handleToggleFemale}
            handleSelectAllFilteredFemales={handleSelectAllFilteredFemales}
            onResetFilters={() => {
              setFemaleSearch('');
              setFemaleBatchFilter('ALL');
            }}
          />
        )}

        {activeStep === 2 && (
          <Step3SireSelection
            filteredMales={filteredMales}
            selectedMaleIds={selectedMaleIds}
            maleSearch={maleSearch}
            setMaleSearch={setMaleSearch}
            maleBatchFilter={maleBatchFilter}
            setMaleBatchFilter={setMaleBatchFilter}
            allBatches={allBatches}
            currentRatio={currentRatio}
            handleToggleMale={handleToggleMale}
            handleSelectAllFilteredMales={handleSelectAllFilteredMales}
          />
        )}

        {activeStep === 3 && (
          <Step4Summary
            name={name}
            selectedFemaleCount={selectedFemaleIds.length}
            selectedMaleCount={selectedMaleIds.length}
            currentRatio={currentRatio}
            autoCreateServiceOrder={autoCreateServiceOrder}
            setAutoCreateServiceOrder={setAutoCreateServiceOrder}
          />
        )}
      </DialogContent>

      {/* Dialog Actions aligned with CreateBatchDialog standard */}
      <DialogActions
        sx={{
          p: 2,
          px: 3,
          bgcolor: 'background.default',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Button
          onClick={activeStep === 0 ? handleClose : handleBack}
          variant="text"
          sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
        >
          {activeStep === 0 ? 'Cancelar' : 'Atrás'}
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                px: 3,
                fontWeight: 700,
                borderRadius: '6px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
              endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>}
            >
              {nextStepButtonLabels[activeStep]}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createServiceBatchMutation.isPending}
              variant="contained"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                px: 3.5,
                fontWeight: 700,
                borderRadius: '6px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
              startIcon={
                createServiceBatchMutation.isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
                )
              }
            >
              {createServiceBatchMutation.isPending ? 'Guardando...' : 'Confirmar y Crear Lote'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CreateServiceBatchWizardDialog;
