import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
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
	emptyBatchesOnly?: boolean;
	stockedBatchesOnly?: boolean;
}

const asArray = <T,>(value: T[] | undefined): T[] => (Array.isArray(value) ? value : []);

function HerdEmptyBatchesKpiStrip({
	batches,
	totalEmptyCount,
	activeFiltersCount
}: {
	batches: Batch[];
	totalEmptyCount: number;
	activeFiltersCount: number;
}) {
	const uniqueFarms = useMemo(
		() => new Set(batches.map((b) => b.farm_name).filter(Boolean)).size,
		[batches]
	);
	const uniqueActivities = useMemo(
		() => new Set(batches.map((b) => b.activity_name).filter(Boolean)).size,
		[batches]
	);

	return (
		<Paper
			component="section"
			aria-label="Resumen de Lotes Vacíos"
			elevation={0}
			sx={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
				border: 1,
				borderColor: 'divider',
				borderRadius: '10px',
				overflow: 'hidden',
				'& > *:not(:last-child)': { borderRight: 1, borderColor: 'divider' }
			}}
		>
			<Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
				<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
					Lotes vacíos disponibles
				</Typography>
				<Typography sx={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.15, color: 'text.primary' }}>
					{batches.length.toLocaleString('es-AR')}
				</Typography>
				<Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
					{activeFiltersCount > 0 ? `de ${totalEmptyCount} lotes vacíos` : 'sin hacienda asignada'}
				</Typography>
			</Box>

			<Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
				<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
					Establecimientos
				</Typography>
				<Typography sx={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.15, color: 'text.primary' }}>
					{uniqueFarms.toLocaleString('es-AR')}
				</Typography>
				<Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
					con disponibilidad de potrero
				</Typography>
			</Box>

			<Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
				<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
					Actividades configuradas
				</Typography>
				<Typography sx={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.15, color: 'text.primary' }}>
					{uniqueActivities.toLocaleString('es-AR')}
				</Typography>
				<Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
					destinos productivos listos
				</Typography>
			</Box>

			<Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
				<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
					Carga Animal
				</Typography>
				<Typography sx={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.15, color: '#16a34a' }}>
					0 cab.
				</Typography>
				<Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
					listos para ingreso o traslado
				</Typography>
			</Box>
		</Paper>
	);
}

/**
 * Own batches with their filters and KPIs. Each row expands to its latest caravans on demand.
 */
export function HerdBatchList({
	onCreateBatch,
	dialogs,
	emptyBatchesOnly = false,
	stockedBatchesOnly = false
}: HerdBatchListProps) {
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

	const ownBatches = useMemo(() => {
		const list = asArray(batches).filter((b) => b && b.provider_id == null);
		if (emptyBatchesOnly) return list.filter((b) => b.head_count <= 0);
		if (stockedBatchesOnly) return list.filter((b) => b.head_count > 0);
		return list;
	}, [batches, emptyBatchesOnly, stockedBatchesOnly]);

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
				{emptyBatchesOnly ? (
					<HerdEmptyBatchesKpiStrip
						batches={filteredBatches}
						totalEmptyCount={ownBatches.length}
						activeFiltersCount={activeFiltersCount}
					/>
				) : (
					<HerdKpiStrip batches={filteredBatches} />
				)}
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
								onWeighCaravan={dialogs.openWeigh}
								onAddCaravans={setAddingTo}
								onWeighBatch={setWeighing}
								onConsume={setConsumingIn}
								onTagCalves={setTaggingIn}
								onStartService={setServiceFor}
								onOpenServiceOrder={setOpenServiceOrderId}
							/>
						))}
						{!emptyBatchesOnly && activeFiltersCount === 0 && (
							<HerdUnassignedRow
								selectedCaravanId={selectedCaravanId}
								onViewCaravan={dialogs.openView}
								onWeighCaravan={dialogs.openWeigh}
							/>
						)}
					</Stack>
				) : emptyBatchesOnly && activeFiltersCount === 0 ? (
					<Paper
						elevation={0}
						sx={{
							p: 6,
							py: 8,
							borderRadius: '8px',
							border: '1px dashed',
							borderColor: 'divider',
							textAlign: 'center',
							bgcolor: 'background.paper'
						}}
					>
						<Stack spacing={2.5} alignItems="center" justifyContent="center">
							<Box
								sx={{
									p: 2,
									bgcolor: 'action.hover',
									color: 'success.main',
									borderRadius: '50%',
									display: 'flex'
								}}
							>
								<FuseSvgIcon size={40}>heroicons-outline:check-circle</FuseSvgIcon>
							</Box>
							<Stack spacing={0.5} maxWidth={440}>
								<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem' }}>
									No hay lotes vacíos actualmente
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
									Todos los lotes propios de su establecimiento cuentan con hacienda asignada. Si necesita crear un nuevo lote para futuras tropas o descansos de potrero, puede crearlo aquí.
								</Typography>
							</Stack>
							{onCreateBatch && (
								<Button
									variant="contained"
									size="small"
									onClick={onCreateBatch}
									startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus-circle</FuseSvgIcon>}
									sx={{
										mt: 1,
										borderRadius: '6px',
										textTransform: 'none',
										fontWeight: 700,
										px: 3
									}}
								>
									Crear Nuevo Lote
								</Button>
							)}
						</Stack>
					</Paper>
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
