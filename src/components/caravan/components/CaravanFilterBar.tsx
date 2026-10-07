import React from 'react';
import {
	Paper,
	Stack,
	TextField,
	InputAdornment,
	FormControl,
	Select,
	MenuItem,
	Typography,
	OutlinedInput,
	Chip,
	Tooltip,
	Button,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface CaravanFilterBarProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	selectedBatchId: number | '';
	onBatchChange: (value: number | '') => void;
	batchOptions: Array<{ id: number; name: string; farm_name?: string | null; count: number }>;
	selectedSex: 'ALL' | 'M' | 'H';
	onSexChange: (value: 'ALL' | 'M' | 'H') => void;
	totalEligibleCount: number;
	viewMode: 'flat' | 'hierarchy';
	onToggleViewMode: () => void;
	isAllSelected: boolean;
	onToggleSelectAll: () => void;
	hasItems: boolean;
	onExportTxt: () => void;
}

/**
 * CaravanFilterBar
 * Matches the canonical filter & search toolbar pattern of ExternalBatchAssignmentView.
 */
export function CaravanFilterBar({
	searchTerm,
	onSearchChange,
	selectedBatchId,
	onBatchChange,
	batchOptions,
	selectedSex,
	onSexChange,
	totalEligibleCount,
	viewMode,
	onToggleViewMode,
	isAllSelected,
	onToggleSelectAll,
	hasItems,
	onExportTxt
}: CaravanFilterBarProps) {
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
					placeholder="Buscar por caravana, raza, categoría o lote..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					sx={{
						flexGrow: 1,
						maxWidth: { md: 380 },
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
					{/* Batch Filter */}
					<FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 }, width: 'auto' }}>
						<Select
							displayEmpty
							value={selectedBatchId}
							onChange={(e) => onBatchChange(e.target.value as number | '')}
							renderValue={(selected) => {
								const val = selected as number | '';
								if (val === '' || val == null) {
									return (
										<Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.4 }}>
											Todos los Lotes
										</Typography>
									);
								}
								const b = batchOptions.find((x) => x.id === val);
								return (
									<Typography
										sx={{
											fontSize: '0.85rem',
											lineHeight: 1.4,
											textOverflow: 'ellipsis',
											overflow: 'hidden',
											whiteSpace: 'nowrap'
										}}
									>
										{b ? `${b.name} (${b.count} cabezas)` : ''}
									</Typography>
								);
							}}
							input={
								<OutlinedInput
									size="small"
									startAdornment={
										<InputAdornment position="start">
											<FuseSvgIcon size={18} color="action">
												heroicons-outline:rectangle-stack
											</FuseSvgIcon>
										</InputAdornment>
									}
								/>
							}
							sx={{
								borderRadius: '6px',
								fontSize: '0.85rem',
								'& .MuiOutlinedInput-root': {
									borderRadius: '6px',
									'& .MuiInputBase-input': {
										py: 1.15,
										fontSize: '0.85rem',
										display: 'flex',
										alignItems: 'center'
									}
								},
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#d1d5db'
								},
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#9ca3af'
								}
							}}
						>
							<MenuItem value="">Todos los Lotes</MenuItem>
							{batchOptions.map((b) => (
								<MenuItem key={b.id} value={b.id}>
									{b.name} ({b.count} cabezas)
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Sex Filter */}
					<FormControl size="small" sx={{ minWidth: 140, width: 'auto' }}>
						<Select
							value={selectedSex}
							onChange={(e) => onSexChange(e.target.value as 'ALL' | 'M' | 'H')}
							sx={{
								borderRadius: '6px',
								fontSize: '0.85rem',
								'& .MuiInputBase-input': { py: 1.15 }
							}}
						>
							<MenuItem value="ALL">Todos los Sexos</MenuItem>
							<MenuItem value="M">Solo Machos</MenuItem>
							<MenuItem value="H">Solo Hembras</MenuItem>
						</Select>
					</FormControl>

					{/* Result count chip */}
					<Chip
						size="small"
						variant="outlined"
						label={`${totalEligibleCount} animales`}
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
								: 'Cambiar a organización por lotes'
						}
					>
						<Button
							variant="outlined"
							size="small"
							onClick={onToggleViewMode}
							startIcon={
								<FuseSvgIcon size={16}>
									{viewMode === 'flat'
										? 'heroicons-outline:rectangle-stack'
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
							{viewMode === 'flat' ? 'Lotes → Caravanas' : 'Tabla plana'}
						</Button>
					</Tooltip>

					{/* Select All Button */}
					<Button
						variant={isAllSelected && hasItems ? 'contained' : 'outlined'}
						size="small"
						startIcon={
							<FuseSvgIcon size={16}>
								{isAllSelected && hasItems ? 'heroicons-outline:x-mark' : 'heroicons-outline:check-circle'}
							</FuseSvgIcon>
						}
						onClick={onToggleSelectAll}
						disabled={!hasItems}
						sx={{
							whiteSpace: 'nowrap',
							px: 2,
							height: 30,
							textTransform: 'none',
							fontSize: '0.8rem',
							borderRadius: '6px'
						}}
					>
						{isAllSelected && hasItems ? 'Deseleccionar' : 'Seleccionar Todo'}
					</Button>

					{/* Export Button */}
					<Button
						variant="outlined"
						size="small"
						color="inherit"
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:download</FuseSvgIcon>}
						onClick={onExportTxt}
						disabled={!hasItems}
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

export default CaravanFilterBar;
