import { useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, Box, IconButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';
import { formatCuit } from '@/core/shared/domain/cuit';
import { useUpdateSupplier } from '@/features/suppliers/hooks/useUpdateSupplier';
import { supplierSchema, SupplierFormValues } from './SupplierSchema';
import SupplierGeneralFields from './create/SupplierGeneralFields';

interface EditSupplierDialogProps {
  supplier: Supplier | null;
  onClose: () => void;
}

type ApiError = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

const EDITABLE_FIELDS = ['name', 'commercial_name', 'cuit', 'location', 'email', 'phone'] as const;

/**
 * Corrects a provider's identity and contact. Roles and farms keep their own actions; the CUIT is
 * read-only once the provider issued fiscal documents (the backend enforces it as well).
 */
export default function EditSupplierDialog({ supplier, onClose }: EditSupplierDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { mutate, isPending } = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<SupplierFormValues>({ resolver: zodResolver(supplierSchema) });

  useEffect(() => {
    if (!supplier) return;

    // Roles and farms only satisfy the shared schema; this dialog neither shows nor sends them.
    reset({
      name: supplier.name,
      commercial_name: supplier.commercial_name ?? '',
      cuit: formatCuit(supplier.cuit),
      location: supplier.location ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      roles: { supplies_livestock: supplier.supplies_livestock, supplies_items: supplier.supplies_items },
      farms: []
    });
  }, [supplier, reset]);

  const submit = (data: SupplierFormValues) => {
    if (!supplier) return;

    const changes = {
      name: data.name.trim(),
      commercial_name: data.commercial_name?.trim() || null,
      cuit: data.cuit.trim(),
      location: data.location?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null
    };

    mutate(
      { current: supplier, changes },
      {
        onSuccess: () => {
          enqueueSnackbar('Proveedor actualizado', { variant: 'success' });
          onClose();
        },
        onError: (error) => {
          const body = (error as ApiError).response?.data;
          let marked = false;

          EDITABLE_FIELDS.forEach((field) => {
            const message = body?.errors?.[field]?.[0];
            if (message) {
              setError(field, { message });
              marked = true;
            }
          });

          if (!marked) enqueueSnackbar(body?.message ?? 'No se pudo guardar el proveedor', { variant: 'error' });
        }
      }
    );
  };

  return (
    <Dialog
      open={supplier !== null}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          Editar proveedor
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(submit)}>
        <DialogContent sx={{ p: 3 }}>
          <SupplierGeneralFields register={register} errors={errors} cuitLocked={supplier?.cuit_locked} />
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            px: 3,
            bgcolor: 'background.default',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button onClick={onClose} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            variant="contained"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 3.5,
              fontWeight: 700,
              borderRadius: '6px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
