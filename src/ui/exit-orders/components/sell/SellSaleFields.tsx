import { Stack, TextField } from '@mui/material';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import type { ExitLoadForm } from '../../hooks/useExitLoadForm';
import { localToday } from '../exitOrderFormat';
import BuyerSelectField from '../load/BuyerSelectField';

/** Who bought and when, side by side in "Vender". */
export function SellSaleFields({ form }: { form: ExitLoadForm }) {
	return (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			spacing={2}
		>
			<BuyerSelectField
				value={form.header.buyerId}
				onChange={(buyerId) => form.setHeader({ buyerId })}
				error={form.errors.general.buyer_partner_id}
			/>
			<TextField
				label="Fecha del egreso"
				type="date"
				variant="filled"
				value={form.header.exitDate}
				onChange={(e) => form.setHeader({ exitDate: e.target.value })}
				InputProps={filledInputProps}
				InputLabelProps={{ shrink: true }}
				inputProps={{ max: localToday() }}
				error={!!form.errors.general.exit_date}
				helperText={form.errors.general.exit_date}
				sx={{ minWidth: { sm: 180 } }}
			/>
		</Stack>
	);
}

export default SellSaleFields;
