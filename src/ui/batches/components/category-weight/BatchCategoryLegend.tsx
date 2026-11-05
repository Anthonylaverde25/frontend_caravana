import { Box, Typography } from '@mui/material';
import type { CategoryCurve } from './categoryWeightModel';

interface BatchCategoryLegendProps {
	curves: CategoryCurve[];
	onFocus?: (key: string | null) => void;
}

/** The categories of the chart, heaviest first. HTML that wraps: long names cannot break the plot. */
export function BatchCategoryLegend({ curves, onFocus }: BatchCategoryLegendProps) {
	if (curves.length < 2) return null;

	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1.75, rowGap: 0.5, minWidth: 0 }}>
			{curves.map((curve) => (
				<Box
					key={curve.key}
					onMouseEnter={() => onFocus?.(curve.key)}
					onMouseLeave={() => onFocus?.(null)}
					sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
				>
					<Box sx={{ width: 14, height: 3, borderRadius: '2px', bgcolor: curve.color, flexShrink: 0 }} />
					<Typography sx={{ fontSize: '0.75rem', color: 'text.primary', whiteSpace: 'nowrap' }}>
						{curve.name}
					</Typography>
				</Box>
			))}
		</Box>
	);
}

export default BatchCategoryLegend;
