import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  IconButton,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateBatch } from '@/features/batches/hooks/useCreateBatch';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';
import { batchSchema, BatchFormValues } from './BatchSchema';
import BatchTypeSelector from './create/BatchTypeSelector';
import ManagementSystemSelector from './create/ManagementSystemSelector';

interface CreateBatchDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (createdBatch: any) => void;
  initialFarmId?: number;
}

/**
 * CreateBatchDialog Component
 * Modal for quick creation of own batches associated with the active company.
 */
function CreateBatchDialog({ open, onClose, onSuccess, initialFarmId }: CreateBatchDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { activeCompanyId } = useCompany();
  const { data: activities = [], isLoading: isLoadingActivities } = useActivities(activeCompanyId);
  const { data: batchTypes = [], isLoading: isLoadingBatchTypes } = useBatchTypes();
  const { mutate, isPending } = useCreateBatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: '',
      is_own: true,
      provider_id: undefined,
      farm_id: null,
      activity_id: undefined,
      batch_type_id: undefined,
      weight: undefined,
      min_weight: undefined,
      max_weight: undefined,
      knows_to_eat: false,
      is_confined: undefined,
      age_in_months: undefined,
      observaciones: ''
    }
  });

  const selectedActivityId = watch('activity_id');
  const selectedBatchTypeId = watch('batch_type_id');
  const isConfined = watch('is_confined');

  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === selectedActivityId),
    [activities, selectedActivityId]
  );

  // The management system is a fact of the batch, not of the stage: a Cría batch can
  // be penned just like a Recría one. It is asked for in every productive activity.
  // INTERNAL is excluded because it is not a stage, it is where the system's own
  // batches live, and it is not offered by the picker anyway.
  const declaresManagement = Boolean(selectedActivity) && selectedActivity?.code !== 'INTERNAL';

  // Catalogue rules, resolved in memory: the catalogue is twelve rows cached for an
  // hour, so changing activity re-filters instantly without a refetch, and the other
  // dialogs that resolve a type by code keep reading the unfiltered list.
  //
  // Two rules apply. The type must fit the activity, unless it is cross-cutting; and
  // it must be one that is picked by hand at all, which is why the reserve batch type
  // does not show up here even though it is cross-cutting.
  const filteredBatchTypes = useMemo(() => {
    const selectable = batchTypes.filter((t) => t.is_selectable !== false);

    if (!selectedActivityId) return selectable;

    return selectable.filter(
      (t) => t.activity_id === selectedActivityId || t.activity_id == null
    );
  }, [batchTypes, selectedActivityId]);

  // Visible preselection of the first compatible type, preferring OPERATIONAL when it
  // is available: whoever does not want to classify does not have to. If the type
  // already chosen is still compatible it is respected.
  useEffect(() => {
    if (filteredBatchTypes.length === 0) return;

    const stillCompatible = filteredBatchTypes.some((t) => t.id === selectedBatchTypeId);

    if (stillCompatible) return;

    const fallback =
      filteredBatchTypes.find((t) => t.code === 'OPERATIONAL') || filteredBatchTypes[0];

    setValue('batch_type_id', fallback.id);
  }, [filteredBatchTypes, selectedBatchTypeId, setValue]);

  // Automatically preselect the company's initial activity
  useEffect(() => {
    if (activities.length > 0) {
      const initialActivity = activities.find((a) => a.isEnabled && a.isInitial) || activities.find((a) => a.isEnabled);
      if (initialActivity) {
        setValue('activity_id', initialActivity.id);
      }
    }
  }, [activities, setValue]);

  const handleOnSuccess = (data: BatchFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { provider_id, is_own, farm_id, is_confined: declaredManagement, ...requestData } = data;

    const payload = {
      ...requestData,
      farm_id: null,
      // The key travels whenever the producer answered. An unanswered question is not
      // sent, and the batch is created with the management system undeclared rather
      // than with a "pasture" nobody stated.
      ...(declaredManagement === true || declaredManagement === false
        ? { is_confined: declaredManagement }
        : {})
    };

    mutate(payload as any, {
      onSuccess: (response: any) => {
        enqueueSnackbar('Lote creado exitosamente', { variant: 'success' });
        reset();
        if (onSuccess) onSuccess(response);
        onClose();
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Error al crear el lote';
        enqueueSnackbar(message, { variant: 'error' });
      }
    });
  };

  // Counterpart in the UI of the backend rule: nothing is submitted until the producer
  // declares the management system of the batch.
  const isManagementUndeclared =
    declaresManagement && isConfined !== true && isConfined !== false;

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
          bgcolor: 'background.paper'
        }
      }}
    >
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          Alta Rápida de Lote
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(handleOnSuccess)}>
        <DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Stack spacing={3}>
            <TextField
              {...register('name')}
              label="Nombre del Lote"
              variant="filled"
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ bgcolor: 'action.hover' }}
            />

            <TextField
              select
              label="Etapa / Actividad Inicial"
              value={watch('activity_id') || ''}
              onChange={(e) => setValue('activity_id', Number(e.target.value))}
              variant="filled"
              fullWidth
              required
              error={!!errors.activity_id}
              helperText={errors.activity_id?.message || (isLoadingActivities ? 'Cargando actividades...' : '')}
              sx={{ bgcolor: 'action.hover' }}
            >
              {activities.filter(a => a.isEnabled !== false).map((activity) => (
                <MenuItem key={activity.id} value={activity.id}>
                  {activity.name} {activity.isInitial ? '(Etapa Inicial)' : ''}
                </MenuItem>
              ))}
            </TextField>

            <BatchTypeSelector
              batchTypes={filteredBatchTypes}
              value={selectedBatchTypeId}
              onChange={(id) => setValue('batch_type_id', id)}
              isLoading={isLoadingBatchTypes}
              error={errors.batch_type_id?.message?.toString()}
            />

            {declaresManagement && (
              <ManagementSystemSelector
                value={isConfined}
                onChange={(value) => setValue('is_confined', value)}
              />
            )}

            <TextField
              {...register('weight')}
              label="Peso Promedio Inicial (kg/cab)"
              variant="filled"
              fullWidth
              type="number"
              error={!!errors.weight}
              helperText={errors.weight?.message?.toString()}
              sx={{ bgcolor: 'action.hover' }}
              InputProps={{
                endAdornment: <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1 }}>KG</Typography>
              }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                {...register('min_weight')}
                label="Peso Mínimo (Opcional)"
                variant="filled"
                fullWidth
                type="number"
                error={!!errors.min_weight}
                helperText={errors.min_weight?.message?.toString()}
                sx={{ bgcolor: 'action.hover' }}
                InputProps={{
                  endAdornment: <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1 }}>KG</Typography>
                }}
              />
              <TextField
                {...register('max_weight')}
                label="Peso Máximo (Opcional)"
                variant="filled"
                fullWidth
                type="number"
                error={!!errors.max_weight}
                helperText={errors.max_weight?.message?.toString()}
                sx={{ bgcolor: 'action.hover' }}
                InputProps={{
                  endAdornment: <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1 }}>KG</Typography>
                }}
              />
            </Stack>

            <Alert severity="info" sx={{ mt: 1, fontSize: '0.75rem', py: 0.5, '& .MuiAlert-message': { width: '100%', lineHeight: 1.3 } }}>
              <strong>Nota:</strong> Los pesos mínimo y máximo manuales sirven como referencia inicial. Se recalcularán automáticamente en base al pesaje real de los animales una vez asignados.
            </Alert>

            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                {...register('age_in_months')}
                label="Edad (Meses - Opcional)"
                variant="filled"
                fullWidth
                type="number"
                error={!!errors.age_in_months}
                helperText={errors.age_in_months?.message?.toString()}
                sx={{ bgcolor: 'action.hover', flex: 1 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={watch('knows_to_eat') || false}
                    onChange={(e) => setValue('knows_to_eat', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ userSelect: 'none' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.1 }}>Sabe Comer</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', display: 'block', mt: 0.25 }}>¿Saben comer de comedero?</Typography>
                  </Box>
                }
                sx={{ flex: 1.2, ml: 1 }}
              />
            </Stack>

            <TextField
              {...register('observaciones')}
              label="Observaciones"
              variant="filled"
              fullWidth
              multiline
              rows={3}
              sx={{ bgcolor: 'action.hover' }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            px: 3,
            bgcolor: 'background.default',
            borderTop: 1,
            borderColor: 'divider',
            gap: 1.5
          }}
        >
          <Button
            onClick={handleClose}
            variant="text"
            sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending || isManagementUndeclared}
            variant="contained"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 4,
              fontWeight: 700,
              borderRadius: '6px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {isPending ? 'Guardando...' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CreateBatchDialog;
