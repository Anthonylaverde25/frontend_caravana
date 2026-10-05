import React from 'react';
import { Chip, Stack, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { formatDate } from '@/ui/birth-orders/components/birthOrderFormat';

/** She was reported past her due date without calving and has not calved or lost the pregnancy since. */
export const isCalvingOverdue = (caravan: Caravan): boolean => Boolean(caravan.active_gestation?.calving_overdue_reported_at);

/** How many females of a batch carry an open overdue alert. */
export const calvingOverdueCount = (caravans: Caravan[]): number => caravans.filter(isCalvingOverdue).length;

/**
 * What Monitoreo Gestacional says about one female beyond her stage: the overdue alert (an N on a
 * PAR-01, she is at risk) and her record of calves born dead, which is charged to her. A calf that
 * died at foot is not on her record.
 */
export const ReproductiveAlertsCell: React.FC<{ caravan: Caravan }> = ({ caravan }) => {
  const reportedAt = caravan.active_gestation?.calving_overdue_reported_at ?? null;
  const days = caravan.active_gestation?.calving_overdue_days ?? null;

  if (!reportedAt && caravan.stillborn_count === 0) {
    return (
      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
        —
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {reportedAt && (
        <Tooltip title="Pasó su fecha probable de parto y no parió. La alerta se cierra cuando para o cuando se registra la pérdida.">
          <Chip
            size="small"
            color="warning"
            icon={<FuseSvgIcon size={13}>heroicons-outline:exclamation-triangle</FuseSvgIcon>}
            label={`Parto vencido · avisado el ${formatDate(reportedAt)}${days != null ? ` (hace ${days} d)` : ''}`}
            sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }}
          />
        </Tooltip>
      )}
      {caravan.stillborn_count > 0 && (
        <Tooltip title="Terneros nacidos muertos: se imputan a la madre. Los muertos al pie no se cuentan.">
          <Chip
            size="small"
            variant="outlined"
            color="error"
            label={`${caravan.stillborn_count} nacido(s) muerto(s)${caravan.last_stillborn_date ? ` · ${formatDate(caravan.last_stillborn_date)}` : ''}`}
            sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }}
          />
        </Tooltip>
      )}
    </Stack>
  );
};

export default ReproductiveAlertsCell;
