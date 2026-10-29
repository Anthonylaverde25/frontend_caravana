import React, { forwardRef } from 'react';
import { useLocation, useParams } from 'react-router';
import { Alert, Box, CircularProgress, Dialog, Slide } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import { useExitOrder } from '@/features/exit-orders/hooks/useExitOrders';
import ExitLoadScreen from './ExitLoadScreen';
import type { ExitLoadMode, ExitLoadPrefill } from './exitRows';

/** The slide-up of the Material UI full-screen dialog. */
const SlideUp = forwardRef(function SlideUp(
	props: TransitionProps & { children: React.ReactElement },
	ref: React.Ref<unknown>
) {
	return (
		<Slide
			direction="up"
			ref={ref}
			{...props}
		/>
	);
});

interface ExitLoadDialogProps {
	open: boolean;
	mode: ExitLoadMode;
	onClose: () => void;
	/** After the slide-down, when the page may leave the route. */
	onExited?: () => void;
}

/**
 * The exit load as a full-screen dialog over the tray, like "Nueva orden de destete":
 * `/exit-orders/new`, `/exit-orders/register`, `/exit-orders/:id/edit` and `/exit-orders/:id/execute`.
 * An order is loaded before the sheet starts, so it fills once; "Vender" passes what it already
 * chose in the navigation state.
 */
export const ExitLoadDialog: React.FC<ExitLoadDialogProps> = ({ open, mode, onClose, onExited }) => {
	const { id } = useParams();
	const location = useLocation();
	const orderId = Number(id) || null;
	const { data: order, isLoading, isError } = useExitOrder(orderId);
	const prefill = (location.state as { exitPrefill?: ExitLoadPrefill } | null)?.exitPrefill ?? null;
	const waiting = orderId != null && (isLoading || isError || !order);
	const blocked =
		order &&
		((mode === 'execute' && order.status !== 'ISSUED' && order.status !== 'PARTIAL') ||
			(mode === 'issue' && (order.status !== 'ISSUED' || order.exited_count > 0)));

	return (
		<Dialog
			fullScreen
			open={open}
			onClose={onClose}
			TransitionComponent={SlideUp}
			TransitionProps={{ onExited }}
			PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}
		>
			{waiting || blocked ? (
				<>
					<FullScreenEntryBar
						title={order?.code ?? 'Orden de egreso'}
						subtitle=""
						primaryLabel="Volver"
						primaryIcon="heroicons-outline:arrow-left"
						busy={isLoading}
						onClose={onClose}
						onPrimary={onClose}
					/>
					<Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
						{isError ? (
							<Alert severity="error">No se pudo cargar la orden de egreso.</Alert>
						) : blocked && order ? (
							<Alert severity="warning">
								La orden {order.code} está {order.status_label.toLowerCase()}: ya no se{' '}
								{mode === 'execute' ? 'registran salidas' : 'edita'}.
							</Alert>
						) : (
							<CircularProgress size={28} />
						)}
					</Box>
				</>
			) : (
				<ExitLoadScreen
					key={`${mode}-${orderId ?? 'new'}`}
					mode={mode}
					order={order}
					prefill={prefill}
					onClose={onClose}
				/>
			)}
		</Dialog>
	);
};

export default ExitLoadDialog;
