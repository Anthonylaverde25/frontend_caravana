import React from 'react';
import {
	Paper,
	Stack,
	Box,
	Typography,
	Chip,
	Button,
	IconButton,
	Tooltip,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Checkbox,
	useTheme,
	alpha
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BatchGroup, CaravanItem } from '../types/caravanViewTypes';

interface CaravanBatchGroupCardProps {
	group: BatchGroup;
	selectedCaravanIds: number[];
	onToggleCaravan: (id: number) => void;
	onToggleGroup: (ids: number[]) => void;
	onAddCaravan: (batchId: number) => void;
	onBulkWeightEntry?: (batchId: number) => void;
	onWeightSheet?: (batchId: number) => void;
	onOpenBatchDetail: (batch: any) => void;
	onViewCaravan: (caravan: CaravanItem) => void;
	onEditCaravan: (caravan: CaravanItem) => void;
	onWeightCaravan: (caravan: CaravanItem) => void;
	onTransferCaravan: (caravan: CaravanItem) => void;
}

/**
 * CaravanBatchGroupCard
 * Canonical panel card representing a Lot and its Caravans in the hierarchy view mode.
 * Replaces the nested accordion with an open, elegant, full-width section card.
 */
export function CaravanBatchGroupCard({
	group,
	selectedCaravanIds,
	onToggleCaravan,
	onToggleGroup,
	onAddCaravan,
	onBulkWeightEntry,
	onWeightSheet,
	onOpenBatchDetail,
	onViewCaravan,
	onEditCaravan,
	onWeightCaravan,
	onTransferCaravan
}: CaravanBatchGroupCardProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const headerBg = isDark ? '#1e293b' : '#f8fafc';
	const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';
	const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
	const bodyBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9';
	const active = isDark ? '#60a5fa' : '#0a6ed1';

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

	const batchIds = group.caravans.map((c) => c.id);
	const selectedCountInBatch = batchIds.filter((id) => selectedCaravanIds.includes(id)).length;
	const isAllBatchSelected = batchIds.length > 0 && selectedCountInBatch === batchIds.length;
	const isSomeBatchSelected = selectedCountInBatch > 0 && !isAllBatchSelected;

	return (
		<Paper
			elevation={0}
			sx={{
				border: 1,
				borderColor: 'divider',
				borderRadius: '8px',
				overflow: 'hidden',
				bgcolor: 'background.paper',
				mb: 3
			}}
		>
			{/* Lot Header */}
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				alignItems={{ xs: 'flex-start', md: 'center' }}
				justifyContent="space-between"
				spacing={1.5}
				sx={{
					px: 2.5,
					py: 1.5,
					borderBottom: '2px solid',
					borderColor: isDark ? alpha(active, 0.55) : alpha(active, 0.35),
					bgcolor: isDark ? alpha(active, 0.16) : alpha('#0a6ed1', 0.07)
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 34,
							height: 34,
							borderRadius: '8px',
							bgcolor: active,
							color: '#ffffff',
							flexShrink: 0,
							boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
						}}
					>
						<FuseSvgIcon size={18}>heroicons-outline:rectangle-stack</FuseSvgIcon>
					</Box>
					<Box>
						<Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
							{group.batchName}
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
							{group.farmName ? `Establecimiento: ${group.farmName} • ` : ''}
							{group.totalHeads} {group.totalHeads === 1 ? 'cabeza' : 'cabezas'}
							{group.averageWeight > 0 ? ` • Peso Promedio: ${Math.round(group.averageWeight)} kg` : ''}
						</Typography>
					</Box>
				</Stack>

				<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
					{selectedCountInBatch > 0 && (
						<Chip
							size="small"
							color="primary"
							label={`${selectedCountInBatch} seleccionadas`}
							sx={{ fontSize: '0.72rem', height: 24, fontWeight: 700 }}
						/>
					)}

					<Button
						size="small"
						variant="outlined"
						startIcon={<FuseSvgIcon size={15}>heroicons-outline:plus</FuseSvgIcon>}
						onClick={() => onAddCaravan(group.batchId)}
						sx={{ height: 28, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
					>
						Añadir Caravana
					</Button>

					<Tooltip title="Carga Masiva de Pesajes">
						<IconButton
							size="small"
							color="success"
							onClick={() => onBulkWeightEntry?.(group.batchId)}
							sx={{ height: 28, width: 28 }}
						>
							<FuseSvgIcon size={16}>heroicons-outline:scale</FuseSvgIcon>
						</IconButton>
					</Tooltip>

					<Tooltip title="Planilla de Control">
						<IconButton
							size="small"
							color="inherit"
							onClick={() => onWeightSheet?.(group.batchId)}
							sx={{ height: 28, width: 28 }}
						>
							<FuseSvgIcon size={16}>heroicons-outline:document-text</FuseSvgIcon>
						</IconButton>
					</Tooltip>

					<Tooltip title="Detalle del Lote">
						<IconButton
							size="small"
							color="inherit"
							onClick={() => onOpenBatchDetail(group.rawBatch)}
							sx={{ height: 28, width: 28 }}
						>
							<FuseSvgIcon size={16}>heroicons-outline:folder-open</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>

			{/* Table of Caravans */}
			<TableContainer>
				<Table stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
					<TableHead>
						<TableRow>
							<TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center', p: 0.5 }}>
								<Checkbox
									size="small"
									checked={isAllBatchSelected}
									indeterminate={isSomeBatchSelected}
									onChange={() => onToggleGroup(batchIds)}
									sx={{ p: 0.5 }}
								/>
							</TableCell>
							<TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>Caravana</TableCell>
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
						{group.caravans.length === 0 ? (
							<TableRow>
								<TableCell colSpan={11} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
									No hay caravanas registradas en este lote.
								</TableCell>
							</TableRow>
						) : (
							group.caravans.map((caravan, index) => {
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
											{index + 1}
										</TableCell>
										<TableCell sx={bodyCellStyle}>
											<Typography
												sx={{
													fontFamily: 'monospace',
													fontWeight: 800,
													color: 'primary.main',
													fontSize: '0.85rem',
													lineHeight: 1.1
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
		</Paper>
	);
}

export default CaravanBatchGroupCard;
