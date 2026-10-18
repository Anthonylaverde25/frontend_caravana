import { Stack, TextField, Typography } from '@mui/material';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import { digitsOnly, padDigits } from '@/core/fiscal/domain/rules/documentNumber';

interface DocumentNumberFieldProps {
	requiresNumber: boolean;
	pointOfSale: string;
	number: string;
	reference: string;
	onChange: (patch: { pointOfSale?: string; number?: string; reference?: string }) => void;
	errors: Record<string, string>;
}

/**
 * Point of sale and number as the paper prints them ("0004-00001050"), padded with zeros on blur. A
 * ticket has a free reference instead.
 */
export default function DocumentNumberField({
	requiresNumber,
	pointOfSale,
	number,
	reference,
	onChange,
	errors
}: DocumentNumberFieldProps) {
	if (!requiresNumber) {
		return (
			<TextField
				label="Referencia del ticket"
				variant="filled"
				fullWidth
				value={reference}
				onChange={(e) => onChange({ reference: e.target.value })}
				InputProps={filledInputProps}
				error={!!errors.reference}
				helperText={errors.reference ?? 'Opcional: el número que figure, si figura.'}
			/>
		);
	}

	const error = errors.point_of_sale ?? errors.number;

	return (
		<Stack spacing={0.5}>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
			>
				<TextField
					label="PV"
					variant="filled"
					value={pointOfSale}
					onChange={(e) => onChange({ pointOfSale: digitsOnly(e.target.value, 5) })}
					onBlur={() => onChange({ pointOfSale: padDigits(pointOfSale, 4) })}
					InputProps={filledInputProps}
					inputProps={{ inputMode: 'numeric', style: { fontFamily: 'monospace' } }}
					error={!!errors.point_of_sale}
					sx={{ width: 120 }}
				/>
				<Typography color="text.secondary">-</Typography>
				<TextField
					label="Número"
					variant="filled"
					fullWidth
					value={number}
					onChange={(e) => onChange({ number: digitsOnly(e.target.value, 8) })}
					onBlur={() => onChange({ number: padDigits(number, 8) })}
					InputProps={filledInputProps}
					inputProps={{ inputMode: 'numeric', style: { fontFamily: 'monospace' } }}
					error={!!errors.number}
				/>
			</Stack>
			{error && (
				<Typography
					variant="caption"
					color="error"
					sx={{ pl: 1.5 }}
				>
					{error}
				</Typography>
			)}
		</Stack>
	);
}
