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
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePartner } from '@/features/partners/hooks/useCreatePartner';
import { useSnackbar } from 'notistack';
import { partnerSchema, PartnerFormValues } from './PartnerSchema';
import AddFarmDialog from './AddFarmDialog';
import PartnerGeneralFields from './create/PartnerGeneralFields';
import PartnerFarmsList from './create/PartnerFarmsList';
import PartnerRoleFields from './create/PartnerRoleFields';
import PartnerContactFields from './contacts/PartnerContactFields';
import { PartnerRole } from '@/core/partners/domain/entities/PartnerRole';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { toCreatePartnerInput } from './create/partnerPayload';
import { useExistingPartner } from './create/useExistingPartner';
import ExistingPartnerNotice from './create/ExistingPartnerNotice';

type ApiError = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

interface CreatePartnerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (partner?: Partner) => void;
  /** Roles marked by default (C4): the role of the selector it was opened from. */
  defaultRoles?: PartnerRole[];
  /** Prefilled from a document read from an image: the person confirms or corrects it. */
  initialValues?: Partial<Pick<PartnerFormValues, 'name' | 'commercial_name' | 'cuit' | 'location'>>;
}

const SELLS_LIVESTOCK: PartnerRole[] = ['SUPPLIER_LIVESTOCK'];
const EMPTY_CONTACT = { name: '', phone: '', email: '' };

/**
 * CreatePartnerDialog Component
 * Canonical modal for registering a supplier, a customer or both, with its first contact person
 * and its origin farms. Adheres strictly to CreateBatchDialog design tokens and container/presenter
 * architecture.
 */
function CreatePartnerDialog({ open, onClose, onSuccess, defaultRoles, initialValues }: CreatePartnerDialogProps) {
  const [isFarmDialogOpen, setIsFarmDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { mutate, isPending } = useCreatePartner();
  const existing = useExistingPartner();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors }
  } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      commercial_name: '',
      cuit: '',
      location: '',
      roles: defaultRoles ?? SELLS_LIVESTOCK,
      contact: EMPTY_CONTACT,
      farms: []
    }
  });

  // Opened with what an image read: those values replace the empty form each time it opens.
  useEffect(() => {
    if (open && initialValues) {
      reset({
        name: initialValues.name ?? '',
        commercial_name: initialValues.commercial_name ?? '',
        cuit: initialValues.cuit ?? '',
        location: initialValues.location ?? '',
        roles: defaultRoles ?? SELLS_LIVESTOCK,
        contact: EMPTY_CONTACT,
        farms: []
      });
    }
  }, [open, initialValues, defaultRoles, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'farms'
  });

  const handleOnSuccess = (data: PartnerFormValues) => {
    if (existing.check(data.cuit, data.roles)) return;

    mutate(toCreatePartnerInput(data), {
      onSuccess: (response: Partner) => finish(response, `${data.name.trim()} dado de alta`),
      onError: (error: unknown) => {
        const body = (error as ApiError).response?.data;
        const cuitError = body?.errors?.cuit?.[0];

        if (cuitError) setError('cuit', { message: cuitError });
        else enqueueSnackbar(body?.message || 'No se pudo dar de alta', { variant: 'error' });
      }
    });
  };

  const finish = (partner: Partner, message: string) => {
    enqueueSnackbar(message, { variant: 'success' });
    existing.clear();
    reset();
    if (onSuccess) onSuccess(partner);
    onClose();
  };

  const adoptExisting = () =>
    existing.adopt(
      (partner) => finish(partner, `${partner.name} elegido`),
      () => enqueueSnackbar('No se pudo agregar el rol', { variant: 'error' })
    );

  const handleClose = () => {
    existing.clear();
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
          Nuevo cliente o proveedor
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      {/* It may open inside another form (an entry order): React bubbles submit through the portal. */}
      <form
        onSubmit={(event) => {
          event.stopPropagation();
          void handleSubmit(handleOnSuccess)(event);
        }}
      >
        <DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Stack spacing={4}>
            {existing.match && (
              <ExistingPartnerNotice match={existing.match} adopting={existing.adopting} onAdopt={adoptExisting} />
            )}
            <PartnerGeneralFields register={register} errors={errors} />
            <PartnerRoleFields control={control} errors={errors} />
            <Stack spacing={2}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '1px' }}>
                Contacto (opcional)
              </Typography>
              <PartnerContactFields register={register} errors={errors.contact} prefix="contact" />
            </Stack>
            <PartnerFarmsList
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

export default CreatePartnerDialog;
