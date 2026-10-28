import { Stack, TextField } from '@mui/material';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type ContactFieldErrors = Partial<Record<'name' | 'phone' | 'email' | 'position' | 'notes', FieldError | undefined>>;

interface PartnerContactFieldsProps {
	// Shared by the new-partner form (under "contact.") and the contact dialog (at the root); a
	// method signature so either form's typed register fits.
	register(name: string): UseFormRegisterReturn;
	errors?: ContactFieldErrors;
	prefix?: string;
	/** Position and notes too: the contact dialog shows them, the new-partner block does not. */
	full?: boolean;
}

/**
 * A contact person's fields (C6): name and phone are required, the rest optional.
 */
export default function PartnerContactFields({ register, errors, prefix, full = false }: PartnerContactFieldsProps) {
	const name = (field: string) => (prefix ? `${prefix}.${field}` : field);
	const fieldProps = (field: keyof ContactFieldErrors) => ({
		...register(name(field)),
		variant: 'filled' as const,
		fullWidth: true,
		error: !!errors?.[field],
		helperText: errors?.[field]?.message,
		sx: { bgcolor: 'action.hover' }
	});

	return (
		<Stack spacing={2}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={2}
			>
				<TextField
					{...fieldProps('name')}
					label="Nombre"
					placeholder="Juan Pérez, Administración…"
				/>
				{full && (
					<TextField
						{...fieldProps('position')}
						label="Cargo o función (opcional)"
						placeholder="Comprador, cobranzas…"
					/>
				)}
			</Stack>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={2}
			>
				<TextField
					{...fieldProps('phone')}
					label="Teléfono / Celular"
				/>
				<TextField
					{...fieldProps('email')}
					label="Email (opcional)"
					type="email"
				/>
			</Stack>
			{full && (
				<TextField
					{...fieldProps('notes')}
					label="Notas (opcional)"
					placeholder="Llamar después de las 14"
					multiline
					rows={2}
				/>
			)}
		</Stack>
	);
}
