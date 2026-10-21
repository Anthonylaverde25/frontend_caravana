import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Autocomplete, Box, CircularProgress, InputAdornment, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { useCaravansSummary } from '@/features/caravans/hooks/useCaravansSummary';
import { herdBatchPath, sexLabel, UNASSIGNED_BATCH } from '../../utils/herdFormat';

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;
const MAX_RESULTS = 8;

/**
 * Finds a caravan anywhere in the own herd and opens its batch with the caravan highlighted.
 * Asks the server for a few matches: the herd is never loaded to search it.
 */
export function HerdCaravanSearch() {
	const navigate = useNavigate();
	const [input, setInput] = useState('');
	const [term, setTerm] = useState('');

	useEffect(() => {
		const handle = setTimeout(() => setTerm(input.trim()), DEBOUNCE_MS);
		return () => clearTimeout(handle);
	}, [input]);

	const enabled = term.length >= MIN_CHARS;
	const { data, isFetching } = useCaravansSummary({ search: term, perPage: MAX_RESULTS, enabled });
	const options = enabled ? (data?.data ?? []) : [];

	const open = (caravan: CaravanSummary | null) => {
		if (!caravan) return;

		navigate(herdBatchPath(caravan.batch_id ?? UNASSIGNED_BATCH, caravan));
	};

	return (
		<Autocomplete<CaravanSummary>
			options={options}
			filterOptions={(all) => all}
			getOptionLabel={(option) => option.label || option.identification || ''}
			isOptionEqualToValue={(a, b) => a.id === b.id}
			loading={enabled && isFetching}
			noOptionsText={enabled ? 'Sin coincidencias' : `Escribí al menos ${MIN_CHARS} caracteres`}
			inputValue={input}
			onInputChange={(_, value, reason) => reason !== 'reset' && setInput(value)}
			onChange={(_, value) => open(value)}
			value={null}
			sx={{ width: { xs: '100%', md: 360 } }}
			renderOption={(props, option) => (
				<Box
					component="li"
					{...props}
					key={option.id}
				>
					<Box>
						<Typography
							variant="body2"
							sx={{ fontWeight: 700, fontFamily: 'monospace' }}
						>
							{option.label || option.identification}
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
						>
							{`${sexLabel(option.sex)} · ${option.category_name ?? 'Sin categoría'} · ${option.batch_name ?? 'Sin lote'}`}
						</Typography>
					</Box>
				</Box>
			)}
			renderInput={(params) => (
				<TextField
					{...params}
					variant="filled"
					size="small"
					placeholder="Buscar caravana en toda la hacienda"
					sx={{ bgcolor: 'action.hover' }}
					InputProps={{
						...params.InputProps,
						startAdornment: (
							<InputAdornment position="start">
								<FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
							</InputAdornment>
						),
						endAdornment: (
							<>
								{enabled && isFetching ? <CircularProgress size={16} /> : null}
								{params.InputProps.endAdornment}
							</>
						)
					}}
				/>
			)}
		/>
	);
}

export default HerdCaravanSearch;
