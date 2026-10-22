import React from 'react';
import { FormControl, InputAdornment, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { CommitmentFilter, SexFilter } from './birthsTypes';

interface BatchOption {
	key: string;
	name: string;
	count: number;
}

interface BirthsFilterBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	batchKey: string | 'all';
	onBatchChange: (key: string | 'all') => void;
	batchOptions: BatchOption[];
	commitment: CommitmentFilter;
	onCommitmentChange: (value: CommitmentFilter) => void;
	commitmentCounts: Record<CommitmentFilter, number>;
	sex: SexFilter;
	onSexChange: (value: SexFilter) => void;
}

const toggleSx = { px: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap' } as const;

/** Search, batch, commitment (free or in a weaning order) and sex: what the batches below show. */
export const BirthsFilterBar: React.FC<BirthsFilterBarProps> = ({
	searchQuery,
	onSearchChange,
	batchKey,
	onBatchChange,
	batchOptions,
	commitment,
	onCommitmentChange,
	commitmentCounts,
	sex,
	onSexChange
}) => (
	<Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
		<TextField
			size="small"
			placeholder="Buscar cría o madre…"
			value={searchQuery}
			onChange={(e) => onSearchChange(e.target.value)}
			sx={{ width: { xs: '100%', sm: 320 }, '& .MuiOutlinedInput-root': { borderRadius: '6px', bgcolor: 'background.paper' } }}
			InputProps={{
				startAdornment: (
					<InputAdornment position="start">
						<FuseSvgIcon size={16} color="action">
							heroicons-outline:magnifying-glass
						</FuseSvgIcon>
					</InputAdornment>
				)
			}}
		/>

		<FormControl size="small" sx={{ minWidth: 210, bgcolor: 'background.paper', borderRadius: '6px' }}>
			<Select
				value={batchKey}
				onChange={(e) => onBatchChange(e.target.value as string)}
				inputProps={{ 'aria-label': 'Lote' }}
				sx={{ borderRadius: '6px', fontSize: '0.84rem' }}
			>
				<MenuItem value="all" sx={{ fontSize: '0.84rem' }}>
					Todos los lotes ({batchOptions.length})
				</MenuItem>
				{batchOptions.map((opt) => (
					<MenuItem key={opt.key} value={opt.key} sx={{ fontSize: '0.84rem' }}>
						{opt.name} ({opt.count})
					</MenuItem>
				))}
			</Select>
		</FormControl>

		<ToggleButtonGroup
			size="small"
			exclusive
			value={commitment}
			onChange={(_, value: CommitmentFilter | null) => value && onCommitmentChange(value)}
			aria-label="Compromiso"
			sx={{ height: 38, bgcolor: 'background.paper' }}
		>
			<ToggleButton value="all" sx={toggleSx}>
				Todas ({commitmentCounts.all})
			</ToggleButton>
			<ToggleButton value="free" sx={toggleSx}>
				Sin orden ({commitmentCounts.free})
			</ToggleButton>
			<ToggleButton value="weaning" sx={toggleSx}>
				En orden de destete ({commitmentCounts.weaning})
			</ToggleButton>
		</ToggleButtonGroup>

		<ToggleButtonGroup
			size="small"
			exclusive
			value={sex}
			onChange={(_, value: SexFilter | null) => value && onSexChange(value)}
			aria-label="Sexo"
			sx={{ height: 38, bgcolor: 'background.paper' }}
		>
			<ToggleButton value="ALL" sx={toggleSx}>
				Todos
			</ToggleButton>
			<ToggleButton value="M" sx={toggleSx}>
				♂ Machos
			</ToggleButton>
			<ToggleButton value="H" sx={toggleSx}>
				♀ Hembras
			</ToggleButton>
		</ToggleButtonGroup>
	</Stack>
);

export default BirthsFilterBar;
