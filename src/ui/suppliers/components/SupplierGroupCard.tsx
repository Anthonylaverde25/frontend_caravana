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

interface SupplierGroupCardProps {
	supplier: any;
	isSelected: boolean;
	onToggleSelect: (id: number) => void;
	onAddFarm: (supplierId: number) => void;
	onViewDetails: (supplierId: number) => void;
}

/**
 * SupplierGroupCard
 * Canonical panel card representing a Supplier and its associated Farms.
 * Replaces the nested accordion with an open, elegant, full-width section card.
 */
export function SupplierGroupCard({
	supplier,
	isSelected,
	onToggleSelect,
	onAddFarm,
	onViewDetails
}: SupplierGroupCardProps) {
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

	const farms = supplier.farms || [];

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
			{/* Supplier Header */}
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
					<Checkbox
						size="small"
						checked={isSelected}
						onChange={() => onToggleSelect(supplier.id)}
						sx={{ p: 0.5 }}
					/>
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
						<FuseSvgIcon size={18}>heroicons-outline:building-storefront</FuseSvgIcon>
					</Box>
					<Box>
						<Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
							{supplier.name}
							{supplier.commercial_name && (
								<Typography
									component="span"
									sx={{ ml: 1, color: 'text.secondary', fontSize: '0.8rem', fontWeight: 500 }}
								>
									({supplier.commercial_name})
								</Typography>
							)}
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
							<Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
								CUIT: {supplier.cuit}
							</Box>
							{supplier.email ? ` • ${supplier.email}` : ''}
							{supplier.phone ? ` • Tel: ${supplier.phone}` : ''}
						</Typography>
					</Box>
				</Stack>

				<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
					<Chip
						size="small"
						variant="outlined"
						label={`${farms.length} ${farms.length === 1 ? 'granja' : 'granjas'}`}
						sx={{ fontSize: '0.72rem', height: 24, fontWeight: 600, bgcolor: 'background.paper' }}
					/>

					<Chip
						label={supplier.is_active ? 'Activo' : 'Inactivo'}
						color={supplier.is_active ? 'success' : 'default'}
						size="small"
						variant="outlined"
						sx={{ fontWeight: 700, fontSize: '0.68rem', height: 24 }}
					/>

					<Button
						size="small"
						variant="outlined"
						startIcon={<FuseSvgIcon size={15}>heroicons-outline:plus</FuseSvgIcon>}
						onClick={() => onAddFarm(supplier.id)}
						sx={{ height: 28, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
					>
						Añadir Granja
					</Button>

					<Tooltip title="Ver Detalles">
						<IconButton
							size="small"
							color="primary"
							onClick={() => onViewDetails(supplier.id)}
							sx={{ height: 28, width: 28 }}
						>
							<FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</Stack>
			</Stack>

			{/* Table of Associated Farms */}
			<TableContainer>
				<Table stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
					<TableHead>
						<TableRow>
							<TableCell sx={{ ...headerCellStyle, width: 50, textAlign: 'center' }}>#</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 220 }}>Establecimiento / Granja</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 200 }}>Ubicación</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>RENSPA</TableCell>
							<TableCell sx={{ ...headerCellStyle, minWidth: 120, borderRight: 0, textAlign: 'center' }}>
								Estado
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{farms.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
									Este proveedor aún no tiene establecimientos registrados.
									<Button
										size="small"
										variant="text"
										onClick={() => onAddFarm(supplier.id)}
										sx={{ ml: 1, textTransform: 'none', fontWeight: 700, color: 'primary.main' }}
									>
										Registrar primer establecimiento
									</Button>
								</TableCell>
							</TableRow>
						) : (
							farms.map((farm: any, index: number) => {
								const rowBg = index % 2 === 1 ? zebraBg : 'inherit';
								return (
									<TableRow key={farm.id || index} hover sx={{ bgcolor: rowBg }}>
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
											<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.82rem' }}>
												{farm.name}
											</Typography>
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem', color: 'text.secondary' }}>
											{farm.location || 'Sin ubicación'}
										</TableCell>
										<TableCell sx={bodyCellStyle}>
											{farm.renspa ? (
												<Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: 'primary.main' }}>
													{farm.renspa}
												</Typography>
											) : (
												<Typography variant="caption" sx={{ color: 'text.disabled' }}>No asignado</Typography>
											)}
										</TableCell>
										<TableCell sx={{ ...bodyCellStyle, borderRight: 0, textAlign: 'center' }}>
											<Chip
												label={farm.is_active ? 'Activa' : 'Inactiva'}
												size="small"
												color={farm.is_active ? 'success' : 'default'}
												variant="outlined"
												sx={{ fontWeight: 600, fontSize: '0.68rem', height: 22 }}
											/>
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

export default SupplierGroupCard;
