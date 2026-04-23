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
  MenuItem
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateBatch } from '@/features/batches/hooks/useCreateBatch';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo } from 'react';
import { batchSchema, BatchFormValues } from './BatchSchema';

interface CreateBatchDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialFarmId?: number;
}

/**
 * CreateBatchDialog Component
 * Modal for quick creation of batches associated with a farm.
 */
function CreateBatchDialog({ open, onClose, onSuccess, initialFarmId }: CreateBatchDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { data: providers = [], isLoading: isLoadingProviders } = useSuppliers();
  const { data: allFarms = [], isLoading: isLoadingFarms } = useFarms();
  const { mutate, isPending } = useCreateBatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: '',
      provider_id: undefined,
      farm_id: initialFarmId,
      observaciones: ''
    }
  });

  const selectedProviderId = watch('provider_id');
  const selectedFarmId = watch('farm_id');

  // Filter farms by selected provider
  const filteredFarms = useMemo(() => {
    if (!selectedProviderId) return [];
    return allFarms.filter((f) => f.provider_id === selectedProviderId);
  }, [allFarms, selectedProviderId]);

  // If provider changes, reset farm selection
  useEffect(() => {
    if (selectedProviderId && selectedFarmId) {
      const farmBelongsToProvider = filteredFarms.some(f => f.id === selectedFarmId);
      if (!farmBelongsToProvider) {
        setValue('farm_id', undefined as any);
      }
    }
  }, [selectedProviderId, filteredFarms, selectedFarmId, setValue]);

  const handleOnSuccess = (data: BatchFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { provider_id, ...requestData } = data;
    
    mutate(requestData, {
      onSuccess: () => {
        enqueueSnackbar('Lote creado exitosamente', { variant: 'success' });
        reset();
        if (onSuccess) onSuccess();
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
              label="Proveedor"
              value={selectedProviderId || ''}
              onChange={(e) => setValue('provider_id', Number(e.target.value))}
              variant="filled"
              fullWidth
              required
              error={!!errors.provider_id}
              helperText={errors.provider_id?.message || (isLoadingProviders ? 'Cargando proveedores...' : '')}
              sx={{ bgcolor: 'action.hover' }}
            >
              {providers.map((provider) => (
                <MenuItem key={provider.id} value={provider.id}>
                  {provider.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Establecimiento / Granja"
              value={selectedFarmId || ''}
              onChange={(e) => setValue('farm_id', Number(e.target.value))}
              variant="filled"
              fullWidth
              required
              disabled={!selectedProviderId}
              error={!!errors.farm_id}
              helperText={errors.farm_id?.message || (!selectedProviderId ? 'Seleccione primero un proveedor' : isLoadingFarms ? 'Cargando establecimientos...' : '')}
              sx={{ bgcolor: 'action.hover', opacity: !selectedProviderId ? 0.6 : 1 }}
            >
              {filteredFarms.map((farm) => (
                <MenuItem key={farm.id} value={farm.id}>
                  {farm.name}
                </MenuItem>
              ))}
            </TextField>

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
            variant="contained"
            disabled={isPending}
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
