import { Box } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { BatchOverview } from '@/core/batches/domain/entities/BatchOverview';
import HerdBatchKpiRow from './HerdBatchKpiRow';
import HerdBatchNovelties from './HerdBatchNovelties';
import HerdBatchProfile from './HerdBatchProfile';
import HerdBatchWeightPanel from './HerdBatchWeightPanel';
import HerdBatchReproductionPanel from './HerdBatchReproductionPanel';
import HerdBatchConsumptionPanel from './HerdBatchConsumptionPanel';

export interface HerdBatchSummaryActions {
	onChangeManagement: () => void;
	onTagCalves: () => void;
	onCastrate?: () => void;
	onWeighBatch: () => void;
	onWeighByCaravan: () => void;
	onOpenService: () => void;
	onStartService: (() => void) | null;
	onConsume: () => void;
	onShowConsumption: () => void;
	onShowNovelties: () => void;
}

interface HerdBatchSummaryTabProps {
	batch: Batch;
	overview: BatchOverview | undefined;
	actions: HerdBatchSummaryActions;
}

/**
 * The "Resumen" tab: the batch sheet on the side (what it is and who is in it) and, beside it, the
 * figures, what needs attention and one section per subject, each with the actions on its own data.
 * One sheet, no cards: rules and hairlines set the parts apart.
 */
export function HerdBatchSummaryTab({ batch, overview, actions }: HerdBatchSummaryTabProps) {
	const reproductive = overview?.reproductive ?? null;

	return (
		<Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', bgcolor: 'background.paper' }}>
			<HerdBatchProfile
				batch={batch}
				overview={overview}
				onChangeManagement={actions.onChangeManagement}
				onTagCalves={actions.onTagCalves}
				onCastrate={actions.onCastrate}
			/>

			<Box sx={{ flex: '999 1 560px', minWidth: 0, '& > * + *': { borderTop: 1, borderColor: 'divider' } }}>
				<HerdBatchKpiRow
					batch={batch}
					lastWeighingDate={overview?.last_weighing_date}
				/>
				<HerdBatchNovelties
					alerts={overview?.alerts ?? []}
					onShowAll={actions.onShowNovelties}
				/>
				<HerdBatchWeightPanel
					batch={batch}
					onWeighBatch={actions.onWeighBatch}
					onWeighByCaravan={actions.onWeighByCaravan}
				/>
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						'& > *': { flex: '1 1 320px' },
						'& > * + *': {
							borderLeft: { md: 1 },
							borderTop: { xs: 1, md: 0 },
							borderColor: { xs: 'divider', md: 'divider' }
						}
					}}
				>
					{reproductive && (
						<HerdBatchReproductionPanel
							reproductive={reproductive}
							activeServiceCode={batch.active_service_order?.code ?? null}
							onOpenService={actions.onOpenService}
							onStartService={actions.onStartService}
						/>
					)}
					<HerdBatchConsumptionPanel
						batchId={batch.id as number}
						onConsume={actions.onConsume}
						onShowDetail={actions.onShowConsumption}
					/>
				</Box>
			</Box>
		</Box>
	);
}

export default HerdBatchSummaryTab;
