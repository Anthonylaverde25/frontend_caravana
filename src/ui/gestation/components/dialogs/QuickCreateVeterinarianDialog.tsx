import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useCreateVeterinarian } from '@/features/gestation/hooks/useVeterinaryProtocols';
import { Veterinarian } from '@/core/veterinary/domain/VeterinaryTypes';
import { apiErrorMessage } from '@/core/veterinary/domain/apiErrorMessage';

interface QuickCreateVeterinarianDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (veterinarian: Veterinarian) => void;
}

/**
 * Opened from inside the protocol wizard so a professional missing from the catalogue never
 * costs the operator the transcription they already typed.
 */
export const QuickCreateVeterinarianDialog: React.FC<QuickCreateVeterinarianDialogProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const createVeterinarian = useCreateVeterinarian();

  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  // ADR-38: identity of the person, and of the entity they invoice under.
  const [cuit, setCuit] = useState('');
  const [billingCuit, setBillingCuit] = useState('');
  // Without this there is no account to create: it is the address the credential belongs to.
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const reset = () => {
    setName('');
    setLicenseNumber('');
    setCuit('');
    setBillingCuit('');
    setEmail('');
    setPhone('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !licenseNumber.trim()) {
      enqueueSnackbar('El nombre y la matrícula profesional son obligatorios.', { variant: 'warning' });
      return;
    }

    try {
      const created = await createVeterinarian.mutateAsync({
        name: name.trim(),
        license_number: licenseNumber.trim(),
        cuit: cuit.trim() || null,
        billing_cuit: billingCuit.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
      });

      // Creating the file creates the account, so the operator has to leave this dialog knowing
      // a credential now exists and what to hand over. Otherwise the access is invisible until
      // somebody asks why the professional cannot get in.
      enqueueSnackbar(
        created.user_id
          ? `${created.name} ya puede entrar al portal con ${created.email} y la clave inicial 123456789.`
          : `${created.name} quedó en el catálogo. Sin correo no se le creó acceso al portal.`,
        { variant: created.user_id ? 'success' : 'info', autoHideDuration: 9000 }
      );
      onCreated(created);
      handleClose();
    } catch (error: unknown) {
      enqueueSnackbar(apiErrorMessage(error, 'No se pudo crear el profesional.'), { variant: 'error' });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
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
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          Nuevo Profesional
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Alert severity="info" sx={{ borderRadius: '6px' }}>
            Al guardarlo se le crea el <strong>acceso al portal</strong> con la clave inicial{' '}
            <strong>123456789</strong>, que él puede cambiar después. Sin correo la ficha se crea
            igual, pero sin acceso.
          </Alert>

          <TextField
            label="Nombre y apellido"
            value={name}
            onChange={(event) => setName(event.target.value)}
            variant="filled"
            fullWidth
            required
            sx={{ bgcolor: 'action.hover' }}
          />
          <TextField
            label="Matrícula profesional (M.P.)"
            value={licenseNumber}
            onChange={(event) => setLicenseNumber(event.target.value)}
            variant="filled"
            fullWidth
            required
            helperText="Única por compañía: evita duplicar el historial del mismo profesional."
            sx={{ bgcolor: 'action.hover' }}
          />
          {/* ADR-38: identidad de la persona, y de la entidad bajo la que factura. */}
          <TextField
            label="CUIT del profesional"
            value={cuit}
            onChange={(event) => setCuit(event.target.value)}
            variant="filled"
            fullWidth
            sx={{ bgcolor: 'action.hover' }}
            helperText="Es contra el que se compara quién hizo cada análisis."
          />
          <TextField
            label="CUIT de facturación (si difiere)"
            value={billingCuit}
            onChange={(event) => setBillingCuit(event.target.value)}
            variant="filled"
            fullWidth
            sx={{ bgcolor: 'action.hover' }}
            helperText="Su laboratorio, si es una razón social distinta de él."
          />
          <TextField
            type="email"
            label="Correo del profesional"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            variant="filled"
            fullWidth
            sx={{ bgcolor: 'action.hover' }}
            helperText="Con este correo entra al portal. Sin él, la ficha queda sin acceso."
          />
          <TextField
            label="Teléfono / WhatsApp"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            variant="filled"
            fullWidth
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
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={handleClose} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createVeterinarian.isPending}
          variant="contained"
          startIcon={createVeterinarian.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
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
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickCreateVeterinarianDialog;
