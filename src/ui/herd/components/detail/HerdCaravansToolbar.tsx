import { Button, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { CaravanSummarySort } from '@/core/caravans/domain/entities/CaravanSummary';

export type HerdSexFilter = 'ALL' | 'M' | 'H';

interface HerdCaravansToolbarProps {
	search: string;
	sex: HerdSexFilter;
	sort: CaravanSummarySort;
	total: number | null;
	onSearchChange: (value: string) => void;
	onSexChange: (value: HerdSexFilter) => void;
	onSortChange: (value: CaravanSummarySort) => void;
	/** Rows ticked in the table; enables the bulk breeding action. */
	selectedCount?: number;
	onBulkBreeding?: () => void;
}

const fieldSx = { bgcolor: 'action.hover', minWidth: 160 } as const;

/** Filters of the batch caravans: tag search, sex and order. Every change goes to the server. */
export function HerdCaravansToolbar({
	search,
	sex,
	sort,
	total,
	onSearchChange,
	onSexChange,
	onSortChange,
	selectedCount = 0,
	onBulkBreeding
}: HerdCaravansToolbarProps) {
	return (
		<Stack
			direction={{ xs: 'column', md: 'row' }}
			spacing={1.5}
			alignItems={{ xs: 'stretch', md: 'center' }}
			sx={{ p: 2 }}
		>
			<Typography
				variant="subtitle2"
				sx={{ fontWeight: 800, flexGrow: 1 }}
			>
				{total === null ? 'Caravanas' : `Caravanas (${total})`}
			</Typography>
			{onBulkBreeding && selectedCount > 0 && (
				<Button
					variant="outlined"
					color="secondary"
					size="small"
					onClick={onBulkBreeding}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:heart</FuseSvgIcon>}
					sx={{ textTransform: 'none', fontWeight: 700 }}
				>
					Aptitud reproductiva ({selectedCount})
				</Button>
			)}
			<TextField
				variant="filled"
				size="small"
				placeholder="Caravana, raza o categoría"
				value={search}
				onChange={(event) => onSearchChange(event.target.value)}
				sx={{ ...fieldSx, minWidth: 240 }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
						</InputAdornment>
					)
				}}
			/>
			<TextField
				select
				variant="filled"
				size="small"
				label="Sexo"
				value={sex}
				onChange={(event) => onSexChange(event.target.value as HerdSexFilter)}
				sx={fieldSx}
			>
				<MenuItem value="ALL">Todos</MenuItem>
				<MenuItem value="H">Hembras</MenuItem>
				<MenuItem value="M">Machos</MenuItem>
			</TextField>
			<TextField
				select
				variant="filled"
				size="small"
				label="Orden"
				value={sort}
				onChange={(event) => onSortChange(event.target.value as CaravanSummarySort)}
				sx={fieldSx}
			>
				<MenuItem value="recent">Último ingreso primero</MenuItem>
				<MenuItem value="identification">Por caravana</MenuItem>
			</TextField>
		</Stack>
	);
}

export default HerdCaravansToolbar;
