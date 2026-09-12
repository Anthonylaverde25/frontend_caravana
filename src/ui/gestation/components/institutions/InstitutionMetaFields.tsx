import React, { useState } from 'react';
import { Autocomplete, Box, Chip, Stack, TextField, Typography, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { InstitutionMeta } from '@/core/veterinary/domain/VeterinaryTypes';
import { useInstitutionSuggestions } from '@/features/gestation/hooks/useVeterinaryPortal';
import { cuitDigits, cuitProblem, expectedCheckDigit } from '@/core/veterinary/domain/cuit';

interface Props {
  value: InstitutionMeta;
  onChange: (value: InstitutionMeta) => void;
  accessToken?: string | null;
  disabled?: boolean;
  /** Shown above the block, because the same fields describe different roles. */
  caption?: string;
  variant?: 'card' | 'standard';
}

/**
 * ADR-29: an institution is described here, and nowhere else.
 *
 * There is no catalogue to pick from and nothing to register beforehand — that requirement is
 * what used to stop a chute session from being closed because a laboratory row did not exist
 * yet. What replaces it is the CUIT: unique per legal entity and self-validating, so two people
 * spelling the name differently still describe the same institution.
 *
 * Repetition is handled by memory rather than by a catalogue: the suggestions come from what has
 * already been recorded, so the second time a laboratory is used it is one click.
 *
 * ADR-43: the CUIT's check digit is warned about, never enforced. Nothing reads this number to
 * decide anything, so blocking on it only cost the operator the work in front of them — which for
 * a chute session is the most expensive thing in the app to redo.
 */
export const InstitutionMetaFields: React.FC<Props> = ({
  value,
  onChange,
  accessToken = null,
  disabled,
  caption,
  variant = 'standard',
}) => {
  const [search, setSearch] = useState('');
  const { data: suggestions = [] } = useInstitutionSuggestions(search, accessToken);

  const set = (field: keyof InstitutionMeta, fieldValue: string) =>
    onChange({ ...value, [field]: fieldValue });

  // Warned about here so the mistake is caught while the person is still looking at the box. The
  // backend rejects it either way; what this avoids is discovering it after submitting a form.
  const problem = cuitProblem(value.cuit);
  const suggestion = problem === 'CHECK_DIGIT' ? expectedCheckDigit(value.cuit) : null;
  const cuitHelperText =
    problem === 'LENGTH'
      ? `Un CUIT tiene 11 dígitos; van ${cuitDigits(value.cuit).length}. Se guarda igual.`
      : problem === 'CHECK_DIGIT'
        ? `El dígito verificador no cierra: con estos números debería terminar en ${suggestion}. Se guarda igual.`
        : 'Es lo que permite agrupar por institución.';

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (variant === 'card') {
    const digits = cuitDigits(value.cuit);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header with INSTITUCIÓN * label and chip */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.secondary',
            }}
          >
            Institución <span style={{ color: '#ef4444' }}>*</span>
          </Typography>

          <Chip
            size="small"
            label="Se ofrecen las que ya usaste"
            sx={{
              height: 20,
              fontSize: '0.68rem',
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
              color: 'text.secondary',
              borderRadius: '4px',
            }}
          />
        </Stack>

        {/* Institution Name Autocomplete */}
        <Autocomplete
          freeSolo
          fullWidth
          disabled={disabled}
          options={suggestions}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.nombre)}
          inputValue={value.nombre ?? ''}
          onInputChange={(_event, newValue) => {
            set('nombre', newValue);
            setSearch(newValue);
          }}
          onChange={(_event, picked) => {
            if (picked && typeof picked !== 'string') {
              onChange({ ...picked });
              setSearch(picked.nombre);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              placeholder="Nombre de la institución o laboratorio..."
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '6px',
                },
              }}
            />
          )}
        />

        {/* CUIT Section */}
        <Box sx={{ mb: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'text.secondary',
              }}
            >
              CUIT
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                color: 'text.secondary',
              }}
            >
              {digits.length} / 11 dígitos
            </Typography>
          </Stack>

          <TextField
            value={value.cuit ?? ''}
            onChange={(e) => set('cuit', e.target.value)}
            disabled={disabled}
            fullWidth
            size="small"
            placeholder="Sin guiones, ej. 20123456789"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontWeight: 600,
              },
            }}
          />

          {problem !== null && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                borderRadius: '6px',
                bgcolor: isDark ? 'rgba(234, 179, 8, 0.12)' : '#fefce8',
                border: '1px solid',
                borderColor: isDark ? 'rgba(234, 179, 8, 0.3)' : '#fef08a',
                color: isDark ? '#fef08a' : '#a16207',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                fontSize: '0.72rem',
                fontWeight: 600,
              }}
            >
              <FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
              <span>{cuitHelperText}</span>
            </Box>
          )}
        </Box>

        {/* Two-column subgrid: SENASA / RENALAB & DIRECCIÓN */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'text.secondary',
                display: 'block',
                mb: 0.25,
              }}
            >
              Código SENASA / RENALAB
            </Typography>
            <TextField
              value={value.codigo_oficial ?? ''}
              onChange={(e) => set('codigo_oficial', e.target.value)}
              disabled={disabled}
              size="small"
              fullWidth
              placeholder="00921"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'text.secondary',
                display: 'block',
                mb: 0.25,
              }}
            >
              Dirección
            </Typography>
            <TextField
              value={value.direccion ?? ''}
              onChange={(e) => set('direccion', e.target.value)}
              disabled={disabled}
              size="small"
              fullWidth
              placeholder="Buenos aires, bernal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {caption && (
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Autocomplete
          freeSolo
          fullWidth
          disabled={disabled}
          options={suggestions}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : option.nombre
          }
          inputValue={value.nombre ?? ''}
          onInputChange={(_event, newValue) => {
            set('nombre', newValue);
            setSearch(newValue);
          }}
          onChange={(_event, picked) => {
            // Picking a past institution brings its CUIT and code along: that is what keeps the
            // history from fragmenting without anyone maintaining a catalogue.
            if (picked && typeof picked !== 'string') {
              onChange({ ...picked });
              setSearch(picked.nombre);
            }
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={`${option.cuit ?? option.nombre}`}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {option.nombre}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.cuit ? `CUIT ${option.cuit}` : 'Sin CUIT'}
                  {option.codigo_oficial ? ` · ${option.codigo_oficial}` : ''}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              label="Institución"
              variant="filled"
              size="small"
              sx={{ bgcolor: 'action.hover' }}
              helperText="Se ofrecen las que ya usaste."
            />
          )}
          sx={{ flex: 2 }}
        />

        <TextField
          label="CUIT"
          value={value.cuit ?? ''}
          onChange={(e) => set('cuit', e.target.value)}
          disabled={disabled}
          variant="filled"
          size="small"
          /*
           * ADR-43: warning, not error. `error` paints the field as something that must be fixed
           * before continuing, and nothing here has to be fixed — the value is stored either way.
           * Amber says "look at this", red would be a lie about what happens next.
           */
          color={problem !== null ? 'warning' : undefined}
          focused={problem !== null || undefined}
          sx={{ bgcolor: 'action.hover', flex: 1 }}
          helperText={cuitHelperText}
          FormHelperTextProps={
            problem !== null ? { sx: { color: 'warning.dark', fontWeight: 600 } } : undefined
          }
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label="Código oficial (SENASA / RENALAB)"
          value={value.codigo_oficial ?? ''}
          onChange={(e) => set('codigo_oficial', e.target.value)}
          disabled={disabled}
          variant="filled"
          size="small"
          sx={{ bgcolor: 'action.hover', flex: 1 }}
        />
        <TextField
          label="Dirección"
          value={value.direccion ?? ''}
          onChange={(e) => set('direccion', e.target.value)}
          disabled={disabled}
          variant="filled"
          size="small"
          sx={{ bgcolor: 'action.hover', flex: 2 }}
        />
      </Stack>
    </Stack>
  );
};

export default InstitutionMetaFields;
