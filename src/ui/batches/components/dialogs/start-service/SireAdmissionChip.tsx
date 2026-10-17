import React from 'react';
import { Button, Chip, Stack, Tooltip } from '@mui/material';
import type { SireAdmission } from '@/core/caravans/domain/rules/resolveSireAdmission';

const chipSx = { height: 20, fontSize: '0.65rem', fontWeight: 800 };

interface SireAdmissionChipProps {
  admission: SireAdmission;
  /** Re-enables a bull the owner excluded. */
  onEnable?: () => void;
}

/**
 * The owner's decision and the veterinary verdict of a bull, as one chip.
 */
export const SireAdmissionChip: React.FC<SireAdmissionChipProps> = ({ admission, onEnable }) => {
  switch (admission.kind) {
    case 'ADMITTED':
      return <Chip label="APTO (Certificado)" size="small" color="success" sx={chipSx} />;
    case 'ADMITTED_WITH_WARNING':
      return (
        <Tooltip
          title={
            admission.reason === 'NOT_EVALUATED'
              ? 'Sin evaluación veterinaria: entra por decisión del ganadero.'
              : 'Evaluación veterinaria incompleta (raspajes o resultados pendientes): entra por decisión del ganadero.'
          }
        >
          <Chip
            label={admission.reason === 'NOT_EVALUATED' ? 'SIN CERTIFICACIÓN' : 'CERTIFICACIÓN PENDIENTE'}
            size="small"
            color="warning"
            variant="outlined"
            sx={chipSx}
          />
        </Tooltip>
      );
    case 'EXCLUDED_BY_OWNER':
      return (
        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
          <Chip
            label={admission.reasonLabel ? `EXCLUIDO · ${admission.reasonLabel}` : 'EXCLUIDO'}
            size="small"
            sx={{ ...chipSx, bgcolor: 'action.selected', color: 'text.secondary' }}
          />
          {onEnable && (
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onEnable();
              }}
              sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, py: 0 }}
            >
              Habilitar
            </Button>
          )}
        </Stack>
      );
    case 'VET_BLOCKED':
      return (
        <Tooltip
          title={`Bloqueado por dictamen veterinario${admission.diagnoses.length ? `: ${admission.diagnoses.join(', ')}` : ''}. Requiere resolución veterinaria.`}
        >
          <Chip
            label={admission.status === 'UNFIT' ? '🔒 NO APTO (Rechazo Sanitario)' : '🔒 EN TRATAMIENTO'}
            size="small"
            color="error"
            sx={chipSx}
          />
        </Tooltip>
      );
  }
};

export default SireAdmissionChip;
