import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface ChatSidebarHeaderProps {
	onToggle: () => void;
	onReset?: () => void;
	canReset?: boolean;
	pending?: boolean;
	simulationMenu?: ReactNode;
}

/**
 * Header for the Assistant conversation sidebar in workspace view.
 * Displays "Análisis XIMON", conversation reset action, simulation menu,
 * and the collapse toggle button styled like Layout 1's NavbarToggleButton.
 */
export function ChatSidebarHeader({
	onToggle,
	onReset,
	canReset = false,
	pending = false,
	simulationMenu
}: ChatSidebarHeaderProps) {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				px: 2,
				py: 1.25,
				height: 52,
				borderBottom: 1,
				borderColor: 'divider',
				bgcolor: 'background.paper',
				flexShrink: 0
			}}
		>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
			>
				<FuseSvgIcon
					size={18}
					sx={{ color: 'primary.main' }}
				>
					lucide:sparkles
				</FuseSvgIcon>
				<Typography
					sx={{
						fontSize: '0.925rem',
						fontWeight: 700,
						color: 'text.primary',
						letterSpacing: '-0.01em',
						lineHeight: 1.2
					}}
				>
					Análisis XIMON
				</Typography>
				<Chip
					label="Solo lectura"
					size="small"
					sx={{
						height: 20,
						fontSize: '0.675rem',
						fontWeight: 600,
						bgcolor: 'action.hover',
						color: 'text.secondary'
					}}
				/>
			</Stack>

			<Stack
				direction="row"
				spacing={0.75}
				alignItems="center"
			>
				{simulationMenu}

				{onReset && (
					<Tooltip title="Nueva conversación">
						<span>
							<IconButton
								size="small"
								onClick={onReset}
								disabled={!canReset || pending}
								className="h-7 w-7 border border-divider"
								sx={{ borderRadius: '6px' }}
								aria-label="Nueva conversación"
							>
								<FuseSvgIcon size={15}>heroicons-outline:arrow-path</FuseSvgIcon>
							</IconButton>
						</span>
					</Tooltip>
				)}

				<Tooltip title="Contraer panel de chat">
					<IconButton
						size="small"
						onClick={onToggle}
						className="h-7 w-7 border border-divider"
						sx={{ borderRadius: '6px' }}
						aria-label="Contraer chat"
					>
						<FuseSvgIcon size={16}>lucide:panel-left-close</FuseSvgIcon>
					</IconButton>
				</Tooltip>
			</Stack>
		</Box>
	);
}

export default ChatSidebarHeader;
