import { Box, Stack, TextField, Typography } from '@mui/material';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import type { ExitLoadForm } from '../../hooks/useExitLoadForm';

/** The DTE of "Vender": recommended and open, never required. */
export function SellDteFields({ form }: { form: ExitLoadForm }) {
	return (
		<Box>
			<Typography sx={{ ...sectionTitleSx, mb: 1 }}>DTE (recomendado)</Typography>
			<Stack
				direction="row"
				spacing={1.5}
			>
				<TextField
					label="Número"
					variant="filled"
					fullWidth
					value={form.dte.number}
					onChange={(e) => form.setDte({ number: e.target.value })}
					InputProps={filledInputProps}
					error={!!form.errors.general['dte.dte_number']}
					helperText={form.errors.general['dte.dte_number']}
				/>
				<TextField
					label="Fecha"
					type="date"
					variant="filled"
					value={form.dte.date}
					onChange={(e) => form.setDte({ date: e.target.value })}
					InputProps={filledInputProps}
					InputLabelProps={{ shrink: true }}
					sx={{ width: 170 }}
				/>
				<TextField
					label="Cabezas"
					type="number"
					variant="filled"
					value={form.dte.heads}
					onChange={(e) => form.setDte({ heads: e.target.value })}
					InputProps={filledInputProps}
					sx={{ width: 100 }}
				/>
			</Stack>
			<Typography
				variant="caption"
				color="text.secondary"
			>
				Sin DTE el egreso se guarda igual y queda marcado para cargarlo después.
			</Typography>
		</Box>
	);
}

export default SellDteFields;
