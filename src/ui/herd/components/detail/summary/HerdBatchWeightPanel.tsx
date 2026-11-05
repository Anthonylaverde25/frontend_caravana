import { useMemo, useState } from 'react';
import { Alert, Box, Button, ButtonGroup, CircularProgress, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { useBatchCategoryWeightSeries } from '@/features/batches/hooks/useBatchCategoryWeightSeries';
import { useBatchWeightHistory } from '@/features/batches/hooks/useBatchWeightHistory';
import { BatchWeightChart } from 'src/ui/batches/components/BatchWeightChart';
import { BatchCategoryLegend } from 'src/ui/batches/components/category-weight/BatchCategoryLegend';
import { BatchCategoryWeightNote } from 'src/ui/batches/components/category-weight/BatchCategoryWeightNote';
import { BatchCategoryWeightPlot, type CategoryWeightPlotMode } from 'src/ui/batches/components/category-weight/BatchCategoryWeightPlot';
import { BatchWeighingHistory } from 'src/ui/batches/components/category-weight/BatchWeighingHistory';
import { buildCategoryCurves, weighingDays } from 'src/ui/batches/components/category-weight/categoryWeightModel';
import { buildWeighingHistory } from 'src/ui/batches/components/category-weight/weighingHistoryModel';
import HerdBatchSection from './HerdBatchSection';
import { hasMixedWeights } from '../../../utils/herdFormat';

interface HerdBatchWeightPanelProps {
	batch: Batch;
	onWeighBatch: () => void;
	onWeighByCaravan: () => void;
}

const PLOT_HEIGHT = 340;
/** Below this room the history stops fitting beside the chart. */
const SIDE_BY_SIDE = '@container (min-width: 768px)';

const actionSx = {
	px: 1.5,
	fontWeight: 500,
	textTransform: 'none',
	color: 'text.primary',
	borderColor: 'divider'
} as const;

/**
 * The weight of the batch over time. The chart lies on the sheet with no frame around it and the
 * weighings run beside it at its height, set apart by a hairline. A mixed batch draws a line per
 * category; a single one, its average and its mass, which keep animals moving apart from real gain.
 */
export function HerdBatchWeightPanel({ batch, onWeighBatch, onWeighByCaravan }: HerdBatchWeightPanelProps) {
	const theme = useTheme();
	const { data: records = [], isLoading: loadingRecords } = useBatchWeightHistory(batch.id);
	const { data: points = [], isLoading: loadingPoints, isError } = useBatchCategoryWeightSeries(batch.id);
	const [focusKey, setFocusKey] = useState<string | null>(null);
	const [chartDay, setChartDay] = useState<string | null>(null);
	const [listDay, setListDay] = useState<string | null>(null);
	const [plotMode, setPlotMode] = useState<CategoryWeightPlotMode>('biomass');

	const curves = useMemo(
		() => buildCategoryCurves(points, theme.palette.mode === 'dark'),
		[points, theme.palette.mode]
	);
	const days = useMemo(() => weighingDays(points), [points]);
	const rows = useMemo(() => buildWeighingHistory(curves, days, records), [curves, days, records]);
	const mixed = (hasMixedWeights(batch) || curves.length > 1) && days.length > 0;

	return (
		<HerdBatchSection
			title="Peso del lote"
			actions={
				<ButtonGroup
					variant="outlined"
					color="inherit"
					size="small"
					aria-label="Registrar pesaje"
				>
					<Button
						onClick={onWeighBatch}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:scale</FuseSvgIcon>}
						sx={actionSx}
					>
						Pesar lote
					</Button>
					<Button
						onClick={onWeighByCaravan}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:tag</FuseSvgIcon>}
						sx={actionSx}
					>
						Pesar por caravana
					</Button>
				</ButtonGroup>
			}
		>
			{loadingRecords || loadingPoints ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
					<CircularProgress size={22} />
				</Box>
			) : isError ? (
				<Alert
					severity="error"
					sx={{ fontSize: '0.8rem', py: 0.5 }}
				>
					No se pudo cargar la curva de peso.
				</Alert>
			) : (
				<Box sx={{ containerType: 'inline-size' }}>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: 'minmax(0, 1fr)',
							rowGap: 2,
							[SIDE_BY_SIDE]: { gridTemplateColumns: 'minmax(0, 1fr) 324px' }
						}}
					>
						<Stack
							spacing={1}
							sx={{ minWidth: 0, [SIDE_BY_SIDE]: { pr: 3 } }}
						>
							{mixed ? (
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
									<BatchCategoryWeightPlot
										curves={curves}
										days={days}
										height={PLOT_HEIGHT}
										mode={plotMode}
										focusKey={focusKey}
										markedDay={listDay}
										onHoverDay={setChartDay}
									/>
									<BatchCategoryWeightNote
										curves={curves}
										days={days}
										mode={plotMode}
									/>
								</>
							) : (
								<BatchWeightChart
									data={records}
									height={PLOT_HEIGHT}
									showTableToggle={false}
								/>
							)}
						</Stack>
						<Box
							sx={{
								position: 'relative',
								minWidth: 0,
								[SIDE_BY_SIDE]: { borderLeft: 1, borderColor: 'divider' }
							}}
						>
							{/* Out of the flow beside the chart, so the chart sets the height and the list scrolls. */}
							<Box
								sx={{
									[SIDE_BY_SIDE]: {
										position: 'absolute',
										top: 0,
										right: 0,
										bottom: 0,
										left: 18,
										overflowY: 'auto'
									}
								}}
							>
								<BatchWeighingHistory
									rows={rows}
									activeDay={chartDay ?? listDay}
									onHoverDay={setListDay}
								/>
							</Box>
						</Box>
					</Box>
				</Box>
			)}
		</HerdBatchSection>
	);
}

export default HerdBatchWeightPanel;
