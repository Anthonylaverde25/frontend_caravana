import React from 'react';
import { Box, Button, Paper, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import type { ExitDteDraft } from '../../hooks/useExitLoadForm';
import { formatDate } from '../exitOrderFormat';

interface ExitDteCardProps {
	dte: ExitDteDraft;
	onOpen: () => void;
}

/**
 * The transit document of the load, beside the client and the date: its state at a glance and the
 * button that loads or edits it. Optional and always recommended, it never blocks the load.
 */
export const ExitDteCard: React.FC<ExitDteCardProps> = ({ dte, onOpen }) => {
	const number = dte.number.trim();
	const loaded = number !== '';

	return (
		<Paper
			variant="outlined"
			sx={{ p: 2, px: { xs: 2, md: 2.5 }, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 1.5 }}
		>
			<Box
				sx={{
					width: 36,
					height: 36,
					flex: 'none',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					borderRadius: '8px',
					bgcolor: (theme) => (loaded ? theme.palette.action.hover : alpha(theme.palette.warning.main, 0.14)),
					color: loaded ? 'primary.main' : 'warning.dark'
				}}
			>
				<FuseSvgIcon size={18}>
					{loaded ? 'heroicons-outline:document-check' : 'heroicons-outline:document-plus'}
				</FuseSvgIcon>
			</Box>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography sx={sectionTitleSx}>DTE</Typography>
				<Typography
					noWrap
					sx={{ fontSize: '0.86rem', fontWeight: 600, color: loaded ? 'text.primary' : 'warning.dark' }}
				>
					{loaded ? `N° ${number}` : 'Sin cargar'}
				</Typography>
				<Typography
					noWrap
					variant="caption"
					color="text.secondary"
					sx={{ display: 'block' }}
				>
					{loaded
						? `${formatDate(dte.date)} · ${dte.heads || '—'} cab.`
						: 'Se guarda igual y se carga después'}
				</Typography>
			</Box>
			<Button
				size="small"
				variant={loaded ? 'text' : 'outlined'}
				color={loaded ? 'primary' : 'inherit'}
				onClick={onOpen}
				sx={{
					flex: 'none',
					height: 36,
					px: 1.75,
					borderRadius: '8px',
					textTransform: 'none',
					fontWeight: 600,
					borderColor: 'divider'
				}}
			>
				{loaded ? 'Editar DTE' : 'Cargar DTE'}
			</Button>
		</Paper>
	);
};

export default ExitDteCard;
