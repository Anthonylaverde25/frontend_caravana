import { useState } from 'react';
import { Divider, MenuItem, TextField } from '@mui/material';
import { usePartners } from '@/features/partners/hooks/usePartners';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { LIVESTOCK_BUYERS } from '@/core/partners/domain/entities/PartnerRole';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import CreatePartnerDialog from '@/ui/partners/components/CreatePartnerDialog';

interface BuyerSelectFieldProps {
	value: number | null;
	onChange: (partnerId: number) => void;
	error?: string;
	disabled?: boolean;
}

const NEW_BUYER = '__new';

/**
 * "Comprador": only partners that buy livestock (C3). One missing is created right here with that
 * role already marked; a CUIT already loaded is offered instead of a second partner (C4). The field
 * says the name only: the CUIT and the contact are read in "Previsualizar".
 */
export default function BuyerSelectField({ value, onChange, error, disabled }: BuyerSelectFieldProps) {
	const { data: buyers = [] } = usePartners(LIVESTOCK_BUYERS);
	const [creating, setCreating] = useState(false);
	const known = value == null || buyers.some((buyer) => buyer.id === value);

	return (
		<>
			<TextField
				select
				label="Comprador"
				variant="filled"
				fullWidth
				disabled={disabled}
				value={known && value != null ? value : ''}
				InputProps={filledInputProps}
				onChange={(e) => (e.target.value === NEW_BUYER ? setCreating(true) : onChange(Number(e.target.value)))}
				error={!!error}
				helperText={
					error ??
					(buyers.length === 0 ? 'Todavía no hay compradores de hacienda: creá el primero.' : undefined)
				}
			>
				{buyers.map((buyer) => (
					<MenuItem
						key={buyer.id}
						value={buyer.id}
					>
						{buyer.name}
					</MenuItem>
				))}
				{buyers.length > 0 && <Divider />}
				<MenuItem
					value={NEW_BUYER}
					sx={{ fontWeight: 700, color: 'primary.main' }}
				>
					+ Nuevo comprador…
				</MenuItem>
			</TextField>

			<CreatePartnerDialog
				open={creating}
				onClose={() => setCreating(false)}
				defaultRoles={['CUSTOMER_LIVESTOCK']}
				onSuccess={(created?: Partner) => {
					if (created?.id) onChange(created.id);
				}}
			/>
		</>
	);
}
