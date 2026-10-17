import type { ComponentProps } from 'react';
import { alpha, Box, Grid, Stack, Typography } from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import ServiceOrderWorkCard from '../ServiceOrderWorkCard';
import { TRAY_PHASE_COLOR, traySectionId, type TraySection } from '../../utils/diagnosisTray';

type WorkCardCaravans = ComponentProps<typeof ServiceOrderWorkCard>['caravans'];

interface DiagnosisTraySectionProps {
  section: TraySection;
  caravans: WorkCardCaravans;
  batchNameOf: (order: ServiceOrder) => string;
  highlightedOrderId: number | null;
  onPrintSheet: (order: ServiceOrder) => void;
  onBulkEntry: (orderId: number) => void;
  onCloseOrder: (order: ServiceOrder) => void;
  onWithdrawBulls: (order: ServiceOrder) => void;
  onView: (order: ServiceOrder) => void;
}

/** One phase of the tray: a tinted band with its title and meaning, then its orders, three per row. */
export default function DiagnosisTraySection({
  section,
  caravans,
  batchNameOf,
  highlightedOrderId,
  onPrintSheet,
  onBulkEntry,
  onCloseOrder,
  onWithdrawBulls,
  onView,
}: DiagnosisTraySectionProps) {
  const color = TRAY_PHASE_COLOR[section.phase];

  return (
    <Stack id={traySectionId(section.phase)} spacing={2} sx={{ scrollMarginTop: 96 }}>
      <Box
        component="header"
        sx={(theme) => ({
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: 1.5,
          rowGap: 0.75,
          px: 2,
          py: 1.25,
          borderRadius: '8px',
          bgcolor: alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.14 : 0.08),
        })}
      >
        <Typography component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${color}.main` }} />
          {section.title}
        </Typography>
        <Box
          component="span"
          sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: `${color}.main`, bgcolor: 'background.paper', borderRadius: '999px', px: 1, py: 0.25 }}
        >
          {section.orders.length}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ flex: '1 1 280px', fontSize: '0.8rem' }}>
          {section.subtitle}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {section.orders.map((order) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={order.id}>
            <ServiceOrderWorkCard
              order={order}
              caravans={caravans}
              batchName={batchNameOf(order)}
              highlighted={order.id === highlightedOrderId}
              onPrintSheet={onPrintSheet}
              onBulkEntry={onBulkEntry}
              onCloseOrder={onCloseOrder}
              onWithdrawBulls={onWithdrawBulls}
              onView={onView}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
