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
	Avatar,
	Box,
	useTheme,
	alpha
} from '@mui/material';
import { formatCuit } from '@/core/shared/domain/cuit';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PartnerRoleChips from './PartnerRoleChips';

interface PartnerFlatTableProps {
	partners: any[];
	selectedPartnerIds: number[];
	page: number;
	rowsPerPage: number;
	onPageChange: (newPage: number) => void;
	onRowsPerPageChange: (newRowsPerPage: number) => void;
	onTogglePartner: (id: number) => void;
	onToggleAllPage: (pageIds: number[]) => void;
	onAddFarm: (partnerId: number) => void;
	onViewDetails: (partnerId: number) => void;
	onEditRoles: (partner: any) => void;
	onEdit: (partner: any) => void;
}

const getInitials = (name: string) => {
	if (!name) return '??';
	return name
		.split(' ')
		.filter(Boolean)
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.substring(0, 2);
};

/**
 * PartnerFlatTable
 * Canonical flat table view for all partners with group headers and pagination.
 */
export function PartnerFlatTable({
	partners,
	selectedPartnerIds,
	page,
	rowsPerPage,
	onPageChange,
	onRowsPerPageChange,
	onTogglePartner,
	onToggleAllPage,
	onAddFarm,
	onViewDetails,
	onEditRoles,
	onEdit
}: PartnerFlatTableProps) {
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

	const paginatedRows = partners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
	const pageIds = paginatedRows.map((s) => s.id);

	const isAllPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedPartnerIds.includes(id));
	const isSomePageSelected = pageIds.some((id) => selectedPartnerIds.includes(id)) && !isAllPageSelected;

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
				<Table stickyHeader size="small" sx={{ minWidth: 1000, borderCollapse: 'collapse' }}>
					<TableHead>
						{/* Group Header Row */}
						<TableRow>
							<TableCell
								colSpan={2}
								sx={{ bgcolor: headerBg, borderBottom: '1px solid', borderColor: headerBorder }}
							/>
							<TableCell
								colSpan={4}
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
								Datos del cliente o proveedor
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
								Operaciones y Estado
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
							<TableCell sx={{ ...headerCellStyle, minWidth: 260 }}>Nombre / Razón Social</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 180 }}>Nombre Comercial</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>CUIT</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 220 }}>Contacto</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 170, textAlign: 'center' }}>Roles</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 150, textAlign: 'center' }}>
								Establecimientos
							</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 100, textAlign: 'center' }}>Estado</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 120, borderRight: 0, textAlign: 'center' }}>
								Acciones
							</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{paginatedRows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={10} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
									No se encontraron clientes ni proveedores con los filtros seleccionados.
								</TableCell>
							</TableRow>
						) : (
							paginatedRows.map((partner, index) => {
								const isSelected = selectedPartnerIds.includes(partner.id);
								const rowBg = isSelected
									? isDark
										? 'rgba(99, 102, 241, 0.22)'
										: '#e0e7ff'
									: index % 2 === 1
										? zebraBg
										: 'inherit';
								const farms = partner.farms || [];

								return (
									<TableRow key={partner.id} hover sx={{ bgcolor: rowBg }}>
										<TableCell
											sx={{ ...bodyCellStyle, textAlign: 'center', p: 0.5, cursor: 'pointer' }}
											onClick={() => onTogglePartner(partner.id)}
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
										<TableCell sx={bodyCellStyle}>
											<Stack direction="row" spacing={1.5} alignItems="center">
												<Avatar
													sx={{
														bgcolor: 'primary.main',
														color: 'primary.contrastText',
														fontSize: '0.75rem',
														fontWeight: 700,
														width: 32,
														height: 32
													}}
												>
													{getInitials(partner.name)}
												</Avatar>
												<Box>
													<Typography
														variant="body2"
														sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
													>
														{partner.name}
													</Typography>
													<Typography
														variant="caption"
														sx={{ color: 'text.secondary', fontFamily: 'monospace', fontWeight: 500 }}
													>
														CUIT: {formatCuit(partner.cuit)}
													</Typography>
												</Box>
											</Stack>
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, fontSize: '0.8rem' }}>
											{partner.commercial_name || '-'}
										</TableCell>
										<TableCell sx={bodyCellStyle}>
											<Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem' }}>
												{formatCuit(partner.cuit)}
											</Typography>
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, fontSize: '0.8rem', color: partner.default_contact ? 'text.primary' : 'text.disabled' }}>
											{partner.getContactInfo()}
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
											<PartnerRoleChips roles={partner.roles} />
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
											<Chip
												label={`${farms.length} ${farms.length === 1 ? 'granja' : 'granjas'}`}
												size="small"
												variant="outlined"
												color={farms.length > 0 ? 'primary' : 'default'}
												sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
											/>
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
											<Chip
												label={partner.is_active ? 'Activo' : 'Inactivo'}
												color={partner.is_active ? 'success' : 'default'}
												size="small"
												variant="outlined"
												sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
											/>
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, borderRight: 0, textAlign: 'center' }}>
											<Stack direction="row" spacing={0.5} justifyContent="center">
												<Tooltip title="Añadir Granja">
													<IconButton size="small" onClick={() => onAddFarm(partner.id)}>
														<FuseSvgIcon size={16}>heroicons-outline:plus-circle</FuseSvgIcon>
													</IconButton>
												</Tooltip>
												<Tooltip title="Editar datos">
													<IconButton size="small" onClick={() => onEdit(partner)}>
														<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>
													</IconButton>
												</Tooltip>
												<Tooltip title="Editar qué vende">
													<IconButton size="small" onClick={() => onEditRoles(partner)}>
														<FuseSvgIcon size={16}>heroicons-outline:tag</FuseSvgIcon>
													</IconButton>
												</Tooltip>
												<Tooltip title="Ver Detalles">
													<IconButton
														size="small"
														color="primary"
														onClick={() => onViewDetails(partner.id)}
													>
														<FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
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
				count={partners.length}
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

export default PartnerFlatTable;
