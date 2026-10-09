import React from 'react';
import {
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Checkbox,
	Typography,
	Chip,
	IconButton,
	Tooltip,
	Stack,
	TablePagination,
	useTheme,
	alpha
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { CaravanItem } from '../types/caravanViewTypes';

interface CaravanFlatTableProps {
	caravans: CaravanItem[];
	selectedCaravanIds: number[];
	page: number;
	rowsPerPage: number;
	onPageChange: (newPage: number) => void;
	onRowsPerPageChange: (newRowsPerPage: number) => void;
	onToggleCaravan: (id: number) => void;
	onToggleAllPage: (pageIds: number[]) => void;
	onViewCaravan: (caravan: CaravanItem) => void;
	onEditCaravan: (caravan: CaravanItem) => void;
	onWeightCaravan: (caravan: CaravanItem) => void;
	onTransferCaravan: (caravan: CaravanItem) => void;
}

/**
 * CaravanFlatTable
 * Canonical flat table view with column group headers matching ExternalBatchAssignmentView.
 */
export function CaravanFlatTable({
	caravans,
	selectedCaravanIds,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	onToggleCaravan,
	onToggleAllPage,
	onViewCaravan,
	onEditCaravan,
	onWeightCaravan,
	onTransferCaravan
}: CaravanFlatTableProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const headerBg = isDark ? '#1e293b' : '#f8fafc';
	const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';
	const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
	const bodyBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9';

	const headerCellStyle = {
		py: 1.2,
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
		bgcolor: headerBg
	};

	const bodyCellStyle = {
		px: 1.5,
		py: 1.1,
		borderRight: '1px solid',
		borderBottom: '1px solid',
		borderColor: bodyBorder
	};

	const paginatedRows = caravans.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
	const pageIds = paginatedRows.map((c) => c.id);

	const isAllPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedCaravanIds.includes(id));
	const isSomePageSelected = pageIds.some((id) => selectedCaravanIds.includes(id)) && !isAllPageSelected;

	return (
		<Paper
			elevation={0}
			sx={{
				border: 1,
				borderColor: 'divider',
				borderRadius: '8px',
				overflow: 'hidden',
				bgcolor: 'background.paper'
			}}
		>
			<TableContainer sx={{ maxHeight: 'calc(100vh - 360px)' }}>
				<Table stickyHeader size="small" sx={{ minWidth: 1150, borderCollapse: 'collapse' }}>
					<TableHead>
						{/* Group Header Row */}
						<TableRow>
							<TableCell
								colSpan={2}
								sx={{ bgcolor: headerBg, borderBottom: '1px solid', borderColor: headerBorder }}
							/>
							<TableCell
								colSpan={6}
								align="center"
								sx={{
									bgcolor: headerBg,
									color: isDark ? '#94a3b8' : '#475569',
									fontWeight: 800,
									fontSize: '0.7rem',
									textTransform: 'uppercase',
									letterSpacing: '0.04em',
									borderBottom: '1px solid',
									borderColor: headerBorder,
									py: 0.8
								}}
							>
								Datos de la Caravana
							</TableCell>
							<TableCell
								colSpan={4}
								align="center"
								sx={{
									bgcolor: alpha(theme.palette.primary.main, isDark ? 0.09 : 0.06),
									color: 'primary.main',
									fontWeight: 800,
									fontSize: '0.7rem',
									textTransform: 'uppercase',
									letterSpacing: '0.04em',
									borderBottom: '1px solid',
									borderColor: headerBorder,
									py: 0.8
								}}
							>
								Lote y Métricas Operativas
							</TableCell>
						</TableRow>

						{/* Column Headers */}
						<TableRow>
							<TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center', p: 0.5 }}>
								<Checkbox
									size="small"
									checked={isAllPageSelected}
									indeterminate={isSomePageSelected}
									onChange={() => onToggleAllPage(pageIds)}
									sx={{ p: 0.5 }}
								/>
							</TableCell>
							<TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>Caravana</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Lote Asignado</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Categoría</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 100 }}>Sexo</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Est. Fisiológico</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Raza</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 90 }}>Dentición</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 120, textAlign: 'right' }}>Peso Actual</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Fecha Ingreso</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 130, borderRight: 0, textAlign: 'center' }}>
								Acciones
							</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{paginatedRows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={12} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
									No se encontraron caravanas con los filtros seleccionados.
								</TableCell>
							</TableRow>
						) : (
							paginatedRows.map((caravan, index) => {
								const isSelected = selectedCaravanIds.includes(caravan.id);
								const rowBg = isSelected
									? isDark
										? 'rgba(99, 102, 241, 0.22)'
										: '#e0e7ff'
									: index % 2 === 1
										? zebraBg
										: 'inherit';

								return (
									<TableRow
										key={caravan.id}
										hover
										sx={{ bgcolor: rowBg, transition: 'background-color 0.15s ease' }}
									>
										<TableCell
											sx={{ ...bodyCellStyle, textAlign: 'center', p: 0.5, cursor: 'pointer' }}
											onClick={() => onToggleCaravan(caravan.id)}
										>
											<Checkbox checked={isSelected} size="small" sx={{ p: 0.5 }} />
										</TableCell>
										<TableCell
											sx={{
												...bodyCellStyle,
												textAlign: 'center',
												color: 'text.secondary',
												fontSize: '0.75rem',
												fontWeight: 600
											}}
										>
											{page * rowsPerPage + index + 1}
										</TableCell>
										<TableCell
											sx={{ ...bodyCellStyle, cursor: 'pointer' }}
											onClick={() => onViewCaravan(caravan)}
										>
											<Typography
												sx={{
													fontFamily: 'monospace',
													fontWeight: 800,
													color: 'primary.main',
													fontSize: '0.85rem',
													lineHeight: 1.1,
													'&:hover': {
														textDecoration: 'underline'
													}
												}}
											>
												#{caravan.identification}
											</Typography>
											{caravan.breed && (
												<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
													{caravan.breed}
												</Typography>
											)}
										</TableCell>
										<TableCell sx={bodyCellStyle}>
											<Chip
												label={caravan.batch_name || 'SIN LOTE'}
												size="small"
												variant="outlined"
												color={caravan.batch_name ? 'primary' : 'default'}
												sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
											/>
										</TableCell>
										<TableCell sx={bodyCellStyle}>
											<Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
												{caravan.category_name || caravan.category || '-'}
											</Typography>
											{caravan.subcategory_name && (
												<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
													{caravan.subcategory_name}
												</Typography>
											)}
										</TableCell>
										<TableCell sx={bodyCellStyle}>
											<Chip
												size="small"
												label={caravan.sex === 'M' ? 'Macho' : 'Hembra'}
												color={caravan.sex === 'M' ? 'info' : 'secondary'}
												variant="outlined"
												sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
											/>
										</TableCell>
										<TableCell sx={bodyCellStyle}>
											{caravan.sex === 'H' ? (
												caravan.female_details ? (
													<Chip
														size="small"
														label={caravan.female_details.is_empty ? 'Vacía' : 'Preñada'}
														color={caravan.female_details.is_empty ? 'default' : 'secondary'}
														sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
													/>
												) : (
													<Typography variant="caption" sx={{ color: 'text.secondary' }}>Vacía</Typography>
												)
											) : (
												<Typography variant="caption" sx={{ color: 'text.disabled' }}>N/A</Typography>
											)}
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.breed || '-'}</TableCell>
										<TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>{caravan.teeth} D</TableCell>
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'right' }}>
											<Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700, fontSize: '0.8rem' }}>
												{caravan.current_weight ? `${caravan.current_weight} kg` : '-'}
											</Typography>
											{caravan.entry_weight && (
												<Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem', display: 'block' }}>
													ini: {caravan.entry_weight} kg
												</Typography>
											)}
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem', color: 'text.secondary' }}>
											{caravan.entry_date || '-'}
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, borderRight: 0, textAlign: 'center' }}>
											<Stack direction="row" spacing={0.5} justifyContent="center">
												<Tooltip title="Ver Detalles">
													<IconButton size="small" onClick={() => onViewCaravan(caravan)}>
														<FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
													</IconButton>
												</Tooltip>
												<Tooltip title="Editar">
													<IconButton size="small" onClick={() => onEditCaravan(caravan)}>
														<FuseSvgIcon size={16}>heroicons-outline:pencil-alt</FuseSvgIcon>
													</IconButton>
												</Tooltip>
												<Tooltip title="Pesar">
													<IconButton size="small" color="success" onClick={() => onWeightCaravan(caravan)}>
														<FuseSvgIcon size={16}>heroicons-outline:scale</FuseSvgIcon>
													</IconButton>
												</Tooltip>
												<Tooltip title="Transferir">
													<IconButton size="small" color="primary" onClick={() => onTransferCaravan(caravan)}>
														<FuseSvgIcon size={16}>heroicons-outline:arrows-right-left</FuseSvgIcon>
													</IconButton>
												</Tooltip>
											</Stack>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Pagination */}
			<TablePagination
				component="div"
				count={caravans.length}
				page={page}
				onPageChange={(_, newPage) => onPageChange(newPage)}
				rowsPerPage={rowsPerPage}
				onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
				rowsPerPageOptions={[15, 25, 50, 100]}
				labelRowsPerPage="Filas por página:"
				labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
			/>
		</Paper>
	);
}

export default CaravanFlatTable;
