import { useState } from 'react';
import { Button, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface HerdBatchHeaderActionsProps {
	onPrintSheet: () => void;
	onAddCaravans: () => void;
	onTransfer: () => void;
	onChangeManagement: () => void;
}

const iconButtonSx = {
	width: 36,
	height: 36,
	borderRadius: '6px',
	border: 1,
	borderColor: 'divider',
	color: 'text.secondary'
} as const;

/**
 * Header of the batch page: print, the batch-wide actions that belong to no section, and the main
 * one. Work on a part of the batch lives in the section of its data (weight, service, consumption).
 */
export function HerdBatchHeaderActions({
	onPrintSheet,
	onAddCaravans,
	onTransfer,
	onChangeManagement
}: HerdBatchHeaderActionsProps) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const run = (action: () => void) => () => {
		setAnchor(null);
		action();
	};

	return (
		<>
			<Tooltip title="Planilla de control">
				<IconButton
					onClick={onPrintSheet}
					aria-label="Imprimir planilla de control"
					sx={iconButtonSx}
				>
					<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>
				</IconButton>
			</Tooltip>
			<IconButton
				onClick={(event) => setAnchor(event.currentTarget)}
				aria-label="Más acciones del lote"
				aria-haspopup="menu"
				sx={iconButtonSx}
			>
				<FuseSvgIcon size={18}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
			</IconButton>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<MenuItem onClick={run(onTransfer)}>
					<ListItemIcon>
						<FuseSvgIcon size={18}>heroicons-outline:arrows-right-left</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText>Trasladar animales</ListItemText>
				</MenuItem>
				<MenuItem onClick={run(onChangeManagement)}>
					<ListItemIcon>
						<FuseSvgIcon size={18}>heroicons-outline:home-modern</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText>Cambiar manejo</ListItemText>
				</MenuItem>
			</Menu>
			<Button
				variant="contained"
				onClick={onAddCaravans}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
				sx={{
					bgcolor: 'primary.main',
					borderRadius: '6px',
					px: 2.5,
					fontWeight: 700,
					textTransform: 'none',
					boxShadow: 'none'
				}}
			>
				Añadir caravanas
			</Button>
		</>
	);
}

export default HerdBatchHeaderActions;
