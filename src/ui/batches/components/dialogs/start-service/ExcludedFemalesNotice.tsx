import React, { useState } from 'react';
import { Alert, Box, Button, Chip, Collapse, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import BreedingEligibilityDialog from '@/ui/herd/components/shared/breeding-eligibility/BreedingEligibilityDialog';

interface ExcludedFemalesNoticeProps {
  /** Empty females of the batch the owner excluded from breeding. */
  excludedFemales: Caravan[];
  isControlledService: boolean;
  /** Opens the batch transfer with these females ticked. */
  onSetApart: (ids: number[]) => void;
}

/**
 * Females the owner excluded from breeding that are still in the batch.
 *
 * Natural service: they share the paddock with the bulls, so they are exposed and registered
 * as such; the notice offers to set them apart before starting. Controlled service / AI: they
 * are not selectable, and can be enabled here if the owner changes their mind.
 */
export const ExcludedFemalesNotice: React.FC<ExcludedFemalesNoticeProps> = ({
  excludedFemales,
  isControlledService,
  onSetApart,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [enabling, setEnabling] = useState<Caravan[] | null>(null);

  if (excludedFemales.length === 0) return null;

  const count = excludedFemales.length;
  const ids = excludedFemales.map((c) => c.id);
  const reasons = Array.from(
    excludedFemales.reduce((acc, c) => {
      const label = c.breeding_exclusion_reason_label ?? 'sin motivo';
      acc.set(label, (acc.get(label) ?? 0) + 1);
      return acc;
    }, new Map<string, number>())
  )
    .map(([label, n]) => `${n} ${label}`)
    .join(', ');

  return (
    <>
      <Alert
        severity={isControlledService ? 'info' : 'warning'}
        sx={{ fontSize: '0.8rem', py: 0.5, '& .MuiAlert-message': { width: '100%' } }}
        action={
          <Stack direction="row" spacing={1}>
            <Button size="small" color="inherit" onClick={() => setExpanded((v) => !v)} sx={{ textTransform: 'none', fontWeight: 700 }}>
              {expanded ? 'Ocultar' : `Ver (${count})`}
            </Button>
            {!isControlledService && (
              <Button size="small" color="inherit" variant="outlined" onClick={() => onSetApart(ids)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                Apartar
              </Button>
            )}
          </Stack>
        }
      >
        {isControlledService
          ? `${count === 1 ? '1 vientre excluido' : `${count} vientres excluidos`} de reproducción (${reasons}): no se pueden elegir.`
          : `${count === 1 ? '1 vientre excluido sigue' : `${count} vientres excluidos siguen`} en el lote (${reasons}). En servicio natural quedan con los toros y se registran como expuestos. Apártelos antes de iniciar si no deben servirse.`}
      </Alert>

      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1.5, border: 1, borderColor: 'divider', borderRadius: '8px' }}>
          {excludedFemales.map((female) => (
            <Chip
              key={female.id}
              size="small"
              label={`${female.identification} · ${female.breeding_exclusion_reason_label ?? 'sin motivo'}`}
              onDelete={() => setEnabling([female])}
              deleteIcon={
<FuseSvgIcon size={14}>heroicons-outline:check-circle</FuseSvgIcon>
              }
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          ))}
          <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
            Use el tilde de cada caravana para habilitarla para reproducción.
          </Typography>
        </Box>
      </Collapse>

      <BreedingEligibilityDialog
        open={enabling !== null}
        onClose={() => setEnabling(null)}
        caravans={(enabling ?? []).map((c) => ({ id: c.id, identification: c.identification, sex: c.sex, is_breeding_eligible: false }))}
      />
    </>
  );
};

export default ExcludedFemalesNotice;
