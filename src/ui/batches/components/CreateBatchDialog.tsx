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
      age_in_months: undefined,
      observaciones: ''
    }
  });

  // Automatically select 'OPERATIONAL' batch type in the background
  useEffect(() => {
    if (batchTypes.length > 0) {
      const operationalType = batchTypes.find((t) => t.code === 'OPERATIONAL');
      if (operationalType) {
        setValue('batch_type_id', operationalType.id);
      }
    }
  }, [batchTypes, setValue]);

  const handleOnSuccess = (data: BatchFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { provider_id, is_own, farm_id, ...requestData } = data;

    const payload = {
      ...requestData,
      farm_id: null
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
                  {activity.name}
                </MenuItem>
              ))}
            </TextField>

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
            disabled={isPending}
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
