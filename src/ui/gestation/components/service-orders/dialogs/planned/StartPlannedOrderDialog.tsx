import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useStartPlannedServiceOrder } from '@/features/gestation/hooks/useServiceOrderIssuance';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { todayLocal } from '../create-order-v2/orderSheetDates';

interface StartPlannedOrderDialogProps {
	order: ServiceOrder;
	open: boolean;
	onClose: () => void;
}

/** "Iniciar" a planned order on the day it really starts: its rules apply again on that day. */
export default function StartPlannedOrderDialog({ order, open, onClose }: StartPlannedOrderDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const start = useStartPlannedServiceOrder();
	const [startDate, setStartDate] = useState(todayLocal());
	const isAi = order.service_method === 'AI';

	useEffect(() => {
		if (open) setStartDate(order.planned_start_date < todayLocal() ? order.planned_start_date : todayLocal());
	}, [open, order.planned_start_date]);

	const handleStart = async () => {
		if (!startDate) {
			enqueueSnackbar('Indicá la fecha real de inicio.', { variant: 'warning' });
			return;
		}

		try {
			const result = await start.mutateAsync({ id: order.id, startDate });
			enqueueSnackbar(`Orden ${order.code} iniciada`, { variant: 'success' });
			result.warnings.forEach((warning) => enqueueSnackbar(warning, { variant: 'warning' }));
			onClose();
		} catch (error) {
			const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
			enqueueSnackbar(message ?? 'No se pudo iniciar la orden.', { variant: 'error' });
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			onClick={(event) => event.stopPropagation()}
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
				<Typography
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					Iniciar {order.code}
				</Typography>
				<IconButton
					size="small"
					onClick={onClose}
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<Stack
				spacing={2}
				sx={{ p: 3 }}
			>
				<Alert
					severity="info"
					sx={{ fontSize: '0.8rem', py: 0.5 }}
				>
					{isAi
						? 'Se vuelven a controlar los vientres y queda lista para cargar inseminaciones.'
						: 'Se vuelven a controlar lote, toros y vientres. Los toros pasan al lote con esta fecha.'}
				</Alert>
				<TextField
					fullWidth
					variant="filled"
					type="date"
					label="Fecha real de inicio"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					InputLabelProps={{ shrink: true }}
					inputProps={{ max: todayLocal() }}
					sx={{ bgcolor: 'action.hover' }}
				/>
			</Stack>
			<Box
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
					variant="text"
					onClick={onClose}
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleStart}
					disabled={start.isPending}
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
					Iniciar
				</Button>
			</Box>
		</Dialog>
	);
}
