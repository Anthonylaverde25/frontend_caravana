import { FormHelperText, Stack, Typography } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { PartnerFormValues } from '../PartnerSchema';
import PartnerRoleCheckboxes from '../PartnerRoleCheckboxes';

interface PartnerRoleFieldsProps {
	control: Control<PartnerFormValues>;
	errors: FieldErrors<PartnerFormValues>;
}

/**
 * What the partner does with us. Declared, not inferred: a livestock seller just registered has no
 * farms yet. At least one role is required (checked when the main button is clicked).
 */
export default function PartnerRoleFields({ control, errors }: PartnerRoleFieldsProps) {
	const error = errors.roles?.message ?? errors.roles?.root?.message;

	return (
		<Stack spacing={1}>
			<Typography
				variant="overline"
				sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '1px' }}
			>
				Roles
			</Typography>
			<Controller
				name="roles"
				control={control}
				render={({ field }) => (
					<PartnerRoleCheckboxes
						value={field.value ?? []}
						onChange={field.onChange}
					/>
				)}
			/>
			{error && <FormHelperText error>{error}</FormHelperText>}
		</Stack>
	);
}
