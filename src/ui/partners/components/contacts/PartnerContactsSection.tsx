import { useState } from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { PartnerContact, PartnerContactInput } from '@/core/partners/domain/entities/PartnerContact';
import {
	useAddPartnerContact,
	useRemovePartnerContact,
	useSetDefaultPartnerContact,
	useUpdatePartnerContact
} from '@/features/partners/hooks/usePartnerContacts';
import PartnerContactDialog from './PartnerContactDialog';
import PartnerContactsTable from './PartnerContactsTable';

interface PartnerContactsSectionProps {
	partnerId: number;
	contacts: PartnerContact[];
}

type ApiError = {
	response?: { data?: { message?: string; errors?: Record<string, string[]> } };
};

const errorsOf = (error: unknown) => (error as ApiError).response?.data;

/**
 * Container of a partner's contact persons (C6–C9): the first one becomes the default, another can
 * be marked as default, and the default goes only when it is the last one (the backend says why).
 */
export default function PartnerContactsSection({ partnerId, contacts }: PartnerContactsSectionProps) {
	const { enqueueSnackbar } = useSnackbar();
	const add = useAddPartnerContact();
	const update = useUpdatePartnerContact();
	const setDefault = useSetDefaultPartnerContact();
	const remove = useRemovePartnerContact();

	const [dialog, setDialog] = useState<{
		contact: PartnerContact | null;
	} | null>(null);
	const [serverErrors, setServerErrors] = useState<Record<string, string[]>>();
	const [rowError, setRowError] = useState<string | null>(null);

	const closeDialog = () => {
		setDialog(null);
		setServerErrors(undefined);
	};

	const save = (input: PartnerContactInput) => {
		const options = {
			onSuccess: () => {
				enqueueSnackbar(dialog?.contact ? 'Persona de contacto actualizada' : 'Persona de contacto agregada', {
					variant: 'success'
				});
				closeDialog();
			},
			onError: (error: unknown) => setServerErrors(errorsOf(error)?.errors)
		};

		if (dialog?.contact) {
			update.mutate({ partnerId, contactId: dialog.contact.id, contact: input }, options);
		} else {
			add.mutate({ partnerId, contact: input }, options);
		}
	};

	const rowAction = (error: unknown) => {
		const body = errorsOf(error);
		setRowError(body?.errors?.contact?.[0] ?? body?.message ?? 'No se pudo guardar.');
	};

	return (
		<Stack spacing={1.5}>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
			>
				<Typography
					variant="overline"
					sx={{
						color: 'text.secondary',
						fontWeight: 700,
						letterSpacing: '1px'
					}}
				>
					Personas de contacto
				</Typography>
				<Button
					size="small"
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:user-plus</FuseSvgIcon>}
					onClick={() => setDialog({ contact: null })}
					sx={{ textTransform: 'none', fontWeight: 600 }}
				>
					Agregar persona
				</Button>
			</Stack>

			<PartnerContactsTable
				contacts={contacts}
				busy={setDefault.isPending || remove.isPending}
				onEdit={(contact) => setDialog({ contact })}
				onMakeDefault={(contact) => {
					setRowError(null);
					setDefault.mutate({ partnerId, contactId: contact.id }, { onError: rowAction });
				}}
				onRemove={(contact) => {
					setRowError(null);
					remove.mutate({ partnerId, contactId: contact.id }, { onError: rowAction });
				}}
			/>
			{rowError && (
				<Alert
					severity="error"
					sx={{ fontSize: '0.8rem', py: 0.5 }}
				>
					{rowError}
				</Alert>
			)}

			<PartnerContactDialog
				open={dialog !== null}
				contact={dialog?.contact ?? null}
				saving={add.isPending || update.isPending}
				serverErrors={serverErrors}
				onClose={closeDialog}
				onSave={save}
			/>
		</Stack>
	);
}
