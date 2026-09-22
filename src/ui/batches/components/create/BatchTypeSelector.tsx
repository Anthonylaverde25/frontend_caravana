import { Box, MenuItem, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BatchType } from '@/core/batch-types/domain/entities/BatchType';

interface BatchTypeSelectorProps {
  batchTypes: BatchType[];
  value?: number;
  onChange: (batchTypeId: number) => void;
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
}

/**
 * Batch type selector.
 *
 * Renders every option with the colour, icon and description of the catalogue: two
 * batches of females (`GROWING_HEIFERS` and `GROWING_REPLACEMENT_FEMALES`) differ by
 * destination and not by the name of the animal, and `GROWING_MIXED` differs from
 * `OPERATIONAL` by the intention to classify. The operator has to read it, not guess it.
 */
export default function BatchTypeSelector({
  batchTypes,
  value,
  onChange,
  isLoading = false,
  error,
  disabled = false
}: BatchTypeSelectorProps) {
  const selected = batchTypes.find((t) => t.id === value);

  return (
    <TextField
      select
      label="Tipo de Lote"
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      variant="filled"
      fullWidth
      required
      disabled={disabled || isLoading}
      error={!!error}
      helperText={error || (isLoading ? 'Cargando tipos de lote...' : selected?.description || '')}
      sx={{ bgcolor: 'action.hover' }}
      SelectProps={{
        renderValue: (selectedValue) => {
          const type = batchTypes.find((t) => t.id === Number(selectedValue));

          if (!type) return '';

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: type.color || 'text.disabled',
                  flexShrink: 0
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {type.name}
              </Typography>
            </Box>
          );
        }
      }}
    >
      {batchTypes.length === 0 && (
        <MenuItem value="" disabled>
          No hay tipos de lote disponibles para esta actividad
        </MenuItem>
      )}

      {batchTypes.map((type) => (
        <MenuItem key={type.id} value={type.id} sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%' }}>
            <Box
              sx={{
                mt: 0.25,
                color: type.color || 'text.secondary',
                display: 'flex',
                flexShrink: 0
              }}
            >
              <FuseSvgIcon size={18}>{type.icon || 'heroicons-outline:tag'}</FuseSvgIcon>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {type.name}
              </Typography>
              {type.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', whiteSpace: 'normal', lineHeight: 1.3, mt: 0.25 }}
                >
                  {type.description}
                </Typography>
              )}
            </Box>
          </Box>
        </MenuItem>
      ))}
    </TextField>
  );
}
