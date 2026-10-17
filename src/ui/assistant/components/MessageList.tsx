import { useEffect, useRef } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ConversationTurn } from '@/core/assistant/domain/AssistantTypes';
import AnswerSummary from './AnswerSummary';
import AssistantAnswer from './AssistantAnswer';
import QuickPrompts from './QuickPrompts';
import ThinkingIndicator from './ThinkingIndicator';
import UserBubble from './UserBubble';

interface MessageListProps {
	turns: ConversationTurn[];
	pending: boolean;
	onPick: (prompt: string) => void;
	/** 'drawer' shows each answer's blocks; 'workspace' lists summaries and the canvas shows the blocks. */
	mode?: 'drawer' | 'workspace';
	selectedAnswerId?: string | null;
	onSelectAnswer?: (answerId: string) => void;
	onExpandAnswer?: (answerId: string) => void;
	onNavigate?: () => void;
}

const WELCOME =
	'Hola, soy XIMON. Consulto las existencias, lotes, servicios, partos y órdenes de tu establecimiento, ' +
	'y armo tablas y gráficos con esos datos. Solo leo información: no modifico registros.';

/** The scrolling conversation; keeps the newest turn in view. */
export function MessageList({
	turns,
	pending,
	onPick,
	mode = 'drawer',
	selectedAnswerId = null,
	onSelectAnswer,
	onExpandAnswer,
	onNavigate
}: MessageListProps) {
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}, [turns.length, pending]);

	return (
		<Box sx={{ height: '100%', overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Box
				sx={{ p: 1.5, px: 2, borderRadius: '12px', border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}
			>
				<Typography
					variant="body2"
					sx={{ lineHeight: 1.5 }}
				>
					{WELCOME}
				</Typography>
			</Box>

			{turns.length === 0 && (
				<QuickPrompts
					disabled={pending}
					onPick={onPick}
				/>
			)}

			{turns.map((turn) => {
				if (turn.role === 'user')
					return (
						<UserBubble
							key={turn.id}
							text={turn.text}
							at={turn.at}
						/>
					);

				if (turn.role === 'assistant' && mode === 'workspace') {
					return (
						<AnswerSummary
							key={turn.id}
							response={turn.response}
							at={turn.at}
							selected={turn.id === selectedAnswerId}
							onSelect={() => onSelectAnswer?.(turn.id)}
						/>
					);
				}

				if (turn.role === 'assistant') {
					return (
						<AssistantAnswer
							key={turn.id}
							response={turn.response}
							at={turn.at}
							onNavigate={onNavigate}
							onExpand={onExpandAnswer ? () => onExpandAnswer(turn.id) : undefined}
						/>
					);
				}

				return (
					<Alert
						key={turn.id}
						severity="error"
						sx={{ fontSize: '0.8rem', py: 0.5 }}
					>
						{turn.message}
					</Alert>
				);
			})}

			{pending && <ThinkingIndicator />}
			<div ref={endRef} />
		</Box>
	);
}

export default MessageList;
