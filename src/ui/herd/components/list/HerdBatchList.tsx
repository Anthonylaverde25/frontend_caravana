import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Stack, Typography } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';
import { useServiceOrders } from '@/features/gestation/hooks/useServiceOrders';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useCompany } from '@/contexts/CompanyContext';
import { BatchFiltersBar } from 'src/ui/batches/components/filters/BatchFiltersBar';
import { useBatchFilters } from 'src/ui/batches/components/filters/useBatchFilters';
import { OwnBatchesEmptyState } from 'src/ui/batches/components/own/OwnBatchesEmptyState';
import AddCaravansDialog from 'src/ui/batches/components/AddCaravansDialog';
import StartBatchServiceDialog from 'src/ui/batches/components/dialogs/StartBatchServiceDialog';
import ServiceOrderDetailDrawer from '@/ui/gestation/components/service-order-drawer/ServiceOrderDetailDrawer';
import HerdBatchRow from './HerdBatchRow';
import { BatchWeighingDialog } from '@/ui/weighing/components/batch-weighing/BatchWeighingDialog';
import ConsumptionDialog from '@/ui/stock/components/consumption/ConsumptionDialog';
import HerdUnassignedRow from './HerdUnassignedRow';
import TagCalvesDialog from '../tag-calves/TagCalvesDialog';
import HerdKpiStrip from './HerdKpiStrip';
import HerdCaravanDialogs from '../shared/HerdCaravanDialogs';
import HerdBatchListSkeleton from './HerdBatchListSkeleton';
import type { HerdCaravanDialogsState } from '../../hooks/useHerdCaravanDialogs';

interface HerdBatchListProps {
	onCreateBatch: () => void;
	/** Owned by the view, so its "Insertar caravana" action opens the same form. */
	dialogs: HerdCaravanDialogsState;
}

const asArray = <T,>(value: T[] | undefined): T[] => (Array.isArray(value) ? value : []);

/**
 * Own batches with their filters and KPIs. Each row expands to its latest caravans on demand.
 */
export function HerdBatchList({ onCreateBatch, dialogs }: HerdBatchListProps) {
	const navigate = useNavigate();
	const { activeCompanyId } = useCompany();
	const [addingTo, setAddingTo] = useState<Batch | null>(null);
	const [serviceFor, setServiceFor] = useState<Batch | null>(null);
	const [weighing, setWeighing] = useState<Batch | null>(null);
	const [consumingIn, setConsumingIn] = useState<Batch | null>(null);
	const [taggingIn, setTaggingIn] = useState<Batch | null>(null);
	const [openServiceOrderId, setOpenServiceOrderId] = useState<number | null>(null);

	const { data: batches, isLoading, isError } = useBatches(undefined, undefined, 'own');
	const { data: activities } = useActivities(activeCompanyId);
	const { data: batchTypes } = useBatchTypes();
	const { data: serviceOrders = [] } = useServiceOrders();
	const { data: allCaravans = [] } = useCaravans(openServiceOrderId ? activeCompanyId : null, 'own');

	const ownBatches = useMemo(() => asArray(batches).filter((b) => b && b.provider_id == null), [batches]);

	const openServiceOrder = useMemo(
		() => serviceOrders.find((o) => o.id === openServiceOrderId) ?? null,
		[serviceOrders, openServiceOrderId]
	);

	const filtersState = useBatchFilters({
		batches: ownBatches,
		activities: asArray(activities),
		// No farms: own batches have none (the company is its own farm), so there is no farm filter.
		batchTypes: asArray(batchTypes)
	});
	const { filters, filteredBatches, activeFiltersCount, resetFilters } = filtersState;

	if (isLoading) {
		return <HerdBatchListSkeleton />;
	}

	if (isError) {
		return (
			<Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
				<Typography variant="h6">Error al cargar los lotes propios</Typography>
				<Typography variant="body2">Intente recargar la página más tarde.</Typography>
			</Box>
		);
	}

	const selectedCaravanId = dialogs.viewing?.id ?? null;

	return (
		<Box sx={{ width: '100%' }}>
			<Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 0, md: 0 } }}>
				<HerdKpiStrip batches={filteredBatches} />
			</Box>
			<BatchFiltersBar
				filters={filters}
				onSearchChange={filtersState.setSearch}
				onActivityChange={filtersState.setActivityId}
				onBatchTypeChange={filtersState.setBatchTypeId}
				onFarmChange={filtersState.setFarmId}
				onLifecycleStatusChange={filtersState.setLifecycleStatus}
				onOperationalStatusChange={filtersState.setOperationalStatus}
				onResetFilters={resetFilters}
				activeFiltersCount={activeFiltersCount}
				activityOptions={filtersState.activityOptions}
				batchTypeOptions={filtersState.batchTypeOptions}
				farmOptions={filtersState.farmOptions}
				summaryKPIs={filtersState.summaryKPIs}
				totalAvailableBatches={ownBatches.length}
				hideSummary
			/>

			<Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.default' }}>
				{filteredBatches.length > 0 ? (
					<Stack spacing={1.5}>
						<Typography
							variant="caption"
							sx={{ color: 'text.secondary', textAlign: 'right' }}
						>
							{`${filteredBatches.length} de ${ownBatches.length} lotes`}
							{activeFiltersCount > 0 &&
								` · ${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} aplicado${activeFiltersCount > 1 ? 's' : ''}`}
						</Typography>
						{filteredBatches.map((batch, index) => (
							<HerdBatchRow
								key={batch.id}
								batch={batch}
								defaultExpanded={index === 0}
								selectedCaravanId={selectedCaravanId}
								onViewCaravan={dialogs.openView}
								onAddCaravans={setAddingTo}
								onWeighBatch={setWeighing}
								onConsume={setConsumingIn}
								onTagCalves={setTaggingIn}
								onStartService={setServiceFor}
								onOpenServiceOrder={setOpenServiceOrderId}
							/>
						))}
						{activeFiltersCount === 0 && (
							<HerdUnassignedRow
								selectedCaravanId={selectedCaravanId}
								onViewCaravan={dialogs.openView}
							/>
						)}
					</Stack>
				) : (
					<OwnBatchesEmptyState
						hasActiveFilters={activeFiltersCount > 0}
						onResetFilters={resetFilters}
						onCreateBatch={onCreateBatch}
					/>
				)}
			</Box>

			{/* Mounted only while open: these dialogs derive state from queries that are idle when closed. */}
			{addingTo && (
				<AddCaravansDialog
					open
					onClose={() => setAddingTo(null)}
					batch={addingTo}
				/>
			)}
			{weighing && (
				<BatchWeighingDialog
					open
					onClose={() => setWeighing(null)}
					batch={weighing}
				/>
			)}
			{consumingIn && (
				<ConsumptionDialog
					open
					onClose={() => setConsumingIn(null)}
					batch={consumingIn}
				/>
			)}
			{taggingIn && (
				<TagCalvesDialog
					open
					onClose={() => setTaggingIn(null)}
					batch={taggingIn}
				/>
			)}
			{serviceFor && (
				<StartBatchServiceDialog
					open
					onClose={() => setServiceFor(null)}
					batch={serviceFor}
				/>
			)}
			<HerdCaravanDialogs
				dialogs={dialogs}
				ownBatches={ownBatches}
			/>
			<ServiceOrderDetailDrawer
				open={openServiceOrder !== null}
				onClose={() => setOpenServiceOrderId(null)}
				order={openServiceOrder}
				caravans={allCaravans}
				batches={ownBatches}
				onNavigateToServiceOrders={() => navigate('/gestation/service-orders')}
			/>
		</Box>
	);
}

export default HerdBatchList;
