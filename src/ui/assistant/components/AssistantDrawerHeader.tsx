import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface AssistantDrawerHeaderProps {
	canReset: boolean;
	onReset: () => void;
	onClose: () => void;
	/** Extra controls (the development simulation menu). */
	extra?: ReactNode;
}

export function AssistantDrawerHeader({ canReset, onReset, onClose, extra }: AssistantDrawerHeaderProps) {
	return (
		<Box
			sx={{
				p: 2,
				px: 2.5,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				borderBottom: 1,
				borderColor: 'divider',
				bgcolor: 'background.default'
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
				<FuseSvgIcon
					size={24}
					sx={{ color: 'primary.main' }}
				>
					lucide:bot
				</FuseSvgIcon>
				<Box>
					<Typography sx={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
						Asistente Virtual
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
					>
						XIMON Ganadero AI · Solo lectura
					</Typography>
				</Box>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
				{extra}
				<Tooltip title="Nueva conversación">
					<span>
						<IconButton
							onClick={onReset}
							size="small"
							disabled={!canReset}
							sx={{ color: 'primary.main' }}
							aria-label="Nueva conversación"
						>
							<FuseSvgIcon size={20}>heroicons-outline:arrow-path</FuseSvgIcon>
						</IconButton>
					</span>
				</Tooltip>
				<IconButton
					onClick={onClose}
					size="small"
					sx={{ color: 'primary.main' }}
					aria-label="Cerrar"
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
		</Box>
	);
}

export default AssistantDrawerHeader;
