import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { herdBatchPath, SERVICE_COLOR } from '../../../utils/herdFormat';

interface HerdBatchRowActionsProps {
	batch: Batch;
	onAddCaravans: () => void;
	onWeighBatch: () => void;
	onConsume: () => void;
	onStartService: () => void;
	onOpenServiceOrder?: () => void;
}

const iconButtonSx = { width: 36, height: 36, borderRadius: '8px' } as const;

/**
 * The work on a batch as a whole: service, weighing, adding caravans; the rest in the ⋮ menu.
 * Slot of the service action is kept even when empty, so the icons line up across rows.
 */
export function HerdBatchRowActions({
	batch,
	onAddCaravans,
	onWeighBatch,
	onConsume,
	onStartService,
	onOpenServiceOrder
}: HerdBatchRowActionsProps) {
	const navigate = useNavigate();
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
	const canStartService = batch.isCria() && !batch.hasActiveService();

	const go = (path: string) => {
		setMenuAnchor(null);
		navigate(path);
	};

	return (
		<Stack
			role="group"
			aria-label="Acciones del lote"
			direction="row"
			spacing={0.5}
			alignItems="center"
			sx={{ flexShrink: 0, pr: 1.5 }}
		>
			<Box sx={{ width: 36, height: 36 }}>
				{canStartService && (
					<Tooltip title="Iniciar servicio">
						<IconButton
							aria-label="Iniciar servicio"
							onClick={onStartService}
							sx={{
								...iconButtonSx,
								color: 'success.dark',
								bgcolor: (theme) => alpha(theme.palette.success.main, 0.1)
							}}
						>
							<FuseSvgIcon size={18}>heroicons-outline:heart</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				)}
				{batch.active_service_order && onOpenServiceOrder && (
					<Tooltip title="Ver orden de servicio">
						<IconButton
							aria-label="Ver orden de servicio"
							onClick={onOpenServiceOrder}
							sx={{ ...iconButtonSx, color: SERVICE_COLOR, bgcolor: alpha(SERVICE_COLOR, 0.1) }}
						>
							<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-list</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				)}
			</Box>

			{/* Never disabled by head count: that count is a snapshot the weighing itself refreshes. */}
			<Tooltip title="Pesar lote">
				<IconButton
					aria-label="Pesar lote"
					onClick={onWeighBatch}
					sx={iconButtonSx}
				>
					<FuseSvgIcon size={18}>heroicons-outline:scale</FuseSvgIcon>
				</IconButton>
			</Tooltip>
			<Tooltip title="Añadir caravanas">
				<IconButton
					aria-label="Añadir caravanas"
					onClick={onAddCaravans}
					sx={iconButtonSx}
				>
					<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>
				</IconButton>
			</Tooltip>

			<Divider
				orientation="vertical"
				flexItem
				sx={{ mx: 0.5, my: 1 }}
			/>

			<Tooltip title="Más acciones">
				<IconButton
					aria-label="Más acciones"
					aria-haspopup="menu"
					aria-expanded={menuAnchor !== null}
					onClick={(event) => setMenuAnchor(event.currentTarget)}
					sx={{ ...iconButtonSx, bgcolor: menuAnchor ? 'action.selected' : 'transparent' }}
				>
					<FuseSvgIcon size={18}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={menuAnchor}
				open={menuAnchor !== null}
				onClose={() => setMenuAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ paper: { sx: { width: 240, borderRadius: '10px', mt: 0.5 } } }}
			>
				<MenuItem onClick={() => go(herdBatchPath(batch.id))}>
					<ListItemIcon>
						<FuseSvgIcon size={16}>heroicons-outline:arrow-top-right-on-square</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primaryTypographyProps={{ fontSize: '0.82rem' }}>Abrir lote</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={() => {
						setMenuAnchor(null);
						onConsume();
					}}
				>
					<ListItemIcon>
						<FuseSvgIcon size={16}>heroicons-outline:beaker</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primaryTypographyProps={{ fontSize: '0.82rem' }}>Registrar consumo</ListItemText>
				</MenuItem>
				<MenuItem onClick={() => go(`/herd/batches/${batch.id}/bulk-weight`)}>
					<ListItemIcon>
						<FuseSvgIcon size={16}>heroicons-outline:table-cells</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primaryTypographyProps={{ fontSize: '0.82rem' }}>Pesaje por caravana</ListItemText>
				</MenuItem>
				<MenuItem onClick={() => go(`/herd/batches/${batch.id}/weight-sheet`)}>
					<ListItemIcon>
						<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primaryTypographyProps={{ fontSize: '0.82rem' }}>
						Planilla de control de peso
					</ListItemText>
				</MenuItem>
			</Menu>
		</Stack>
	);
}

export default HerdBatchRowActions;
