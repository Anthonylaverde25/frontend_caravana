import ReactECharts from 'echarts-for-react';
import { Box, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';

interface WeightRecord {
    id: number;
    weight: number;
    weighing_date: string;
    type: string;
}

interface BatchWeightChartProps {
    data: WeightRecord[];
}

export function BatchWeightChart({ data }: BatchWeightChartProps) {
    const theme = useTheme();

    const chartOptions = useMemo(() => {
        if (!data || data.length === 0) return {};

        // Sort data by date just in case
        const sortedData = [...data].sort((a, b) => 
            new Date(a.weighing_date).getTime() - new Date(b.weighing_date).getTime()
        );

        return {
            grid: {
                top: 40,
                right: 20,
                bottom: 40,
                left: 50,
                containLabel: true,
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderWidth: 1,
                borderColor: '#e0e0e0',
                textStyle: {
                    color: '#333',
                    fontSize: 12,
                    fontWeight: 600,
                },
                formatter: (params: any) => {
                    const item = params[0];
                    const record = sortedData[item.dataIndex];
                    return `
                        <div style="padding: 4px;">
                            <div style="color: #999; font-size: 10px; margin-bottom: 4px; text-transform: uppercase;">${record.weighing_date}</div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 16px; font-weight: 800; color: #0a6ed1;">${record.weight} kg</span>
                                <span style="font-size: 10px; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; color: #666;">${record.type}</span>
                            </div>
                        </div>
                    `;
                },
            },
            xAxis: {
                type: 'category',
                data: sortedData.map(d => d.weighing_date),
                axisLine: {
                    lineStyle: { color: '#e0e0e0' }
                },
                splitLine: {
                    show: true,
                    lineStyle: { 
                        color: '#e0e0e0',
                        type: 'dashed'
                    }
                },
                axisLabel: {
                    color: '#999',
                    fontSize: 10,
                    fontWeight: 600,
                    formatter: (value: string) => {
                        const parts = value.split('-');
                        return `${parts[2]}/${parts[1]}`;
                    }
                },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                scale: true, // This is crucial for livestock: focuses on the weight range
                splitLine: {
                    show: true,
                    lineStyle: { 
                        type: 'solid',
                        color: '#e0e0e0' 
                    }
                },
                axisLabel: {
                    color: '#999',
                    fontSize: 10,
                    fontWeight: 600,
                    formatter: '{value} kg'
                }
            },
            series: [
                {
                    data: sortedData.map(d => d.weight),
                    type: 'line',
                    smooth: true, // Smooth spline
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: {
                        color: '#0a6ed1',
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    lineStyle: {
                        width: 4,
                        color: '#0a6ed1',
                        shadowColor: 'rgba(10, 110, 209, 0.2)',
                        shadowBlur: 10,
                        shadowOffsetY: 5
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(10, 110, 209, 0.2)' },
                                { offset: 1, color: 'rgba(10, 110, 209, 0)' }
                            ]
                        }
                    },
                    emphasis: {
                        scale: true,
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0,0,0,0.2)'
                        }
                    }
                }
            ],
            animationDuration: 1500,
            animationEasing: 'cubicOut'
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
        <Box sx={{ width: '100%', height: 300 }}>
            <ReactECharts 
                option={chartOptions} 
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }} // SVG renderer for sharper lines on high-DPI
            />
        </Box>
    );
}
