import React from 'react';
import {
	Paper,
	Stack,
	TextField,
	InputAdornment,
	FormControl,
	Select,
	MenuItem,
	Chip,
	Tooltip,
	Button,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface SupplierFilterBarProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	selectedStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
	onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
	totalSuppliersCount: number;
	totalFarmsCount: number;
	viewMode: 'hierarchy' | 'flat';
	onToggleViewMode: () => void;
	isAllSelected: boolean;
	onToggleSelectAll: () => void;
	hasSuppliers: boolean;
	onExport: () => void;
}

/**
 * SupplierFilterBar
 * Matches the canonical filter & search toolbar pattern of ExternalBatchAssignmentView.
 */
export function SupplierFilterBar({
	searchTerm,
	onSearchChange,
	selectedStatus,
	onStatusChange,
	totalSuppliersCount,
	totalFarmsCount,
	viewMode,
	onToggleViewMode,
	isAllSelected,
	onToggleSelectAll,
	hasSuppliers,
	onExport
}: SupplierFilterBarProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				mb: 2,
				borderRadius: '8px',
				border: '1px solid',
				borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
				bgcolor: isDark ? '#1e293b' : '#ffffff',
				boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
			}}
		>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				justifyContent="space-between"
				alignItems={{ xs: 'stretch', md: 'center' }}
				spacing={1.5}
			>
				{/* Search Input */}
				<TextField
					size="small"
					hiddenLabel
					placeholder="Buscar por razón social, CUIT, granja o RENSPA..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					sx={{
						flexGrow: 1,
						maxWidth: { md: 400 },
						'& .MuiOutlinedInput-root': {
							borderRadius: '6px',
							fontSize: '0.85rem'
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FuseSvgIcon size={18} color="action">
									heroicons-outline:magnifying-glass
								</FuseSvgIcon>
							</InputAdornment>
						)
					}}
				/>

				{/* Filters & Actions */}
				<Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
					{/* Status Filter */}
					<FormControl size="small" sx={{ minWidth: 160, width: 'auto' }}>
						<Select
							value={selectedStatus}
							onChange={(e) => onStatusChange(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
							sx={{
								borderRadius: '6px',
								fontSize: '0.85rem',
								'& .MuiInputBase-input': { py: 1.15 }
							}}
						>
							<MenuItem value="ALL">Todos los Estados</MenuItem>
							<MenuItem value="ACTIVE">Solo Activos</MenuItem>
							<MenuItem value="INACTIVE">Solo Inactivos</MenuItem>
						</Select>
					</FormControl>

					{/* Result count chip */}
					<Chip
						size="small"
						variant="outlined"
						label={`${totalSuppliersCount} proveedores • ${totalFarmsCount} granjas`}
						sx={{
							height: 30,
							px: 0.5,
							fontWeight: 600,
							whiteSpace: 'nowrap',
							fontSize: '0.75rem',
							'& .MuiChip-label': { px: 1 }
						}}
					/>

					{/* View Mode Toggle */}
					<Tooltip
						title={
							viewMode === 'hierarchy'
								? 'Cambiar a vista de tabla plana'
								: 'Cambiar a organización Proveedores → Establecimientos'
						}
					>
						<Button
							variant="outlined"
							size="small"
							onClick={onToggleViewMode}
							startIcon={
								<FuseSvgIcon size={16}>
									{viewMode === 'flat'
										? 'heroicons-outline:building-storefront'
										: 'heroicons-outline:table-cells'}
								</FuseSvgIcon>
							}
							sx={{
								whiteSpace: 'nowrap',
								px: 2,
								height: 30,
								textTransform: 'none',
								fontSize: '0.8rem',
								borderRadius: '6px'
							}}
						>
							{viewMode === 'flat' ? 'Proveedores → Granjas' : 'Tabla plana'}
						</Button>
					</Tooltip>

					{/* Select All Button */}
					<Button
						variant={isAllSelected && hasSuppliers ? 'contained' : 'outlined'}
						size="small"
						startIcon={
							<FuseSvgIcon size={16}>
								{isAllSelected && hasSuppliers
									? 'heroicons-outline:x-mark'
									: 'heroicons-outline:check-circle'}
							</FuseSvgIcon>
						}
						onClick={onToggleSelectAll}
						disabled={!hasSuppliers}
						sx={{
							whiteSpace: 'nowrap',
							px: 2,
							height: 30,
							textTransform: 'none',
							fontSize: '0.8rem',
							borderRadius: '6px'
						}}
					>
						{isAllSelected && hasSuppliers ? 'Deseleccionar' : 'Seleccionar Todo'}
					</Button>

					{/* Export Button */}
					<Button
						variant="outlined"
						size="small"
						color="inherit"
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:download</FuseSvgIcon>}
						onClick={onExport}
						disabled={!hasSuppliers}
						sx={{
							whiteSpace: 'nowrap',
							px: 1.5,
							height: 30,
							textTransform: 'none',
							fontSize: '0.8rem',
							borderRadius: '6px'
						}}
					>
						Exportar
					</Button>
				</Stack>
			</Stack>
		</Paper>
	);
}

export default SupplierFilterBar;
