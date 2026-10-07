import { useState } from 'react';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type QuickAction = {
	id: string;
	label: string;
	sublabel: string;
	icon: string;
	route: string;
	color: string;
};

const QUICK_ACTIONS: QuickAction[] = [
	{
		id: 'qa-new-caravana',
		label: 'Nueva Caravana',
		sublabel: 'Registrar animal',
		icon: 'heroicons-outline:square-3-stack-3d',
		route: '/caravans/new',
		color: '#6366f1'
	},
	{
		id: 'qa-new-lote',
		label: 'Nuevo Lote',
		sublabel: 'Crear tropa',
		icon: 'heroicons-outline:view-columns',
		route: '/batches/new',
		color: '#0ea5e9'
	},
	{
		id: 'qa-scan',
		label: 'Escanear Planilla',
		sublabel: 'AI / OCR',
		icon: 'heroicons-outline:camera',
		route: '/work-templates/scan',
		color: '#8b5cf6'
	},
	{
		id: 'qa-parto',
		label: 'Registrar Parto',
		sublabel: 'Nacimiento',
		icon: 'heroicons-outline:sparkles',
		route: '/gestation/births/new',
		color: '#f43f5e'
	},
	{
		id: 'qa-ingreso',
		label: 'Orden de Ingreso',
		sublabel: 'ING-02',
		icon: 'heroicons-outline:arrow-down-tray',
		route: '/entry-orders/new',
		color: '#10b981'
	}
];

/**
 * Floating Speed Dial for quick actions across the livestock management system.
 * Rendered fixed at bottom-right, outside the normal document flow.
 */
function QuickActionsSpeedDial() {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleAction = (route: string) => {
		navigate(route);
		handleClose();
	};

	return (
		<Box
			sx={{
				position: 'fixed',
				bottom: 28,
				right: 28,
				zIndex: 1300
			}}
		>
			<SpeedDial
				id="quick-actions-speed-dial"
				ariaLabel="Acciones Rápidas"
				open={open}
				onOpen={handleOpen}
				onClose={handleClose}
				icon={
					<SpeedDialIcon
						icon={
							<FuseSvgIcon size={22} sx={{ color: 'white' }}>
								heroicons-outline:bolt
							</FuseSvgIcon>
						}
						openIcon={
							<FuseSvgIcon size={20} sx={{ color: 'white' }}>
								heroicons-outline:x-mark
							</FuseSvgIcon>
						}
					/>
				}
				direction="up"
				sx={{
					'& .MuiFab-primary': {
						width: 52,
						height: 52,
						background: (theme) =>
							`linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
						boxShadow: (theme) =>
							`0 8px 24px -4px ${alpha(theme.palette.primary.main, 0.55)}`,
						transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
						'&:hover': {
							transform: 'scale(1.08)',
							boxShadow: (theme) =>
								`0 12px 28px -4px ${alpha(theme.palette.primary.main, 0.65)}`
						}
					}
				}}
			>
				{QUICK_ACTIONS.map((action) => (
					<SpeedDialAction
						key={action.id}
						id={action.id}
						icon={
							<FuseSvgIcon size={20} sx={{ color: action.color }}>
								{action.icon}
							</FuseSvgIcon>
						}
						tooltipTitle={
							<Box sx={{ textAlign: 'left' }}>
								<Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
									{action.label}
								</Typography>
								<Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
									{action.sublabel}
								</Typography>
							</Box>
						}
						tooltipOpen
						tooltipPlacement="left"
						onClick={() => handleAction(action.route)}
						sx={{
							'& .MuiFab-root': {
								width: 44,
								height: 44,
								backgroundColor: (theme) => theme.vars.palette.background.paper,
								boxShadow: `0 4px 12px -2px ${alpha(action.color, 0.35)}, 0 2px 6px -1px ${alpha(action.color, 0.2)}`,
								border: `2px solid ${alpha(action.color, 0.2)}`,
								transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
								'&:hover': {
									backgroundColor: (theme) => theme.vars.palette.background.paper,
									borderColor: action.color,
									transform: 'scale(1.1)',
									boxShadow: `0 6px 16px -2px ${alpha(action.color, 0.5)}`
								}
							},
							'& .MuiSpeedDialAction-staticTooltipLabel': {
								backgroundColor: (theme) => theme.vars.palette.background.paper,
								color: (theme) => theme.vars.palette.text.primary,
								boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
								borderRadius: '8px',
								px: 1.5,
								py: 0.75,
								whiteSpace: 'nowrap',
								border: (theme) => `1px solid ${theme.vars.palette.divider}`
							}
						}}
					/>
				))}
			</SpeedDial>
		</Box>
	);
}

export default QuickActionsSpeedDial;
