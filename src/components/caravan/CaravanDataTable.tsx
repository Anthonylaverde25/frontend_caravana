import React, { useState, useMemo, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';
import { Box, CircularProgress, Stack, Paper, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useUpsertCaravan } from '@/features/caravans/hooks/useUpsertCaravan';
import { CaravanItem, BatchGroup } from './types/caravanViewTypes';
import CaravanFilterBar from './components/CaravanFilterBar';
import CaravanSelectionBanner from './components/CaravanSelectionBanner';
import CaravanBatchGroupCard from './components/CaravanBatchGroupCard';
import CaravanFlatTable from './components/CaravanFlatTable';
import CaravanFormDialog from './dialogs/CaravanFormDialog';
import CaravanTransferDialog from './dialogs/CaravanTransferDialog';
import { CaravanWeightDialog } from './CaravanWeightDialog';
import BatchDetailDrawer from './BatchDetailDrawer';

export interface CaravanDataTableRef {
	openAddDialog: () => void;
	refresh: () => void;
}

interface CaravanDataTableProps {
	onBulkWeightEntry?: (batchId: number) => void;
	onWeightSheet?: (batchId: number | number[]) => void;
}

/**
 * CaravanDataTable
 * Adheres strictly to the canonical design pattern of /batches/external-assignment.
 * Provides a clean hierarchy view (Lotes → Caravanas) and flat table mode with zero accordion clutter.
 */
const CaravanDataTable = forwardRef<CaravanDataTableRef, CaravanDataTableProps>((props, ref) => {
	const queryClient = useQueryClient();
	const { activeCompanyId, companies } = useCompany();
	const availableCompanies = companies.filter((c) => c.id !== activeCompanyId);

	// Data Queries
	const { data: batches = [], isLoading: isLoadingBatches } = useBatches();
	const { data: rawCaravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId, 'own');
	const upsertMutation = useUpsertCaravan();

	// View & Filter States
	const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
	const [selectedSex, setSelectedSex] = useState<'ALL' | 'M' | 'H'>('ALL');
	const [selectedCaravanIds, setSelectedCaravanIds] = useState<number[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);

	// Dialog & Drawer States
	const [formDialogOpen, setFormDialogOpen] = useState(false);
	const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
	const [activeCaravan, setActiveCaravan] = useState<any>(null);
	const [defaultBatchForAdd, setDefaultBatchForAdd] = useState<number | undefined>(undefined);

	const [transferDialogOpen, setTransferDialogOpen] = useState(false);
	const [caravansToTransfer, setCaravansToTransfer] = useState<any[]>([]);

	const [weightDialogOpen, setWeightDialogOpen] = useState(false);
	const [caravanForWeight, setCaravanForWeight] = useState<any>(null);

	const [batchDetailOpen, setBatchDetailOpen] = useState(false);
	const [batchDetailData, setBatchDetailData] = useState<any>(null);

	// Reset pagination on filter change
	useEffect(() => {
		setPage(0);
	}, [searchTerm, selectedBatchId, selectedSex]);

	// Filter own batches (batches belonging to company without external provider)
	const ownBatches = useMemo(() => {
		return batches.filter((b) => b.provider_id === null || b.provider_id === undefined);
	}, [batches]);

	// Cast raw caravans to CaravanItem
	const allCaravans = useMemo(() => rawCaravans as CaravanItem[], [rawCaravans]);

	// Filtered caravans matching search, lot, and sex
	const filteredCaravans = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();

		return allCaravans.filter((c) => {
			if (selectedBatchId !== '' && c.batch_id !== selectedBatchId) return false;
			if (selectedSex !== 'ALL' && c.sex !== selectedSex) return false;

			if (term !== '') {
				const idMatch = c.identification?.toLowerCase().includes(term);
				const breedMatch = c.breed?.toLowerCase().includes(term);
				const catMatch =
					c.category?.toLowerCase().includes(term) ||
					c.category_name?.toLowerCase().includes(term) ||
					c.subcategory_name?.toLowerCase().includes(term);
				const lotMatch = c.batch_name?.toLowerCase().includes(term);
				if (!idMatch && !breedMatch && !catMatch && !lotMatch) return false;
			}

			return true;
		});
	}, [allCaravans, searchTerm, selectedBatchId, selectedSex]);

	const allEligibleIds = useMemo(() => filteredCaravans.map((c) => c.id), [filteredCaravans]);

	// Hierarchy structure: Groups by Lot (matching ExternalBatchAssignmentView)
	const hierarchyGroups = useMemo<BatchGroup[]>(() => {
		const groups: BatchGroup[] = [];

		ownBatches.forEach((batch) => {
			if (selectedBatchId !== '' && batch.id !== selectedBatchId) return;

			const batchCaravans = filteredCaravans.filter((c) => c.batch_id === batch.id);

			// Only show lot if it has matching animals or if explicitly filtering by this lot
			if (batchCaravans.length > 0 || (selectedBatchId === batch.id && searchTerm === '')) {
				const weights = batchCaravans.filter((c) => c.current_weight).map((c) => c.current_weight as number);
				const avgWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;

				groups.push({
					batchId: batch.id,
					batchName: batch.name,
					farmName: batch.farm_name || null,
					caravans: batchCaravans,
					totalHeads: batchCaravans.length,
					averageWeight: avgWeight,
					rawBatch: batch
				});
			}
		});

		// Check for unassigned animals
		const unassigned = filteredCaravans.filter((c) => !c.batch_id || c.batch_id === 0);
		if (unassigned.length > 0 && selectedBatchId === '') {
			const weights = unassigned.filter((c) => c.current_weight).map((c) => c.current_weight as number);
			const avgWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;

			groups.push({
				batchId: 0,
				batchName: 'SIN LOTE ASIGNADO',
				farmName: null,
				caravans: unassigned,
				totalHeads: unassigned.length,
				averageWeight: avgWeight,
				rawBatch: { id: 0, name: 'SIN LOTE ASIGNADO' }
			});
		}

		return groups;
	}, [ownBatches, filteredCaravans, selectedBatchId, searchTerm]);

	// Options for batch dropdown filter
	const batchOptions = useMemo(() => {
		return ownBatches.map((b) => {
			const count = allCaravans.filter((c) => c.batch_id === b.id).length;
			return { id: b.id, name: b.name, farm_name: b.farm_name, count };
		});
	}, [ownBatches, allCaravans]);

	// Selection handlers
	const handleToggleCaravan = useCallback((id: number) => {
		setSelectedCaravanIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
	}, []);

	const handleToggleGroup = useCallback((groupIds: number[]) => {
		if (groupIds.length === 0) return;
		const isAllSelected = groupIds.every((id) => groupIds.includes(id));
		setSelectedCaravanIds((prev) => {
			const areAllPresent = groupIds.every((id) => prev.includes(id));
			if (areAllPresent) {
				return prev.filter((id) => !groupIds.includes(id));
			}
			return Array.from(new Set([...prev, ...groupIds]));
		});
	}, []);

	const handleToggleAllPage = useCallback((pageIds: number[]) => {
		setSelectedCaravanIds((prev) => {
			const areAllPresent = pageIds.length > 0 && pageIds.every((id) => prev.includes(id));
			if (areAllPresent) {
				return prev.filter((id) => !pageIds.includes(id));
			}
			return Array.from(new Set([...prev, ...pageIds]));
		});
	}, []);

	const handleToggleSelectAll = useCallback(() => {
		if (selectedCaravanIds.length === allEligibleIds.length && allEligibleIds.length > 0) {
			setSelectedCaravanIds([]);
		} else {
			setSelectedCaravanIds(allEligibleIds);
		}
	}, [selectedCaravanIds, allEligibleIds]);

	// Imperative ref handler
	useImperativeHandle(ref, () => ({
		openAddDialog: () => {
			setDefaultBatchForAdd(undefined);
			setActiveCaravan(null);
			setFormMode('create');
			setFormDialogOpen(true);
		},
		refresh: () => queryClient.invalidateQueries({ queryKey: ['caravans'] })
	}));

	// Action triggers
	const handleAddCaravanToBatch = useCallback((batchId: number) => {
		setDefaultBatchForAdd(batchId);
		setActiveCaravan(null);
		setFormMode('create');
		setFormDialogOpen(true);
	}, []);

	const handleOpenViewCaravan = useCallback((caravan: CaravanItem) => {
		setActiveCaravan(caravan);
		setFormMode('view');
		setFormDialogOpen(true);
	}, []);

	const handleOpenEditCaravan = useCallback((caravan: CaravanItem) => {
		setActiveCaravan(caravan);
		setFormMode('edit');
		setFormDialogOpen(true);
	}, []);

	const handleOpenWeightCaravan = useCallback((caravan: CaravanItem) => {
		setCaravanForWeight(caravan);
		setWeightDialogOpen(true);
	}, []);

	const handleOpenTransferCaravan = useCallback((caravan: CaravanItem) => {
		setCaravansToTransfer([caravan]);
		setTransferDialogOpen(true);
	}, []);

	const handleOpenBatchDetail = useCallback((batch: any) => {
		setBatchDetailData(batch);
		setBatchDetailOpen(true);
	}, []);

	const handleFormSubmit = useCallback(
		(payload: any) => {
			upsertMutation.mutate(payload, {
				onSuccess: () => setFormDialogOpen(false)
			});
		},
		[upsertMutation]
	);

	const handleExportTxt = useCallback(() => {
		const targetIds = selectedCaravanIds.length > 0 ? selectedCaravanIds : allEligibleIds;
		if (targetIds.length === 0) return;

		const targetCaravans = allCaravans.filter((c) => targetIds.includes(c.id));
		let content = '';
		targetCaravans.forEach((c) => {
			content += `${c.identification || '-'}-${c.sex || '-'}-${c.breed || '-'}-${c.entry_date || '-'};\r\n`;
		});
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `caravanas_${selectedCaravanIds.length > 0 ? 'seleccion' : 'inventario'}_${new Date().toISOString().split('T')[0]}.txt`;
		link.click();
		URL.revokeObjectURL(url);
	}, [selectedCaravanIds, allEligibleIds, allCaravans]);

	const isLoading = isLoadingBatches || isLoadingCaravans;

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box className="w-full">
			{/* Canonical Filter Toolbar */}
			<CaravanFilterBar
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				selectedBatchId={selectedBatchId}
				onBatchChange={setSelectedBatchId}
				batchOptions={batchOptions}
				selectedSex={selectedSex}
				onSexChange={setSelectedSex}
				totalEligibleCount={filteredCaravans.length}
				viewMode={viewMode}
				onToggleViewMode={() => setViewMode((prev) => (prev === 'flat' ? 'hierarchy' : 'flat'))}
				isAllSelected={selectedCaravanIds.length === allEligibleIds.length && allEligibleIds.length > 0}
				onToggleSelectAll={handleToggleSelectAll}
				hasItems={allEligibleIds.length > 0}
				onExportTxt={handleExportTxt}
			/>

			{/* Canonical Selection Banner (Pedigree Pattern) */}
			<CaravanSelectionBanner
				selectedCount={selectedCaravanIds.length}
				onTransfer={() => {
					const selected = allCaravans.filter((c) => selectedCaravanIds.includes(c.id));
					setCaravansToTransfer(selected);
					setTransferDialogOpen(true);
				}}
				onWeightSheet={() => {
					// Open weight sheet for batches represented in selected caravans
					const representedBatchIds = Array.from(
						new Set(
							allCaravans
								.filter((c) => selectedCaravanIds.includes(c.id) && c.batch_id)
								.map((c) => c.batch_id as number)
						)
					);
					if (representedBatchIds.length > 0) {
						props.onWeightSheet?.(representedBatchIds);
					}
				}}
				onExportSelected={handleExportTxt}
				onClearSelection={() => setSelectedCaravanIds([])}
			/>

			{/* Views */}
			{viewMode === 'hierarchy' ? (
				hierarchyGroups.length === 0 ? (
					<Paper sx={{ p: 5, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No se encontraron lotes con animales según los filtros actuales.
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Prueba ajustando los criterios de búsqueda o seleccionando otro lote.
						</Typography>
					</Paper>
				) : (
					<Stack spacing={0}>
						{hierarchyGroups.map((group) => (
							<CaravanBatchGroupCard
								key={group.batchId}
								group={group}
								selectedCaravanIds={selectedCaravanIds}
								onToggleCaravan={handleToggleCaravan}
								onToggleGroup={handleToggleGroup}
								onAddCaravan={handleAddCaravanToBatch}
								onBulkWeightEntry={props.onBulkWeightEntry}
								onWeightSheet={props.onWeightSheet}
								onOpenBatchDetail={handleOpenBatchDetail}
								onViewCaravan={handleOpenViewCaravan}
								onEditCaravan={handleOpenEditCaravan}
								onWeightCaravan={handleOpenWeightCaravan}
								onTransferCaravan={handleOpenTransferCaravan}
							/>
						))}
					</Stack>
				)
			) : (
				<CaravanFlatTable
					caravans={filteredCaravans}
					selectedCaravanIds={selectedCaravanIds}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={setPage}
					onRowsPerPageChange={setRowsPerPage}
					onToggleCaravan={handleToggleCaravan}
					onToggleAllPage={handleToggleAllPage}
					onViewCaravan={handleOpenViewCaravan}
					onEditCaravan={handleOpenEditCaravan}
					onWeightCaravan={handleOpenWeightCaravan}
					onTransferCaravan={handleOpenTransferCaravan}
				/>
			)}

			{/* Isolated Reusable Dialogs */}
			<CaravanFormDialog
				open={formDialogOpen}
				mode={formMode}
				caravanData={activeCaravan}
				defaultBatchId={defaultBatchForAdd || (typeof selectedBatchId === 'number' ? selectedBatchId : undefined)}
				ownBatches={ownBatches}
				onClose={() => setFormDialogOpen(false)}
				onSubmit={handleFormSubmit}
				isSubmitting={upsertMutation.isPending}
			/>

			<CaravanTransferDialog
				open={transferDialogOpen}
				caravans={caravansToTransfer}
				availableCompanies={availableCompanies}
				onClose={() => setTransferDialogOpen(false)}
				onConfirm={(companyId, selected) => {
					console.log(`Transferring ${selected.length} animals to company ${companyId}`);
				}}
			/>

			<CaravanWeightDialog
				open={weightDialogOpen}
				onClose={() => {
					setWeightDialogOpen(false);
					setCaravanForWeight(null);
				}}
				caravan={caravanForWeight}
			/>

			<BatchDetailDrawer
				open={batchDetailOpen}
				onClose={() => {
					setBatchDetailOpen(false);
					setBatchDetailData(null);
				}}
				batch={batchDetailData}
			/>
		</Box>
	);
});

export default CaravanDataTable;
