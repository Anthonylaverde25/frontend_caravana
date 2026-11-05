import { useNavigate } from 'react-router';
import { Box, Link, Stack, Typography } from '@mui/material';
import type { BatchBullOnService } from '@/core/batches/domain/entities/BatchOverview';
import { bullsOnServiceLabel, formatKg, orderLink } from '../../../utils/herdFormat';

interface HerdBatchBullsOnServiceProps {
	bulls: BatchBullOnService[];
}

/**
 * The bulls a running service keeps in the batch for now, apart from the herd above: where they
 * came from and which order brought them, because the figures of the batch leave them out.
 */
export function HerdBatchBullsOnService({ bulls }: HerdBatchBullsOnServiceProps) {
	const navigate = useNavigate();

	if (bulls.length === 0) return null;

	const openOrder = (orderId: number) => {
		const link = orderLink('service_order', orderId);

		if (link) navigate(link);
	};
	const orders = [...new Map(bulls.map((bull) => [bull.order_id, bull.order_code])).entries()];

	return (
		<Box
			component="section"
			sx={{ px: 3, pt: 2 }}
		>
			<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{bullsOnServiceLabel(bulls.length)}</Typography>
			<Typography sx={{ mt: 0.25, fontSize: '0.75rem', color: 'text.secondary' }}>
				{'De paso por '}
				{orders.map(([orderId, code], index) => (
					<span key={orderId}>
						{index > 0 && ', '}
						<Link
							component="button"
							type="button"
							underline="hover"
							onClick={() => openOrder(orderId)}
							sx={{ fontSize: 'inherit', fontWeight: 600, verticalAlign: 'baseline' }}
						>
							{code}
						</Link>
					</span>
				))}
				. No cuentan en el peso ni en la composición del lote.
			</Typography>
			<Stack
				component="ul"
				spacing={0.5}
				sx={{ m: 0, mt: 1, p: 0, listStyle: 'none' }}
			>
				{bulls.map((bull) => (
					<Stack
						key={bull.caravan_id}
						component="li"
						direction="row"
						justifyContent="space-between"
						spacing={1.5}
						sx={{ fontSize: '0.75rem' }}
					>
						<Box
							component="span"
							className="truncate"
							title={bull.origin_batch_name ? `Vino de ${bull.origin_batch_name}` : undefined}
						>
							<Box
								component="span"
								sx={{ fontWeight: 600 }}
							>
								{bull.identification ?? 'Sin caravana'}
							</Box>
							{bull.origin_batch_name && (
								<Box
									component="span"
									sx={{ color: 'text.secondary' }}
								>
									{` · de ${bull.origin_batch_name}`}
								</Box>
							)}
						</Box>
						<Box
							component="span"
							sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
						>
							{formatKg(bull.weight)}
						</Box>
					</Stack>
				))}
			</Stack>
		</Box>
	);
}

export default HerdBatchBullsOnService;
