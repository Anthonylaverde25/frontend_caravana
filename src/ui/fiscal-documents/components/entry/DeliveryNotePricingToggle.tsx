import { FormHelperText, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

interface DeliveryNotePricingToggleProps {
	value: boolean | null;
	onChange: (value: boolean) => void;
	error?: string;
}

/**
 * Whether the delivery note carries prices (DC14). No default: the operator says what the paper shows.
 * With prices, they enter the stock at them; without, the units wait for the invoice.
 */
export default function DeliveryNotePricingToggle({ value, onChange, error }: DeliveryNotePricingToggleProps) {
	return (
		<Stack spacing={0.75}>
			<Typography
				variant="caption"
				sx={{ color: error ? 'error.main' : 'text.secondary', fontWeight: 600 }}
			>
				Precios del remito
			</Typography>
			<ToggleButtonGroup
				exclusive
				fullWidth
				size="small"
				value={value}
				onChange={(_, next) => next !== null && onChange(next)}
				sx={{
					'& .MuiToggleButton-root': {
						textTransform: 'none',
						fontWeight: 600,
						...(error ? { borderColor: 'error.main' } : {})
					}
				}}
			>
				<ToggleButton value>Trae precios</ToggleButton>
				<ToggleButton value={false}>Sin precios</ToggleButton>
			</ToggleButtonGroup>
			<FormHelperText
				error={!!error}
				sx={{ mx: 0 }}
			>
				{error ??
					(value === false
						? 'La mercadería entra sin valor y lo toma de la factura.'
						: value
							? 'Entra al stock al precio del remito.'
							: ' ')}
			</FormHelperText>
		</Stack>
	);
}
