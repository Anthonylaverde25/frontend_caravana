import { Fragment } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DASHBOARD_COLORS, toneColors } from '../../theme/dashboardTokens';
import { formatNumber, formatPercent } from '../../theme/formatters';

export interface FunnelStage {
	label: string;
	value: number;
	/** Loss explanation rendered between this stage and the next one. */
	lossNote?: string;
}

interface FunnelBarsProps {
	stages: FunnelStage[];
	labelWidth?: number;
}

/** Every stage is expressed over the first stage, so percentages are comparable across stages. */
export function FunnelBars({ stages, labelWidth = 170 }: FunnelBarsProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const base = stages[0]?.value || 1;
	const grid = `${labelWidth}px 1fr 120px`;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
			{stages.map((stage, index) => {
				const pct = (stage.value / base) * 100;
				const isLast = index === stages.length - 1;

				return (
					<Fragment key={stage.label}>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: grid,
								alignItems: 'center',
								gap: 2,
								minHeight: 36
							}}
						>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: isLast ? 600 : 500 }}>
								{stage.label}
							</Typography>
							<Box
								role="img"
								aria-label={`${stage.label}: ${stage.value}, ${formatPercent(pct)}`}
								sx={{
									height: 26,
									borderRadius: '4px',
									bgcolor: isDark ? 'rgba(255,255,255,0.08)' : DASHBOARD_COLORS.track
								}}
							>
								<Box
									sx={{
										width: `${pct}%`,
										height: 26,
										borderRadius: '4px',
										bgcolor: DASHBOARD_COLORS.accent
									}}
								/>
							</Box>
							<Typography
								sx={{ fontSize: '0.875rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
							>
								<strong>{formatNumber(stage.value)}</strong>
								{` · ${formatPercent(pct)}`}
							</Typography>
						</Box>
						{stage.lossNote && !isLast && (
							<Box sx={{ display: 'grid', gridTemplateColumns: grid, gap: 2 }}>
								<span />
								<Typography
									sx={{
										fontSize: '0.75rem',
										color: toneColors('warn', isDark).fg,
										fontVariantNumeric: 'tabular-nums'
									}}
								>
									{`↓ ${stage.lossNote}`}
								</Typography>
							</Box>
						)}
					</Fragment>
				);
			})}
		</Box>
	);
}

export default FunnelBars;
