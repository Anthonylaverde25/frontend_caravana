import { InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type PendingFilter = 'ALL' | 'UNPRICED' | 'CONSUMED';

interface PendingDeliveryNotesToolbarProps {
	search: string;
	onSearch: (value: string) => void;
	filter: PendingFilter;
	onFilter: (value: PendingFilter) => void;
	counts: Record<PendingFilter, number>;
}

const FILTERS: { value: PendingFilter; label: string }[] = [
	{ value: 'ALL', label: 'Todos' },
	{ value: 'UNPRICED', label: 'Sin precio' },
	{ value: 'CONSUMED', label: 'Con consumo sin costo' }
];

/** Search by provider or number, and the filters with their counts. */
export default function PendingDeliveryNotesToolbar({
	search,
	onSearch,
	filter,
	onFilter,
	counts
}: PendingDeliveryNotesToolbarProps) {
	return (
		<Stack
			direction={{ xs: 'column', md: 'row' }}
			spacing={1.5}
			alignItems={{ md: 'center' }}
		>
			<TextField
				size="small"
				placeholder="Proveedor o número"
				value={search}
				onChange={(e) => onSearch(e.target.value)}
				sx={{ minWidth: 260 }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
						</InputAdornment>
					)
				}}
			/>
			<ToggleButtonGroup
				size="small"
				exclusive
				value={filter}
				onChange={(_, value) => value && onFilter(value)}
				sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 1.5 } }}
			>
				{FILTERS.map((f) => (
					<ToggleButton
						key={f.value}
						value={f.value}
					>
						{f.label} ({counts[f.value]})
					</ToggleButton>
				))}
			</ToggleButtonGroup>
		</Stack>
	);
}
