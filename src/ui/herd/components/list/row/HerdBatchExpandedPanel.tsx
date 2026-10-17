import { Box } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import HerdBatchRecentCaravans from '../HerdBatchRecentCaravans';
import HerdBatchOverviewAside from './HerdBatchOverviewAside';

interface HerdBatchExpandedPanelProps {
	batch: Batch;
	selectedCaravanId?: number | null;
	onViewCaravan: (caravan: CaravanSummary) => void;
}

/** The open batch: its overview aside and its latest caravans, in one surface. */
export function HerdBatchExpandedPanel({ batch, selectedCaravanId, onViewCaravan }: HerdBatchExpandedPanelProps) {
	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' },
				borderTop: 1,
				borderColor: 'divider',
				borderRadius: '0 0 9px 0',
				overflow: 'hidden'
			}}
		>
			<HerdBatchOverviewAside batch={batch} />
			<Box sx={{ minWidth: 0 }}>
				<HerdBatchRecentCaravans
					batchId={batch.id}
					highlightId={selectedCaravanId}
					onView={onViewCaravan}
				/>
			</Box>
		</Box>
	);
}

export default HerdBatchExpandedPanel;
