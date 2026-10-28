import { useState } from 'react';
import { Divider, MenuItem, TextField } from '@mui/material';
import { Partner } from '@/core/partners/domain/entities/Partner';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import CreatePartnerDialog from '@/ui/partners/components/CreatePartnerDialog';
import { PartnerRole } from '@/core/partners/domain/entities/PartnerRole';

interface ProviderSelectFieldProps {
	providers: Partner[];
	onPick: (providerId: number) => void;
	error?: string;
}

const NEW_PROVIDER = '__new';
const ITEMS_ROLE: PartnerRole[] = ['SUPPLIER_ITEMS'];

/**
 * "Razón social" of a provider document. One missing from the portfolio is created right here and
 * comes back selected: the paper is in hand, and the lines already typed must not be lost.
 */
export default function ProviderSelectField({ providers, onPick, error }: ProviderSelectFieldProps) {
	const [creating, setCreating] = useState(false);

	return (
		<>
			<TextField
				select
				label="Razón social"
				variant="filled"
				fullWidth
				value=""
				InputProps={filledInputProps}
				onChange={(e) => {
					if (e.target.value === NEW_PROVIDER) {
						setCreating(true);
						return;
					}

					onPick(Number(e.target.value));
				}}
				error={!!error}
				helperText={error}
			>
				{providers.map((p) => (
					<MenuItem
						key={p.id}
						value={p.id}
					>
						{p.name}
					</MenuItem>
				))}
				<Divider />
				<MenuItem
					value={NEW_PROVIDER}
					sx={{ fontWeight: 700, color: 'primary.main' }}
				>
					+ Nuevo proveedor…
				</MenuItem>
			</TextField>

			<CreatePartnerDialog
				open={creating}
				onClose={() => setCreating(false)}
				defaultRoles={ITEMS_ROLE}
				onSuccess={(created?: Partner) => {
					if (created?.id) onPick(created.id);
				}}
			/>
		</>
	);
}
