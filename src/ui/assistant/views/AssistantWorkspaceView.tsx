import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useAssistantConversation } from '@/features/assistant/hooks/useAssistantConversation';
import Composer from '../components/Composer';
import MessageList from '../components/MessageList';
import AnswerCanvas from '../components/workspace/AnswerCanvas';
import CanvasEmptyState from '../components/workspace/CanvasEmptyState';
import ChatSidebarHeader from '../components/workspace/ChatSidebarHeader';
import AssistantSimulationMenu from '../simulation/AssistantSimulationMenu';

const SIDEBAR_STORAGE_KEY = 'assistant:workspace:sidebarOpen';

/**
 * Análisis XIMON: the assistant at full width without top page header.
 * The conversation header contains the title and actions, liberating maximal vertical space.
 */
function AssistantWorkspaceView() {
	const { turns, pending, selectedAnswerId, ask, simulate, select, reset } = useAssistantConversation();

	const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
		try {
			const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
			return saved !== null ? JSON.parse(saved) : true;
		} catch {
			return true;
		}
	});

	const toggleSidebar = () => {
		setSidebarOpen((prev) => {
			const next = !prev;
			try {
				localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(next));
			} catch {
				// storage error ignored
			}
			return next;
		});
	};

	const selection = useMemo(() => {
		const index = turns.findIndex((turn) => turn.id === selectedAnswerId);
		const answer = index >= 0 ? turns[index] : undefined;

		if (!answer || answer.role !== 'assistant') return null;

		const question = turns
			.slice(0, index)
			.reverse()
			.find((turn) => turn.role === 'user');

		return { answer, question: question && question.role === 'user' ? question.text : null };
	}, [turns, selectedAnswerId]);

	return (
		<ViewLayout
			showHeader={false}
			scroll="content"
			className="p-0 flex flex-col flex-1 h-full min-h-0"
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					flex: 1,
					minHeight: 0,
					height: '100%',
					width: '100%',
					overflow: 'hidden',
					bgcolor: 'background.paper'
				}}
			>
				<Box
					sx={{
						width: sidebarOpen ? { xs: '100%', md: 420 } : 0,
						minWidth: sidebarOpen ? { xs: '100%', md: 420 } : 0,
						maxWidth: sidebarOpen ? { xs: '100%', md: 420 } : 0,
						flexShrink: 0,
						display: 'flex',
						flexDirection: 'column',
						borderStyle: 'solid',
						borderColor: 'divider',
						borderWidth: sidebarOpen ? { xs: '0 0 1px 0', md: '0 1px 0 0' } : 0,
						height: { xs: 520, md: '100%' },
						minHeight: 0,
						bgcolor: 'background.paper',
						overflow: 'hidden',
						transition: (theme) =>
							theme.transitions.create(['width', 'min-width', 'max-width', 'border-width'], {
								duration: theme.transitions.duration.shorter,
								easing: theme.transitions.easing.easeInOut
							})
					}}
				>
					<ChatSidebarHeader
						onToggle={toggleSidebar}
						onReset={reset}
						canReset={turns.length > 0}
						pending={pending}
						simulationMenu={
							import.meta.env.DEV && (
								<AssistantSimulationMenu onPick={(p) => simulate(p.question, p.response)} />
							)
						}
					/>
					<Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
						<MessageList
							turns={turns}
							pending={pending}
							onPick={ask}
							mode="workspace"
							selectedAnswerId={selectedAnswerId}
							onSelectAnswer={select}
						/>
					</Box>
					<Composer
						disabled={pending}
						onSend={ask}
					/>
				</Box>
				<Box
					sx={{
						flex: 1,
						minWidth: 0,
						bgcolor: 'background.default',
						height: '100%',
						minHeight: 0,
						overflow: 'hidden',
						position: 'relative'
					}}
				>
					{!sidebarOpen && (
						<Box
							sx={{
								position: 'absolute',
								top: 12,
								left: 12,
								zIndex: 10,
								display: 'flex',
								alignItems: 'center',
								gap: 1,
								bgcolor: 'background.paper',
								px: 1,
								py: 0.5,
								borderRadius: '8px',
								border: 1,
								borderColor: 'divider',
								boxShadow: 1
							}}
						>
							<Tooltip title="Expandir panel de conversación">
								<IconButton
									size="small"
									onClick={toggleSidebar}
									className="h-7 w-7 border border-divider"
									sx={{ borderRadius: '6px' }}
									aria-label="Expandir chat"
								>
									<FuseSvgIcon size={16}>lucide:panel-left-open</FuseSvgIcon>
								</IconButton>
							</Tooltip>
							<Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.primary', pr: 0.5 }}>
								Análisis XIMON
							</Typography>
							{import.meta.env.DEV && (
								<AssistantSimulationMenu onPick={(p) => simulate(p.question, p.response)} />
							)}
							<Tooltip title="Nueva conversación">
								<span>
									<IconButton
										size="small"
										onClick={reset}
										disabled={turns.length === 0 || pending}
										className="h-7 w-7 border border-divider"
										sx={{ borderRadius: '6px' }}
										aria-label="Nueva conversación"
									>
										<FuseSvgIcon size={14}>heroicons-outline:arrow-path</FuseSvgIcon>
									</IconButton>
								</span>
							</Tooltip>
						</Box>
					)}
					{selection ? (
						<AnswerCanvas
							question={selection.question}
							response={selection.answer.response}
							at={selection.answer.at}
						/>
					) : (
						<CanvasEmptyState
							disabled={pending}
							onPick={ask}
						/>
					)}
				</Box>
			</Box>
		</ViewLayout>
	);
}

export default AssistantWorkspaceView;
