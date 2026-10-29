import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useExitOrder } from '@/features/exit-orders/hooks/useExitOrders';
import {
	useCancelExitOrder,
	useCloseExitOrder,
	useRemoveExitOrderDte
} from '@/features/exit-orders/hooks/useExitOrderMutations';
import type { ExitOrder, ExitOrderLine } from '@/features/exit-orders/types';
import TransferOrderReasonDialog from '@/ui/transfer-orders/components/TransferOrderReasonDialog';
import ExitOrderStatusChip, { ExitOrderRegisteredChip, WithoutDteChip } from './ExitOrderStatusChip';
import ExitOrderDetailSummary from './detail/ExitOrderDetailSummary';
import ExitOrderCategoryBalance from './detail/ExitOrderCategoryBalance';
import ExitOrderNextStep from './detail/ExitOrderNextStep';
import ExitOrderRollTable from './detail/ExitOrderRollTable';
import ExitOrderDteList from './detail/ExitOrderDteList';
import ExitOrderHistoryTimeline from './detail/ExitOrderHistoryTimeline';
import AddExitDteDialog from './detail/AddExitDteDialog';
import ExitLineDeathDialog from './detail/ExitLineDeathDialog';

interface ExitOrderDetailDrawerProps {
	orderId: number | null;
	onClose: () => void;
}

type ClosingAction = 'cancel' | 'close' | null;

const actionSx = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

const closingCopy = (order: ExitOrder, action: Exclude<ClosingAction, null>) =>
	action === 'cancel'
		? {
				title: 'Anular orden',
				explanation:
					'Ningún animal salió con esta orden. Queda anulada con su motivo y los animales dejan de estar comprometidos.',
				confirmLabel: 'Anular orden'
			}
		: {
				title: 'Cerrar orden',
				explanation: `Salieron ${order.exited_count} de ${order.planned_head_count}. La orden se da por terminada y los ${order.pending_count} pendientes quedan como que no salieron.`,
				confirmLabel: 'Cerrar orden'
			};

/**
 * One exit order in full: figures, next step, roll, DTEs and history. The actions follow the
 * state: edit and cancel while nothing left, a new load or closing while it is partial, a DTE
 * whenever animals left without one.
 */
export const ExitOrderDetailDrawer: React.FC<ExitOrderDetailDrawerProps> = ({ orderId, onClose }) => {
	const navigate = useNavigate();
	const { data: order, isLoading } = useExitOrder(orderId);
	const cancel = useCancelExitOrder();
	const close = useCloseExitOrder();
	const removeDte = useRemoveExitOrderDte();
	const [closing, setClosing] = useState<ClosingAction>(null);
	const [addingDte, setAddingDte] = useState(false);
	const [dying, setDying] = useState<ExitOrderLine | null>(null);

	const isOpen = order?.status === 'ISSUED' || order?.status === 'PARTIAL';
	const untouched = order?.status === 'ISSUED' && order.exited_count === 0;

	const confirmClosing = (reason: string | null) => {
		if (!order || !closing) return;

		const mutation = closing === 'cancel' ? cancel : close;
		mutation.mutate({ id: order.id, reason: reason ?? '' }, { onSuccess: () => setClosing(null) });
	};

	return (
		<Drawer
			anchor="right"
			open={orderId != null}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: '100%', md: 760 },
					boxSizing: 'border-box',
					display: 'flex',
					flexDirection: 'column'
				}
			}}
		>
			<Box
				sx={{
					p: 2.5,
					borderBottom: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					alignItems: 'center',
					gap: 1.5
				}}
			>
				<FuseSvgIcon size={22}>heroicons-outline:arrow-up-tray</FuseSvgIcon>
				<Box sx={{ flexGrow: 1, minWidth: 0 }}>
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						flexWrap="wrap"
						useFlexGap
					>
						<Typography sx={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
							{order?.code ?? 'Orden de egreso'}
						</Typography>
						{order && <ExitOrderStatusChip status={order.status} />}
						{order?.kind === 'REGISTERED' && <ExitOrderRegisteredChip />}
						{order?.without_dte && <WithoutDteChip />}
					</Stack>
					{order && (
						<Typography
							variant="caption"
							color="text.secondary"
						>
							{order.reason_label} · {order.buyer?.name ?? 'sin comprador'}
						</Typography>
					)}
				</Box>
				<IconButton
					size="small"
					onClick={onClose}
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			{isLoading || !order ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress size={28} />
				</Box>
			) : (
				<>
					<Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1 }}>
						<Stack spacing={2.5}>
							<ExitOrderNextStep
								order={order}
								onExecute={() => navigate(`/exit-orders/${order.id}/execute`)}
								onAddDte={() => setAddingDte(true)}
								onClose={() => setClosing('close')}
							/>
							<ExitOrderDetailSummary order={order} />
							<ExitOrderCategoryBalance order={order} />
							<Divider />
							<ExitOrderRollTable
								order={order}
								onRegisterDeath={isOpen ? setDying : undefined}
							/>
							<Divider />
							<ExitOrderDteList
								order={order}
								onRemove={
									order.status !== 'CANCELLED'
										? (dte) => removeDte.mutate({ id: order.id, dteId: dte.id })
										: undefined
								}
							/>
							<Divider />
							<ExitOrderHistoryTimeline history={order.history} />
						</Stack>
					</Box>

					<Box
						sx={{
							p: 2,
							borderTop: '1px solid',
							borderColor: 'divider',
							display: 'flex',
							gap: 1,
							flexWrap: 'wrap'
						}}
					>
						{untouched && (
							<Button
								variant="outlined"
								color="inherit"
								startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
								onClick={() => navigate(`/exit-orders/${order.id}/edit`)}
								sx={actionSx}
							>
								Editar
							</Button>
						)}
						{order.exited_count > 0 && order.status !== 'CANCELLED' && !order.without_dte && (
							<Button
								variant="outlined"
								color="inherit"
								startIcon={<FuseSvgIcon size={16}>heroicons-outline:document-plus</FuseSvgIcon>}
								onClick={() => setAddingDte(true)}
								sx={actionSx}
							>
								Agregar DTE
							</Button>
						)}
						<Box sx={{ flexGrow: 1 }} />
						{untouched && (
							<Button
								variant="outlined"
								color="error"
								onClick={() => setClosing('cancel')}
								sx={actionSx}
							>
								Anular…
							</Button>
						)}
					</Box>

					{closing && (
						<TransferOrderReasonDialog
							open
							onClose={() => setClosing(null)}
							onConfirm={confirmClosing}
							isPending={cancel.isPending || close.isPending}
							code={order.code}
							{...closingCopy(order, closing)}
						/>
					)}
					<AddExitDteDialog
						order={addingDte ? order : null}
						onClose={() => setAddingDte(false)}
					/>
					{dying && (
						<ExitLineDeathDialog
							order={order}
							line={dying}
							onClose={() => setDying(null)}
						/>
					)}
				</>
			)}
		</Drawer>
	);
};

export default ExitOrderDetailDrawer;
