import ReactECharts from 'echarts-for-react';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';

export function BatchesComparativeChart() {
    // Mocking multi-batch history for demonstration of comparative performance
    const comparativeData = useMemo(() => {
        const dates = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
        
        return {
            dates,
            batches: [
                {
                    name: 'Lote Invierno - 1',
                    data: [150, 185, 220, 260, 310, 350],
                    color: '#0a6ed1'
                },
                {
                    name: 'Lote Recría - 2',
                    data: [140, 160, 195, 230, 270, 310],
                    color: '#4caf50'
                },
                {
                    name: 'Lote Exportación - A',
                    data: [160, 200, 250, 310, 380, 450],
                    color: '#ff9800'
                },
                {
                    name: 'Lote Reserva - Sur',
                    data: [130, 150, 180, 210, 245, 285],
                    color: '#9c27b0'
                }
            ]
        };
    }, []);

    const chartOptions = useMemo(() => {
        return {
            grid: {
                top: 80,
                right: 40,
                bottom: 60,
                left: 60,
                containLabel: true,
            },
            legend: {
                top: 20,
                icon: 'roundRect',
                itemGap: 20,
                textStyle: {
                    fontWeight: 700,
                    color: '#666'
                }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                borderWidth: 1,
                borderColor: '#e0e0e0',
                textStyle: { color: '#333' },
                axisPointer: {
                    type: 'cross',
                    label: { backgroundColor: '#6a7985' }
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: comparativeData.dates,
                axisLine: { lineStyle: { color: '#e0e0e0' } },
                axisLabel: { color: '#999', fontWeight: 600 }
            },
            yAxis: {
                type: 'value',
                scale: true,
                name: 'Peso Promedio (kg)',
                nameTextStyle: { color: '#999', fontWeight: 700, padding: [0, 0, 0, 40] },
                splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
                axisLabel: { color: '#999', fontWeight: 600 }
            },
            series: comparativeData.batches.map(batch => ({
                name: batch.name,
                type: 'line',
                stack: null, // We don't want stacked area, we want overlapping comparative area
                smooth: true,
                lineStyle: { width: 3, color: batch.color },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.15,
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: batch.color },
                            { offset: 1, color: 'rgba(255,255,255,0)' }
                        ]
                    }
                },
                emphasis: {
                    focus: 'series',
                    lineStyle: { width: 5 }
                },
                data: batch.data
            })),
            animationDuration: 2000,
            animationEasing: 'quadraticInOut'
        };
    }, [comparativeData]);

    return (
        <Box sx={{ width: '100%', height: 500 }}>
            <ReactECharts 
                option={chartOptions} 
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
            />
        </Box>
    );
}
