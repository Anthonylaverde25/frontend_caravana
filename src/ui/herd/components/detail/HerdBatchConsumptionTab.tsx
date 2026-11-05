import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useBatchConsumptionHistory } from '@/features/stock/hooks/useStockOperations';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import ConsumptionHistoryGrid from './ConsumptionHistoryGrid';
import HerdBatchSection, { HerdBatchSectionAction } from './summary/HerdBatchSection';
import { HerdBatchFigure, HerdBatchFigureRow } from './summary/HerdBatchFigures';

interface HerdBatchConsumptionTabProps {
	batchId: number;
	onConsume: () => void;
}

/**
 * "Consumos y costos" (logical schema 4.4): what the batch received and what it cost. The cost
 * per head adds up operation by operation, with the heads of each one, never the total divided by
 * today's heads: a transfer does not change it.
 */
export function HerdBatchConsumptionTab({ batchId, onConsume }: HerdBatchConsumptionTabProps) {
	const { data, isLoading } = useBatchConsumptionHistory(batchId);

	return (
		<Box sx={{ flex: 1, bgcolor: 'background.paper' }}>
			<HerdBatchSection
				title="Consumos y servicios"
				actions={
					<HerdBatchSectionAction
						label="Registrar consumo"
						onClick={onConsume}
					/>
				}
			>
				{isLoading || !data ? (
					<CircularProgress size={22} />
				) : (
					<Stack spacing={2}>
						<HerdBatchFigureRow>
							<HerdBatchFigure
								label="Costo total"
								value={formatMoney(data.totalCost)}
							/>
							<HerdBatchFigure
								label="Por cabeza, acumulado"
								value={formatMoney(data.costPerHead)}
							/>
						</HerdBatchFigureRow>
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
			</HerdBatchSection>
		</Box>
	);
}

export default HerdBatchConsumptionTab;
