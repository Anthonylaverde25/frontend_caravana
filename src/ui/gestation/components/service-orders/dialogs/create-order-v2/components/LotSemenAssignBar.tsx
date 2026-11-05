import React, { useState } from 'react';
import { Box, Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';
import { SelectedBatchState } from '../types';

const ALL_LOTS = 0;

interface LotSemenAssignBarProps {
	lots: SelectedBatchState[];
	options: SemenOption[];
	plannedStraws: Record<number, number>;
	onAssign: (femaleIds: number[], itemId: number | null) => void;
}

/**
 * How many picked females each semen has, and one semen given at once to all of them or to those of
 * one batch: the typical IATF. Each row can still change its own.
 */
export const LotSemenAssignBar: React.FC<LotSemenAssignBarProps> = ({ lots, options, plannedStraws, onAssign }) => {
	const [scope, setScope] = useState(ALL_LOTS);
	const [itemId, setItemId] = useState<number | ''>('');
	const scoped = lots.some((lot) => lot.batchId === scope) ? scope : ALL_LOTS;
	const allIds = lots.flatMap((lot) => lot.selectedCaravanIds);
	const inScope =
		scoped === ALL_LOTS ? allIds : (lots.find((lot) => lot.batchId === scoped)?.selectedCaravanIds ?? []);
	const planned = Object.values(plannedStraws).reduce((sum, straws) => sum + straws, 0);

	return (
		<Stack
			direction={{ xs: 'column', xl: 'row' }}
			spacing={1.5}
			alignItems={{ xl: 'center' }}
			justifyContent="space-between"
			sx={{ px: 1.5, py: 1, borderRadius: '6px', border: '1px solid', borderColor: 'divider' }}
		>
			<Stack
				direction="row"
				spacing={1}
				flexWrap="wrap"
				useFlexGap
				alignItems="center"
			>
				{options
					.filter((option) => plannedStraws[option.itemId])
					.map((option) => (
						<Chip
							key={option.itemId}
							size="small"
							label={`${option.label} · ${plannedStraws[option.itemId]}`}
							sx={{ fontWeight: 600 }}
						/>
					))}
				<Chip
					size="small"
					variant="outlined"
					label={`Se decide en la manga · ${allIds.length - planned}`}
				/>
			</Stack>

			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
			>
				<TextField
					select
					size="small"
					label="Asignar a"
					value={scoped}
					onChange={(e) => setScope(Number(e.target.value))}
					sx={{ minWidth: 190 }}
				>
					<MenuItem value={ALL_LOTS}>Todos los marcados ({allIds.length})</MenuItem>
					{lots.map((lot) => (
						<MenuItem
							key={lot.batchId}
							value={lot.batchId}
						>
							{lot.batchName} ({lot.selectedCaravanIds.length})
						</MenuItem>
					))}
				</TextField>
				<Box sx={{ minWidth: 220 }}>
					<TextField
						select
						size="small"
						fullWidth
						label="Semen"
						value={itemId}
						onChange={(e) => setItemId(e.target.value === '' ? '' : Number(e.target.value))}
						SelectProps={{ displayEmpty: true }}
						InputLabelProps={{ shrink: true }}
					>
						<MenuItem value="">Se decide en la manga</MenuItem>
						{options.map((option) => (
							<MenuItem
								key={option.itemId}
								value={option.itemId}
							>
								{option.label}
							</MenuItem>
						))}
					</TextField>
				</Box>
				<Button
					variant="outlined"
					size="small"
					onClick={() => onAssign(inScope, itemId === '' ? null : itemId)}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						borderRadius: '6px',
						height: 38,
						whiteSpace: 'nowrap'
					}}
				>
					Asignar ({inScope.length})
				</Button>
			</Stack>
		</Stack>
	);
};

export default LotSemenAssignBar;
