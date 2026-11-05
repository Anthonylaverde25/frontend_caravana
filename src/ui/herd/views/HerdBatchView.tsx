import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useBatchOverview } from '@/features/batches/hooks/useBatchOverview';
import HerdBatchHeaderActions from '../components/detail/HerdBatchHeaderActions';
import HerdBatchTabs, { type HerdBatchTab } from '../components/detail/HerdBatchTabs';
import HerdBatchSummaryTab from '../components/detail/summary/HerdBatchSummaryTab';
import HerdBatchNoveltiesTab from '../components/detail/HerdBatchNoveltiesTab';
import HerdBatchCaravansTable from '../components/detail/HerdBatchCaravansTable';
import HerdBatchConsumptionTab from '../components/detail/HerdBatchConsumptionTab';
import HerdBatchDialogs, { type HerdBatchDialog } from '../components/detail/HerdBatchDialogs';
import HerdCaravanDialogs from '../components/shared/HerdCaravanDialogs';
import { useHerdCaravanDialogs } from '../hooks/useHerdCaravanDialogs';
import { orderLink, UNASSIGNED_BATCH } from '../utils/herdFormat';

const TABS: HerdBatchTab[] = ['summary', 'novelties', 'caravans', 'consumption'];

/**
 * The page of one batch as one sheet with three tabs: "Resumen" (the batch sheet and a section per
 * subject, each with its own actions), "Caravanas" and "Consumos y costos". The tab lives in
 * ?tab=; a link to a caravan (?caravan= or ?q=) opens the caravans. "unassigned" shows the caravans
 * in no batch, with the table only.
 */
function HerdBatchView() {
	const navigate = useNavigate();
	const { batchId: rawBatchId } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();
	const isUnassigned = rawBatchId === UNASSIGNED_BATCH;
	const batchId = isUnassigned ? undefined : Number(rawBatchId) || undefined;
	const highlightId = Number(searchParams.get('caravan')) || null;
	const initialSearch = searchParams.get('q') ?? '';
	const tabParam = searchParams.get('tab') as HerdBatchTab | null;
	const tab: HerdBatchTab =
		tabParam && TABS.includes(tabParam) ? tabParam : highlightId || initialSearch ? 'caravans' : 'summary';

	const dialogs = useHerdCaravanDialogs();
	const [dialog, setDialog] = useState<HerdBatchDialog>(null);
	const { data: batch, isLoading, isError } = useBatch(batchId);
	const { data: overview } = useBatchOverview(batchId);
	const { data: batches } = useBatches(undefined, undefined, 'own');
	const ownBatches = useMemo(
		() => (Array.isArray(batches) ? batches.filter((b) => b.provider_id == null) : []),
		[batches]
	);

	const changeTab = (next: HerdBatchTab) =>
		setSearchParams(
			(params) => {
				params.set('tab', next);

				// The caravan a link pointed to belongs to the caravans tab only.
				if (next !== 'caravans') {
					params.delete('caravan');
					params.delete('q');
				}

				return params;
			},
			{ replace: true }
		);

	const table = (
		<HerdBatchCaravansTable
			key={`${rawBatchId}-${highlightId ?? ''}-${initialSearch}`}
			batchId={isUnassigned ? UNASSIGNED_BATCH : (batchId as number)}
			initialSearch={initialSearch}
			highlightId={highlightId}
			dialogs={dialogs}
			onBulkTransfer={isUnassigned ? undefined : (caravanIds) => setDialog({ kind: 'transfer', caravanIds })}
		/>
	);

	if (isUnassigned) {
		return (
			<ViewLayout
				title="Sin lote asignado"
				subtitle="Caravanas propias que no están en ningún lote."
				className=""
			>
				{table}
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

	const service = batch.active_service_order;
	const serviceLink = service ? orderLink('service_order', service.id) : null;
	const open = (kind: Exclude<NonNullable<HerdBatchDialog>['kind'], 'transfer'>) => () => setDialog({ kind });

	return (
		<ViewLayout
			title={batch.name}
			subtitle={batch.is_active ? undefined : 'Inactivo'}
			className=""
			breadcrumbs={[
				{ title: 'Hacienda Propia', url: '/herd' },
				{ title: batch.name, url: `/herd/batches/${batch.id}` }
			]}
			actions={
				<HerdBatchHeaderActions
					onPrintSheet={() => navigate(`/herd/batches/${batch.id}/weight-sheet`)}
					onAddCaravans={open('add')}
					onTransfer={() => setDialog({ kind: 'transfer', caravanIds: undefined })}
					onChangeManagement={open('management')}
				/>
			}
			subHeader={
				<HerdBatchTabs
					value={tab}
					caravanCount={batch.caravans_count ?? null}
					alertsCount={overview?.alerts?.length ?? 0}
					onChange={changeTab}
				/>
			}
		>
			{tab === 'summary' && (
				<HerdBatchSummaryTab
					batch={batch}
					overview={overview}
					actions={{
						onChangeManagement: open('management'),
						onTagCalves: open('tag'),
						onCastrate: open('castrate'),
						onWeighBatch: open('weigh'),
						onWeighByCaravan: () => navigate(`/herd/batches/${batch.id}/bulk-weight`),
						onOpenService: () => serviceLink && navigate(serviceLink),
						onStartService: batch.isCria() && !batch.hasUnclosedServiceOrder() ? open('service') : null,
						onConsume: open('consume'),
						onShowConsumption: () => changeTab('consumption'),
						onShowNovelties: () => changeTab('novelties')
					}}
				/>
			)}
			{tab === 'novelties' && (
				<HerdBatchNoveltiesTab alerts={overview?.alerts ?? []} />
			)}
			{tab === 'caravans' && table}
			{tab === 'consumption' && (
				<HerdBatchConsumptionTab
					batchId={batch.id as number}
					onConsume={open('consume')}
				/>
			)}

			<HerdCaravanDialogs
				dialogs={dialogs}
				ownBatches={ownBatches}
			/>
			<HerdBatchDialogs
				batch={batch}
				dialog={dialog}
				onClose={() => setDialog(null)}
			/>
		</ViewLayout>
	);
}

export default HerdBatchView;
