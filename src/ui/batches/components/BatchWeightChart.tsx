import ReactECharts from 'echarts-for-react';
import { Box, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

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
}

const MOVEMENT_TYPES = ['MOVEMENT_IN', 'MOVEMENT_OUT'];

const COLORS = {
    average: '#0a6ed1',
    mass: '#7b61ff',
    movementIn: '#16a34a',
    movementOut: '#ea580c',
};

const isMovement = (type: string) => MOVEMENT_TYPES.includes(type);

const formatNumber = (value: number, digits = 1) =>
    value.toLocaleString('es-AR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/**
 * Weight curve of a batch.
 *
 * The batch average is a statistic over a set of animals: when animals are transferred
 * the average moves without anybody having gained or lost a gram. So the chart never
 * smooths across a change of composition — it draws it as the vertical step it is, and
 * shows the mass alongside, which is additive and makes the transfer self-evident: the
 * kilos missing from one batch are exactly the kilos found in the other.
 */
export function BatchWeightChart({ data }: BatchWeightChartProps) {
    const chartOptions = useMemo(() => {
        if (!data || data.length === 0) return {};

        // Insertion order breaks the tie for the closing point and the movement, which
        // deliberately share a date so that the step comes out vertical.
        const sorted = [...data].sort((a, b) => {
            const byDate =
                new Date(a.weighing_date).getTime() - new Date(b.weighing_date).getTime();
            return byDate !== 0 ? byDate : a.id - b.id;
        });

        const at = (record: WeightRecord) => new Date(record.weighing_date).getTime();

        const pointStyle = (record: WeightRecord) => {
            if (record.type === 'MOVEMENT_IN') return COLORS.movementIn;
            if (record.type === 'MOVEMENT_OUT') return COLORS.movementOut;
            return COLORS.average;
        };

        const averageSeries = sorted.map((record) => ({
            value: [at(record), record.weight],
            symbol: isMovement(record.type) ? 'diamond' : 'circle',
            symbolSize: isMovement(record.type) ? 13 : 8,
            itemStyle: { color: pointStyle(record), borderWidth: 2, borderColor: '#fff' },
        }));

        const massSeries = sorted.map((record) => ({
            value: [at(record), record.total_weight ?? null],
            symbol: isMovement(record.type) ? 'diamond' : 'circle',
            symbolSize: isMovement(record.type) ? 11 : 6,
            itemStyle: { color: COLORS.mass, borderWidth: 2, borderColor: '#fff' },
        }));

        const movementMarks = sorted
            .filter((record) => isMovement(record.type))
            .map((record) => ({ xAxis: at(record) }));

        return {
            grid: { top: 40, right: 60, bottom: 40, left: 60, containLabel: true },
            legend: {
                data: ['Promedio (kg/cab)', 'Kilos totales'],
                top: 0,
                itemWidth: 14,
                textStyle: { fontSize: 11, fontWeight: 600, color: '#666' },
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.97)',
                borderWidth: 1,
                borderColor: '#e0e0e0',
                textStyle: { color: '#333', fontSize: 12 },
                formatter: (params: any) => {
                    const index = params?.[0]?.dataIndex ?? 0;
                    const record = sorted[index];
                    const previous = index > 0 ? sorted[index - 1] : null;

                    const head = record.caravans_count;
                    const weighed = record.weighed_count;

                    const rows: string[] = [];

                    rows.push(
                        record.weight != null
                            ? `<div style="font-size:16px;font-weight:800;color:${COLORS.average};">${formatNumber(record.weight)} kg/cab</div>`
                            : `<div style="font-size:13px;font-weight:700;color:#999;">Promedio indefinido (lote vacío)</div>`
                    );

                    if (record.total_weight != null) {
                        rows.push(
                            `<div style="font-size:12px;font-weight:700;color:${COLORS.mass};">${formatNumber(record.total_weight, 0)} kg totales</div>`
                        );
                    }

                    if (head == null) {
                        // Rows written before composition was recorded: we do not know
                        // what set the average covered, and claiming one would invent it.
                        rows.push(
                            `<div style="font-size:11px;color:#b45309;margin-top:4px;">Composición no registrada</div>`
                        );
                    } else {
                        const coverage =
                            weighed != null && weighed !== head ? ` (${weighed} pesadas)` : '';
                        rows.push(
                            `<div style="font-size:11px;color:#666;margin-top:4px;">${head} cabezas${coverage}</div>`
                        );
                    }

                    if (isMovement(record.type) && previous?.caravans_count != null && head != null) {
                        const headDelta = head - previous.caravans_count;
                        const massDelta =
                            record.total_weight != null && previous.total_weight != null
                                ? record.total_weight - previous.total_weight
                                : null;
                        const verb = headDelta >= 0 ? 'Entraron' : 'Salieron';
                        const color = headDelta >= 0 ? COLORS.movementIn : COLORS.movementOut;

                        rows.push(
                            `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #eee;font-size:11px;font-weight:800;color:${color};">
                                ${previous.caravans_count} → ${head} cabezas
                                ${massDelta != null ? `· ${verb.toLowerCase()} ${formatNumber(Math.abs(massDelta), 0)} kg` : ''}
                             </div>
                             <div style="font-size:10px;color:#999;">Traslado de hacienda, no cambio de peso</div>`
                        );
                    }

                    if (record.weights_as_of && record.weights_as_of !== record.weighing_date) {
                        rows.push(
                            `<div style="font-size:10px;color:#999;margin-top:4px;">Pesos del ${record.weights_as_of}</div>`
                        );
                    }

                    return `<div style="padding:4px;">
                        <div style="color:#999;font-size:10px;margin-bottom:4px;text-transform:uppercase;">${record.weighing_date} · ${record.type}</div>
                        ${rows.join('')}
                    </div>`;
                },
            },
            // A real time axis: with a category axis the points were spaced evenly no
            // matter how many days apart they were, so no slope meant a daily gain.
            xAxis: {
                type: 'time',
                axisLine: { lineStyle: { color: '#e0e0e0' } },
                splitLine: { show: true, lineStyle: { color: '#f0f0f0', type: 'dashed' } },
                axisLabel: {
                    color: '#999',
                    fontSize: 10,
                    fontWeight: 600,
                    formatter: '{dd}/{MM}',
                },
                axisTick: { show: false },
            },
            yAxis: [
                {
                    type: 'value',
                    scale: true,
                    name: 'kg/cab',
                    nameTextStyle: { color: '#999', fontSize: 10 },
                    splitLine: { show: true, lineStyle: { type: 'solid', color: '#f0f0f0' } },
                    axisLabel: { color: '#999', fontSize: 10, fontWeight: 600 },
                },
                {
                    type: 'value',
                    scale: true,
                    name: 'kg tot.',
                    nameTextStyle: { color: '#999', fontSize: 10 },
                    splitLine: { show: false },
                    axisLabel: { color: '#999', fontSize: 10, fontWeight: 600 },
                },
            ],
            series: [
                {
                    name: 'Promedio (kg/cab)',
                    data: averageSeries,
                    type: 'line',
                    // No smoothing and no area fill: a spline turns an instantaneous step
                    // into a gradual slope, which reads exactly as the loss of weight that
                    // never happened.
                    smooth: false,
                    connectNulls: false,
                    lineStyle: { width: 3, color: COLORS.average },
                    markLine: {
                        symbol: 'none',
                        silent: true,
                        data: movementMarks,
                        lineStyle: { type: 'dashed', color: '#bbb', width: 1 },
                        label: { show: false },
                    },
                },
                {
                    name: 'Kilos totales',
                    data: massSeries,
                    type: 'line',
                    yAxisIndex: 1,
                    smooth: false,
                    connectNulls: false,
                    lineStyle: { width: 2, color: COLORS.mass, type: 'dotted' },
                },
            ],
            animationDuration: 600,
        };
    }, [data]);

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ddd' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Sin datos de pesaje para graficar
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ width: '100%', height: 300 }}>
                <ReactECharts
                    option={chartOptions}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                    notMerge
                />
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                <LegendItem color={COLORS.average} shape="circle" label="Pesaje" />
                <LegendItem color={COLORS.movementIn} shape="diamond" label="Entraron animales" />
                <LegendItem color={COLORS.movementOut} shape="diamond" label="Salieron animales" />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', alignSelf: 'center' }}>
                    Un escalón vertical es un traslado de hacienda, no un cambio de peso.
                </Typography>
            </Stack>
        </Box>
    );
}

function LegendItem({ color, shape, label }: { color: string; shape: 'circle' | 'diamond'; label: string }) {
    return (
        <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
                sx={{
                    width: 9,
                    height: 9,
                    bgcolor: color,
                    borderRadius: shape === 'circle' ? '50%' : 0,
                    transform: shape === 'diamond' ? 'rotate(45deg)' : 'none',
                }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 600 }}>
                {label}
            </Typography>
        </Stack>
    );
}
