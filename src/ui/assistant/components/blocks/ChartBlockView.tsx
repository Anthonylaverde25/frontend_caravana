import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import type { BlockSize, ChartBlock } from '@/core/assistant/domain/AssistantTypes';
import { buildChartOption, hasDrawableData } from './chartOptions';
import { formatCell } from './formatCell';

const HEIGHT: Record<BlockSize, number> = { compact: 230, full: 420 };

interface ChartBlockViewProps {
	block: ChartBlock;
	size?: BlockSize;
}

/** A chart of a dataset. The backend validated the spec and attached the rows; this only draws them. */
export function ChartBlockView({ block, size = 'compact' }: ChartBlockViewProps) {
	const theme = useTheme();
	const option = useMemo(
		() =>
			buildChartOption(block, {
				text: theme.palette.text.primary,
				muted: theme.palette.text.secondary,
				grid: theme.palette.divider,
				compact: size === 'compact'
			}),
		[block, size, theme]
	);

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
			{hasDrawableData(block) ? (
				<Box sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', p: 1, bgcolor: 'background.paper' }}>
					<ReactECharts
						option={option}
						notMerge
						style={{ height: HEIGHT[size], width: '100%' }}
						opts={{ renderer: 'svg' }}
					/>
				</Box>
			) : (
				<Alert
					severity="info"
					sx={{ fontSize: '0.8rem', py: 0.5 }}
				>
					No hay valores para dibujar este gráfico.
				</Alert>
			)}
			<Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.5 }}>
				{[block.n != null ? `n = ${formatCell(block.n)}` : null, block.unit ? `Unidad: ${block.unit}` : null]
					.filter(Boolean)
					.join(' · ')}
			</Typography>
		</Box>
	);
}

export default ChartBlockView;
