import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { useAssistantConversation } from '@/features/assistant/hooks/useAssistantConversation';
import AssistantDrawerHeader from './components/AssistantDrawerHeader';
import Composer from './components/Composer';
import MessageList from './components/MessageList';
import AssistantSimulationMenu from './simulation/AssistantSimulationMenu';

const ASSISTANT_WORKSPACE_ROUTE = '/assistant';

export interface VirtualAssistantDrawerProps {
	open: boolean;
	onClose: () => void;
}

/**
 * The Virtual Assistant drawer: a thin orchestrator over the conversation hook, for quick questions.
 * Charts show here in compact size; "Ver en grande" opens the same conversation in the workspace.
 */
export function VirtualAssistantDrawer({ open, onClose }: VirtualAssistantDrawerProps) {
	const { turns, pending, ask, simulate, select, reset } = useAssistantConversation();
	const navigate = useNavigate();

	const openWorkspace = (answerId?: string) => {
		if (answerId) select(answerId);

		navigate(ASSISTANT_WORKSPACE_ROUTE);
		onClose();
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: '100%', sm: 460 },
					display: 'flex',
					flexDirection: 'column',
					boxShadow: 8,
					bgcolor: 'background.paper'
				}
			}}
		>
			<AssistantDrawerHeader
				canReset={turns.length > 0 && !pending}
				onReset={reset}
				onClose={onClose}
				extra={
					<>
						{import.meta.env.DEV && (
							<AssistantSimulationMenu onPick={(p) => simulate(p.question, p.response)} />
						)}
						<Tooltip title="Abrir vista completa">
							<IconButton
								size="small"
								onClick={() => openWorkspace()}
								sx={{ color: 'primary.main' }}
								aria-label="Abrir vista completa"
							>
								<FuseSvgIcon size={20}>heroicons-outline:arrows-pointing-out</FuseSvgIcon>
							</IconButton>
						</Tooltip>
					</>
				}
			/>
			<Box sx={{ flex: 1, minHeight: 0 }}>
				<MessageList
					turns={turns}
					pending={pending}
					onPick={ask}
					onNavigate={onClose}
					onExpandAnswer={openWorkspace}
				/>
			</Box>
			<Composer
				disabled={pending}
				onSend={ask}
			/>
		</Drawer>
	);
}

export default VirtualAssistantDrawer;
