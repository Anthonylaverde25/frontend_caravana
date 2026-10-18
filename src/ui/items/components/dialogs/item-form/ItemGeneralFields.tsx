import { Stack, TextField } from '@mui/material';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { ItemFormValues } from './ItemFormSchema';

interface ItemGeneralFieldsProps {
	register: UseFormRegister<ItemFormValues>;
	errors: FieldErrors<ItemFormValues>;
	/** Field errors the backend returned on the last save. */
	serverErrors: Record<string, string>;
	codeHint: string;
}

const inputSx = { bgcolor: 'action.hover' };

export function ItemNameField({ register, errors, serverErrors }: Omit<ItemGeneralFieldsProps, 'codeHint'>) {
	return (
		<TextField
			{...register('name')}
			label="Nombre *"
			variant="filled"
			fullWidth
			autoFocus
			error={!!errors.name || !!serverErrors.name}
			helperText={errors.name?.message ?? serverErrors.name}
			sx={inputSx}
		/>
	);
}

/** Code and description; the name goes first in the dialog, so it has its own field. */
export default function ItemGeneralFields({ register, errors, serverErrors, codeHint }: ItemGeneralFieldsProps) {
	return (
		<Stack spacing={2}>
			<TextField
				{...register('code')}
				label="Código"
				variant="filled"
				fullWidth
				error={!!errors.code || !!serverErrors.code}
				helperText={errors.code?.message ?? serverErrors.code ?? codeHint}
				inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' } }}
				sx={inputSx}
			/>
			<TextField
				{...register('description')}
				label="Descripción"
				variant="filled"
				fullWidth
				multiline
				minRows={2}
				error={!!errors.description}
				helperText={errors.description?.message}
				sx={inputSx}
			/>
		</Stack>
	);
}
