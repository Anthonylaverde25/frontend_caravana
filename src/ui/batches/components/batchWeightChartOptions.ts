import type { Theme } from '@mui/material/styles';
import type { WeightRecord } from './BatchWeightChart';
import { dayToTime, formatDay, formatWeight } from './category-weight/categoryWeightModel';

const DAY_MS = 24 * 60 * 60 * 1000;
/** A lone weighing still needs a span of time around it to read as a date. */
const MIN_SPAN_MS = 28 * DAY_MS;

/** Validated all-pairs with the dataviz palette script, light against #fcfcfb and dark against #1a1a19. */
export const batchWeightColors = (dark: boolean) => ({
    line: dark ? '#3987e5' : '#2a78d6',
    movementIn: dark ? '#199e70' : '#1baf7a',
    movementOut: dark ? '#d95926' : '#eb6834',
});

const EVENT_LABELS: Record<string, string> = {
    INITIAL: 'Inicio del lote',
    CONTROL: 'Pesaje',
    MOVEMENT_IN: 'Entraron animales',
    MOVEMENT_OUT: 'Salieron animales',
    TRANSFER: 'Traslado',
};

export const eventLabel = (type: string) => EVENT_LABELS[type] ?? 'Pesaje';

const isMovement = (type: string) => type === 'MOVEMENT_IN' || type === 'MOVEMENT_OUT';

/**
 * Insertion order breaks the tie for the closing point and the movement, which deliberately share a
 * date so that the step comes out vertical.
 */
export const sortWeightRecords = (records: WeightRecord[]) =>
    [...records].sort((a, b) => {
        const byDate = dayToTime(a.weighing_date) - dayToTime(b.weighing_date);

        return byDate !== 0 ? byDate : a.id - b.id;
    });

function tooltipContent(sorted: WeightRecord[], index: number, theme: Theme): string {
    const { primary, secondary } = theme.palette.text;
    const record = sorted[index];
    const previous = index > 0 ? sorted[index - 1] : null;
    const figure = (label: string, value: string) =>
        `<div style="display:flex;justify-content:space-between;gap:24px;margin-top:8px">
            <span style="color:${secondary}">${label}</span>
            <span style="color:${primary};font-weight:700">${value}</span>
        </div>`;
    const note = (text: string) => `<div style="color:${secondary};font-size:11px;margin-top:6px">${text}</div>`;

    const rows = [
        figure('Promedio', record.weight != null ? `${formatWeight(record.weight)} kg/cab` : 'Sin definir: lote vacío'),
        ...(record.total_weight != null ? [figure('Kilos totales', `${formatWeight(record.total_weight, 0)} kg`)] : []),
    ];

    // Rows written before composition was recorded: claiming a set would invent it.
    if (record.caravans_count == null) {
        rows.push(note('Composición no registrada'));
    } else {
        const coverage =
            record.weighed_count != null && record.weighed_count !== record.caravans_count ? `, ${record.weighed_count} pesadas` : '';
        rows.push(note(`${record.caravans_count} cabezas${coverage}`));
    }

    if (isMovement(record.type) && previous?.caravans_count != null && record.caravans_count != null) {
        const moved =
            record.total_weight != null && previous.total_weight != null
                ? ` · ${formatWeight(Math.abs(record.total_weight - previous.total_weight), 0)} kg`
                : '';
        rows.push(note(`${previous.caravans_count} → ${record.caravans_count} cabezas${moved}. Es un traslado, no un cambio de peso.`));
    }

    if (record.weights_as_of && record.weights_as_of !== record.weighing_date) {
        rows.push(note(`Pesos del ${formatDay(record.weights_as_of)}`));
    }

    return `<div style="font-size:12px;min-width:210px;max-width:280px;white-space:normal">
        <div style="color:${secondary};font-size:11px;font-weight:600">${formatDay(record.weighing_date)} · ${eventLabel(record.type)}</div>
        ${rows.join('')}
    </div>`;
}

/**
 * The curve of one category, as two plots on a shared time axis: average above, mass below. One
 * scale per plot: on one plot, two scales would suggest a relation their alignment made up. Reading
 * them together is what shows a transfer: the average steps while the mass steps by the kilos moved.
 *
 * Never smoothed: a spline turns an instantaneous step into a slope, which reads exactly as the loss
 * of weight that never happened.
 */
export function buildBatchWeightOptions(sorted: WeightRecord[], theme: Theme) {
    const { primary, secondary } = theme.palette.text;
    const hairline = theme.palette.divider;
    const surface = theme.palette.background.paper;
    const colors = batchWeightColors(theme.palette.mode === 'dark');
    const fontFamily = theme.typography.fontFamily;

    const times = sorted.map((record) => dayToTime(record.weighing_date));
    const first = times[0];
    const last = times[times.length - 1];
    const span = Math.max(last - first, MIN_SPAN_MS);
    const pad = last === first ? span / 2 : span * 0.03;
    const showsYear = span > 300 * DAY_MS;
    const showsMonths = span >= 60 * DAY_MS;

    const isDark = theme.palette.mode === 'dark';

    const pointColor = (type: string) =>
        type === 'MOVEMENT_IN' ? colors.movementIn : type === 'MOVEMENT_OUT' ? colors.movementOut : colors.line;

    const series = (name: string, plot: number, read: (record: WeightRecord) => number | null | undefined, digits: number) => {
        const lastIndex = sorted.reduce((found, record, index) => (read(record) != null ? index : found), -1);

        return {
            name,
            type: 'line',
            xAxisIndex: plot,
            yAxisIndex: plot,
            smooth: false,
            connectNulls: false,
            showSymbol: true,
            color: colors.line,
            lineStyle: { width: 2, color: colors.line, cap: 'round', join: 'round' },
            areaStyle: {
                opacity: plot === 1 ? (isDark ? 0.3 : 0.22) : (isDark ? 0.12 : 0.08),
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        { offset: 0, color: colors.line },
                        { offset: 1, color: isDark ? 'rgba(57, 135, 229, 0.01)' : 'rgba(42, 120, 214, 0.01)' },
                    ],
                },
            },
            emphasis: {
                focus: 'series',
            },
            data: sorted.map((record, index) => ({
                value: [times[index], read(record) ?? null],
                symbol: isMovement(record.type) ? 'diamond' : 'circle',
                symbolSize: isMovement(record.type) ? 13 : 9,
                itemStyle: { color: pointColor(record.type), borderColor: surface, borderWidth: 2 },
                ...(index === lastIndex
                    ? {
                          label: {
                              show: true,
                              position: 'right',
                              distance: 8,
                              color: primary,
                              fontSize: 12,
                              fontWeight: 600,
                              fontFamily,
                              formatter: `${formatWeight(read(record) as number, digits)} kg`,
                          },
                      }
                    : {}),
            })),
            markLine: {
                symbol: 'none',
                silent: true,
                label: { show: false },
                lineStyle: { type: 'solid', color: hairline, width: 1 },
                data: sorted.filter((record) => isMovement(record.type)).map((record) => ({ xAxis: dayToTime(record.weighing_date) })),
            },
        };
    };

    const timeAxis = (plot: number, labelled: boolean) => ({
        type: 'time',
        gridIndex: plot,
        min: first - pad,
        max: last + pad,
        // Monthly at least: the time scale then lands its ticks on the first of each month.
        minInterval: showsMonths ? 28 * DAY_MS : DAY_MS,
        axisLine: { lineStyle: { color: hairline } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
            show: labelled,
            color: secondary,
            fontSize: 11,
            hideOverlap: true,
            formatter: (value: number) => {
                const date = new Date(value);
                const dayMonth = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

                return showsYear ? `${dayMonth}/${String(date.getFullYear()).slice(2)}` : dayMonth;
            },
        },
    });

    const valueAxis = (plot: number) => ({
        type: 'value',
        gridIndex: plot,
        scale: true,
        splitNumber: 3,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: hairline, width: 1, type: 'solid' } },
        axisLabel: { color: secondary, fontSize: 11, formatter: (value: number) => formatWeight(value, 0) },
    });

    const plotTitle = (text: string, top: number | string) => ({
        text,
        left: 0,
        top,
        textStyle: { color: primary, fontSize: 12, fontWeight: 600, fontFamily },
    });

    return {
        aria: { enabled: true },
        animationDuration: 300,
        title: [plotTitle('Promedio por cabeza (kg)', 0), plotTitle('Kilos totales del lote', '55%')],
        // Fixed side margins: containLabel would size each plot apart and misalign their dates.
        grid: [
            { left: 52, right: 84, top: 28, height: '38%' },
            { left: 52, right: 84, top: '63%', bottom: 26 },
        ],
        axisPointer: { link: [{ xAxisIndex: 'all' }] },
        tooltip: {
            trigger: 'axis',
            confine: true,
            backgroundColor: surface,
            borderColor: hairline,
            borderWidth: 1,
            padding: 12,
            extraCssText: 'box-shadow:0 4px 16px rgba(0,0,0,0.12);border-radius:8px;',
            axisPointer: { type: 'line', lineStyle: { color: secondary, width: 1, type: 'solid' } },
            // A closing point and its movement share a date: the movement, the later one, says more.
            formatter: (params: { dataIndex: number }[]) =>
                tooltipContent(sorted, Math.max(...params.map((param) => param.dataIndex)), theme),
        },
        xAxis: [timeAxis(0, false), timeAxis(1, true)],
        yAxis: [valueAxis(0), valueAxis(1)],
        series: [
            series('Promedio por cabeza', 0, (record) => record.weight, 1),
            series('Kilos totales', 1, (record) => record.total_weight, 0),
        ],
    };
}
