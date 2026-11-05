import ReactECharts from 'echarts-for-react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { BatchWeightHistoryTable } from './BatchWeightHistoryTable';
import { batchWeightColors, buildBatchWeightOptions, sortWeightRecords } from './batchWeightChartOptions';

export interface WeightRecord {
    id: number;
    /** Average kg per head. Null when the set is empty: an average of nothing is undefined. */
    weight: number | null;
    /** Measured mass over the weighed animals. Additive and conserved on a split. */
    total_weight?: number | null;
    /** Head in the batch. Null on rows written before composition was recorded. */
    caravans_count?: number | null;
    /** Head the average was computed over; may be smaller than the batch. */
    weighed_count?: number | null;
    /** Newest individual weighing behind this point. */
    weights_as_of?: string | null;
    weighing_date: string;
    type: string;
}

interface BatchWeightChartProps {
    data: WeightRecord[];
    height?: number | string;
    /** Off where the figures already sit beside the chart. */
    showTableToggle?: boolean;
}

/**
 * Weight curve of a batch.
 *
 * The batch average is a statistic over a set of animals: when animals are transferred
 * the average moves without anybody having gained or lost a gram. So the chart never
 * smooths across a change of composition: it draws it as the vertical step it is, and
 * shows the mass in its own plot below, which is additive and makes the transfer
 * self-evident: the kilos missing from one batch are exactly the kilos found in the other.
 */
export function BatchWeightChart({ data, height = 380, showTableToggle = true }: BatchWeightChartProps) {
    const theme = useTheme();
    const [asTable, setAsTable] = useState(false);
    const sorted = useMemo(() => sortWeightRecords(data ?? []), [data]);
    const chartOptions = useMemo(() => (sorted.length > 0 ? buildBatchWeightOptions(sorted, theme) : {}), [sorted, theme]);
    const colors = batchWeightColors(theme.palette.mode === 'dark');
    const moved = sorted.some((record) => record.type === 'MOVEMENT_IN' || record.type === 'MOVEMENT_OUT');

    if (sorted.length === 0) {
        return (
            <Box sx={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: '8px', border: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Sin datos de pesaje para graficar
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {asTable ? (
                <BatchWeightHistoryTable records={sorted} />
            ) : (
                <Box sx={{ width: '100%', height, flex: 1, minHeight: 340 }}>
                    <ReactECharts
                        option={chartOptions}
                        style={{ height: '100%', width: '100%' }}
                        opts={{ renderer: 'svg' }}
                        notMerge
                    />
                </Box>
            )}

            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}>
                    <LegendItem color={colors.line} shape="circle" label="Pesaje" />
                    {moved && (
                        <>
                            <LegendItem color={colors.movementIn} shape="diamond" label="Entraron animales" />
                            <LegendItem color={colors.movementOut} shape="diamond" label="Salieron animales" />
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                                Un escalón vertical es un traslado de hacienda, no un cambio de peso.
                            </Typography>
                        </>
                    )}
                </Stack>
                {showTableToggle && (
                    <Button
                        size="small"
                        onClick={() => setAsTable((current) => !current)}
                        sx={{ flexShrink: 0, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                    >
                        {asTable ? 'Ver gráfico' : 'Ver tabla'}
                    </Button>
                )}
            </Stack>
        </Box>
    );
}

function LegendItem({ color, shape, label }: { color: string; shape: 'circle' | 'diamond'; label: string }) {
    return (
        <Stack direction="row" spacing={0.75} alignItems="center">
            <Box
                sx={{
                    width: 9,
                    height: 9,
                    bgcolor: color,
                    borderRadius: shape === 'circle' ? '50%' : 0,
                    transform: shape === 'diamond' ? 'rotate(45deg)' : 'none',
                }}
            />
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
        </Stack>
    );
}
