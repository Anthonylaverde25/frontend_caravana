import { Box, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface ManagementSystemSelectorProps {
  /** `undefined` / `null` means nothing has been declared yet. */
  value?: boolean | null;
  onChange: (isConfined: boolean) => void;
  error?: string;
}

const OPTIONS = [
  {
    value: false,
    label: 'A campo (extensivo)',
    description: 'Pastura, verdeo o campo natural',
    icon: 'heroicons-outline:sun',
    color: '#16a34a'
  },
  {
    value: true,
    label: 'A corral (confinado)',
    description: 'Alimentación en batea, corral o piquete de acostumbramiento',
    icon: 'heroicons-outline:home',
    color: '#ea580c'
  }
] as const;

/**
 * Management system of the batch: pen or pasture.
 *
 * Deliberately WITHOUT a preselection. The management system is a fact only whoever
 * runs the batch knows; a preselected "a campo" would send a `false` to the backend
 * that the system assumed instead of the producer declaring it.
 */
export default function ManagementSystemSelector({
  value,
  onChange,
  error
}: ManagementSystemSelectorProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}
      >
        SISTEMA DE MANEJO *
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <Box
              key={option.label}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(option.value);
                }
              }}
              sx={{
                flex: 1,
                p: 1.5,
                cursor: 'pointer',
                borderRadius: '8px',
                border: 2,
                borderColor: isSelected ? option.color : 'divider',
                bgcolor: isSelected ? alpha(option.color, 0.08) : 'action.hover',
                transition: 'all 0.15s',
                '&:hover': { borderColor: option.color }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ color: option.color, display: 'flex' }}>
                  <FuseSvgIcon size={18}>{option.icon}</FuseSvgIcon>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {option.label}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.68rem', lineHeight: 1.3, display: 'block' }}
              >
                {option.description}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Typography
        variant="caption"
        sx={{ display: 'block', mt: 0.75, color: error ? 'error.main' : 'text.secondary', fontSize: '0.68rem' }}
      >
        {error || 'Puede cambiarse más adelante sin mover animales ni alterar el tipo de lote.'}
      </Typography>
    </Box>
  );
}
