import { TextField, Stack, Typography } from '@mui/material';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { PartnerFormValues } from '../PartnerSchema';

interface PartnerGeneralFieldsProps {
  register: UseFormRegister<PartnerFormValues>;
  errors: FieldErrors<PartnerFormValues>;
  /** The partner already issued fiscal documents: its CUIT is shown but no longer changes. */
  cuitLocked?: boolean;
}

/**
 * PartnerGeneralFields Component
 * Presentational component for legal, tax and location information.
 * Adheres strictly to canonical design tokens (variant="filled", bgcolor="action.hover").
 */
export default function PartnerGeneralFields({ register, errors, cuitLocked = false }: PartnerGeneralFieldsProps) {
  return (
    <Stack spacing={3}>
      {/* Sección Datos Principales */}
      <Stack spacing={2}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '1px' }}
        >
          Datos Generales y Fiscales
        </Typography>

        <TextField
          {...register('name')}
          label="Nombre / Razón Social"
          variant="filled"
          fullWidth
          required
          error={!!errors.name}
          helperText={errors.name?.message}
          sx={{ bgcolor: 'action.hover' }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            {...register('cuit')}
            label="CUIT"
            variant="filled"
            fullWidth
            required
            placeholder="XX-XXXXXXXX-X"
            disabled={cuitLocked}
            error={!!errors.cuit}
            helperText={
              errors.cuit?.message ??
              (cuitLocked ? 'No se puede cambiar: ya tiene comprobantes registrados.' : undefined)
            }
            sx={{ bgcolor: 'action.hover' }}
          />
          <TextField
            {...register('commercial_name')}
            label="Nombre Comercial (Opcional)"
            variant="filled"
            fullWidth
            error={!!errors.commercial_name}
            helperText={errors.commercial_name?.message}
            sx={{ bgcolor: 'action.hover' }}
          />
        </Stack>
      </Stack>

      {/* Sección Ubicación: contact details live in the contact persons */}
      <Stack spacing={2}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '1px' }}
        >
          Ubicación
        </Typography>

        <TextField
          {...register('location')}
          label="Dirección Administrativa (Opcional)"
          variant="filled"
          fullWidth
          multiline
          rows={2}
          error={!!errors.location}
          helperText={errors.location?.message}
          sx={{ bgcolor: 'action.hover' }}
        />
      </Stack>
    </Stack>
  );
}
