import React from 'react';
import { Box, TextField, FormControl, Select, MenuItem, Button, Tooltip, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BirthsViewMode, NursingStatusFilter } from './birthsTypes';

interface BatchOption {
	id: number;
	name: string;
	count: number;
}

interface BirthsFilterBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	selectedBatchId: number | 'all';
	onBatchChange: (batchId: number | 'all') => void;
	batchOptions: BatchOption[];
	nursingFilter: NursingStatusFilter;
	onNursingFilterChange: (status: NursingStatusFilter) => void;
	viewMode: BirthsViewMode;
	onToggleViewMode: () => void;
	isAllSelected: boolean;
	onToggleSelectAll: () => void;
	hasEligibleItems: boolean;
}

export const BirthsFilterBar: React.FC<BirthsFilterBarProps> = ({
	searchQuery,
	onSearchChange,
	selectedBatchId,
	onBatchChange,
	batchOptions,
	nursingFilter,
	onNursingFilterChange,
	viewMode,
	onToggleViewMode,
	isAllSelected,
	onToggleSelectAll,
	hasEligibleItems
}) => {
	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				flexWrap: 'wrap',
				gap: 2
			}}
		>
			{/* Left Filters Group */}
			<Stack
				direction="row"
				spacing={1.5}
				alignItems="center"
				flexWrap="wrap"
				useFlexGap
				sx={{ flexGrow: 1 }}
			>
				{/* Search Input */}
				<TextField
					size="small"
					variant="outlined"
					placeholder="Buscar por madre, cría u observaciones..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					sx={{
						width: { xs: '100%', sm: 300 },
						'& .MuiOutlinedInput-root': {
							borderRadius: '8px',
							bgcolor: 'background.paper'
						}
					}}
					InputProps={{
						startAdornment: (
							<Box sx={{ color: 'text.disabled', mr: 1, display: 'flex', alignItems: 'center' }}>
								<FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>
							</Box>
						)
					}}
				/>

				{/* Batch Filter Select */}
				<FormControl
					size="small"
					sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: '8px' }}
				>
					<Select
						value={selectedBatchId}
						onChange={(e) => onBatchChange(e.target.value as number | 'all')}
						displayEmpty
						sx={{ borderRadius: '8px', fontSize: '0.84rem' }}
					>
						<MenuItem value="all">
							<em>Todos los lotes</em>
						</MenuItem>
						{batchOptions.map((opt) => (
							<MenuItem
								key={opt.id}
								value={opt.id}
								sx={{ fontSize: '0.84rem' }}
							>
								{opt.name} ({opt.count})
							</MenuItem>
						))}
					</Select>
				</FormControl>

				{/* Nursing Filter */}
				<FormControl
					size="small"
					sx={{ minWidth: 170, bgcolor: 'background.paper', borderRadius: '8px' }}
				>
					<Select
						value={nursingFilter}
						onChange={(e) => onNursingFilterChange(e.target.value as NursingStatusFilter)}
						sx={{ borderRadius: '8px', fontSize: '0.84rem' }}
					>
						<MenuItem
							value="all"
							sx={{ fontSize: '0.84rem' }}
						>
							Todos los estados
						</MenuItem>
						<MenuItem
							value="nursing"
							sx={{ fontSize: '0.84rem' }}
						>
							Solo al pie (lactando)
						</MenuItem>
						<MenuItem
							value="weaned"
							sx={{ fontSize: '0.84rem' }}
						>
							Solo destetados
						</MenuItem>
					</Select>
				</FormControl>
			</Stack>

			{/* Right Action Controls */}
			<Stack
				direction="row"
				spacing={1.5}
				alignItems="center"
			>
				{/* Toggle View Mode Button */}
				<Tooltip
					title={
						viewMode === 'hierarchy'
							? 'Cambiar a vista de tabla plana'
							: 'Cambiar a organización agrupada por lote'
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
							height: 36,
							textTransform: 'none',
							fontSize: '0.8rem',
							fontWeight: 700,
							borderRadius: '8px'
						}}
					>
						{viewMode === 'flat' ? 'Lotes → Partos' : 'Tabla plana'}
					</Button>
				</Tooltip>

				{/* Select All Eligible Calves */}
				<Button
					variant={isAllSelected && hasEligibleItems ? 'contained' : 'outlined'}
					size="small"
					startIcon={
						<FuseSvgIcon size={16}>
							{isAllSelected && hasEligibleItems
								? 'heroicons-outline:x-mark'
								: 'heroicons-outline:check-circle'}
						</FuseSvgIcon>
					}
					onClick={onToggleSelectAll}
					disabled={!hasEligibleItems}
					sx={{
						whiteSpace: 'nowrap',
						px: 2,
						height: 36,
						textTransform: 'none',
						fontSize: '0.8rem',
						fontWeight: 700,
						borderRadius: '8px'
					}}
				>
					{isAllSelected && hasEligibleItems ? 'Deseleccionar' : 'Seleccionar Todo'}
				</Button>
			</Stack>
		</Box>
	);
};

export default BirthsFilterBar;
