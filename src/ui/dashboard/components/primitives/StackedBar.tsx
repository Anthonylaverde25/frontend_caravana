import { Box } from '@mui/material';

export interface StackedSegment {
	label: string;
	value: number;
	color: string;
}

interface StackedBarProps {
	segments: StackedSegment[];
	height?: number;
	showLegend?: boolean;
	/** Appends " · value" to each legend label. */
	legendWithValues?: boolean;
	ariaLabel?: string;
}

/** Part-to-whole bar. Segment order is the reading order and the legend follows it. */
export function StackedBar({
	segments,
	height = 12,
	showLegend = true,
	legendWithValues = true,
	ariaLabel
}: StackedBarProps) {
	const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
	const label = ariaLabel ?? segments.map((s) => `${s.label}: ${s.value}`).join(', ');

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
			<Box
				role="img"
				aria-label={label}
				sx={{ display: 'flex', gap: '2px', height, borderRadius: '3px', overflow: 'hidden' }}
			>
				{segments
					.filter((s) => s.value > 0)
					.map((s) => (
						<Box
							key={s.label}
							sx={{ width: `${(s.value / total) * 100}%`, bgcolor: s.color }}
						/>
					))}
			</Box>
			{showLegend && (
				<Legend
					items={segments.map((s) => ({
						color: s.color,
						label: legendWithValues ? `${s.label} · ${s.value}` : s.label
					}))}
				/>
			)}
		</Box>
	);
}

interface LegendProps {
	items: { label: string; color: string }[];
}

export function Legend({ items }: LegendProps) {
	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.75, fontSize: '0.75rem', color: 'text.secondary' }}>
			{items.map((item) => (
				<Box
					key={item.label}
					component="span"
					sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontVariantNumeric: 'tabular-nums' }}
				>
					<Box
						component="span"
						sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: item.color, flexShrink: 0 }}
					/>
					{item.label}
				</Box>
			))}
		</Box>
	);
}

export default StackedBar;
