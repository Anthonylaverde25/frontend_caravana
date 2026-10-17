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

interface ServiceOrdersRejectDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (reason: string) => void;
	isSubmitting: boolean;
}

export function ServiceOrdersRejectDialog({
	open,
	onClose,
	onSubmit,
	isSubmitting
}: ServiceOrdersRejectDialogProps) {
	const [reason, setReason] = useState('');

	useEffect(() => {
		if (open) {
			setReason('');
		}
	}, [open]);

	const handleSubmit = () => {
		if (!reason.trim()) return;
		onSubmit(reason.trim());
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '8px',
					boxShadow: 2
				}
			}}
		>
			<DialogTitle
				sx={{
					p: 2,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					fontSize: '1.05rem',
					fontWeight: 700
				}}
			>
				<Typography
					variant="inherit"
					sx={{ fontWeight: 700 }}
				>
					Rechazar Orden de Servicio
				</Typography>
				<IconButton
					size="small"
					onClick={onClose}
					disabled={isSubmitting}
					sx={{ color: 'text.secondary' }}
				>
					<FuseSvgIcon size={18}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 2, pt: '8px !important' }}>
				<Stack spacing={2}>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ fontSize: '0.82rem' }}
					>
						Por favor, ingrese el motivo del rechazo para informar al equipo y registrar en la trazabilidad.
					</Typography>
					<TextField
						autoFocus
						required
						fullWidth
						multiline
						rows={3}
						size="small"
						variant="filled"
						label="Motivo del Rechazo"
						placeholder="Ej: Ratio toro/vientre insuficiente, lote no apto..."
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						sx={{ bgcolor: 'action.hover' }}
					/>
				</Stack>
			</DialogContent>

			<DialogActions sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
				<Button
					onClick={onClose}
					variant="text"
					size="small"
					disabled={isSubmitting}
					sx={{ textTransform: 'none', fontWeight: 600 }}
				>
					Cancelar
				</Button>
				<Button
					onClick={handleSubmit}
					color="error"
					variant="contained"
					size="small"
					disabled={!reason.trim() || isSubmitting}
					sx={{
						textTransform: 'none',
						fontWeight: 700,
						color: '#fff',
						borderRadius: '6px'
					}}
				>
					Rechazar Orden
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ServiceOrdersRejectDialog;
