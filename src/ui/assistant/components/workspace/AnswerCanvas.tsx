import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { AssistantResponse } from '@/core/assistant/domain/AssistantTypes';
import BlockRenderer from '../blocks/BlockRenderer';
import SourceBadge from '../SourceBadge';

interface AnswerCanvasProps {
	question: string | null;
	response: AssistantResponse;
	at: string;
}

/** The selected answer at full width: the question it answers, then every block in large size. */
export function AnswerCanvas({ question, response, at }: AnswerCanvasProps) {
	return (
		<Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2, md: 3 } }}>
			<Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 1.5 }}>
					{question && (
						<Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
							{question}
						</Typography>
					)}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
						<SourceBadge grounded={response.grounded} />
						<Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>{at}</Typography>
					</Box>
				</Box>
				{response.blocks.map((block, index) => (
					<BlockRenderer
						key={index}
						block={block}
						size="full"
					/>
				))}
			</Box>
		</Box>
	);
}

export default AnswerCanvas;
