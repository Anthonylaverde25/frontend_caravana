import { Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { CASTRATION_METHOD_LABELS, CastrationMethod } from '@/core/caravans/domain/entities/Castration';

interface CastrationFieldsProps {
	castratedOn: string;
	method: CastrationMethod | null;
	notes: string;
	dateError?: string | null;
	onCastratedOnChange: (value: string) => void;
	onMethodChange: (value: CastrationMethod | null) => void;
	onNotesChange: (value: string) => void;
}

const METHODS: CastrationMethod[] = ['RUBBER_RING', 'BURDIZZO', 'SURGICAL', 'OTHER'];

export function CastrationFields({
	castratedOn,
	method,
	notes,
	dateError,
	onCastratedOnChange,
	onMethodChange,
	onNotesChange
}: CastrationFieldsProps) {
	return (
		<Stack spacing={2}>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
					gap: 2
				}}
			>
				<TextField
					label="Fecha de castración"
					type="date"
					size="small"
					variant="filled"
					value={castratedOn}
					error={Boolean(dateError)}
					helperText={dateError}
					onChange={(e) => onCastratedOnChange(e.target.value)}
					slotProps={{ inputLabel: { shrink: true } }}
					sx={{
						'& .MuiFilledInput-root': {
							bgcolor: (theme) => theme.palette.action.hover,
							borderRadius: '6px'
						}
					}}
				/>

				<FormControl
					size="small"
					variant="filled"
					sx={{
						'& .MuiFilledInput-root': {
							bgcolor: (theme) => theme.palette.action.hover,
							borderRadius: '6px'
						}
					}}
				>
					<InputLabel id="castration-method-label">Método (opcional)</InputLabel>
					<Select
						labelId="castration-method-label"
						value={method ?? ''}
						onChange={(e) => onMethodChange((e.target.value as CastrationMethod) || null)}
					>
						<MenuItem value="">
							<em>Sin especificar</em>
						</MenuItem>
						{METHODS.map((m) => (
							<MenuItem
								key={m}
								value={m}
							>
								{CASTRATION_METHOD_LABELS[m]}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>

			<TextField
				label="Observaciones (opcional)"
				size="small"
				variant="filled"
				value={notes}
				onChange={(e) => onNotesChange(e.target.value)}
				fullWidth
				multiline
				rows={2}
				sx={{
					'& .MuiFilledInput-root': {
						bgcolor: (theme) => theme.palette.action.hover,
						borderRadius: '6px'
					}
				}}
			/>
		</Stack>
	);
}

export default CastrationFields;
