import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { AssistantResponse } from '@/core/assistant/domain/AssistantTypes';
import BlockRenderer from './blocks/BlockRenderer';
import SourceBadge from './SourceBadge';
import { hasVisualBlocks } from './answerBlocks';

interface AssistantAnswerProps {
	response: AssistantResponse;
	at: string;
	onNavigate?: () => void;
	/** Opens this answer in the workspace view; offered when it carries a chart, table or timeline. */
	onExpand?: () => void;
}

/** One assistant reply in the drawer: its blocks in compact size, the source badge and the time. */
export function AssistantAnswer({ response, at, onNavigate, onExpand }: AssistantAnswerProps) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
			<Box
				sx={{
					width: '100%',
					p: 1.5,
					px: 2,
					borderRadius: '12px',
					borderBottomLeftRadius: '2px',
					border: 1,
					borderColor: 'divider',
					bgcolor: (theme) =>
						theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
					display: 'flex',
					flexDirection: 'column',
					gap: 1.5
				}}
			>
				{response.blocks.map((block, index) => (
					<BlockRenderer
						key={index}
						block={block}
						size="compact"
						onNavigate={onNavigate}
					/>
				))}
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, px: 0.5, width: '100%' }}>
				<SourceBadge grounded={response.grounded} />
				<Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>{at}</Typography>
				{onExpand && hasVisualBlocks(response) && (
					<Button
						size="small"
						onClick={onExpand}
						startIcon={<FuseSvgIcon size={14}>heroicons-outline:arrows-pointing-out</FuseSvgIcon>}
						sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, py: 0 }}
					>
						Ver en grande
					</Button>
				)}
			</Box>
		</Box>
	);
}

export default AssistantAnswer;
