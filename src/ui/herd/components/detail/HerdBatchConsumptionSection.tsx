import { useState } from 'react';
import { Box, Chip, CircularProgress, Collapse, Paper, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatchConsumptionHistory } from '@/features/stock/hooks/useStockOperations';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import ConsumptionHistoryGrid from './ConsumptionHistoryGrid';

/**
 * "Consumos y servicios" (logical schema 4.4): what the batch received and what it cost. The cost
 * per head adds up operation by operation, with the heads of each one, never the total divided by
 * today's heads: a transfer does not change it.
 */
export default function HerdBatchConsumptionSection({ batchId }: { batchId: number }) {
	const [open, setOpen] = useState(true);
	const { data, isLoading } = useBatchConsumptionHistory(batchId);

	return (
		<Paper
			elevation={0}
			sx={{ borderRadius: '8px', border: 1, borderColor: 'divider', overflow: 'hidden' }}
		>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				sx={{ p: 2, cursor: 'pointer' }}
				onClick={() => setOpen((prev) => !prev)}
			>
				<FuseSvgIcon
					size={20}
					sx={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
				>
					heroicons-outline:chevron-right
				</FuseSvgIcon>
				<Typography
					variant="subtitle2"
					sx={{ fontWeight: 800 }}
				>
					Consumos y servicios
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ flex: 1 }}
				>
					{data
						? `Costo total ${formatMoney(data.totalCost)} · Costo por cabeza acumulado ${formatMoney(data.costPerHead)}${data.hasPendingCost ? ' · con costos pendientes de factura' : ''}`
						: 'Lo que recibió el lote y su costo'}
				</Typography>
			</Stack>
			<Collapse
				in={open}
				unmountOnExit
			>
				<Box sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
					{isLoading || !data ? (
						<CircularProgress size={22} />
					) : (
						<Stack spacing={1.5}>
							{data.byCategory.length > 0 && (
								<Stack
									direction="row"
									spacing={1}
									flexWrap="wrap"
									useFlexGap
								>
									{data.byCategory.map((c) => (
										<Chip
											key={c.category}
											size="small"
											variant="outlined"
											label={`${c.category} ${formatMoney(c.cost)}`}
											sx={{ fontWeight: 600 }}
										/>
									))}
								</Stack>
							)}
							{data.hasPendingCost && (
								<Typography
									variant="body2"
									sx={{ color: 'warning.dark', fontWeight: 600 }}
								>
									Hay costos pendientes de factura: los totales suman sólo lo que ya tiene precio.
								</Typography>
							)}
							<ConsumptionHistoryGrid rows={data.rows} />
						</Stack>
					)}
				</Box>
			</Collapse>
		</Paper>
	);
}
