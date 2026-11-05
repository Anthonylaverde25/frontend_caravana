import { CircularProgress, Typography } from '@mui/material';
import { useBatchConsumptionHistory } from '@/features/stock/hooks/useStockOperations';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import HerdBatchSection, { HerdBatchSectionAction } from './HerdBatchSection';
import { HerdBatchFigure, HerdBatchFigureRow } from './HerdBatchFigures';

interface HerdBatchConsumptionPanelProps {
	batchId: number;
	onConsume: () => void;
	onShowDetail: () => void;
}

/**
 * What the batch received and what it cost, in two figures once there is something to add up. The cost per head adds up operation
 * by operation with the heads of each one; the detail lives in its own tab.
 */
export function HerdBatchConsumptionPanel({ batchId, onConsume, onShowDetail }: HerdBatchConsumptionPanelProps) {
	const { data, isLoading } = useBatchConsumptionHistory(batchId);
	const count = data?.rows.length ?? 0;

	return (
		<HerdBatchSection
			title="Consumos y costos"
			actions={
				<>
					<HerdBatchSectionAction
						label="Registrar consumo"
						onClick={onConsume}
					/>
					{count > 0 && (
						<HerdBatchSectionAction
							label="Ver detalle"
							onClick={onShowDetail}
							icon={null}
						/>
					)}
				</>
			}
		>
			{isLoading || !data ? (
				<CircularProgress size={20} />
			) : (
				<>
					{/* A zero says nothing yet: with no records, the sentence is enough. */}
					{count > 0 && (
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
					)}
					<Typography
						sx={{
							fontSize: '0.8rem',
							color: data.hasPendingCost ? 'warning.dark' : 'text.secondary',
							fontWeight: data.hasPendingCost ? 600 : 400
						}}
					>
						{count === 0
							? 'Todavía no recibió consumos ni servicios.'
							: data.hasPendingCost
								? 'Hay costos pendientes de factura: los totales suman sólo lo que ya tiene precio.'
								: `${count} ${count === 1 ? 'registro' : 'registros'} de consumos y servicios.`}
					</Typography>
				</>
			)}
		</HerdBatchSection>
	);
}

export default HerdBatchConsumptionPanel;
