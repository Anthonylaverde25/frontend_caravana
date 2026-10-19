import { useState, useEffect } from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';

interface InternalNotesDialogProps {
	open: boolean;
	initialNote: string;
	onClose: () => void;
	onSave: (note: string) => void;
}

/**
 * Modal to enter or edit internal notes for the fiscal document.
 * Follows canonical modal design tokens: PaperProps borderRadius: 8px, boxShadow: 3.
 */
export default function InternalNotesDialog({
	open,
	initialNote,
	onClose,
	onSave
}: InternalNotesDialogProps) {
	const [value, setValue] = useState(initialNote);

	useEffect(() => {
		if (open) {
			setValue(initialNote);
		}
	}, [open, initialNote]);

	const handleSave = () => {
		onSave(value);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '8px',
					boxShadow: 3
				}
			}}
		>
			<DialogTitle
				sx={{
					m: 0,
					px: 3,
					py: 2,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider'
				}}
			>
				<Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
					Notas internas del comprobante
				</Typography>
				<IconButton
					aria-label="Cerrar"
					onClick={onClose}
					size="small"
					sx={{ color: 'text.secondary' }}
				>
					<FuseSvgIcon size={18}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</DialogTitle>
			<DialogContent sx={{ p: 3 }}>
				<Stack spacing={1.5} sx={{ mt: 1 }}>
					<Typography variant="body2" color="text.secondary">
						Agregá anotaciones, observaciones operativas o detalles para auditoría interna.
					</Typography>
					<TextField
						label="Contenido de la nota"
						variant="filled"
						fullWidth
						multiline
						minRows={4}
						maxRows={10}
						placeholder="Escribí aquí las notas u observaciones internas..."
						value={value}
						onChange={(e) => setValue(e.target.value)}
						InputProps={filledInputProps}
						autoFocus
					/>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
				<Button
					variant="outlined"
					color="inherit"
					onClick={onClose}
					sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					color="primary"
					onClick={handleSave}
					sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', boxShadow: 'none' }}
				>
					Guardar nota
				</Button>
			</DialogActions>
		</Dialog>
	);
}
