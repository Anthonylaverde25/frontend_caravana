import { useNavigate } from 'react-router';
import { Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { orderLink } from '../../utils/herdFormat';

interface HerdBatchActionsProps {
	batch: Batch;
	onAddCaravans: () => void;
	onTransfer: () => void;
	onWeighBatch: () => void;
	onConsume: () => void;
	onStartService: () => void;
	onTagCalves: () => void;
}

const textButtonSx = { fontWeight: 600, color: 'primary.main', textTransform: 'none' } as const;

/**
 * Header actions of the batch page: the work on the batch as a whole. Weighing and the control
 * sheet open their own screens under /herd/batches/:id.
 */
export function HerdBatchActions({ batch, onAddCaravans, onTransfer, onWeighBatch, onConsume, onStartService, onTagCalves }: HerdBatchActionsProps) {
	const navigate = useNavigate();
	const service = batch.active_service_order;
	const serviceLink = service ? orderLink('service_order', service.id) : null;

	return (
		<Stack
			direction="row"
			spacing={1}
			flexWrap="wrap"
			useFlexGap
			justifyContent="flex-end"
		>
			<Button
				variant="text"
				onClick={() => navigate('/herd')}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>}
				sx={textButtonSx}
			>
				Hacienda
			</Button>
			<Button
				variant="text"
				onClick={onWeighBatch}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:scale</FuseSvgIcon>}
				sx={textButtonSx}
			>
				Pesar lote
			</Button>
			<Button
				variant="text"
				onClick={onConsume}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:beaker</FuseSvgIcon>}
				sx={textButtonSx}
			>
				Registrar consumo
			</Button>
			<Button
				variant="text"
				onClick={() => navigate(`/herd/batches/${batch.id}/bulk-weight`)}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:table-cells</FuseSvgIcon>}
				sx={textButtonSx}
			>
				Pesaje por caravana
			</Button>
			<Button
				variant="text"
				onClick={() => navigate(`/herd/batches/${batch.id}/weight-sheet`)}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
				sx={textButtonSx}
			>
				Planilla de control
			</Button>
			{batch.untagged_calf_count > 0 && (
				<Button
					variant="text"
					onClick={onTagCalves}
					startIcon={<FuseSvgIcon size={18}>heroicons-outline:tag</FuseSvgIcon>}
					sx={{ ...textButtonSx, color: 'warning.dark' }}
				>
					{`Caravanear crías (${batch.untagged_calf_count})`}
				</Button>
			)}
			<Button
				variant="text"
				onClick={onTransfer}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrows-right-left</FuseSvgIcon>}
				sx={textButtonSx}
			>
				Trasladar animales
			</Button>
			{serviceLink && (
				<Button
					variant="text"
					color="success"
					onClick={() => navigate(serviceLink)}
					startIcon={<FuseSvgIcon size={18}>heroicons-outline:heart</FuseSvgIcon>}
					sx={{ ...textButtonSx, color: 'success.main' }}
				>
					{`Servicio ${service?.code}`}
				</Button>
			)}
			{batch.isCria() && !batch.hasActiveService() && (
				<Button
					variant="text"
					onClick={onStartService}
					startIcon={<FuseSvgIcon size={18}>heroicons-outline:heart</FuseSvgIcon>}
					sx={textButtonSx}
				>
					Iniciar servicio
				</Button>
			)}
			<Button
				variant="contained"
				onClick={onAddCaravans}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>}
				sx={{ bgcolor: 'primary.main', borderRadius: '6px', px: 3, fontWeight: 700, textTransform: 'none' }}
			>
				Añadir caravanas
			</Button>
		</Stack>
	);
}

export default HerdBatchActions;
