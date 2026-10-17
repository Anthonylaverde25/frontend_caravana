import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useServiceOrders } from '@/features/gestation/hooks/useServiceOrders';
import ServiceOrderDetailDrawer from '@/ui/gestation/components/service-order-drawer/ServiceOrderDetailDrawer';
import HerdCaravanDialogs from '@/ui/herd/components/shared/HerdCaravanDialogs';
import HerdBatchListSkeleton from '@/ui/herd/components/list/HerdBatchListSkeleton';
import { useHerdCaravanDialogs } from '@/ui/herd/hooks/useHerdCaravanDialogs';
import { UNASSIGNED_BATCH } from '@/ui/herd/utils/herdFormat';
import GestationKpiCards from '../components/dashboard/GestationKpiCards';
import { isCalvingOverdue } from '../components/monitoring/ReproductiveAlertsCell';
import GestationBatchRow from '../components/list/GestationBatchRow';
import GestationFiltersBar from '../components/list/GestationFiltersBar';
import {
	getDaysLeft,
	getRiskDetails,
	type GestationBatchGroup,
	type GestationListFilters
} from '../components/list/gestationListUtils';

const INITIAL_FILTERS: GestationListFilters = {
	search: '',
	stage: 'ALL',
	risk: 'ALL',
	alertFilter: 'ALL'
};

/**
 * GestationListView Component
 * Renders the gestational monitoring batches and their pregnant females using the canonical
 * expandable batch card pattern from /herd.
 */
function GestationListView() {
	const navigate = useNavigate();
	const { activeCompanyId } = useCompany();
	const dialogs = useHerdCaravanDialogs();
	const [filters, setFilters] = useState<GestationListFilters>(INITIAL_FILTERS);
	const [openServiceOrderId, setOpenServiceOrderId] = useState<number | null>(null);

	const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);
	const { data: batches = [], isLoading: isLoadingBatches } = useBatches(undefined, undefined, 'own');
	const { data: serviceOrders = [] } = useServiceOrders();

	const ownBatches = useMemo(
		() => (Array.isArray(batches) ? batches.filter((b) => b && b.provider_id == null) : []),
		[batches]
	);

	const openServiceOrder = useMemo(
		() => serviceOrders.find((o) => o.id === openServiceOrderId) ?? null,
		[serviceOrders, openServiceOrderId]
	);

	const allBatchGroups = useMemo<GestationBatchGroup[]>(() => {
		const batchLookup = new Map(ownBatches.map((b) => [b.id, b]));
		const groupsMap = new Map<string, GestationBatchGroup>();

		for (const caravan of caravans) {
			if (!caravan.active_gestation) continue;

			const hasBatch = caravan.batch_id !== null && caravan.batch_id > 0;
			const key = hasBatch ? `batch-${caravan.batch_id}` : UNASSIGNED_BATCH;

			if (!groupsMap.has(key)) {
				const matchedBatch = hasBatch && caravan.batch_id ? (batchLookup.get(caravan.batch_id) ?? null) : null;
				groupsMap.set(key, {
					id: hasBatch && caravan.batch_id ? caravan.batch_id : UNASSIGNED_BATCH,
					name: matchedBatch?.name ?? caravan.batch_name ?? 'Sin lote asignado',
					isUnassigned: !hasBatch,
					batch: matchedBatch,
					caravans: []
				});
			}

			groupsMap.get(key)!.caravans.push(caravan);
		}

		const assigned: GestationBatchGroup[] = [];
		let unassigned: GestationBatchGroup | null = null;
		groupsMap.forEach((group) => {
			if (group.isUnassigned) unassigned = group;
			else assigned.push(group);
		});

		return unassigned ? [...assigned, unassigned] : assigned;
	}, [caravans, ownBatches]);

	const activeFiltersCount = useMemo(
		() =>
			(filters.search.trim().length > 0 ? 1 : 0) +
			(filters.stage !== 'ALL' ? 1 : 0) +
			(filters.risk !== 'ALL' ? 1 : 0) +
			(filters.alertFilter !== 'ALL' ? 1 : 0),
		[filters]
	);

	const filteredGroups = useMemo<GestationBatchGroup[]>(() => {
		const query = filters.search.trim().toLowerCase();

		return allBatchGroups
			.map((group) => {
				const batchNameMatches = query.length > 0 && group.name.toLowerCase().includes(query);
				const matchingCaravans = group.caravans.filter((caravan) => {
					if (query.length > 0 && !batchNameMatches) {
						const idMatch = caravan.identification.toLowerCase().includes(query);
						const catMatch = (caravan.category_name ?? caravan.category ?? '').toLowerCase().includes(query);
						if (!idMatch && !catMatch) return false;
					}
					if (filters.stage !== 'ALL' && caravan.active_gestation?.gestation_stage !== filters.stage) {
						return false;
					}
					const daysLeft = getDaysLeft(caravan.active_gestation?.estimated_due_date);
					if (
						filters.risk !== 'ALL' &&
						getRiskDetails(caravan.category_name ?? caravan.category, daysLeft).risk !== filters.risk
					) {
						return false;
					}
					if (filters.alertFilter === 'IMMINENT' && (daysLeft === null || daysLeft > 45)) return false;
					if (filters.alertFilter === 'OVERDUE' && !isCalvingOverdue(caravan)) return false;
					return true;
				});
				return { ...group, caravans: matchingCaravans };
			})
			.filter((group) => group.caravans.length > 0);
	}, [allBatchGroups, filters]);

	const selectedCaravanId = dialogs.viewing?.id ?? null;

	return (
		<ViewLayout
			title="Monitoreo Gestacional por Lotes"
			subtitle="Tus lotes con vientres gestantes y sus próximos partos en un solo lugar. Expandí un lote para revisar su estado obstétrico."
			actions={
				<Button
					variant="text"
					startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>}
					onClick={() => navigate('/gestation')}
					sx={{ textTransform: 'none', fontWeight: 700, color: 'primary.main' }}
				>
					Volver al Dashboard
				</Button>
			}
		>
			<GestationKpiCards caravans={caravans} />

			<Box component="main">
				<Paper
					elevation={0}
					sx={{ borderRadius: '8px', border: 1, borderColor: 'divider', overflow: 'hidden' }}
				>
					{isLoadingCaravans && isLoadingBatches ? (
						<HerdBatchListSkeleton />
					) : (
						<Box sx={{ width: '100%' }}>
							<GestationFiltersBar
								filters={filters}
								activeFiltersCount={activeFiltersCount}
								onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
								onStageChange={(stage) => setFilters((prev) => ({ ...prev, stage }))}
								onRiskChange={(risk) => setFilters((prev) => ({ ...prev, risk }))}
								onAlertFilterChange={(alertFilter) => setFilters((prev) => ({ ...prev, alertFilter }))}
								onResetFilters={() => setFilters(INITIAL_FILTERS)}
							/>

							<Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default' }}>
								{filteredGroups.length > 0 ? (
									<Stack spacing={1.5}>
										<Typography
											variant="caption"
											sx={{ color: 'text.secondary', textAlign: 'right' }}
										>
											{`${filteredGroups.length} de ${allBatchGroups.length} lotes con gestación`}
											{activeFiltersCount > 0 &&
												` · ${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} aplicado${activeFiltersCount > 1 ? 's' : ''}`}
										</Typography>
										{filteredGroups.map((group, index) => (
											<GestationBatchRow
												key={String(group.id)}
												group={group}
												defaultExpanded={index === 0}
												selectedCaravanId={selectedCaravanId}
												onViewCaravan={dialogs.openView}
												onEditCaravan={dialogs.openEdit}
												onWeighCaravan={dialogs.openWeigh}
												onOpenServiceOrder={setOpenServiceOrderId}
											/>
										))}
									</Stack>
								) : (
									<Paper
										elevation={0}
										sx={{
											p: 5,
											textAlign: 'center',
											borderRadius: '10px',
											border: 1,
											borderColor: 'divider',
											bgcolor: 'background.paper'
										}}
									>
										<Typography
											variant="subtitle1"
											sx={{ fontWeight: 700 }}
										>
											{activeFiltersCount > 0
												? 'No se encontraron vientres gestantes con los filtros seleccionados'
												: 'No hay vientres en gestación activa registrados'}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mt: 0.5 }}
										>
											{activeFiltersCount > 0
												? 'Probá limpiar los filtros para ver todos los lotes con preñeces activas.'
												: 'Los lotes aparecerán aquí automáticamente cuando se registren diagnósticos de preñez.'}
										</Typography>
										{activeFiltersCount > 0 && (
											<Button
												variant="outlined"
												size="small"
												onClick={() => setFilters(INITIAL_FILTERS)}
												sx={{ mt: 2, textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
											>
												Limpiar filtros
											</Button>
										)}
									</Paper>
								)}
							</Box>
						</Box>
					)}
				</Paper>
			</Box>

			<HerdCaravanDialogs
				dialogs={dialogs}
				ownBatches={ownBatches}
			/>
			<ServiceOrderDetailDrawer
				open={openServiceOrder !== null}
				onClose={() => setOpenServiceOrderId(null)}
				order={openServiceOrder}
				caravans={caravans}
				batches={ownBatches}
				onNavigateToServiceOrders={() => navigate('/gestation/service-orders')}
			/>
		</ViewLayout>
	);
}

export default GestationListView;
