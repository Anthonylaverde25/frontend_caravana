import { useState } from 'react';
import { Typography } from '@mui/material';
import CatalogDialogFrame from '../CatalogDialogFrame';
import { readApiErrors } from '../apiErrors';

interface SetActiveDialogProps {
	open: boolean;
	onClose: () => void;
	/** "Ivermectina 1%", "la unidad Gramo"... */
	subject: string;
	/** The state it moves to. */
	activate: boolean;
	consequence: string;
	onConfirm: () => Promise<unknown>;
}

/** Confirmation of deactivating or reactivating a catalog record: an app dialog, never confirm(). */
export default function SetActiveDialog({ open, onClose, subject, activate, consequence, onConfirm }: SetActiveDialogProps) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const confirm = async () => {
		setPending(true);
		setError(null);
		try {
			await onConfirm();
			onClose();
		} catch (e) {
			setError(readApiErrors(e, 'No se pudo cambiar el estado.').domain ?? 'No se pudo cambiar el estado.');
		} finally {
			setPending(false);
		}
	};

	return (
		<CatalogDialogFrame
			open={open}
			title={activate ? `Reactivar ${subject}` : `Desactivar ${subject}`}
			onClose={() => {
				setError(null);
				onClose();
			}}
			onSubmit={confirm}
			submitLabel={activate ? 'Reactivar' : 'Desactivar'}
			pending={pending}
			error={error}
			maxWidth="xs"
		>
			<Typography sx={{ fontSize: '0.9rem' }}>{consequence}</Typography>
		</CatalogDialogFrame>
	);
}
