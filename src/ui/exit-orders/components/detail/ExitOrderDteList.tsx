import React from 'react';
import { Alert, Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ExitOrder, ExitOrderDte } from '@/features/exit-orders/types';
import { formatDate } from '../exitOrderFormat';

interface ExitOrderDteListProps {
	order: ExitOrder;
	onRemove?: (dte: ExitOrderDte) => void;
}

/**
 * The DTEs of the order. A difference between their heads and the animals that left is said,
 * never blocked: the document is SENASA's, the roll is what happened.
 */
export const ExitOrderDteList: React.FC<ExitOrderDteListProps> = ({ order, onRemove }) => {
	const differs = order.dtes.length > 0 && order.dte_head_count !== order.exited_count;

	return (
		<Box>
			<Typography
				variant="overline"
				sx={{ fontWeight: 800, color: 'text.secondary' }}
			>
				DTE ({order.dtes.length})
			</Typography>
			<Stack
				spacing={1}
				sx={{ mt: 0.5 }}
			>
				{order.without_dte && (
					<Alert
						severity="warning"
						sx={{ borderRadius: '6px', fontSize: '0.8rem', py: 0.25 }}
					>
						Salieron {order.exited_count} animal(es) sin DTE cargado. Cargalo cuando lo tengas.
					</Alert>
				)}
				{order.dtes.length === 0 && !order.without_dte && (
					<Typography
						variant="body2"
						color="text.secondary"
					>
						Todavía no salió ningún animal: el DTE se carga con la salida.
					</Typography>
				)}
				{order.dtes.map((dte) => (
					<Paper
						key={dte.id}
						variant="outlined"
						sx={{ p: 1.25, borderRadius: '8px' }}
					>
						<Stack
							direction="row"
							spacing={1.5}
							alignItems="center"
						>
							<FuseSvgIcon
								size={18}
								color="action"
							>
								heroicons-outline:document-text
							</FuseSvgIcon>
							<Box sx={{ flexGrow: 1, minWidth: 0 }}>
								<Typography
									variant="body2"
									sx={{ fontWeight: 800, fontFamily: 'monospace' }}
								>
									{dte.dte_number}
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									{formatDate(dte.dte_date)} · {dte.head_count} cab.
									{dte.observations ? ` · ${dte.observations}` : ''}
								</Typography>
							</Box>
							{onRemove && (
								<Tooltip title="Quitar DTE">
									<IconButton
										size="small"
										aria-label={`Quitar el DTE ${dte.dte_number}`}
										onClick={() => onRemove(dte)}
									>
										<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
									</IconButton>
								</Tooltip>
							)}
						</Stack>
					</Paper>
				))}
				{differs && (
					<Alert
						severity="info"
						sx={{ borderRadius: '6px', fontSize: '0.8rem', py: 0.25 }}
					>
						Los DTE suman {order.dte_head_count} cabeza(s) y salieron {order.exited_count}. Revisá si falta
						un DTE o si el documento tiene un error.
					</Alert>
				)}
			</Stack>
		</Box>
	);
};

export default ExitOrderDteList;
