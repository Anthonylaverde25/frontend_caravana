import React from 'react';
import { Alert, Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ExitOrder } from '@/features/exit-orders/types';

interface ExitOrderNextStepProps {
	order: ExitOrder;
	onExecute: () => void;
	onAddDte: () => void;
	onClose: () => void;
}

const buttonSx = { textTransform: 'none', fontWeight: 700, borderRadius: '6px', whiteSpace: 'nowrap' } as const;

/** What is left to do with the order, in one line and one or two buttons. Nothing to do → nothing shown. */
export const ExitOrderNextStep: React.FC<ExitOrderNextStepProps> = ({ order, onExecute, onAddDte, onClose }) => {
	const open = order.status === 'ISSUED' || order.status === 'PARTIAL';

	if (!open && !order.without_dte) return null;

	const text =
		order.status === 'ISSUED'
			? `El día de la carga, registrá la salida de ${order.pending_count === 1 ? 'el animal' : `los ${order.pending_count} animales`}.`
			: order.status === 'PARTIAL'
				? `${order.pending_count === 1 ? 'Queda 1 pendiente' : `Quedan ${order.pending_count} pendientes`}: registrá otra carga o cerrá la orden si no va a salir.`
				: 'Los animales salieron sin DTE cargado.';

	return (
		<Alert
			severity={open ? 'info' : 'warning'}
			icon={
				<FuseSvgIcon size={20}>
					{open ? 'heroicons-outline:truck' : 'heroicons-outline:document-text'}
				</FuseSvgIcon>
			}
			sx={{ borderRadius: '8px', alignItems: 'center', '& .MuiAlert-message': { flexGrow: 1 } }}
		>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={1}
				alignItems={{ sm: 'center' }}
				justifyContent="space-between"
			>
				<span>{text}</span>
				<Stack
					direction="row"
					spacing={1}
				>
					{open && (
						<Button
							size="small"
							variant="contained"
							disableElevation
							onClick={onExecute}
							sx={buttonSx}
						>
							Registrar salida
						</Button>
					)}
					{order.without_dte && (
						<Button
							size="small"
							variant="outlined"
							onClick={onAddDte}
							sx={buttonSx}
						>
							Cargar DTE
						</Button>
					)}
					{order.status === 'PARTIAL' && (
						<Button
							size="small"
							variant="outlined"
							color="warning"
							onClick={onClose}
							sx={buttonSx}
						>
							Cerrar orden
						</Button>
					)}
				</Stack>
			</Stack>
		</Alert>
	);
};

export default ExitOrderNextStep;
