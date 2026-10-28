import { useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Divider, Typography, Box, IconButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { formatCuit } from '@/core/shared/domain/cuit';
import { useUpdatePartner } from '@/features/partners/hooks/useUpdatePartner';
import { partnerSchema, PartnerFormValues } from './PartnerSchema';
import PartnerGeneralFields from './create/PartnerGeneralFields';
import PartnerContactsSection from './contacts/PartnerContactsSection';

interface EditPartnerDialogProps {
  partner: Partner | null;
  onClose: () => void;
}

type ApiError = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

const EDITABLE_FIELDS = ['name', 'commercial_name', 'cuit', 'location'] as const;

/**
 * Corrects a partner's identity and manages its contact persons. Roles and farms keep their own
 * actions; the CUIT is read-only once the partner issued fiscal documents (the backend enforces it
 * as well). The partner comes from the refreshed list, so contact changes show at once.
 */
export default function EditPartnerDialog({ partner, onClose }: EditPartnerDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { mutate, isPending } = useUpdatePartner();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<PartnerFormValues>({ resolver: zodResolver(partnerSchema) });

  const partnerId = partner?.id;

  // Reset only when another partner opens: a refreshed list must not wipe what is being typed.
  useEffect(() => {
    if (!partner) return;

    // Roles, contact and farms only satisfy the shared schema; this form neither shows nor sends them.
    reset({
      name: partner.name,
      commercial_name: partner.commercial_name ?? '',
      cuit: formatCuit(partner.cuit),
      location: partner.location ?? '',
      roles: partner.roles,
      contact: { name: '', phone: '', email: '' },
      farms: []
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId, reset]);

  const submit = (data: PartnerFormValues) => {
    if (!partner) return;

    const identity = {
      name: data.name.trim(),
      commercial_name: data.commercial_name?.trim() || null,
      cuit: data.cuit.trim(),
      location: data.location?.trim() || null
    };

    mutate(
      { id: partner.id, identity },
      {
        onSuccess: () => {
          enqueueSnackbar(`${identity.name} actualizado`, { variant: 'success' });
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

          if (!marked) enqueueSnackbar(body?.message ?? 'No se pudo guardar', { variant: 'error' });
        }
      }
    );
  };

  return (
    <Dialog
      open={partner !== null}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
          Editar {partner?.name}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(submit)}>
        <DialogContent sx={{ p: 3 }}>
          <PartnerGeneralFields register={register} errors={errors} cuitLocked={partner?.cuit_locked} />
          {partner && (
            <>
              <Divider sx={{ my: 3 }} />
              <PartnerContactsSection partnerId={partner.id} contacts={partner.contacts} />
            </>
          )}
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
