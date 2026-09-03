import { useMemo, useState } from 'react';
import {
	Box,
	Typography,
	CircularProgress,
	IconButton,
	Paper,
	Stack,
	Chip,
	Tooltip,
	useTheme,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	alpha
} from '@mui/material';
import DataTable from '@/components/data-table/DataTable';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { getSupplierColumns } from '../../suppliers/components/SupplierColumns';
import AddCaravansDialog from './AddCaravansDialog';
import { useNavigate } from 'react-router';
import { BatchDetailsDialog } from './BatchDetailsDialog';

interface BatchesTableProps {
	filter?: 'own' | 'external' | 'all';
}

/**
 * BatchesTable Component
 * Displays the list of own batches and providers with their associated batches in a detail panel.
 */
export function BatchesTable({ filter = 'all' }: BatchesTableProps) {
	const navigate = useNavigate();
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const { data: suppliers = [], isLoading: isLoadingSuppliers, isError: isErrorSuppliers } = useSuppliers();
	const { data: batches = [], isLoading: isLoadingBatches } = useBatches();

	// Spreadsheet/industrial palette (mismo patrón que ExternalBatchAssignmentView)
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

	const [addCaravansDialogOpen, setAddCaravansDialogOpen] = useState(false);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [selectedBatch, setSelectedBatch] = useState<any>(null);

	const handleAddCaravans = (batch: any) => {
		setSelectedBatch(batch);
		setAddCaravansDialogOpen(true);
	};

	const handleViewDetails = (batch: any) => {
		setSelectedBatch(batch);
		setDetailsDialogOpen(true);
	};

	const columns = useMemo(() => getSupplierColumns(), []);

	// Filter own batches (without supplier)
	const ownBatches = useMemo(() => {
		return batches.filter((b) => b.provider_id === null || b.provider_id === undefined);
	}, [batches]);

	const isLoading = isLoadingSuppliers || isLoadingBatches;

	if (isLoading) {
		return (
			<Box className="flex items-center justify-center p-32">
				<CircularProgress />
			</Box>
		);
	}

	if (isErrorSuppliers) {
		return (
			<Box className="text-error border-error rounded-8 bg-error-50 overflow-hidden border p-32 text-center">
				<Typography variant="h6">Error al cargar el panel de lotes</Typography>
				<Typography variant="body2">Por favor, intente nuevamente más tarde.</Typography>
			</Box>
		);
	}

	return (
		<Box className="w-full">
			{/* Section for Own Batches (without supplier) */}
			{filter !== 'external' && ownBatches.length > 0 && (
				<Box
					sx={{
						p: 3,
						borderBottom: 1,
						borderColor: 'divider',
						bgcolor: isDark ? 'background.default' : '#fafafa'
					}}
				>
					<Typography
						variant="overline"
						sx={{
							color: 'primary.main',
							fontWeight: 800,
							mb: 2,
							display: 'block',
							letterSpacing: '0.75px',
							fontSize: '0.72rem'
						}}
					>
						Mis Lotes Propios ({ownBatches.length})
					</Typography>

					<Stack spacing={1.5}>
						{ownBatches.map((batch) => (
							<Paper
								key={batch.id}
								elevation={0}
								sx={{
									p: 2,
									px: 3,
									borderRadius: '6px',
									border: 1,
									borderColor: 'divider',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									bgcolor: 'background.paper'
								}}
							>
								<Stack
									direction="row"
									spacing={3}
									alignItems="center"
								>
									<Box>
										<Stack
											direction="row"
											spacing={1}
											alignItems="center"
											sx={{ mb: 0.5 }}
										>
											<Typography
												variant="subtitle2"
												sx={{ fontWeight: 800, color: 'text.primary' }}
											>
												{batch.name}
											</Typography>
											{batch.activity_name && (
												<>
													<Typography
														variant="caption"
														sx={{ color: 'divider', fontWeight: 900 }}
													>
														|
													</Typography>
													<Typography
														variant="caption"
														sx={{
															fontWeight: 700,
															color: 'primary.main',
															textTransform: 'uppercase',
															letterSpacing: 0.5
														}}
													>
														{batch.activity_name}
													</Typography>
													<Typography
														variant="caption"
														sx={{ color: 'divider', fontWeight: 900 }}
													>
														|
													</Typography>
													<Typography
														variant="caption"
														sx={{ fontWeight: 800, color: 'secondary.main' }}
													>
														{batch.current_weight
															? `${batch.current_weight} kg/cab`
															: 'SIN PESO'}
													</Typography>
												</>
											)}
										</Stack>
										<Typography
											variant="caption"
											sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
										>
											Establecimiento: Propio (RENSPA de la Compañía)
										</Typography>

										<Stack
											direction="row"
											spacing={2}
										>
											<Stack
												direction="row"
												spacing={0.5}
												alignItems="center"
											>
												<FuseSvgIcon
													size={16}
													sx={{ color: 'text.secondary' }}
												>
													heroicons-outline:users
												</FuseSvgIcon>
												<Typography
													variant="caption"
													sx={{ fontWeight: 600, color: 'text.primary' }}
												>
													120 Cabezas
												</Typography>
											</Stack>
											{batch.batch_type_name && (
												<Chip
													label={batch.batch_type_name.toUpperCase()}
													size="small"
													sx={{
														height: 20,
														fontSize: '0.65rem',
														fontWeight: 700,
														bgcolor: 'primary.light',
														color: 'primary.contrastText',
														border: 'none'
													}}
												/>
											)}
										</Stack>
									</Box>
								</Stack>

								<Stack
									direction="row"
									spacing={1}
									alignItems="center"
								>
									<Tooltip title="Ver Detalles y Evolución">
										<IconButton
											size="small"
											onClick={() => handleViewDetails(batch)}
											sx={{
												color: 'primary.main',
												bgcolor: 'action.hover',
												'&:hover': { bgcolor: 'action.selected' }
											}}
										>
											<FuseSvgIcon size={20}>heroicons-outline:eye</FuseSvgIcon>
										</IconButton>
									</Tooltip>

									<Tooltip title="Ingreso Múltiple (Manual)">
										<IconButton
											size="small"
											onClick={() => navigate(`/batches/${batch.id}/bulk-entry`)}
											sx={{
												color: 'secondary.main',
												bgcolor: 'action.hover',
												'&:hover': { bgcolor: 'action.selected' }
											}}
										>
											<FuseSvgIcon size={20}>heroicons-outline:table-cells</FuseSvgIcon>
										</IconButton>
									</Tooltip>

									<Tooltip title="Añadir Caravana">
										<IconButton
											size="small"
											onClick={() => handleAddCaravans(batch)}
											sx={{
												color: (theme) =>
													theme.palette.mode === 'dark' ? '#ffffff' : 'primary.main',
												bgcolor: 'action.hover',
												'&:hover': { bgcolor: 'action.selected' }
											}}
										>
											<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
										</IconButton>
									</Tooltip>

									<Chip
										label={batch.is_active ? 'Activo' : 'Inactivo'}
										size="small"
										color={batch.is_active ? 'success' : 'default'}
										variant="outlined"
										sx={{ fontWeight: 600, fontSize: '0.7rem' }}
									/>
								</Stack>
							</Paper>
						))}
					</Stack>
				</Box>
			)}

			{/* Main DataTable of Suppliers */}
			{filter !== 'own' && (
				<DataTable
					columns={columns}
					data={suppliers}
					enableRowSelection={true}
					enableColumnOrdering={true}
					enableGlobalFilter={true}
					enableRowActions={true}
					enableExpanding={true}
					positionActionsColumn="last"
					renderDetailPanel={({ row }) => {
						// Filter batches belonging to this specific provider
						const providerBatches = batches.filter((b) => b.provider_id === row.original.id);

						return (
							<Box
								sx={{
									display: 'grid',
									width: '100%',
									p: 3,
									bgcolor: 'background.default',
									borderTop: 1,
									borderBottom: 1,
									borderColor: 'divider'
								}}
							>
								<Stack
									direction="row"
									alignItems="center"
									justifyContent="space-between"
									flexWrap="wrap"
									useFlexGap
									gap={1}
									sx={{
										mb: 2,
										px: 2,
										py: 1.25,
										borderRadius: '6px',
										border: '1px solid',
										borderColor: alpha(active, isDark ? 0.4 : 0.25),
										bgcolor: isDark ? alpha(active, 0.16) : alpha('#0a6ed1', 0.07)
									}}
								>
									<Stack
										direction="row"
										spacing={1.5}
										alignItems="center"
									>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												width: 30,
												height: 30,
												borderRadius: '8px',
												bgcolor: active,
												color: '#ffffff',
												flexShrink: 0,
												boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
											}}
										>
											<FuseSvgIcon size={18}>heroicons-outline:rectangle-stack</FuseSvgIcon>
										</Box>
										<Typography
											variant="subtitle2"
											sx={{
												fontWeight: 800,
												color: 'text.primary',
												fontSize: '0.85rem',
												lineHeight: 1.3
											}}
										>
											Lotes asociados a este Proveedor
										</Typography>
									</Stack>
									<Chip
										size="small"
										variant="outlined"
										label={`${providerBatches.length} ${providerBatches.length === 1 ? 'lote' : 'lotes'}`}
										sx={{
											fontWeight: 700,
											color: active,
											borderColor: alpha(active, 0.4),
											bgcolor: 'background.paper',
											fontSize: '0.72rem',
											height: 24
										}}
									/>
								</Stack>

								{providerBatches.length > 0 ? (
									<TableContainer>
										<Table
											size="small"
											sx={{
												borderCollapse: 'collapse',
												border: '1px solid',
												borderColor: headerBorder,
												bgcolor: 'background.paper'
											}}
										>
											<TableHead>
												<TableRow>
													<TableCell sx={headerCellStyle}>Lote</TableCell>
													<TableCell sx={headerCellStyle}>Establecimiento</TableCell>
													<TableCell sx={headerCellStyle}>Actividad</TableCell>
													<TableCell sx={headerCellStyle}>Peso Prom.</TableCell>
													<TableCell sx={headerCellStyle}>Tipo</TableCell>
													<TableCell sx={headerCellStyle}>Cabezas</TableCell>
													<TableCell sx={{ ...headerCellStyle, textAlign: 'center' }}>
														Estado
													</TableCell>
													<TableCell
														sx={{ ...headerCellStyle, borderRight: 0, textAlign: 'center' }}
													>
														Acciones
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{providerBatches.map((batch, index) => (
													<TableRow
														key={batch.id}
														hover
														sx={{
															cursor: 'default',
															bgcolor: index % 2 === 1 ? zebraBg : 'inherit',
															transition: 'background-color 0.15s ease'
														}}
													>
														<TableCell sx={bodyCellStyle}>
															<Typography
																sx={{
																	fontWeight: 700,
																	fontSize: '0.8rem',
																	color: 'text.primary',
																	lineHeight: 1.2
																}}
															>
																{batch.name}
															</Typography>
															{batch.activity_name && (
																<Typography
																	variant="caption"
																	sx={{
																		color: active,
																		fontWeight: 700,
																		textTransform: 'uppercase',
																		fontSize: '0.62rem',
																		letterSpacing: 0.4,
																		display: 'block'
																	}}
																>
																	{batch.activity_name}
																</Typography>
															)}
														</TableCell>
														<TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>
															{batch.farm_name || 'Propio (RENSPA Compañía)'}
														</TableCell>
														<TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>
															{batch.activity_name || '-'}
														</TableCell>
														<TableCell
															sx={{
																...bodyCellStyle,
																fontSize: '0.78rem',
																fontWeight: 600,
																color: 'success.main'
															}}
														>
															{batch.current_weight
																? `${batch.current_weight} kg/cab`
																: 'SIN PESO'}
														</TableCell>
														<TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>
															{batch.batch_type_name || '-'}
														</TableCell>
														<TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>
															{batch.caravans_count ?? '-'}
														</TableCell>
														<TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
															<Chip
																size="small"
																label={batch.is_active ? 'Activo' : 'Inactivo'}
																color={batch.is_active ? 'success' : 'default'}
																variant="outlined"
																sx={{
																	fontWeight: 700,
																	fontSize: '0.68rem',
																	height: 22
																}}
															/>
														</TableCell>
														<TableCell
															sx={{
																...bodyCellStyle,
																borderRight: 0,
																textAlign: 'center'
															}}
														>
															<Stack
																direction="row"
																spacing={0.5}
																justifyContent="center"
															>
																<Tooltip title="Ver Detalles y Evolución">
																	<IconButton
																		size="small"
																		onClick={() => handleViewDetails(batch)}
																		sx={{ color: 'primary.main' }}
																	>
																		<FuseSvgIcon size={18}>
																			heroicons-outline:eye
																		</FuseSvgIcon>
																	</IconButton>
																</Tooltip>
																<Tooltip title="Ingreso Múltiple (Manual)">
																	<IconButton
																		size="small"
																		onClick={() =>
																			navigate(`/batches/${batch.id}/bulk-entry`)
																		}
																		sx={{ color: 'secondary.main' }}
																	>
																		<FuseSvgIcon size={18}>
																			heroicons-outline:table-cells
																		</FuseSvgIcon>
																	</IconButton>
																</Tooltip>
																<Tooltip title="Añadir Caravana">
																	<IconButton
																		size="small"
																		onClick={() => handleAddCaravans(batch)}
																		sx={{ color: 'primary.main' }}
																	>
																		<FuseSvgIcon size={18}>
																			heroicons-outline:plus-circle
																		</FuseSvgIcon>
																	</IconButton>
																</Tooltip>
															</Stack>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								) : (
									<Typography
										variant="body2"
										sx={{ color: 'text.secondary', fontStyle: 'italic' }}
									>
										Este proveedor no tiene lotes registrados.
									</Typography>
								)}
							</Box>
						);
					}}
					renderRowActions={({ row }) => (
						<Box sx={{ display: 'flex', gap: 1 }}>
							<IconButton
								size="small"
								title="Ver detalle"
								sx={{ color: 'primary.main' }}
								onClick={() => console.log('Ver proveedor', row.original.id)}
							>
								<FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>
							</IconButton>
							<IconButton
								size="small"
								title="Más opciones"
								sx={{ color: 'text.secondary' }}
								onClick={() => console.log('Acciones adicionales', row.original.id)}
							>
								<FuseSvgIcon size={18}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
							</IconButton>
						</Box>
					)}
					initialState={{
						density: 'compact',
						showGlobalFilter: true,
						pagination: { pageSize: 15, pageIndex: 0 }
					}}
					muiTableProps={{
						sx: {
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
				/>
			)}
			<AddCaravansDialog
				open={addCaravansDialogOpen}
				onClose={() => setAddCaravansDialogOpen(false)}
				batch={selectedBatch}
			/>
			<BatchDetailsDialog
				open={detailsDialogOpen}
				onClose={() => setDetailsDialogOpen(false)}
				batch={selectedBatch}
			/>
		</Box>
	);
}
