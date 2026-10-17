import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { AssistantResponse } from '@/core/assistant/domain/AssistantTypes';
import SafeMarkdown from './blocks/SafeMarkdown';
import SourceBadge from './SourceBadge';
import { describeVisuals } from './answerBlocks';

interface AnswerSummaryProps {
	response: AssistantResponse;
	at: string;
	selected: boolean;
	onSelect: () => void;
}

/**
 * An answer in the workspace conversation panel: its text and what it carries. Selecting it shows
 * its blocks at full width in the canvas.
 */
export function AnswerSummary({ response, at, selected, onSelect }: AnswerSummaryProps) {
	const text = response.blocks.find((block) => block.type === 'text');
	const visuals = describeVisuals(response);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
			<ButtonBase
				onClick={onSelect}
				sx={{
					width: '100%',
					display: 'block',
					textAlign: 'left',
					p: 1.5,
					px: 2,
					borderRadius: '12px',
					borderBottomLeftRadius: '2px',
					border: selected ? 2 : 1,
					borderColor: selected ? 'primary.main' : 'divider',
					bgcolor: selected ? 'action.selected' : 'transparent',
					'&:hover': { bgcolor: 'action.hover' }
				}}
			>
				{text && text.type === 'text' && <SafeMarkdown markdown={text.markdown} />}
				{visuals && (
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 0.75,
							mt: text ? 1 : 0,
							color: 'primary.main'
						}}
					>
						<FuseSvgIcon size={14}>heroicons-outline:chart-bar</FuseSvgIcon>
						<Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>{visuals}</Typography>
					</Box>
				)}
			</ButtonBase>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, px: 0.5 }}>
				<SourceBadge grounded={response.grounded} />
				<Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>{at}</Typography>
			</Box>
		</Box>
	);
}

export default AnswerSummary;
