import React from 'react';
import { Box, Button, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ExitLoadMode } from './exitRows';

export type ExitGridFilter = 'ALL' | 'NOTICE' | 'UNMARKED';

interface ExitGridToolbarProps {
	mode: ExitLoadMode;
	/** A long load: the filters and the search. A short one is read at a glance. */
	showFilters: boolean;
	search: string;
	onSearchChange: (value: string) => void;
	filter: ExitGridFilter;
	onFilterChange: (value: ExitGridFilter) => void;
	counts: Record<ExitGridFilter, number>;
	/** "Completar con el último peso", when some leaving row has its weight empty. */
	onFillWeights?: () => void;
}

const segmentSx = {
	textTransform: 'none',
	px: 1.5,
	py: 0.5,
	fontWeight: 600,
	fontSize: '0.8rem',
	border: 0,
	borderRadius: '6px !important',
	color: 'text.secondary',
	'&.Mui-selected': { bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1 },
	'&.Mui-selected:hover': { bgcolor: 'background.paper' }
} as const;

/**
 * The bar over the grid: the filters on the left; on the right what acts on the rows (fill the
 * empty weights) and the search, outlined so it is not taken for "Agregar caravana".
 */
export const ExitGridToolbar: React.FC<ExitGridToolbarProps> = ({
	mode,
	showFilters,
	search,
	onSearchChange,
	filter,
	onFilterChange,
	counts,
	onFillWeights
}) => (
	<Stack
		direction="row"
		alignItems="center"
		sx={{ flexWrap: 'wrap', gap: 1 }}
	>
		{showFilters && (
			<ToggleButtonGroup
				size="small"
				exclusive
				value={filter}
				onChange={(_, value) => value && onFilterChange(value)}
				sx={{ p: '3px', gap: '2px', bgcolor: 'action.hover', borderRadius: '8px' }}
			>
				<ToggleButton
					value="ALL"
					sx={segmentSx}
				>
					Todas {counts.ALL}
				</ToggleButton>
				<ToggleButton
					value="NOTICE"
					sx={segmentSx}
				>
					Con error {counts.NOTICE}
				</ToggleButton>
				<ToggleButton
					value="UNMARKED"
					sx={segmentSx}
				>
					{mode === 'execute' ? 'No subieron' : 'Desmarcadas'} {counts.UNMARKED}
				</ToggleButton>
			</ToggleButtonGroup>
		)}
		<Box sx={{ flex: 1 }} />
		{onFillWeights && (
			<Button
				size="small"
				variant="outlined"
				color="inherit"
				onClick={onFillWeights}
				startIcon={<FuseSvgIcon size={16}>heroicons-outline:scale</FuseSvgIcon>}
				sx={{
					height: 36,
					px: 1.5,
					borderRadius: '8px',
					borderColor: 'divider',
					textTransform: 'none',
					fontWeight: 600,
					whiteSpace: 'nowrap'
				}}
			>
				Completar con el último peso
			</Button>
		)}
		{showFilters && (
			<TextField
				size="small"
				placeholder="Filtrar en la lista"
				value={search}
				onChange={(e) => onSearchChange(e.target.value)}
				inputProps={{ 'aria-label': 'Filtrar en la lista' }}
				sx={{ width: { xs: '100%', sm: 240 } }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<FuseSvgIcon size={16}>heroicons-outline:funnel</FuseSvgIcon>
						</InputAdornment>
					),
					sx: { height: 36, borderRadius: '8px', fontSize: '0.82rem' }
				}}
			/>
		)}
	</Stack>
);

export default ExitGridToolbar;
