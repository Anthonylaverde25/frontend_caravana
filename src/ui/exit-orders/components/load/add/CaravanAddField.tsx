import React, { useState } from 'react';
import { Autocomplete, Box, InputAdornment, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ExitCandidate } from '../../../hooks/useExitCandidates';

interface CaravanAddFieldProps {
	candidates: ExitCandidate[];
	selectedIds: Set<number>;
	onAdd: (id: number) => void;
}

/**
 * "Agregar caravana…": one loose animal at a time. Enter takes the first match and clears the field
 * for the next one; an animal already in the load is listed, greyed, so it is not looked for twice.
 */
export const CaravanAddField: React.FC<CaravanAddFieldProps> = ({ candidates, selectedIds, onAdd }) => {
	const [input, setInput] = useState('');

	return (
		<Autocomplete
			size="small"
			options={candidates}
			value={null}
			inputValue={input}
			autoHighlight
			forcePopupIcon={false}
			onInputChange={(_, value, reason) => reason !== 'reset' && setInput(value)}
			onChange={(_, candidate) => {
				if (candidate) onAdd(candidate.caravan.id);

				setInput('');
			}}
			getOptionLabel={(candidate) => candidate.row.label}
			getOptionDisabled={(candidate) => selectedIds.has(candidate.caravan.id)}
			renderOption={({ key: _key, ...props }, candidate) => (
				<li
					{...props}
					key={candidate.caravan.id}
				>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Box
							component="span"
							sx={{ display: 'block', fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
						>
							{candidate.row.label}
						</Box>
						<Box
							component="span"
							sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
						>
							{`${candidate.row.categoryName ?? 'Sin categoría'} · ${candidate.row.batchName ?? 'Sin lote'}`}
						</Box>
					</Box>
					{selectedIds.has(candidate.caravan.id) && (
						<Box
							component="span"
							sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'primary.main', ml: 1 }}
						>
							Ya en la orden
						</Box>
					)}
				</li>
			)}
			noOptionsText="Ninguna caravana coincide"
			sx={{ flex: '1 1 260px', minWidth: 0 }}
			renderInput={(params) => (
				<TextField
					{...params}
					variant="filled"
					hiddenLabel
					placeholder="Agregar caravana…"
					inputProps={{ ...params.inputProps, 'aria-label': 'Agregar caravana' }}
					InputProps={{
						...params.InputProps,
						disableUnderline: true,
						startAdornment: (
							<InputAdornment
								position="start"
								sx={{ color: 'primary.main', ml: 0.5 }}
							>
								<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>
							</InputAdornment>
						),
						sx: { borderRadius: '8px', bgcolor: 'action.hover', minHeight: 40, py: '4px !important' }
					}}
				/>
			)}
		/>
	);
};

export default CaravanAddField;
