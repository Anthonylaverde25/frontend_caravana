import {
	Button,
	Chip,
	IconButton,
	Stack,
	TableCell,
	TableRow,
	Tooltip,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import ServiceOrdersStatusChip from './ServiceOrdersStatusChip';
import ServiceOrdersPhaseDetail from './ServiceOrdersPhaseDetail';
import { getServiceOrderPhase, PHASE_LABELS } from '../../utils/serviceOrderPhase';
import { formatDate } from '../../../herd/utils/herdFormat';

interface ServiceOrdersTableRowProps {
	order: ServiceOrder;
	batchName: string;
	rowBg: string;
	cellSx: Record<string, any>;
	onView: (order: ServiceOrder) => void;
	onPrint: (order: ServiceOrder) => void;
	onShareWhatsApp: (order: ServiceOrder) => void;
	onApprove: (id: number) => void;
	onReject: (id: number) => void;
	onOpenInTray: (order: ServiceOrder) => void;
	isTransitioning: boolean;
}

const compactChipSx = {
	height: 20,
	fontSize: '0.7rem',
	fontWeight: 700,
	'& .MuiChip-label': { px: 0.75 }
};

export function ServiceOrdersTableRow({
	order,
	batchName,
	rowBg,
	cellSx,
	onView,
	onPrint,
	onShareWhatsApp,
	onApprove,
	onReject,
	onOpenInTray,
	isTransitioning
}: ServiceOrdersTableRowProps) {
	const activeMales =
		order.male_details && order.male_details.length > 0
			? order.male_details.filter((d) => d.status === 'ACTIVE').length
			: (order.active_male_caravan_ids?.length ?? order.male_caravan_ids.length);
	const { phase, isOpen } = getServiceOrderPhase(order);
	const isReadyToClose = phase === 'READY_TO_CLOSE';

	return (
		<TableRow
			hover
			sx={{
				bgcolor: rowBg,
				transition: 'background-color 0.15s ease',
				'&:hover': {
					bgcolor: 'rgba(0, 0, 0, 0.02)'
				}
			}}
		>
			{/* Código */}
			<TableCell sx={cellSx}>
				<Typography
					variant="body2"
					onClick={() => onView(order)}
					sx={{
						fontWeight: 800,
						fontFamily: 'monospace',
						cursor: 'pointer',
						color: 'primary.main',
						'&:hover': { textDecoration: 'underline' }
					}}
				>
					#{order.code}
				</Typography>
			</TableCell>

			{/* Lote */}
			<TableCell sx={cellSx}>
				<Typography
					variant="body2"
					sx={{ fontWeight: 600, fontSize: '0.78rem' }}
				>
					{batchName}
				</Typography>
			</TableCell>

			{/* Toros */}
			<TableCell sx={cellSx}>
				{activeMales > 0 ? (
					<Chip
						size="small"
						label={`${activeMales} ${activeMales === 1 ? 'toro' : 'toros'}`}
						color="info"
						variant="outlined"
						sx={compactChipSx}
					/>
				) : (
					<Typography
						variant="caption"
						sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: '0.75rem' }}
					>
						0 toros
					</Typography>
				)}
			</TableCell>

			{/* Vientres */}
			<TableCell sx={cellSx}>
				<Chip
					size="small"
					label={`${order.female_caravan_ids.length} vientres`}
					color="secondary"
					variant="outlined"
					sx={compactChipSx}
				/>
			</TableCell>

			{/* Fecha Planificada */}
			<TableCell sx={cellSx}>
				{order.planned_start_date ? (
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.78rem' }}
					>
						{formatDate(order.planned_start_date)}
					</Typography>
				) : (
					<Typography
						variant="caption"
						sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: '0.75rem' }}
					>
						No aplica
					</Typography>
				)}
			</TableCell>

			{/* Estado */}
			<TableCell sx={cellSx}>
				<Stack spacing={0.5} alignItems="flex-start">
					<ServiceOrdersStatusChip order={order} />
					<ServiceOrdersPhaseDetail order={order} />
				</Stack>
			</TableCell>

			{/* Acciones */}
			<TableCell
				align="right"
				sx={{ ...cellSx, borderRight: 0, textAlign: 'right', whiteSpace: 'nowrap' }}
			>
				<Stack
					direction="row"
					spacing={0.5}
					alignItems="center"
					justifyContent="flex-end"
				>
					<Tooltip title="Ver detalle">
						<IconButton
							size="small"
							onClick={() => onView(order)}
							sx={{ height: 28, width: 28 }}
						>
							<FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>
						</IconButton>
					</Tooltip>

					<Tooltip title="Imprimir / Planilla">
						<IconButton
							size="small"
							onClick={() => onPrint(order)}
							sx={{ height: 28, width: 28 }}
						>
							<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>
						</IconButton>
					</Tooltip>

					<Tooltip title="Compartir WhatsApp">
						<IconButton
							size="small"
							onClick={() => onShareWhatsApp(order)}
							sx={{ height: 28, width: 28, color: '#25D366' }}
						>
							<FuseSvgIcon size={18}>heroicons-outline:chat-bubble-left-right</FuseSvgIcon>
						</IconButton>
					</Tooltip>

					{/* DRAFT -> Approve / Reject */}
					{order.status === 'DRAFT' && (
						<>
							<Button
								variant="contained"
								size="small"
								color="primary"
								disabled={isTransitioning}
								onClick={() => onApprove(order.id)}
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
								Aprobar
							</Button>
							<Tooltip title="Rechazar">
								<IconButton
									size="small"
									color="error"
									disabled={isTransitioning}
									onClick={() => onReject(order.id)}
									sx={{ height: 28, width: 28 }}
								>
									<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
								</IconButton>
							</Tooltip>
						</>
					)}

					{/* Open order -> worked in the diagnosis tray (rounds, bull withdrawal, closing) */}
					{isOpen && (
						<Tooltip title={`Trabajar en bandeja de tacto · ${PHASE_LABELS[phase]}`}>
							<IconButton
								size="small"
								color={isReadyToClose ? 'success' : 'primary'}
								onClick={() => onOpenInTray(order)}
								sx={{ height: 28, width: 28 }}
							>
								<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
							</IconButton>
						</Tooltip>
					)}
				</Stack>
			</TableCell>
		</TableRow>
	);
}

export default ServiceOrdersTableRow;
