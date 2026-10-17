import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip, Tooltip } from '@mui/material';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { ServiceExposureExitReason, ServiceOrderFemaleExposure } from '@/features/gestation/hooks/useServiceOrders';

interface ServiceOrderFemaleChipsProps {
  femaleCaravans: Caravan[];
  exposures: ServiceOrderFemaleExposure[];
}

const MAX_CHIPS = 40;

const EXIT_LABELS: Record<ServiceExposureExitReason, string> = {
  TRANSFERRED_OUT: 'Salió del lote',
  BULLS_WITHDRAWN: 'Retiro de torada',
  SERVICE_CLOSED: 'Servicio cerrado',
  DEATH: 'Muerte',
  SALE: 'Venta',
};

/**
 * Females of the service with their exposure window: who shares the paddock with the bulls now,
 * who joined with the service already running and who left before it ended.
 */
export const ServiceOrderFemaleChips: React.FC<ServiceOrderFemaleChipsProps> = ({ femaleCaravans, exposures }) => {
  const exposureById = useMemo(() => new Map(exposures.map((e) => [e.female_caravan_id, e])), [exposures]);

  const joinedCount = exposures.filter((e) => e.joined_after_start).length;
  const leftCount = exposures.filter(
    (e) => e.exposed_until !== null && e.exit_reason !== 'BULLS_WITHDRAWN' && e.exit_reason !== 'SERVICE_CLOSED'
  ).length;

  return (
    <>
      <Box sx={{ mb: 1.5, pl: 1, borderLeft: (theme) => `3px solid ${theme.palette.primary.main}` }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
          Vientres expuestos ({femaleCaravans.length})
          {joinedCount > 0 && ` · ${joinedCount} ingresaron durante el servicio`}
          {leftCount > 0 && ` · ${leftCount} salieron`}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 1.5, mb: 3, borderRadius: '8px', backgroundColor: 'background.paper' }}>
        {femaleCaravans.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
            No hay vientres en este servicio.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 180, overflowY: 'auto', p: 0.5 }}>
            {femaleCaravans.slice(0, MAX_CHIPS).map((female) => {
              const exposure = exposureById.get(female.id);
              const left = Boolean(exposure?.exposed_until) && exposure?.exit_reason === 'TRANSFERRED_OUT';
              const joined = Boolean(exposure?.joined_after_start);
              const tooltip = [
                exposure?.exposed_from ? `Expuesta desde ${exposure.exposed_from}` : 'Pendiente de inicio',
                exposure?.exposed_until ? `hasta ${exposure.exposed_until}` : null,
                exposure?.exit_reason ? `(${EXIT_LABELS[exposure.exit_reason]})` : null,
                joined ? '· ingresó con el servicio en curso' : null,
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <Tooltip key={female.id} title={tooltip} arrow>
                  <Chip
                    label={`#${female.identification}`}
                    size="small"
                    variant={joined ? 'filled' : 'outlined'}
                    color={joined ? 'info' : 'default'}
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      borderRadius: '4px',
                      ...(left && { textDecoration: 'line-through', opacity: 0.6 }),
                    }}
                  />
                </Tooltip>
              );
            })}
            {femaleCaravans.length > MAX_CHIPS && (
              <Chip
                label={`+${femaleCaravans.length - MAX_CHIPS} vientres más...`}
                size="small"
                variant="filled"
                sx={{ fontWeight: 700, fontSize: '0.72rem', borderRadius: '4px' }}
              />
            )}
          </Box>
        )}
      </Paper>
    </>
  );
};

export default ServiceOrderFemaleChips;
