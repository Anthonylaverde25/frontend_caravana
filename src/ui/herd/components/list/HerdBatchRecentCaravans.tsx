import { useNavigate } from 'react-router';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { useCaravansSummary } from '@/features/caravans/hooks/useCaravansSummary';
import HerdCaravanTable from '../shared/HerdCaravanTable';
import HerdCaravanTableSkeleton from '../shared/HerdCaravanTableSkeleton';
import { herdBatchPath, RECENT_COUNT, UNASSIGNED_BATCH } from '../../utils/herdFormat';

interface HerdBatchRecentCaravansProps {
	batchId: number | typeof UNASSIGNED_BATCH;
	/** The caravan open in the detail drawer. */
	highlightId?: number | null;
	onView: (caravan: CaravanSummary) => void;
}

/**
 * The last caravans that arrived to a batch. Mounted only when its row is expanded, so a closed
 * batch costs no request; "Ver todas" opens the batch page with the full, paginated list.
 */
export function HerdBatchRecentCaravans({ batchId, highlightId, onView }: HerdBatchRecentCaravansProps) {
	const navigate = useNavigate();
	const { data, isLoading, isError } = useCaravansSummary({ batchId, sort: 'recent', perPage: RECENT_COUNT });
	const rows = data?.data ?? [];
	const total = data?.meta.total ?? 0;

	if (isLoading) {
		return (
			<Box>
				<HerdCaravanTableSkeleton rowCount={RECENT_COUNT} />
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 2, pr: 1, py: 1 }}>
					<Skeleton
						variant="text"
						width={170}
						height={20}
					/>
					<Skeleton
						variant="rounded"
						width={140}
						height={28}
						sx={{ borderRadius: '6px' }}
					/>
				</Box>
			</Box>
		);
	}

	if (isError) {
		return (
			<Typography
				variant="body2"
				color="error"
				sx={{ p: 2 }}
			>
				No se pudieron cargar las caravanas del lote.
			</Typography>
		);
	}

	if (rows.length === 0) {
		return (
			<Typography
				variant="body2"
				color="text.secondary"
				sx={{ p: 2 }}
			>
				El lote todavía no tiene caravanas.
			</Typography>
		);
	}

	return (
		<Box>
			<HerdCaravanTable
				rows={rows}
				highlightId={highlightId}
				onView={onView}
			/>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 2, pr: 1, py: 0.5 }}>
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary' }}
				>
					{total > rows.length
						? `Últimos ${rows.length} ingresos de ${total}`
						: `${total} caravanas, último ingreso primero`}
				</Typography>
				<Button
					size="small"
					onClick={() => navigate(herdBatchPath(batchId))}
					endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>}
					sx={{ fontWeight: 700, textTransform: 'none' }}
				>
					{`Ver las ${total} caravanas`}
				</Button>
			</Box>
		</Box>
	);
}

export default HerdBatchRecentCaravans;
