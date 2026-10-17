import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import type { BlockSize, TimelineBlock } from '@/core/assistant/domain/AssistantTypes';

const formatDay = (iso: string) => {
	const [year, month, day] = iso.split('-');

	return day && month && year ? `${day}/${month}/${year}` : iso;
};

interface TimelineBlockViewProps {
	block: TimelineBlock;
	size?: BlockSize;
}

/** The history of one animal, oldest first: movements and weighings as the API recorded them. */
export function TimelineBlockView({ block, size = 'compact' }: TimelineBlockViewProps) {
	return (
		<Box>
			<Typography
				sx={{
					fontSize: size === 'full' ? '0.95rem' : '0.8rem',
					fontWeight: 700,
					color: 'text.primary',
					mb: 0.5
				}}
			>
				{block.title}
			</Typography>
			<Box
				sx={{
					maxHeight: size === 'full' ? 520 : 300,
					overflowY: 'auto',
					border: 1,
					borderColor: 'divider',
					borderRadius: '8px'
				}}
			>
				<Timeline sx={{ m: 0, py: 1, px: 0.5, [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.32 } }}>
					{block.events.map((event, index) => (
						<TimelineItem
							key={`${event.date}-${index}`}
							sx={{ minHeight: 52 }}
						>
							<TimelineOppositeContent sx={{ fontSize: '0.72rem', color: 'text.secondary', pt: '7px' }}>
								{formatDay(event.date)}
							</TimelineOppositeContent>
							<TimelineSeparator>
								<TimelineDot
									variant={event.kind === 'pesada' ? 'outlined' : 'filled'}
									sx={{
										my: 0.75,
										boxShadow: 'none',
										bgcolor: event.kind === 'pesada' ? 'transparent' : 'primary.main',
										borderColor: 'primary.main'
									}}
								/>
								{index < block.events.length - 1 && <TimelineConnector sx={{ bgcolor: 'divider' }} />}
							</TimelineSeparator>
							<TimelineContent sx={{ pt: '5px' }}>
								<Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{event.label}</Typography>
								{event.detail && (
									<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
										{event.detail}
									</Typography>
								)}
							</TimelineContent>
						</TimelineItem>
					))}
				</Timeline>
			</Box>
			<Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.5 }}>
				{block.events.length} eventos
			</Typography>
		</Box>
	);
}

export default TimelineBlockView;
