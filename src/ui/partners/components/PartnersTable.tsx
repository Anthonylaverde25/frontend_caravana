import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, CircularProgress, Stack, Paper, Typography } from '@mui/material';
import { usePartners } from '@/features/partners/hooks/usePartners';
import { useCreateFarm } from '@/features/partners/hooks/useCreateFarm';
import { FarmFormValues } from './PartnerSchema';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import PartnerFilterBar from './PartnerFilterBar';
import PartnerSelectionBanner from './PartnerSelectionBanner';
import PartnerGroupCard from './PartnerGroupCard';
import PartnerFlatTable from './PartnerFlatTable';
import AddFarmDialog from './AddFarmDialog';
import PartnerRolesDialog, { PartnerRolesTarget } from './PartnerRolesDialog';
import EditPartnerDialog from './EditPartnerDialog';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { usePartnerListFilters } from './usePartnerListFilters';
import { downloadPartnersCsv } from './partnersCsv';

/**
 * PartnersTable Component
 * Canonical Container Orchestrator adhering to SRP and Clean Architecture (< 200 lines).
 * Follows the ExternalBatchAssignment pattern: provides hierarchy (Clientes y proveedores → Establecimientos)
 * and flat table modes with zero nested accordion clutter.
 */
export function PartnersTable() {
	const navigate = useNavigate();
	const { data: partners = [], isLoading, isError } = usePartners();
	const { mutate: createFarm } = useCreateFarm();
	const { enqueueSnackbar } = useSnackbar();

	// View & Filter States
	const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');
	const filters = usePartnerListFilters(partners);
	const { searchTerm, selectedStatus, selectedGroup, filteredPartners } = filters;
	const [selectedPartnerIds, setSelectedPartnerIds] = useState<number[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	// Dialog States
	const [isAddFarmDialogOpen, setIsAddFarmDialogOpen] = useState(false);
	const [activePartnerId, setActivePartnerId] = useState<number | undefined>();
	const [rolesTarget, setRolesTarget] = useState<PartnerRolesTarget | null>(null);
	// By id: the dialog shows the partner from the refreshed list, so contact changes appear at once.
	const [editTargetId, setEditTargetId] = useState<number | null>(null);
	const editTarget = partners.find((p) => p.id === editTargetId) ?? null;

	// Reset pagination on filter change
	useEffect(() => {
		setPage(0);
	}, [searchTerm, selectedStatus, selectedGroup]);

	const allEligibleIds = useMemo(() => filteredPartners.map((s: any) => s.id), [filteredPartners]);

	const totalFarmsCount = useMemo(() => {
		return filteredPartners.reduce((acc: number, s: any) => acc + (s.farms?.length || 0), 0);
	}, [filteredPartners]);

	// Selection handlers
	const handleTogglePartner = useCallback((id: number) => {
		setSelectedPartnerIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
	}, []);

	const handleToggleAllPage = useCallback((pageIds: number[]) => {
		setSelectedPartnerIds((prev) => {
			const areAllPresent = pageIds.length > 0 && pageIds.every((id) => prev.includes(id));
			if (areAllPresent) {
				return prev.filter((id) => !pageIds.includes(id));
			}
			return Array.from(new Set([...prev, ...pageIds]));
		});
	}, []);

	const handleToggleSelectAll = useCallback(() => {
		if (selectedPartnerIds.length === allEligibleIds.length && allEligibleIds.length > 0) {
			setSelectedPartnerIds([]);
		} else {
			setSelectedPartnerIds(allEligibleIds);
		}
	}, [selectedPartnerIds, allEligibleIds]);

	// Action triggers
	const handleOpenAddFarm = useCallback((partnerId: number) => {
		setActivePartnerId(partnerId);
		setIsAddFarmDialogOpen(true);
	}, []);

	const handleAddFarm = useCallback(
		(farmData: FarmFormValues) => {
			if (!activePartnerId) return;

			createFarm(
				{ ...farmData, provider_id: activePartnerId },
				{
					onSuccess: () => {
						enqueueSnackbar('Establecimiento añadido correctamente', { variant: 'success' });
					},
					onError: (error: any) => {
						const msg = error.response?.data?.message || 'Error al añadir el establecimiento';
						enqueueSnackbar(msg, { variant: 'error' });
					}
				}
			);
		},
		[activePartnerId, createFarm, enqueueSnackbar]
	);

	const handleViewDetails = useCallback(
		(partnerId: number) => {
			navigate(`/batches/external-assignment?supplierId=${partnerId}`);
		},
		[navigate]
	);

	const handleExport = useCallback(() => {
		const targetIds = selectedPartnerIds.length > 0 ? selectedPartnerIds : allEligibleIds;
		if (targetIds.length === 0) return;

		downloadPartnersCsv(partners.filter((s) => targetIds.includes(s.id)));
	}, [selectedPartnerIds, allEligibleIds, partners]);

	if (isLoading) {
		return (
			<Box className="flex items-center justify-center p-32">
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box className="p-32 text-center text-error border border-error rounded-8 bg-error-50 overflow-hidden">
				<Typography variant="h6">Error al cargar los clientes y proveedores</Typography>
				<Typography variant="body2">Por favor, intente nuevamente más tarde.</Typography>
			</Box>
		);
	}

	return (
		<Box className="w-full">
			{/* Canonical Filter Toolbar */}
			<PartnerFilterBar
				searchTerm={searchTerm}
				onSearchChange={filters.setSearchTerm}
				selectedGroup={selectedGroup}
				onGroupChange={filters.setSelectedGroup}
				groupCounts={filters.groupCounts}
				selectedStatus={selectedStatus}
				onStatusChange={filters.setSelectedStatus}
				totalPartnersCount={filteredPartners.length}
				totalFarmsCount={totalFarmsCount}
				viewMode={viewMode}
				onToggleViewMode={() => setViewMode((prev) => (prev === 'flat' ? 'hierarchy' : 'flat'))}
				isAllSelected={selectedPartnerIds.length === allEligibleIds.length && allEligibleIds.length > 0}
				onToggleSelectAll={handleToggleSelectAll}
				hasPartners={allEligibleIds.length > 0}
				onExport={handleExport}
			/>

			{/* Canonical Selection Banner */}
			<PartnerSelectionBanner
				selectedCount={selectedPartnerIds.length}
				onExportSelected={handleExport}
				onClearSelection={() => setSelectedPartnerIds([])}
			/>

			{/* Views */}
			{viewMode === 'hierarchy' ? (
				filteredPartners.length === 0 ? (
					<Paper sx={{ p: 5, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No se encontraron clientes ni proveedores con los filtros actuales.
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Prueba ajustando los criterios de búsqueda o el estado.
						</Typography>
					</Paper>
				) : (
					<Stack spacing={0}>
						{filteredPartners.map((partner: any) => (
							<PartnerGroupCard
								key={partner.id}
								partner={partner}
								isSelected={selectedPartnerIds.includes(partner.id)}
								onToggleSelect={handleTogglePartner}
								onAddFarm={handleOpenAddFarm}
								onViewDetails={handleViewDetails}
								onEdit={(p: Partner) => setEditTargetId(p.id)}
							/>
						))}
					</Stack>
				)
			) : (
				<PartnerFlatTable
					partners={filteredPartners}
					selectedPartnerIds={selectedPartnerIds}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={setPage}
					onRowsPerPageChange={setRowsPerPage}
					onTogglePartner={handleTogglePartner}
					onToggleAllPage={handleToggleAllPage}
					onAddFarm={handleOpenAddFarm}
					onViewDetails={handleViewDetails}
					onEditRoles={setRolesTarget}
					onEdit={(p: Partner) => setEditTargetId(p.id)}
				/>
			)}

			{/* Dialog to Add Farm */}
			<AddFarmDialog
				open={isAddFarmDialogOpen}
				onClose={() => setIsAddFarmDialogOpen(false)}
				onAdd={handleAddFarm}
			/>

			<PartnerRolesDialog partner={rolesTarget} onClose={() => setRolesTarget(null)} />
			<EditPartnerDialog partner={editTarget} onClose={() => setEditTargetId(null)} />
		</Box>
	);
}

export default PartnersTable;
