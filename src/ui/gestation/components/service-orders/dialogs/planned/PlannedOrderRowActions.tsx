import { Button, IconButton, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { usePlannedOrderActions } from './usePlannedOrderActions';

/** The actions of a planned order on its row. Reaching its date does not start it. */
export default function PlannedOrderRowActions({ order }: { order: ServiceOrder }) {
	const planned = usePlannedOrderActions(order);

	return (
		<>
			<Button
				variant="contained"
				size="small"
				color="primary"
				onClick={planned.openStart}
				sx={{
					height: 24,
					fontSize: '0.7rem',
					fontWeight: 700,
					textTransform: 'none',
					px: 1,
					borderRadius: '4px',
					color: '#fff'
				}}
			>
				Iniciar
			</Button>
			<Tooltip title="Editar">
				<IconButton
					size="small"
					onClick={planned.openEdit}
					sx={{ height: 28, width: 28 }}
				>
					<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>
				</IconButton>
			</Tooltip>
			<Tooltip title="Cancelar orden">
				<IconButton
					size="small"
					color="error"
					disabled={planned.isCancelling}
					onClick={planned.cancel}
					sx={{ height: 28, width: 28 }}
				>
					<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Tooltip>
			{planned.dialogs}
		</>
	);
}
