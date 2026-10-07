import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, CircularProgress, Stack, Paper, Typography } from '@mui/material';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useCreateFarm } from '@/features/suppliers/hooks/useCreateFarm';
import { FarmFormValues } from './SupplierSchema';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import SupplierFilterBar from './SupplierFilterBar';
import SupplierSelectionBanner from './SupplierSelectionBanner';
import SupplierGroupCard from './SupplierGroupCard';
import SupplierFlatTable from './SupplierFlatTable';
import AddFarmDialog from './AddFarmDialog';

/**
 * SuppliersTable Component
 * Canonical Container Orchestrator adhering to SRP and Clean Architecture (< 200 lines).
 * Follows the ExternalBatchAssignment pattern: provides hierarchy (Proveedores → Establecimientos)
 * and flat table modes with zero nested accordion clutter.
 */
export function SuppliersTable() {
	const navigate = useNavigate();
	const { data: suppliers = [], isLoading, isError } = useSuppliers();
	const { mutate: createFarm } = useCreateFarm();
	const { enqueueSnackbar } = useSnackbar();

	// View & Filter States
	const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
	const [selectedSupplierIds, setSelectedSupplierIds] = useState<number[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	// Dialog States
	const [isAddFarmDialogOpen, setIsAddFarmDialogOpen] = useState(false);
	const [activeSupplierId, setActiveSupplierId] = useState<number | undefined>();

	// Reset pagination on filter change
	useEffect(() => {
		setPage(0);
	}, [searchTerm, selectedStatus]);

	// Filtered suppliers matching search and status
	const filteredSuppliers = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();

		return suppliers.filter((s: any) => {
			if (selectedStatus === 'ACTIVE' && !s.is_active) return false;
			if (selectedStatus === 'INACTIVE' && s.is_active) return false;

			if (term !== '') {
				const nameMatch = s.name?.toLowerCase().includes(term);
				const commMatch = s.commercial_name?.toLowerCase().includes(term);
				const cuitMatch = s.cuit?.toLowerCase().includes(term);
				const farmMatch = (s.farms || []).some(
					(f: any) => f.name?.toLowerCase().includes(term) || f.renspa?.toLowerCase().includes(term)
				);

				if (!nameMatch && !commMatch && !cuitMatch && !farmMatch) return false;
			}

			return true;
		});
	}, [suppliers, searchTerm, selectedStatus]);

	const allEligibleIds = useMemo(() => filteredSuppliers.map((s: any) => s.id), [filteredSuppliers]);

	const totalFarmsCount = useMemo(() => {
		return filteredSuppliers.reduce((acc: number, s: any) => acc + (s.farms?.length || 0), 0);
	}, [filteredSuppliers]);

	// Selection handlers
	const handleToggleSupplier = useCallback((id: number) => {
		setSelectedSupplierIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
	}, []);

	const handleToggleAllPage = useCallback((pageIds: number[]) => {
		setSelectedSupplierIds((prev) => {
			const areAllPresent = pageIds.length > 0 && pageIds.every((id) => prev.includes(id));
			if (areAllPresent) {
				return prev.filter((id) => !pageIds.includes(id));
			}
			return Array.from(new Set([...prev, ...pageIds]));
		});
	}, []);

	const handleToggleSelectAll = useCallback(() => {
		if (selectedSupplierIds.length === allEligibleIds.length && allEligibleIds.length > 0) {
			setSelectedSupplierIds([]);
		} else {
			setSelectedSupplierIds(allEligibleIds);
		}
	}, [selectedSupplierIds, allEligibleIds]);

	// Action triggers
	const handleOpenAddFarm = useCallback((supplierId: number) => {
		setActiveSupplierId(supplierId);
		setIsAddFarmDialogOpen(true);
	}, []);

	const handleAddFarm = useCallback(
		(farmData: FarmFormValues) => {
			if (!activeSupplierId) return;

			createFarm(
				{ ...farmData, provider_id: activeSupplierId },
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
		[activeSupplierId, createFarm, enqueueSnackbar]
	);

	const handleViewDetails = useCallback(
		(supplierId: number) => {
			navigate(`/batches/external-assignment?supplierId=${supplierId}`);
		},
		[navigate]
	);

	const handleExport = useCallback(() => {
		const targetIds = selectedSupplierIds.length > 0 ? selectedSupplierIds : allEligibleIds;
		if (targetIds.length === 0) return;

		const targetSuppliers = suppliers.filter((s: any) => targetIds.includes(s.id));
		let content = 'Razón Social,Nombre Comercial,CUIT,Email,Teléfono,Granjas,Estado\r\n';
		targetSuppliers.forEach((s: any) => {
			content += `"${s.name || ''}","${s.commercial_name || ''}","${s.cuit || ''}","${s.email || ''}","${s.phone || ''}",${s.farms?.length || 0},"${s.is_active ? 'Activo' : 'Inactivo'}"\r\n`;
		});

		const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `proveedores_${new Date().toISOString().split('T')[0]}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}, [selectedSupplierIds, allEligibleIds, suppliers]);

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
				<Typography variant="h6">Error al cargar la lista de proveedores</Typography>
				<Typography variant="body2">Por favor, intente nuevamente más tarde.</Typography>
			</Box>
		);
	}

	return (
		<Box className="w-full">
			{/* Canonical Filter Toolbar */}
			<SupplierFilterBar
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				selectedStatus={selectedStatus}
				onStatusChange={setSelectedStatus}
				totalSuppliersCount={filteredSuppliers.length}
				totalFarmsCount={totalFarmsCount}
				viewMode={viewMode}
				onToggleViewMode={() => setViewMode((prev) => (prev === 'flat' ? 'hierarchy' : 'flat'))}
				isAllSelected={selectedSupplierIds.length === allEligibleIds.length && allEligibleIds.length > 0}
				onToggleSelectAll={handleToggleSelectAll}
				hasSuppliers={allEligibleIds.length > 0}
				onExport={handleExport}
			/>

			{/* Canonical Selection Banner */}
			<SupplierSelectionBanner
				selectedCount={selectedSupplierIds.length}
				onExportSelected={handleExport}
				onClearSelection={() => setSelectedSupplierIds([])}
			/>

			{/* Views */}
			{viewMode === 'hierarchy' ? (
				filteredSuppliers.length === 0 ? (
					<Paper sx={{ p: 5, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
						<Typography variant="h6" color="text.secondary" gutterBottom>
							No se encontraron proveedores con los filtros actuales.
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Prueba ajustando los criterios de búsqueda o el estado.
						</Typography>
					</Paper>
				) : (
					<Stack spacing={0}>
						{filteredSuppliers.map((supplier: any) => (
							<SupplierGroupCard
								key={supplier.id}
								supplier={supplier}
								isSelected={selectedSupplierIds.includes(supplier.id)}
								onToggleSelect={handleToggleSupplier}
								onAddFarm={handleOpenAddFarm}
								onViewDetails={handleViewDetails}
							/>
						))}
					</Stack>
				)
			) : (
				<SupplierFlatTable
					suppliers={filteredSuppliers}
					selectedSupplierIds={selectedSupplierIds}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={setPage}
					onRowsPerPageChange={setRowsPerPage}
					onToggleSupplier={handleToggleSupplier}
					onToggleAllPage={handleToggleAllPage}
					onAddFarm={handleOpenAddFarm}
					onViewDetails={handleViewDetails}
				/>
			)}

			{/* Dialog to Add Farm */}
			<AddFarmDialog
				open={isAddFarmDialogOpen}
				onClose={() => setIsAddFarmDialogOpen(false)}
				onAdd={handleAddFarm}
			/>
		</Box>
	);
}

export default SuppliersTable;
