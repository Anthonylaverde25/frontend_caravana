import { Typography } from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { getServiceOrderPhase } from '../../utils/serviceOrderPhase';

interface ServiceOrdersPhaseDetailProps {
	order: ServiceOrder;
}

/**
 * Line under the status chip: where the bulls are and how far the diagnosis went.
 */
export function ServiceOrdersPhaseDetail({ order }: ServiceOrdersPhaseDetailProps) {
	const { detail } = getServiceOrderPhase(order);
	if (!detail) return null;

	return (
		<Typography
			variant="caption"
			sx={{ display: 'block', color: 'text.secondary', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}
		>
			{detail}
		</Typography>
	);
}

export default ServiceOrdersPhaseDetail;
