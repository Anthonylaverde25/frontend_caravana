import type { ComponentProps } from 'react';
import { alpha, Box, Typography } from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { getServiceOrderPhase } from '../../../utils/serviceOrderPhase';
import { isQueueOrder } from '../../../utils/servicesQueue';
import ServicesNextStepActions, { type QueueOrderHandlers } from './ServicesNextStepActions';

interface ServicesDrawerNextStepProps extends QueueOrderHandlers {
  order: ServiceOrder | null;
  batchName: string;
  caravans: ComponentProps<typeof ServicesNextStepActions>['caravans'];
  isApproving: boolean;
}

/** "Próximo paso" at the top of the order detail: the same button and menu as its queue row. */
export default function ServicesDrawerNextStep({ order, ...props }: ServicesDrawerNextStepProps) {
  if (!order || !isQueueOrder(order)) return null;
  const phase = getServiceOrderPhase(order);

  return (
    <Box
      sx={(theme) => ({
        mb: 2.5,
        p: 2,
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.3),
        borderRadius: '8px',
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
      })}
    >
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'primary.main' }}>
        Próximo paso
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
        {phase.label}
        {phase.detail ? ` · ${phase.detail}` : ''}
      </Typography>
      <ServicesNextStepActions order={order} variant="panel" {...props} />
    </Box>
  );
}
