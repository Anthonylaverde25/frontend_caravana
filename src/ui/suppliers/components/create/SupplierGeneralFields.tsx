import { TextField, Stack, Typography } from '@mui/material';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { SupplierFormValues } from '../SupplierSchema';

interface SupplierGeneralFieldsProps {
  register: UseFormRegister<SupplierFormValues>;
  errors: FieldErrors<SupplierFormValues>;
}

/**
 * SupplierGeneralFields Component
 * Presentational component for legal, tax, and contact information.
 * Adheres strictly to canonical design tokens (variant="filled", bgcolor="action.hover").
 */
export default function SupplierGeneralFields({ register, errors }: SupplierGeneralFieldsProps) {
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
            error={!!errors.cuit}
            helperText={errors.cuit?.message}
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

      {/* Sección Contacto y Ubicación */}
      <Stack spacing={2}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '1px' }}
        >
          Información de Contacto y Ubicación
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            {...register('email')}
            label="Email"
            variant="filled"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ bgcolor: 'action.hover' }}
          />
          <TextField
            {...register('phone')}
            label="Teléfono / Celular"
            variant="filled"
            fullWidth
            error={!!errors.phone}
            helperText={errors.phone?.message}
            sx={{ bgcolor: 'action.hover' }}
          />
        </Stack>

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
