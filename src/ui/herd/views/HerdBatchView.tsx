import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useBatchOverview } from '@/features/batches/hooks/useBatchOverview';
import AddCaravansDialog from 'src/ui/batches/components/AddCaravansDialog';
import StartBatchServiceDialog from 'src/ui/batches/components/dialogs/StartBatchServiceDialog';
import BatchQuickTransferDialog from 'src/ui/batches/components/details/BatchQuickTransferDialog';
import HerdBatchActions from '../components/detail/HerdBatchActions';
import { BatchWeighingDialog } from '@/ui/weighing/components/batch-weighing/BatchWeighingDialog';
import HerdBatchKpiGrid from '../components/detail/HerdBatchKpiGrid';
import HerdBatchAlerts from '../components/detail/HerdBatchAlerts';
import HerdBatchCategoryBreakdown from '../components/detail/HerdBatchCategoryBreakdown';
import HerdBatchCaravansTable from '../components/detail/HerdBatchCaravansTable';
import HerdBatchWeightSection from '../components/detail/HerdBatchWeightSection';
import HerdCaravanDialogs from '../components/shared/HerdCaravanDialogs';
import { useHerdCaravanDialogs } from '../hooks/useHerdCaravanDialogs';
import { UNASSIGNED_BATCH } from '../utils/herdFormat';
import { useCompany } from '@/contexts/CompanyContext';

type BatchDialog = 'add' | 'transfer' | 'weigh' | 'service' | null;

/**
 * The page of one batch: its figures, what needs attention, and all its caravans paginated.
 * "unassigned" shows the caravans in no batch, with the table only.
 */
function HerdBatchView() {
	const navigate = useNavigate();
	const { batchId: rawBatchId } = useParams();
	const [searchParams] = useSearchParams();
	const isUnassigned = rawBatchId === UNASSIGNED_BATCH;
	const batchId = isUnassigned ? undefined : Number(rawBatchId) || undefined;
	const highlightId = Number(searchParams.get('caravan')) || null;
	const initialSearch = searchParams.get('q') ?? '';

	const { activeCompanyId, companies } = useCompany();
	const companyName = companies.find((c) => c.id === activeCompanyId)?.name;
	const dialogs = useHerdCaravanDialogs();
	const [openDialog, setOpenDialog] = useState<BatchDialog>(null);
	const { data: batch, isLoading, isError } = useBatch(batchId);
	const { data: overview } = useBatchOverview(batchId);
	const { data: batches } = useBatches(undefined, undefined, 'own');
	const ownBatches = useMemo(
		() => (Array.isArray(batches) ? batches.filter((b) => b.provider_id == null) : []),
		[batches]
	);

	const tableKey = `${rawBatchId}-${highlightId ?? ''}-${initialSearch}`;
	const table = (
		<HerdBatchCaravansTable
			key={tableKey}
			batchId={isUnassigned ? UNASSIGNED_BATCH : (batchId as number)}
			initialSearch={initialSearch}
			highlightId={highlightId}
			dialogs={dialogs}
		/>
	);

	if (isUnassigned) {
		return (
			<ViewLayout
				title="Sin lote asignado"
				subtitle="Caravanas propias que no están en ningún lote."
			>
				<Box sx={{ p: { xs: 2, md: 3 } }}>{table}</Box>
				<HerdCaravanDialogs
					dialogs={dialogs}
					ownBatches={ownBatches}
				/>
			</ViewLayout>
		);
	}

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError || !batch) {
		return (
			<Stack
				alignItems="center"
				spacing={2}
				sx={{ p: 8 }}
			>
				<Typography variant="h6">No se encontró el lote.</Typography>
				<Button
					variant="contained"
					onClick={() => navigate('/herd')}
				>
					Volver a Hacienda Propia
				</Button>
			</Stack>
		);
	}

	const subtitle = [
		// An own batch has no farm: its place is the company itself.
		batch.farm_name ?? companyName,
		batch.activity_name,
		batch.batch_type_name,
		batch.is_active ? null : 'Inactivo'
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<ViewLayout
			title={batch.name}
			subtitle={subtitle}
			actions={
				<HerdBatchActions
					batch={batch}
					onAddCaravans={() => setOpenDialog('add')}
					onTransfer={() => setOpenDialog('transfer')}
					onWeighBatch={() => setOpenDialog('weigh')}
					onStartService={() => setOpenDialog('service')}
				/>
			}
		>
			<Stack
				spacing={2}
				sx={{ p: { xs: 2, md: 3 } }}
			>
				<HerdBatchKpiGrid
					batch={batch}
					overview={overview}
				/>
				<Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' } }}>
					<HerdBatchAlerts alerts={overview?.alerts ?? []} />
					<HerdBatchCategoryBreakdown categories={overview?.category_composition ?? []} />
				</Box>
				{table}
				<HerdBatchWeightSection batchId={batch.id} />
			</Stack>

			<HerdCaravanDialogs
				dialogs={dialogs}
				ownBatches={ownBatches}
			/>
			{/* Mounted only while open: these dialogs derive state from queries that are idle when closed. */}
			{openDialog === 'add' && (
				<AddCaravansDialog
					open
					onClose={() => setOpenDialog(null)}
					batch={batch}
				/>
			)}
			{openDialog === 'transfer' && (
				<BatchQuickTransferDialog
					open
					onClose={() => setOpenDialog(null)}
					batch={batch}
				/>
			)}
			{openDialog === 'weigh' && (
				<BatchWeighingDialog
					open
					onClose={() => setOpenDialog(null)}
					batch={batch}
				/>
			)}
			{openDialog === 'service' && (
				<StartBatchServiceDialog
					open
					onClose={() => setOpenDialog(null)}
					batch={batch}
				/>
			)}
		</ViewLayout>
	);
}

export default HerdBatchView;
