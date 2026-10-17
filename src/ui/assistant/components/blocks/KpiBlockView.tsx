import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { KpisBlock } from '@/core/assistant/domain/AssistantTypes';
import { formatCell } from './formatCell';

/** Headline figures. Each value was copied from a dataset column by the backend. */
export function KpiBlockView({ block }: { block: KpisBlock }) {
	return (
		<Box>
			{block.title && (
				<Typography
					sx={{
						fontSize: '0.75rem',
						fontWeight: 700,
						color: 'text.secondary',
						mb: 1,
						textTransform: 'uppercase',
						letterSpacing: '0.04em'
					}}
				>
					{block.title}
				</Typography>
			)}
			<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
				{block.items.map((item) => (
					<Box
						key={item.label}
						sx={{
							p: 1.5,
							border: 1,
							borderColor: 'divider',
							borderRadius: '8px',
							bgcolor: 'background.paper'
						}}
					>
						<Typography
							sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}
							noWrap
						>
							{item.label}
						</Typography>
						<Typography
							sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'primary.main', lineHeight: 1.3 }}
						>
							{formatCell(item.value)}
							{item.unit && item.value !== null && (
								<Box
									component="span"
									sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary', ml: 0.5 }}
								>
									{item.unit}
								</Box>
							)}
						</Typography>
						{item.n != null && (
							<Typography sx={{ fontSize: '0.66rem', color: 'text.disabled' }}>
								n = {formatCell(item.n)}
							</Typography>
						)}
					</Box>
				))}
			</Box>
		</Box>
	);
}

export default KpiBlockView;
