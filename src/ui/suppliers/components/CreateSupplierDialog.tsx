import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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
import FarmCard from './FarmCard';

interface CreateSupplierDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * CreateSupplierDialog Component (Unified)
 * Manages supplier creation with multiple farms using RHF + Zod.
 */
function CreateSupplierDialog({ open, onClose, onSuccess }: CreateSupplierDialogProps) {
  const [isFarmDialogOpen, setIsFarmDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // setup mutation
  const { mutate, isPending } = useCreateSupplier();

  // setup react-hook-form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      farms: [],
      name: '',
      cuit: ''
    }
  });

  // useFieldArray for dynamic farms
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'farms'
  });

  const handleOnSuccess = (data: SupplierFormValues) => {
    console.log('data:', data);
    mutate(data, {
      onSuccess: () => {
        enqueueSnackbar('Proveedor creado exitosamente', { variant: 'success' });
        reset();
        if (onSuccess) onSuccess();
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
          maxWidth: '720px',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
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
          borderBottom: '1px solid #e5e5e5',
          bgcolor: '#ffffff'
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#32363a' }}>
          Alta Rápida de Proveedor
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#0a6ed1' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(handleOnSuccess)}>
        <DialogContent sx={{ p: 0, bgcolor: '#ffffff' }}>
          <Box sx={{ p: 4 }}>
            <Stack spacing={4}>

              {/* Sección Datos Principales */}
              <Stack spacing={2}>
                <Typography variant="overline" sx={{ color: '#6a6d70', fontWeight: 700, letterSpacing: '1px' }}>
                  Datos Generales
                </Typography>
                <TextField
                  {...register('name')}
                  label="Nombre / Razón Social"
                  variant="filled"
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ bgcolor: '#f7f7f7' }}
                />
                <div className="flex flex-col md:flex-row gap-16">
                  <TextField
                    {...register('cuit')}
                    label="CUIT"
                    variant="filled"
                    fullWidth
                    required
                    error={!!errors.cuit}
                    helperText={errors.cuit?.message}
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                  <TextField
                    {...register('commercial_name')}
                    label="Nombre Comercial"
                    variant="filled"
                    fullWidth
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                </div>
              </Stack>

              {/* Sección Contacto */}
              <Stack spacing={2}>
                <Typography variant="overline" sx={{ color: '#6a6d70', fontWeight: 700, letterSpacing: '1px' }}>
                  Información de Contacto
                </Typography>
                <div className="flex flex-col md:flex-row gap-16">
                  <TextField
                    {...register('email')}
                    label="Email"
                    variant="filled"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                  <TextField
                    {...register('phone')}
                    label="Teléfono"
                    variant="filled"
                    fullWidth
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                </div>
              </Stack>

              {/* Sección Establecimientos */}
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="overline" sx={{ color: '#6a6d70', fontWeight: 700, letterSpacing: '1px' }}>
                    Establecimientos Asociados ({fields.length})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>}
                    onClick={() => setIsFarmDialogOpen(true)}
                    sx={{ textTransform: 'none', fontWeight: 600, color: '#0a6ed1' }}
                  >
                    Agregar Establecimiento
                  </Button>
                </Box>

                {errors.farms && (
                  <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                    {errors.farms.message}
                  </Typography>
                )}

                {fields.length > 0 ? (
                  <Stack spacing={1.5}>
                    {fields.map((field, index) => (
                      <FarmCard
                        key={field.id}
                        farm={field}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      border: '1px dashed #d8dde6',
                      borderRadius: '8px',
                      textAlign: 'center',
                      bgcolor: '#fafafa'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No hay establecimientos asociados. Haz clic en "Agregar Establecimiento" para comenzar.
                    </Typography>
                  </Box>
                )}
              </Stack>

            </Stack>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            px: 3,
            bgcolor: '#eff4f9',
            borderTop: '1px solid #d8dde6',
            gap: 1.5
          }}
        >
          <Button
            onClick={handleClose}
            variant="text"
            sx={{ fontWeight: 600, color: '#0a6ed1', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            sx={{
              bgcolor: '#0a6ed1',
              color: '#ffffff',
              px: 4,
              fontWeight: 700,
              borderRadius: '6px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#0854a1' }
            }}
          >
            {isPending ? 'Guardando...' : 'Crear'}
          </Button>
        </DialogActions>
      </form>

      {/* Sub-diálogo para añadir Farm */}
      <AddFarmDialog
        open={isFarmDialogOpen}
        onClose={() => setIsFarmDialogOpen(false)}
        onAdd={(farm) => append(farm)}
      />
    </Dialog>
  );
}

export default CreateSupplierDialog;
