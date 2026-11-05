import React from 'react';
import { Box, Button, CircularProgress, Dialog, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ServiceOrderConfirmSummary, { ServiceOrderConfirmSummaryProps } from './ServiceOrderConfirmSummary';

interface ServiceOrderConfirmDialogProps extends ServiceOrderConfirmSummaryProps {
	open: boolean;
	submitLabel: string;
	busy: boolean;
	/** "Volver": back to the sheet, with everything still declared there. */
	onClose: () => void;
	onConfirm: () => void;
}

/**
 * The confirmation over the sheet, read back as a whole: what each batch gets and what will happen.
 * Nothing is edited here; "Volver" goes back to the dialog that declared it.
 */
export const ServiceOrderConfirmDialog: React.FC<ServiceOrderConfirmDialogProps> = ({
	open,
	submitLabel,
	busy,
	onClose,
	onConfirm,
	...summary
}) => {
	const registering = summary.mode === 'register';

	return (
		<Dialog
			open={open}
			onClose={busy ? undefined : onClose}
			fullWidth
			maxWidth="sm"
			PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
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
				<Box sx={{ minWidth: 0 }}>
					<Typography
						variant="h6"
						sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
					>
						{registering ? 'Registrar orden de servicio' : 'Confirmar orden de servicio'}
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
					>
						{registering
							? 'El servicio ya ocurrió: revisá lo que se va a registrar. Para cambiar algo, volvé.'
							: 'Revisá lo que dice la orden antes de confirmarla. Para cambiar algo, volvé.'}
					</Typography>
				</Box>
				<IconButton
					onClick={onClose}
					disabled={busy}
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			<Box sx={{ p: 3 }}>
				<ServiceOrderConfirmSummary {...summary} />
			</Box>

			<Box
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 1
				}}
			>
				<Button
					variant="text"
					onClick={onClose}
					disabled={busy}
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Volver
				</Button>
				<Button
					variant="contained"
					onClick={onConfirm}
					disabled={busy}
					startIcon={
						busy ? (
							<CircularProgress
								size={14}
								color="inherit"
							/>
						) : (
							<FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>
						)
					}
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
					{submitLabel}
				</Button>
			</Box>
		</Dialog>
	);
};

export default ServiceOrderConfirmDialog;
