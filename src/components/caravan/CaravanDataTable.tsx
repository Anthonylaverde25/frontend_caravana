import React, { useState, useMemo, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
	Box,
	CircularProgress,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Stack,
	alpha,
	useTheme,
	Menu,
	MenuItem,
	IconButton,
	Tooltip,
	Typography,
	Chip
} from '@mui/material';
import DataTable from 'src/components/data-table/DataTable';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { getCaravanColumns } from './columns/CaravanColumns';
import { CaravanWeightDialog } from './CaravanWeightDialog';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useUpsertCaravan } from '@/features/caravans/hooks/useUpsertCaravan';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { useQueryClient } from '@tanstack/react-query';
import BatchDetailDrawer from './BatchDetailDrawer';

export interface CaravanDataTableRef {
	openAddDialog: () => void;
	refresh: () => void;
}

type ActionMode = 'create' | 'edit' | 'view';

interface CaravanDataTableProps {
	onBulkWeightEntry?: (batchId: number) => void;
	onWeightSheet?: (batchId: number | number[]) => void;
}

const CaravanDataTable = forwardRef<CaravanDataTableRef, CaravanDataTableProps>((props, ref) => {
	const theme = useTheme();
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();
	const { getCategoryOptions, getSubcategoryOptions, getCategoryById } = useAnimalCategories();

	// Spreadsheet/industrial palette (mismo patrón que ExternalBatchAssignmentView)
	const isDark = theme.palette.mode === 'dark';
	const headerBg = isDark ? '#1e293b' : '#f8fafc';
	const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';
	const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
	const bodyBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9';
	const active = isDark ? '#60a5fa' : '#0a6ed1';

	const headerCellStyle = {
		py: 1.5,
		px: 1.5,
		fontSize: '0.7rem',
		fontWeight: 700,
		textTransform: 'uppercase' as const,
		color: isDark ? '#94a3b8' : '#475569',
		borderBottom: '1px solid',
		borderRight: '1px solid',
		borderColor: headerBorder,
		whiteSpace: 'nowrap' as const,
		letterSpacing: '0.04em',
		bgcolor: headerBg,
		'& .Mui-TableHeadCell-Content-Labels': {
			flex: 1,
			justifyContent: 'space-between'
		},
		'& .Mui-TableHeadCell-Content-Actions': {
			'& > button': {
				marginX: '2px'
			}
		}
	};

	const bodyCellStyle = {
		px: 1.5,
		py: 1.2,
		borderRight: '1px solid',
		borderBottom: '1px solid',
		borderColor: bodyBorder
	};

	// Data Fetching: Batches & Own Caravans
	const { data: batches = [] } = useBatches();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'own');
	const upsertMutation = useUpsertCaravan();

	const [openDialog, setOpenDialog] = useState(false);
	const [actionMode, setActionMode] = useState<ActionMode>('create');

	const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
	const openExportMenu = Boolean(exportAnchorEl);

	const [bulkMenuAnchorEl, setBulkMenuAnchorEl] = useState<null | HTMLElement>(null);
	const openBulkMenu = Boolean(bulkMenuAnchorEl);

	const [batchMenuAnchorEl, setBatchMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedBatch, setSelectedBatch] = useState<any>(null);
	const openBatchMenu = Boolean(batchMenuAnchorEl);

	const [batchDetailOpen, setBatchDetailOpen] = useState(false);
	const [batchDetailData, setBatchDetailData] = useState<any>(null);

	const handleOpenBatchDetail = useCallback((batch: any) => {
		setBatchDetailData(batch);
		setBatchDetailOpen(true);
	}, []);

	const handleOpenBatchMenu = (event: React.MouseEvent<HTMLElement>, batch: any) => {
		setBatchMenuAnchorEl(event.currentTarget);
		setSelectedBatch(batch);
	};

	const handleCloseBatchMenu = () => {
		setBatchMenuAnchorEl(null);
		setSelectedBatch(null);
	};
	const [formData, setFormData] = useState<{
		id: number;
		identification: string;
		category: string;
		category_id: number | '';
		subcategory_id: number | '';
		breed: string;
		sex: 'M' | 'H';
		teeth: number;
		entry_weight: string;
		entry_date: string;
		batch_id: number;
		farm_id: number;
		is_empty: boolean;
	}>({
		id: 0,
		identification: '',
		category: '',
		category_id: '',
		subcategory_id: '',
		breed: '',
		sex: 'M',
		teeth: 0,
		entry_weight: '',
		entry_date: new Date().toISOString().split('T')[0],
		batch_id: 0,
		farm_id: 0,
		is_empty: true
	});

	// --- Transfer Flow State ---
	const [transferDialogOpen, setTransferDialogOpen] = useState(false);
	const [selectedCaravan, setSelectedCaravan] = useState<any>(null);
	const [targetCompanyId, setTargetCompanyId] = useState<number | string>('');
	const [weightDialogOpen, setWeightDialogOpen] = useState(false);
	const [caravanForWeight, setCaravanForWeight] = useState<any>(null);

	const handleOpenWeight = (caravan: any) => {
		setCaravanForWeight(caravan);
		setWeightDialogOpen(true);
	};

	const { companies } = useCompany();
	const availableCompanies = companies.filter((c) => c.id !== activeCompanyId);

	const handleOpenTransfer = (caravans: any | any[]) => {
		const data = Array.isArray(caravans) ? caravans : [caravans];
		setSelectedCaravan(data);
		setTransferDialogOpen(true);
	};

	const handleCloseTransfer = () => {
		setTransferDialogOpen(false);
		setSelectedCaravan(null);
		setTargetCompanyId('');
	};

	const handleConfirmTransfer = () => {
		const count = Array.isArray(selectedCaravan) ? selectedCaravan.length : 1;
		const ids = Array.isArray(selectedCaravan)
			? selectedCaravan.map((c) => c.identification).join(', ')
			: selectedCaravan?.identification;

		console.log(`Iniciando transferencia masiva (${count} animales): ${ids} a empresa ID: ${targetCompanyId}`);
		handleCloseTransfer();
	};

	useImperativeHandle(ref, () => ({
		openAddDialog: () => {
			setActionMode('create');
			setOpenDialog(true);
		},
		refresh: () => queryClient.invalidateQueries({ queryKey: ['caravans'] })
	}));

	const handleExportTxt = (selectedRows: any[] = []) => {
		const dataToExport = selectedRows.length > 0 ? selectedRows : caravans;

		if (dataToExport.length === 0) return;

		let content = '';
		dataToExport.forEach((c) => {
			content += `${c.identification || '-'}-${c.sex || '-'}-${c.breed || '-'}-${c.entry_date || '-'};\r\n`;
		});

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		const fileName = selectedRows.length > 0 ? 'seleccion_caravanas' : 'todas_las_caravanas';
		link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.txt`;
		link.click();
		URL.revokeObjectURL(url);
	};

	// Filter own batches only (batches that belong to own farms)
	const ownBatches = useMemo(() => {
		return batches.filter((b) => b.provider_id === null || b.provider_id === undefined);
	}, [batches]);

	const handleOpenDialog = (mode: ActionMode, rowData?: any, defaultBatchId?: number) => {
		setActionMode(mode);

		if (rowData) {
			setFormData({
				id: rowData.id,
				identification: rowData.identification,
				category: rowData.category || '',
				category_id: rowData.category_id || '',
				subcategory_id: rowData.subcategory_id || '',
				breed: rowData.breed || '',
				teeth: rowData.teeth,
				entry_weight: rowData.entry_weight?.toString() || '',
				sex: rowData.sex || 'M',
				entry_date: rowData.entry_date || '',
				batch_id: rowData.batch_id || 0,
				farm_id: rowData.farm_id || 0,
				is_empty: rowData.female_details?.is_empty ?? true
			});
		} else {
			setFormData({
				id: 0,
				identification: '',
				category: '',
				category_id: '',
				subcategory_id: '',
				breed: '',
				teeth: 0,
				entry_weight: '',
				sex: 'M',
				entry_date: new Date().toISOString().split('T')[0],
				batch_id: defaultBatchId || ownBatches[0]?.id || 0,
				farm_id: 0,
				is_empty: true
			});
		}

		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setFormData({
			id: 0,
			identification: '',
			category: '',
			category_id: '',
			subcategory_id: '',
			breed: '',
			teeth: 0,
			entry_weight: '',
			sex: 'M',
			entry_date: new Date().toISOString().split('T')[0],
			batch_id: 0,
			farm_id: 0,
			is_empty: true
		});
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updated = { ...prev, [name]: value };

			if (name === 'category_id') {
				const catIdNum = Number(value);
				const catObj = getCategoryById(catIdNum);
				if (catObj) {
					updated.category = catObj.code.toLowerCase();
					updated.subcategory_id = '';
					if (catObj.sex === 'M') {
						updated.sex = 'M';
						updated.is_empty = true;
					} else if (catObj.sex === 'H') {
						updated.sex = 'H';
						if (!catObj.is_reproductive) {
							updated.is_empty = true;
						}
					}
				}
			}

			// Auto-set is_empty to true for young females
			const cat = (updated.category || '').toLowerCase();

			if (
				updated.sex === 'H' &&
				(cat === 'vaquillona' || cat === 'ternera' || cat === 'vaca vacia' || cat === 'vaca_vacia')
			) {
				updated.is_empty = true;
			}

			return updated;
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (actionMode === 'view') return;

		const payload = {
			...formData,
			category_id: formData.category_id ? Number(formData.category_id) : undefined,
			subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : undefined,
			entry_weight: formData.entry_weight ? parseFloat(formData.entry_weight) : null,
			teeth: Number(formData.teeth),
			batch_id: formData.batch_id ? Number(formData.batch_id) : undefined
		};

		upsertMutation.mutate(payload, {
			onSuccess: () => {
				handleCloseDialog();
			}
		});
	};

	// ─── Data Transformation: List All Own Batches & Populate with Operational Caravans ───
	const groupedBatches = useMemo(() => {
		const batchesMap: Record<number, any> = {};

		// 1. Initialize with all own batches so every own lot is visible
		ownBatches.forEach((b) => {
			batchesMap[b.id] = {
				...b,
				id: b.id,
				name: b.name,
				farm_name: b.farm_name,
				caravans: []
			};
		});

		// 2. Add caravans into their own batches
		caravans.forEach((caravan) => {
			const bId = caravan.batch_id || 0;

			if (!batchesMap[bId]) {
				batchesMap[bId] = {
					id: bId,
					name: caravan.batch_name || 'SIN LOTE ASIGNADO',
					farm_name: caravan.farm_name || null,
					caravans: []
				};
			}

			batchesMap[bId].caravans.push(caravan);
		});

		return Object.values(batchesMap);
	}, [ownBatches, caravans]);

	// ─── Columns for the Batch Rows (Top Level) ───
	const batchColumns = useMemo(
		() => [
			{
				accessorKey: 'name',
				header: 'Lote / Grupo Propio',
				size: 340,
				Cell: ({ cell, row }: any) => {
					const batch = row.original;

					return (
						<Box
							sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
							onClick={() => handleOpenBatchDetail(batch)}
						>
							<Typography
								variant="body2"
								sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary', lineHeight: 1.2 }}
							>
								{(cell.getValue() as string) || ''}
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: 'text.secondary', fontSize: '0.68rem', fontWeight: 500, display: 'block' }}
							>
								{batch.farm_name ? `Establecimiento: ${batch.farm_name} • ` : ''}
								<Box
									component="span"
									sx={{ color: active, fontWeight: 700 }}
								>
									{batch.caravans.length} {batch.caravans.length === 1 ? 'Animal' : 'Animales'}
								</Box>
							</Typography>
						</Box>
					);
				}
			},
			{
				header: 'Categoría Predominante',
				size: 190,
				accessorFn: (row: any) => row.caravans[0]?.category || '-',
				Cell: ({ cell }: any) => (
					<Typography
						variant="body2"
						sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
					>
						{(cell.getValue() as string) || '-'}
					</Typography>
				)
			},
			{
				header: 'Peso Promedio',
				size: 150,
				accessorFn: (row: any) => {
					const weights = row.caravans.filter((c: any) => c.current_weight).map((c: any) => c.current_weight);

					if (weights.length === 0) return 0;

					return weights.reduce((a: number, b: number) => a + b, 0) / weights.length;
				},
				Cell: ({ cell }: any) => {
					const val = Number(cell.getValue()) || 0;
					return (
						<Typography
							variant="body2"
							sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'success.main' }}
						>
							{val > 0 ? `${Math.round(val)} kg` : '-'}
						</Typography>
					);
				}
			},
			{
				header: 'Rango de Peso',
				size: 150,
				accessorFn: (row: any) => {
					const min = row.min_weight;
					const max = row.max_weight;
					const hasMin = min !== null && min !== undefined;
					const hasMax = max !== null && max !== undefined;

					if (!hasMin && !hasMax) return '';

					if (hasMin && hasMax) return `${min}–${max} kg`;

					return hasMin ? `mín ${min} kg` : `máx ${max} kg`;
				},
				Cell: ({ cell }: any) => {
					const val = cell.getValue() as string;
					return (
						<Typography
							variant="body2"
							sx={{
								fontWeight: 600,
								fontSize: '0.78rem',
								color: val ? 'text.secondary' : 'text.disabled'
							}}
						>
							{val || '-'}
						</Typography>
					);
				}
			},
			{
				header: 'Sabe Comer',
				size: 120,
				accessorFn: (row: any) =>
					row.knows_to_eat !== undefined && row.knows_to_eat !== null ? Boolean(row.knows_to_eat) : null,
				Cell: ({ cell }: any) => {
					const val = cell.getValue() as boolean | null;

					if (val === null) {
						return (
							<Typography
								variant="body2"
								sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.disabled' }}
							>
								-
							</Typography>
						);
					}

					return (
						<Chip
							label={val ? 'Sí' : 'No'}
							size="small"
							color={val ? 'success' : 'default'}
							variant="outlined"
							sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
						/>
					);
				}
			},
			{
				header: 'Edad (Meses)',
				size: 130,
				accessorFn: (row: any) =>
					row.age_in_months !== null && row.age_in_months !== undefined ? Number(row.age_in_months) : null,
				Cell: ({ cell }: any) => {
					const val = cell.getValue() as number | null;
					return (
						<Typography
							variant="body2"
							sx={{
								fontWeight: 600,
								fontSize: '0.78rem',
								color: val !== null ? 'text.primary' : 'text.disabled'
							}}
						>
							{val !== null ? `${val} meses` : '-'}
						</Typography>
					);
				}
			}
		],
		[theme, handleOpenBatchDetail]
	);

	// ─── Columns for the Caravans (Detail Level) ───
	const caravanColumns = useMemo(() => getCaravanColumns().filter((col) => col.accessorKey !== 'batch_name'), []);

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box className="w-full">
			<DataTable
				columns={batchColumns}
				data={groupedBatches}
				enableRowSelection={true}
				enableColumnOrdering={true}
				enableGlobalFilter={true}
				enableRowActions={true}
				enableExpanding={true}
				positionActionsColumn="last"
				renderDetailPanel={({ row }) => (
					<Box
						sx={{
							display: 'grid',
							width: '100%',
							px: 1,
							py: 3,
							bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
							borderTop: '1px solid',
							borderBottom: '1px solid',
							borderColor: 'divider'
						}}
					>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography
								variant="overline"
								sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}
							>
								Detalle de Animales en {row.original.name} ({row.original.caravans.length})
							</Typography>
							<Button
								size="small"
								variant="text"
								startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>}
								onClick={() => handleOpenDialog('create', undefined, row.original.id)}
								sx={{ textTransform: 'none', fontWeight: 700 }}
							>
								Añadir Caravana
							</Button>
						</Box>

						<DataTable
							columns={caravanColumns}
							data={row.original.caravans}
							enableTopToolbar={false}
							enableBottomToolbar={false}
							enableRowActions={true}
							renderRowActions={({ row: caravanRow }) => (
								<Box sx={{ display: 'flex', gap: 0.5 }}>
									<IconButton
										size="small"
										onClick={() => handleOpenDialog('view', caravanRow.original)}
									>
										<FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
									</IconButton>
									<IconButton
										size="small"
										onClick={() => handleOpenDialog('edit', caravanRow.original)}
									>
										<FuseSvgIcon size={16}>heroicons-outline:pencil-alt</FuseSvgIcon>
									</IconButton>
									<IconButton
										size="small"
										color="success"
										onClick={() => handleOpenWeight(caravanRow.original)}
									>
										<FuseSvgIcon size={16}>heroicons-outline:scale</FuseSvgIcon>
									</IconButton>
									<IconButton
										size="small"
										color="primary"
										onClick={() => handleOpenTransfer(caravanRow.original)}
									>
										<FuseSvgIcon size={16}>heroicons-outline:arrows-right-left</FuseSvgIcon>
									</IconButton>
								</Box>
							)}
							muiTableProps={{
								sx: {
									width: '100%',
									bgcolor: 'background.paper',
									border: '1px solid',
									borderColor: 'divider',
									'& .MuiTableHead-root': {
										bgcolor: 'action.hover'
									}
								}
							}}
							muiTableHeadCellProps={{
								sx: {
									borderRight: '1px solid',
									borderBottom: '2px solid',
									borderColor: 'divider',
									fontWeight: 800,
									fontSize: '0.75rem',
									textTransform: 'uppercase',
									bgcolor: 'action.hover'
								}
							}}
							muiTableBodyCellProps={{
								sx: {
									borderRight: '1px solid',
									borderBottom: '1px solid',
									borderColor: 'divider',
									p: '6px 12px'
								}
							}}
							initialState={{
								density: 'compact',
								columnVisibility: { id: false }
							}}
						/>
					</Box>
				)}
				renderRowActions={({ row }) => (
					<Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
						<Tooltip title="Carga Masiva de Pesajes">
							<IconButton
								size="small"
								color="success"
								onClick={() => props.onBulkWeightEntry?.(row.original.id)}
							>
								<FuseSvgIcon size={18}>heroicons-outline:scale</FuseSvgIcon>
							</IconButton>
						</Tooltip>
						<Tooltip title="Gestionar Lote">
							<IconButton
								size="small"
								color="primary"
							>
								<FuseSvgIcon size={18}>heroicons-outline:folder-open</FuseSvgIcon>
							</IconButton>
						</Tooltip>
						<Tooltip title="Más opciones">
							<IconButton
								size="small"
								onClick={(e) => handleOpenBatchMenu(e, row.original)}
							>
								<FuseSvgIcon size={18}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
							</IconButton>
						</Tooltip>
					</Box>
				)}
				renderTopToolbarCustomActions={({ table }) => (
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
						sx={{ ml: 1 }}
					>
						<Button
							size="small"
							color="inherit"
							sx={{
								fontWeight: 600,
								textTransform: 'none',
								borderRadius: '8px',
								px: 2,
								bgcolor: (theme) => alpha(theme.palette.action.active, 0.05),
								'&:hover': { bgcolor: (theme) => alpha(theme.palette.action.active, 0.1) }
							}}
							startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-text</FuseSvgIcon>}
							onClick={() => handleExportTxt()}
						>
							Exportar Inventario
						</Button>

						{table.getSelectedRowModel().rows.length > 0 && (
							<>
								<IconButton
									size="small"
									onClick={(e) => setBulkMenuAnchorEl(e.currentTarget)}
									sx={{
										bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
										color: 'primary.main',
										borderRadius: '8px',
										ml: 1
									}}
								>
									<FuseSvgIcon size={18}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
								</IconButton>
								<Menu
									anchorEl={bulkMenuAnchorEl}
									open={openBulkMenu}
									onClose={() => setBulkMenuAnchorEl(null)}
									transformOrigin={{ horizontal: 'right', vertical: 'top' }}
									anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
								>
									<MenuItem
										onClick={() => {
											const selectedIds = table
												.getSelectedRowModel()
												.rows.map((r: any) => r.original.id);
											props.onWeightSheet?.(selectedIds);
											setBulkMenuAnchorEl(null);
											table.resetRowSelection();
										}}
									>
										<FuseSvgIcon
											size={20}
											className="mr-3"
											color="action"
										>
											heroicons-outline:document-text
										</FuseSvgIcon>
										<Typography
											variant="body2"
											sx={{ fontWeight: 500 }}
										>
											Planillas de Control (Seleccionados)
										</Typography>
									</MenuItem>
								</Menu>
							</>
						)}

						<Menu
							anchorEl={exportAnchorEl}
							open={openExportMenu}
							onClose={() => setExportAnchorEl(null)}
							transformOrigin={{ horizontal: 'right', vertical: 'top' }}
							anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
						>
							<MenuItem
								onClick={() => {
									console.log('Export CSV');
									setExportAnchorEl(null);
								}}
							>
								<FuseSvgIcon
									size={20}
									className="mr-3"
									color="action"
								>
									heroicons-outline:table
								</FuseSvgIcon>
								<Typography
									variant="body2"
									sx={{ fontWeight: 500 }}
								>
									Exportar CSV
								</Typography>
							</MenuItem>
						</Menu>

						<Menu
							anchorEl={batchMenuAnchorEl}
							open={openBatchMenu}
							onClose={handleCloseBatchMenu}
							transformOrigin={{ horizontal: 'right', vertical: 'top' }}
							anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
						>
							<MenuItem
								onClick={() => {
									props.onWeightSheet?.(selectedBatch.id);
									handleCloseBatchMenu();
								}}
							>
								<FuseSvgIcon
									size={20}
									className="mr-3"
									color="action"
								>
									heroicons-outline:document-text
								</FuseSvgIcon>
								<Typography
									variant="body2"
									sx={{ fontWeight: 500 }}
								>
									Planilla de Control de Peso
								</Typography>
							</MenuItem>
							<MenuItem
								onClick={() => {
									console.log('Other batch action');
									handleCloseBatchMenu();
								}}
							>
								<FuseSvgIcon
									size={20}
									className="mr-3"
									color="action"
								>
									heroicons-outline:printer
								</FuseSvgIcon>
								<Typography
									variant="body2"
									sx={{ fontWeight: 500 }}
								>
									Imprimir Etiquetas
								</Typography>
							</MenuItem>
						</Menu>
					</Stack>
				)}
				muiTableProps={{
					sx: {
						width: '100%',
						border: '1px solid',
						borderColor: headerBorder
					}
				}}
				muiTableHeadCellProps={{ sx: headerCellStyle }}
				muiTableBodyCellProps={{ sx: bodyCellStyle }}
				muiTableBodyRowProps={{
					sx: {
						'&:nth-of-type(odd)': { bgcolor: zebraBg },
						'&:hover': { bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : alpha(active, 0.04) }
					}
				}}
				initialState={{
					density: 'compact',
					showGlobalFilter: true,
					pagination: { pageSize: 15, pageIndex: 0 }
				}}
			/>

			{/* Reusable Dialog for Create/Edit/View */}
			<Dialog
				open={openDialog}
				onClose={handleCloseDialog}
				maxWidth="sm"
				fullWidth
				scroll="paper"
				PaperProps={{ sx: { borderRadius: '16px' } }}
			>
				<form onSubmit={handleSubmit}>
					<DialogTitle sx={{ p: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<FuseSvgIcon
							color="primary"
							size={24}
						>
							{actionMode === 'create'
								? 'heroicons-outline:plus-circle'
								: actionMode === 'edit'
									? 'heroicons-outline:pencil-alt'
									: 'heroicons-outline:information-circle'}
						</FuseSvgIcon>
						{actionMode === 'create'
							? 'Insertar Nueva Caravana'
							: actionMode === 'edit'
								? 'Editar Caravana'
								: 'Detalles de la Caravana'}
					</DialogTitle>
					<DialogContent
						dividers
						sx={{ p: 3 }}
					>
						<Box className="grid grid-cols-1 gap-16 sm:grid-cols-2">
							<Box>
								<TextField
									name="identification"
									label="Identificación"
									required
									fullWidth
									disabled={actionMode === 'view'}
									value={formData.identification}
									onChange={handleChange}
								/>
							</Box>
							<Box>
								<TextField
									name="category_id"
									label="Categoría"
									select
									required
									fullWidth
									disabled={actionMode === 'view'}
									value={formData.category_id || ''}
									onChange={handleChange}
								>
									<MenuItem value="">
										<em>Seleccionar Categoría</em>
									</MenuItem>
									{getCategoryOptions().map((opt) => (
										<MenuItem key={opt.value} value={opt.value}>
											{opt.label} ({opt.sex === 'BOTH' ? 'M/H' : opt.sex === 'M' ? 'Macho' : 'Hembra'})
										</MenuItem>
									))}
								</TextField>
							</Box>
							<Box>
								<TextField
									name="subcategory_id"
									label="Subcategoría"
									select
									fullWidth
									disabled={actionMode === 'view' || !formData.category_id || getSubcategoryOptions(Number(formData.category_id)).length === 0}
									value={formData.subcategory_id || ''}
									onChange={handleChange}
									helperText={
										formData.category_id && getSubcategoryOptions(Number(formData.category_id)).length === 0
											? 'Sin subcategorías obligatorias'
											: undefined
									}
								>
									<MenuItem value="">
										<em>Ninguna / Rodeo General</em>
									</MenuItem>
									{getSubcategoryOptions(Number(formData.category_id)).map((opt) => (
										<MenuItem key={opt.value} value={opt.value}>
											{opt.label}
										</MenuItem>
									))}
								</TextField>
							</Box>
							<Box>
								<TextField
									name="breed"
									label="Raza"
									fullWidth
									disabled={actionMode === 'view'}
									value={formData.breed}
									onChange={handleChange}
								/>
							</Box>
							<Box>
								<TextField
									name="sex"
									label="Sexo"
									select
									fullWidth
									disabled={
										actionMode === 'view' ||
										(Boolean(formData.category_id) &&
											getCategoryById(Number(formData.category_id))?.sex !== 'BOTH')
									}
									value={formData.sex}
									onChange={handleChange}
								>
									<MenuItem value="M">Macho</MenuItem>
									<MenuItem value="H">Hembra</MenuItem>
								</TextField>
							</Box>
							{formData.sex === 'H' ? (
								<Box>
									<TextField
										name="is_empty"
										label="Estado Reproductivo"
										select
										fullWidth
										disabled={
											actionMode === 'view' ||
											(Boolean(formData.category_id) &&
												!getCategoryById(Number(formData.category_id))?.is_reproductive)
										}
										value={formData.is_empty.toString()}
										onChange={(e) =>
											setFormData((p) => ({ ...p, is_empty: e.target.value === 'true' }))
										}
									>
										<MenuItem value="true">Vacía</MenuItem>
										<MenuItem value="false">Preñada</MenuItem>
									</TextField>
								</Box>
							) : (
								<Box>
									<TextField
										label="Estado Reproductivo"
										fullWidth
										disabled
										value="No Aplica"
									/>
								</Box>
							)}
							<Box className="sm:col-span-2">
								<TextField
									name="batch_id"
									label="Lote Propio Asignado"
									select
									fullWidth
									disabled={actionMode === 'view'}
									value={formData.batch_id || ''}
									onChange={handleChange}
									helperText="Solo se listan los lotes operativos propios de tus fincas"
								>
									{ownBatches.map((b) => (
										<MenuItem
											key={b.id}
											value={b.id}
										>
											{b.name} ({b.farm_name || 'Finca Propia'})
										</MenuItem>
									))}
								</TextField>
							</Box>
							<Box className="grid grid-cols-1 gap-16 sm:col-span-2 sm:grid-cols-3">
								<Box>
									<TextField
										name="teeth"
										label="Dientes"
										type="number"
										fullWidth
										disabled={actionMode === 'view'}
										value={formData.teeth}
										onChange={handleChange}
									/>
								</Box>
								<Box>
									<TextField
										name="entry_weight"
										label="Peso (Kg)"
										type="number"
										fullWidth
										disabled={actionMode === 'view'}
										value={formData.entry_weight}
										onChange={handleChange}
									/>
								</Box>
								<Box>
									<TextField
										name="entry_date"
										label="Fecha"
										type="date"
										fullWidth
										disabled={actionMode === 'view'}
										value={formData.entry_date}
										onChange={handleChange}
										InputLabelProps={{ shrink: true }}
									/>
								</Box>
							</Box>
						</Box>
					</DialogContent>
					<DialogActions sx={{ p: 3 }}>
						<Button
							onClick={handleCloseDialog}
							color="inherit"
							sx={{ fontWeight: 600 }}
						>
							{actionMode === 'view' ? 'Cerrar' : 'Cancelar'}
						</Button>
						{actionMode !== 'view' && (
							<Button
								type="submit"
								variant="contained"
								color="primary"
								disabled={upsertMutation.isPending}
								sx={{
									px: 4,
									fontWeight: 700
								}}
								startIcon={
									upsertMutation.isPending ? (
										<CircularProgress
											size={20}
											color="inherit"
										/>
									) : null
								}
							>
								{actionMode === 'create' ? 'Guardar Registro' : 'Actualizar Cambios'}
							</Button>
						)}
					</DialogActions>
				</form>
			</Dialog>

			{/* --- Transfer Dialog --- */}
			<Dialog
				open={transferDialogOpen}
				onClose={handleCloseTransfer}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
			>
				<DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
					<Box
						sx={{
							p: 1,
							bgcolor: alpha(theme.palette.primary.main, 0.1),
							borderRadius: '12px',
							display: 'flex'
						}}
					>
						<FuseSvgIcon
							color="primary"
							size={24}
						>
							heroicons-outline:arrows-right-left
						</FuseSvgIcon>
					</Box>
					Transferencia{' '}
					{Array.isArray(selectedCaravan) && selectedCaravan.length > 1
						? `Masiva de ${selectedCaravan.length} Animales`
						: 'de Animal'}
				</DialogTitle>
				<DialogContent>
					<Typography
						variant="body1"
						sx={{ mb: 2, fontWeight: 500 }}
					>
						{Array.isArray(selectedCaravan) && selectedCaravan.length > 1
							? `Estás por transferir un lote de ${selectedCaravan.length} animales.`
							: `Estás por transferir la caravana ${selectedCaravan?.[0]?.identification}.`}
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ mb: 3 }}
					>
						Esta acción registrará un movimiento de salida en la empresa actual y una entrada automática en
						la empresa destino para cada animal seleccionado.
					</Typography>

					<Box
						sx={{
							p: 2,
							bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
							borderRadius: '12px',
							mb: 3,
							border: 1,
							borderColor: 'divider'
						}}
					>
						<TextField
							select
							fullWidth
							label="Empresa Destino"
							value={targetCompanyId}
							onChange={(e) => setTargetCompanyId(e.target.value)}
							variant="outlined"
							helperText={
								availableCompanies.length === 0
									? 'No tienes otras empresas registradas'
									: 'Selecciona la empresa que recibirá los animales'
							}
						>
							{availableCompanies.map((company) => (
								<MenuItem
									key={company.id}
									value={company.id}
								>
									{company.name}
								</MenuItem>
							))}
						</TextField>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2.5, pt: 1.5 }}>
					<Button
						onClick={handleCloseTransfer}
						color="inherit"
						sx={{ fontWeight: 600, textTransform: 'none' }}
					>
						Cancelar
					</Button>
					<Button
						onClick={handleConfirmTransfer}
						variant="contained"
						color="primary"
						disabled={!targetCompanyId}
						sx={{
							fontWeight: 700,
							textTransform: 'none',
							px: 4,
							borderRadius: '8px',
							boxShadow: 'none',
							'&:hover': { boxShadow: 'none' }
						}}
					>
						Confirmar Transferencia
					</Button>
				</DialogActions>
			</Dialog>

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
