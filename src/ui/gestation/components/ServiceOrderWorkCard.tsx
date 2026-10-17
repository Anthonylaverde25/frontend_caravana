import { useState } from 'react';
import { alpha, Box, Card, Link, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import WorkCardActions from './service-order-work-card/WorkCardActions';
import WorkCardDiagnosis from './service-order-work-card/WorkCardDiagnosis';
import FemalesVerdictDialog from './service-order-work-card/FemalesVerdictDialog';
import { getTrayDeadline, trayCardId, trayTimeLabel } from '../utils/diagnosisTray';

interface ServiceOrderWorkCardProps {
  order: ServiceOrder;
  caravans: { id: number; identification: string; category?: string | null; active_gestation?: { gestation_stage?: string | null } | null }[];
  batchName: string;
  onPrintSheet: (order: ServiceOrder) => void;
  onBulkEntry: (orderId: number) => void;
  /** "Cerrar orden": the missing diagnoses, then the bulls. */
  onCloseOrder: (order: ServiceOrder) => void;
  /** "Retirar torada": the service ends, the order waits for its diagnosis. */
  onWithdrawBulls: (order: ServiceOrder) => void;
  /** Opens the order detail (drawer). */
  onView: (order: ServiceOrder) => void;
  /** The order the tray was opened on: outlined so it can be found at a glance. */
  highlighted?: boolean;
}

/**
 * A service order in the diagnosis tray. Reading order: the batch, its service window, how far the
 * diagnosis went; then one primary action, the secondary ones as icons and the rest in ⋮.
 */
function ServiceOrderWorkCard({ order, caravans, batchName, onPrintSheet, onBulkEntry, onCloseOrder, onWithdrawBulls, onView, highlighted = false }: ServiceOrderWorkCardProps) {
  const [femalesOpen, setFemalesOpen] = useState(false);
  const deadline = getTrayDeadline(order);
  const urgent = deadline === 'OVERDUE' || deadline === 'CLOSING_SOON';
  const urgentColor = deadline === 'OVERDUE' ? 'error' : 'warning';

  return (
    <Card
      id={trayCardId(order.id)}
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: highlighted ? 'primary.main' : 'divider',
        outline: highlighted ? '1px solid' : 'none',
        outlineColor: 'primary.main',
        borderRadius: '10px',
        bgcolor: 'background.paper',
        scrollMarginTop: 96,
        transition: 'border-color 0.15s ease, outline-color 0.4s ease',
        '&:hover': { borderColor: highlighted ? 'primary.main' : 'text.disabled' },
      }}
    >
      <Stack spacing={2} sx={{ px: 2.5, pt: 2.25, pb: 2, flexGrow: 1 }}>
        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => onView(order)}
              sx={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600, color: 'primary.main' }}
            >
              {order.code}
            </Link>
            <Box
              component="span"
              sx={(theme) => ({
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.625,
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                fontWeight: urgent ? 600 : 500,
                color: urgent ? `${urgentColor}.dark` : 'text.secondary',
                ...(urgent && { bgcolor: alpha(theme.palette[urgentColor].main, 0.1), px: 1, py: 0.375, borderRadius: '999px' }),
              })}
            >
              <FuseSvgIcon size={14}>heroicons-outline:clock</FuseSvgIcon>
              {trayTimeLabel(order)}
            </Box>
          </Stack>
          <Typography component="h3" sx={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>
            {batchName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            {order.male_caravan_ids.length} toros · {order.female_caravan_ids.length} vientres
          </Typography>
        </Stack>

        <WorkCardDiagnosis summary={order.diagnosis_summary} totalFemales={order.female_caravan_ids.length} />
      </Stack>

      <WorkCardActions
        order={order}
        onPrintSheet={onPrintSheet}
        onBulkEntry={onBulkEntry}
        onCloseOrder={onCloseOrder}
        onWithdrawBulls={onWithdrawBulls}
        onView={onView}
        onViewFemales={() => setFemalesOpen(true)}
      />

      {femalesOpen && (
        <FemalesVerdictDialog open onClose={() => setFemalesOpen(false)} order={order} batchName={batchName} caravans={caravans} />
      )}
    </Card>
  );
}

export default ServiceOrderWorkCard;
