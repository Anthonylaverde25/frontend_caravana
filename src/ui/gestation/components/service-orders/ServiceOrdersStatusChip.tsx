import { useState } from 'react';
import {
	Chip,
	CircularProgress,
	Menu,
	MenuItem,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useUpdateServiceOrderStatus, type ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { toast } from 'sonner';
import { getServiceOrderPhase } from '../../utils/serviceOrderPhase';

export const getServiceStatusConfig = (status: string) => {
	switch (status.toUpperCase()) {
		case 'DRAFT':
			return { label: 'Borrador', color: 'default' as const };
		case 'APPROVED':
			return { label: 'En servicio', color: 'info' as const };
		case 'BULLS_WITHDRAWN':
			return { label: 'Torada retirada', color: 'warning' as const };
		case 'SUCCESS':
			return { label: 'Diagnosticada', color: 'success' as const };
		case 'REJECTED':
			return { label: 'Rechazada', color: 'error' as const };
		case 'CANCELLED':
			return { label: 'Cancelada', color: 'default' as const };
		default:
			return { label: status, color: 'default' as const };
	}
};

interface ServiceOrdersStatusChipProps {
	order: ServiceOrder;
	disabled?: boolean;
}

const compactChipSx = {
	height: 20,
	fontSize: '0.7rem',
	fontWeight: 700,
	cursor: 'pointer',
	'& .MuiChip-label': { px: 0.75 },
	'& .MuiChip-icon': {
		order: 1,
		marginLeft: '2px',
		marginRight: '-3px'
	}
};

export function ServiceOrdersStatusChip({ order, disabled = false }: ServiceOrdersStatusChipProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const updateStatusMutation = useUpdateServiceOrderStatus();
	const theme = useTheme();

	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (disabled || updateStatusMutation.isPending) return;
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleStatusChange = async (status: string) => {
		handleClose();
		if (status === order.status) return;

		try {
			await updateStatusMutation.mutateAsync({ id: order.id, status });
			toast.success(`Estado actualizado a ${getServiceStatusConfig(status).label}`);
		} catch (e: any) {
			toast.error(`Error al actualizar el estado: ${e.response?.data?.message || e.message}`);
		}
	};

	const phase = getServiceOrderPhase(order);

	return (
		<>
			<Chip
				label={phase.label}
				size="small"
				color={phase.color}
				variant={phase.phase === 'READY_TO_CLOSE' ? 'filled' : 'outlined'}
				onClick={handleClick}
				disabled={disabled || updateStatusMutation.isPending}
				icon={
					updateStatusMutation.isPending ? (
						<CircularProgress
							size={10}
							color="inherit"
						/>
					) : (
						<FuseSvgIcon size={12}>heroicons-outline:chevron-down</FuseSvgIcon>
					)
				}
				sx={compactChipSx}
			/>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				elevation={2}
				transformOrigin={{ horizontal: 'left', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
				PaperProps={{
					sx: {
						mt: 0.5,
						borderRadius: '6px',
						minWidth: 130
					}
				}}
			>
				<MenuItem
					onClick={() => handleStatusChange('DRAFT')}
					selected={order.status === 'DRAFT'}
					sx={{ fontSize: '0.75rem', fontWeight: 600 }}
				>
					Borrador
				</MenuItem>
				<MenuItem
					onClick={() => handleStatusChange('APPROVED')}
					selected={order.status === 'APPROVED'}
					sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'info.main' }}
				>
					En servicio
				</MenuItem>
				{/* "Torada retirada" comes from "Retirar torada" and "Diagnosticada" from "Cerrar orden": never by hand. */}
				<MenuItem
					onClick={() => handleStatusChange('REJECTED')}
					selected={order.status === 'REJECTED'}
					sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'error.main' }}
				>
					Rechazada
				</MenuItem>
				<MenuItem
					onClick={() => handleStatusChange('CANCELLED')}
					selected={order.status === 'CANCELLED'}
					sx={{ fontSize: '0.75rem', fontWeight: 600 }}
				>
					Cancelada
				</MenuItem>
			</Menu>
		</>
	);
}

export default ServiceOrdersStatusChip;
