import { Chip, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PHASE_LABELS, type ServiceOrderPhase } from '../../utils/serviceOrderPhase';

export type ServiceOrderStatusFilter = 'ALL' | ServiceOrderPhase;

interface ServiceOrdersToolbarProps {
	search: string;
	onSearchChange: (value: string) => void;
	status: ServiceOrderStatusFilter;
	onStatusChange: (value: ServiceOrderStatusFilter) => void;
	batchId: number | 'ALL';
	onBatchChange: (value: number | 'ALL') => void;
	batchOptions: { id: number; name: string }[];
	batchFilterLockedName?: string | null;
	onClearLockedBatch?: () => void;
	total: number;
}

const PHASE_FILTER_ORDER: ServiceOrderPhase[] = [
	'IN_SERVICE',
	'DIAGNOSING',
	'BULLS_WITHDRAWN',
	'READY_TO_CLOSE',
	'DIAGNOSED',
	'DRAFT',
	'REJECTED',
	'CANCELLED'
];

const fieldSx = { bgcolor: 'action.hover', minWidth: 160 } as const;

export function ServiceOrdersToolbar({
	search,
	onSearchChange,
	status,
	onStatusChange,
	batchId,
	onBatchChange,
	batchOptions,
	batchFilterLockedName,
	onClearLockedBatch,
	total
}: ServiceOrdersToolbarProps) {
	return (
		<Stack
			direction={{ xs: 'column', md: 'row' }}
			spacing={1.5}
			alignItems={{ xs: 'stretch', md: 'center' }}
			sx={{ p: 2 }}
		>
			<Stack
				direction="row"
				alignItems="center"
				spacing={1}
				sx={{ flexGrow: 1 }}
			>
				<Typography
					variant="subtitle2"
					sx={{ fontWeight: 800 }}
				>
					Órdenes de Servicio ({total})
				</Typography>
				{batchFilterLockedName && (
					<Chip
						label={`Lote: ${batchFilterLockedName}`}
						size="small"
						color="primary"
						variant="outlined"
						onDelete={onClearLockedBatch}
						sx={{ fontWeight: 600, fontSize: '0.72rem' }}
					/>
				)}
			</Stack>

			{/* Search */}
			<TextField
				variant="filled"
				size="small"
				placeholder="Buscar por código u observaciones..."
				value={search}
				onChange={(event) => onSearchChange(event.target.value)}
				sx={{ ...fieldSx, minWidth: { xs: '100%', md: 260 } }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
						</InputAdornment>
					)
				}}
			/>

			{/* Filter by Status */}
			<TextField
				select
				variant="filled"
				size="small"
				label="Estado"
				value={status}
				onChange={(event) => onStatusChange(event.target.value as ServiceOrderStatusFilter)}
				sx={fieldSx}
			>
				<MenuItem value="ALL">Todos los estados</MenuItem>
				{PHASE_FILTER_ORDER.map((phase) => (
					<MenuItem key={phase} value={phase}>
						{PHASE_LABELS[phase]}
					</MenuItem>
				))}
			</TextField>

			{/* Filter by Batch (only if not locked by URL parameter) */}
			{!batchFilterLockedName && batchOptions.length > 0 && (
				<TextField
					select
					variant="filled"
					size="small"
					label="Lote"
					value={batchId}
					onChange={(event) => {
						const val = event.target.value;
						onBatchChange(val === 'ALL' ? 'ALL' : Number(val));
					}}
					sx={{ ...fieldSx, minWidth: 180 }}
				>
					<MenuItem value="ALL">Todos los lotes</MenuItem>
					{batchOptions.map((b) => (
						<MenuItem
							key={b.id}
							value={b.id}
						>
							{b.name}
						</MenuItem>
					))}
				</TextField>
			)}
		</Stack>
	);
}

export default ServiceOrdersToolbar;
