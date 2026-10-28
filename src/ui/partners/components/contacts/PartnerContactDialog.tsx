import { useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PartnerContact, PartnerContactInput } from '@/core/partners/domain/entities/PartnerContact';
import { contactSchema, ContactFormValues } from '../PartnerSchema';
import PartnerContactFields from './PartnerContactFields';

interface PartnerContactDialogProps {
	open: boolean;
	/** Null adds a new contact; a contact opens it to be corrected. */
	contact: PartnerContact | null;
	saving: boolean;
	/** Errors the backend tied to a field, shown on that field. */
	serverErrors?: Record<string, string[]>;
	onClose: () => void;
	onSave: (input: PartnerContactInput) => void;
}

const EMPTY: ContactFormValues = {
	name: '',
	phone: '',
	position: '',
	email: '',
	notes: ''
};

/** Adds or corrects one contact person; follows the CreateBatchDialog tokens. */
export default function PartnerContactDialog({
	open,
	contact,
	saving,
	serverErrors,
	onClose,
	onSave
}: PartnerContactDialogProps) {
	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors }
	} = useForm<ContactFormValues>({
		resolver: zodResolver(contactSchema),
		defaultValues: EMPTY
	});

	useEffect(() => {
		if (open) {
			reset(
				contact
					? {
							name: contact.name,
							phone: contact.phone,
							position: contact.position ?? '',
							email: contact.email ?? '',
							notes: contact.notes ?? ''
						}
					: EMPTY
			);
		}
	}, [open, contact, reset]);

	useEffect(() => {
		Object.entries(serverErrors ?? {}).forEach(([field, messages]) => {
			if (field in EMPTY) setError(field as keyof ContactFormValues, { message: messages[0] });
		});
	}, [serverErrors, setError]);

	const submit = (data: ContactFormValues) =>
		onSave({
			name: data.name.trim(),
			phone: data.phone.trim(),
			position: data.position?.trim() || null,
			email: data.email?.trim() || null,
			notes: data.notes?.trim() || null
		});

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' }
			}}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider'
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					{contact ? 'Editar persona de contacto' : 'Nueva persona de contacto'}
				</Typography>
				<IconButton
					onClick={onClose}
					size="small"
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			{/* Opened from inside the partner's form: React bubbles submit through the portal, so it stops here. */}
			<form
				onSubmit={(event) => {
					event.stopPropagation();
					void handleSubmit(submit)(event);
				}}
			>
				<DialogContent sx={{ p: 3 }}>
					<PartnerContactFields
						register={register}
						errors={errors}
						full
					/>
				</DialogContent>
				<DialogActions
					sx={{
						p: 2,
						px: 3,
						bgcolor: 'background.default',
						borderTop: 1,
						borderColor: 'divider',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<Button
						onClick={onClose}
						variant="text"
						sx={{
							fontWeight: 600,
							color: 'primary.main',
							textTransform: 'none'
						}}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={saving}
						variant="contained"
						sx={{
							bgcolor: 'primary.main',
							color: 'primary.contrastText',
							px: 3.5,
							fontWeight: 700,
							borderRadius: '6px',
							textTransform: 'none',
							boxShadow: 'none',
							'&:hover': { bgcolor: 'primary.dark' }
						}}
					>
						{saving ? 'Guardando...' : contact ? 'Guardar' : 'Agregar'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
