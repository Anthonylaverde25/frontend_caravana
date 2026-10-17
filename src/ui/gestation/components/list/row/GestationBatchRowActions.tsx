import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
	Box,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { registerBirthsPath } from '@/ui/birth-orders/components/register/registerBirths';
import { herdBatchPath, SERVICE_COLOR } from '@/ui/herd/utils/herdFormat';
import type { GestationBatchGroup } from '../gestationListUtils';

interface GestationBatchRowActionsProps {
	group: GestationBatchGroup;
	onOpenServiceOrder?: () => void;
}

const iconButtonSx = { width: 36, height: 36, borderRadius: '8px' } as const;

/**
 * Batch-level actions on a gestational row: active service order, birth order creation,
 * calving registration, and the overflow menu.
 */
export function GestationBatchRowActions({ group, onOpenServiceOrder }: GestationBatchRowActionsProps) {
	const navigate = useNavigate();
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
	const batchId = typeof group.id === 'number' ? group.id : null;

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
				{group.batch?.active_service_order && onOpenServiceOrder && (
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

			{batchId !== null && (
				<>
					<Tooltip title="Nueva orden de parición">
						<IconButton
							aria-label="Nueva orden de parición"
							onClick={() => navigate(`/birth-orders/new?batchId=${batchId}`)}
							sx={iconButtonSx}
						>
							<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
						</IconButton>
					</Tooltip>
					<Tooltip title="Registrar partos">
						<IconButton
							aria-label="Registrar partos"
							onClick={() => navigate(registerBirthsPath(batchId))}
							sx={{
								...iconButtonSx,
								color: 'primary.main',
								bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08)
							}}
						>
							<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</>
			)}

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
				<MenuItem onClick={() => go(herdBatchPath(group.id))}>
					<ListItemIcon>
						<FuseSvgIcon size={16}>heroicons-outline:arrow-top-right-on-square</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primaryTypographyProps={{ fontSize: '0.82rem' }}>
						{group.isUnassigned ? 'Ver caravanas sin lote' : 'Abrir lote en Hacienda'}
					</ListItemText>
				</MenuItem>
				{batchId !== null && (
					<MenuItem onClick={() => go(`/birth-orders/new?batchId=${batchId}`)}>
						<ListItemIcon>
							<FuseSvgIcon size={16}>heroicons-outline:clipboard-document-list</FuseSvgIcon>
						</ListItemIcon>
						<ListItemText primaryTypographyProps={{ fontSize: '0.82rem' }}>
							Nueva Orden de Parición
						</ListItemText>
					</MenuItem>
				)}
				{batchId !== null && (
					<MenuItem onClick={() => go(registerBirthsPath(batchId))}>
						<ListItemIcon>
							<FuseSvgIcon size={16}>heroicons-outline:plus-circle</FuseSvgIcon>
						</ListItemIcon>
						<ListItemText primaryTypographyProps={{ fontSize: '0.82rem' }}>
							Registrar Partos
						</ListItemText>
					</MenuItem>
				)}
			</Menu>
		</Stack>
	);
}

export default GestationBatchRowActions;
