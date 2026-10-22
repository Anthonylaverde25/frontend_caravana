import { Stack } from '@mui/material';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useBatchOverview } from '@/features/batches/hooks/useBatchOverview';
import HerdBatchAlerts from '@/ui/herd/components/detail/HerdBatchAlerts';
import HerdBatchCategoryBreakdown from '@/ui/herd/components/detail/HerdBatchCategoryBreakdown';
import HerdBatchKpiGrid from '@/ui/herd/components/detail/HerdBatchKpiGrid';
import EntityDrawerShell from '../EntityDrawerShell';
import type { EntityDrawerProps } from './entityDrawerProps';

/** A batch at a glance: its figures, alerts and categories, as the top of its herd page. */
export function BatchEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: batch, isLoading, isError } = useBatch(id);
	const { data: overview } = useBatchOverview(id);

	const subtitle = batch
		? [batch.farm_name, batch.activity_name, batch.batch_type_name, batch.is_active ? null : 'Inactivo']
				.filter(Boolean)
				.join(' · ')
		: undefined;

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:rectangle-stack"
			title={batch?.name ?? label ?? 'Lote'}
			subtitle={subtitle}
			isLoading={isLoading}
			isError={isError}
			screen={{ route: `/herd/batches/${id}`, label: 'Abrir lote' }}
			onNavigate={onNavigate}
		>
			{batch && (
				<Stack spacing={2}>
					<HerdBatchKpiGrid
						batch={batch}
						overview={overview}
					/>
					<HerdBatchAlerts alerts={overview?.alerts ?? []} />
					<HerdBatchCategoryBreakdown categories={overview?.category_composition ?? []} />
				</Stack>
			)}
		</EntityDrawerShell>
	);
}

export default BatchEntityDrawer;
