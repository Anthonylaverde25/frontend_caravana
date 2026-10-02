import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateSupplier } from '@/features/suppliers/hooks/useCreateSupplier';
import { useSnackbar } from 'notistack';
import { supplierSchema, SupplierFormValues } from './SupplierSchema';
import AddFarmDialog from './AddFarmDialog';
import SupplierGeneralFields from './create/SupplierGeneralFields';
import SupplierFarmsList from './create/SupplierFarmsList';

interface CreateSupplierDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (createdSupplier?: any) => void;
}

/**
 * CreateSupplierDialog Component
 * Canonical modal for registering new livestock providers and associated establishments.
 * Adheres strictly to CreateBatchDialog design tokens and container/presenter architecture.
 */
function CreateSupplierDialog({ open, onClose, onSuccess }: CreateSupplierDialogProps) {
  const [isFarmDialogOpen, setIsFarmDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { mutate, isPending } = useCreateSupplier();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      commercial_name: '',
      cuit: '',
      location: '',
      email: '',
      phone: '',
      farms: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'farms'
  });

  const handleOnSuccess = (data: SupplierFormValues) => {
    const payload = {
      name: data.name.trim(),
      commercial_name: data.commercial_name?.trim() || null,
      cuit: data.cuit.trim(),
      location: data.location?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      farms: (data.farms || []).map((farm) => ({
        name: farm.name.trim(),
        renspa: farm.renspa.trim(),
        location: [farm.city, farm.province, farm.country].filter(Boolean).join(', ')
      }))
    };

    mutate(payload, {
      onSuccess: (response: any) => {
        enqueueSnackbar('Proveedor creado exitosamente', { variant: 'success' });
        reset();
        if (onSuccess) onSuccess(response);
        onClose();
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Error al crear el proveedor';
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
      maxWidth="md"
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
          Nuevo Proveedor
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(handleOnSuccess)}>
        <DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Stack spacing={4}>
            <SupplierGeneralFields register={register} errors={errors} />
            <SupplierFarmsList
              farms={fields}
              onRemove={remove}
              onOpenAddFarm={() => setIsFarmDialogOpen(true)}
              error={errors.farms?.message}
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

      <AddFarmDialog
        open={isFarmDialogOpen}
        onClose={() => setIsFarmDialogOpen(false)}
        onAdd={(farm) => append(farm)}
      />
    </Dialog>
  );
}

export default CreateSupplierDialog;
