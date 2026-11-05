import { useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useBatchCategoryWeightSeries } from '@/features/batches/hooks/useBatchCategoryWeightSeries';
import { BatchCategoryLegend } from './BatchCategoryLegend';
import { BatchCategoryWeightNote } from './BatchCategoryWeightNote';
import { BatchCategoryWeightPlot, type CategoryWeightPlotMode } from './BatchCategoryWeightPlot';
import { BatchCategoryWeightTable } from './BatchCategoryWeightTable';
import { buildCategoryCurves, weighingDays } from './categoryWeightModel';

interface BatchCategoryWeightChartProps {
	batchId: number;
	height?: number | string;
}

/**
 * The weight curve of a mixed batch: one line per category, or stacked area of biomass.
 * The batch average would fall the day its calves are weighed without any animal losing a gram,
 * so it has no place here.
 */
export function BatchCategoryWeightChart({ batchId, height = 350 }: BatchCategoryWeightChartProps) {
	const theme = useTheme();
	const { data: points = [], isLoading, isError } = useBatchCategoryWeightSeries(batchId);
	const [asTable, setAsTable] = useState(false);
	const [focusKey, setFocusKey] = useState<string | null>(null);
	const [plotMode, setPlotMode] = useState<CategoryWeightPlotMode>('biomass');

	const curves = useMemo(
		() => buildCategoryCurves(points, theme.palette.mode === 'dark'),
		[points, theme.palette.mode]
	);
	const days = useMemo(() => weighingDays(points), [points]);

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
				<CircularProgress size={22} />
			</Box>
		);
	}

	if (isError) {
		return (
			<Alert
				severity="error"
				sx={{ fontSize: '0.8rem', py: 0.5 }}
			>
				No se pudo cargar la curva de peso por categoría.
			</Alert>
		);
	}

	return (
		<Stack spacing={1}>
			{asTable ? (
				<BatchCategoryWeightTable
					curves={curves}
					days={days}
				/>
			) : (
				<>
					<Box
						sx={{
							display: 'flex',
							flexWrap: 'wrap',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 1,
							minHeight: 28
						}}
					>
						<BatchCategoryLegend
							curves={curves}
							onFocus={setFocusKey}
						/>
						<ToggleButtonGroup
							value={plotMode}
							exclusive
							onChange={(_, val) => val && setPlotMode(val)}
							size="small"
							sx={{
								height: 26,
								'& .MuiToggleButton-root': {
									px: 1.25,
									py: 0.25,
									fontSize: '0.72rem',
									fontWeight: 500,
									textTransform: 'none',
									color: 'text.secondary',
									'&.Mui-selected': {
										color: 'text.primary',
										fontWeight: 600,
										bgcolor: 'action.selected'
									}
								}
							}}
						>
							<ToggleButton value="biomass">
								Biomasa apilada (kg)
							</ToggleButton>
							<ToggleButton value="average">
								Promedio (kg/cab)
							</ToggleButton>
						</ToggleButtonGroup>
					</Box>
					{days.length > 0 && (
						<BatchCategoryWeightPlot
							curves={curves}
							days={days}
							height={height}
							mode={plotMode}
							focusKey={focusKey}
						/>
					)}
				</>
			)}
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				spacing={2}
			>
				<BatchCategoryWeightNote
					curves={curves}
					days={days}
					mode={plotMode}
				/>
				<Button
					size="small"
					onClick={() => setAsTable((current) => !current)}
					sx={{ flexShrink: 0, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
				>
					{asTable ? 'Ver gráfico' : 'Ver tabla'}
				</Button>
			</Stack>
		</Stack>
	);
}

export default BatchCategoryWeightChart;
