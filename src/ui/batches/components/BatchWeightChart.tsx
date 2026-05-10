import { Box, Typography, alpha, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

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
    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ddd' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Sin datos de pesaje para graficar
                </Typography>
            </Box>
        );
    }

    // Chart dimensions
    const width = 600;
    const height = 250;
    const padding = 40;

    const weights = data.map(d => d.weight);
    const minWeight = Math.min(...weights) * 0.95;
    const maxWeight = Math.max(...weights) * 1.05;
    const weightRange = maxWeight - minWeight;

    const points = data.map((d, i) => {
        const x = padding + (i * (width - 2 * padding)) / (data.length > 1 ? data.length - 1 : 1);
        const y = height - padding - ((d.weight - minWeight) / weightRange) * (height - 2 * padding);
        return { x, y, data: d };
    });

    const linePath = points.reduce((acc, p, i) => 
        i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, 
    '');

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <Box sx={{ width: '100%', overflowX: 'auto', py: 2 }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                    const y = height - padding - p * (height - 2 * padding);
                    const val = (minWeight + p * weightRange).toFixed(0);
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                            <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#999" fontWeight="600">{val}</text>
                        </g>
                    );
                })}

                {/* Area under the line */}
                <motion.path
                    d={areaPath}
                    fill="url(#gradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                />

                {/* The Line */}
                <motion.path
                    d={linePath}
                    fill="none"
                    stroke="#0a6ed1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />

                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0a6ed1" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0a6ed1" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Data Points */}
                {points.map((p, i) => (
                    <Tooltip 
                        key={i} 
                        title={`${p.data.weighing_date}: ${p.data.weight}kg (${p.data.type})`} 
                        arrow
                    >
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="#0a6ed1"
                            stroke="white"
                            strokeWidth="2"
                            style={{ cursor: 'pointer' }}
                        />
                    </Tooltip>
                ))}

                {/* X Axis Labels (Dates) */}
                {points.map((p, i) => (
                    i % Math.ceil(points.length / 5) === 0 || i === points.length - 1 ? (
                        <text 
                            key={i} 
                            x={p.x} 
                            y={height - padding + 20} 
                            textAnchor="middle" 
                            fontSize="9" 
                            fill="#999" 
                            fontWeight="600"
                        >
                            {p.data.weighing_date.split('-').slice(1).reverse().join('/')}
                        </text>
                    ) : null
                ))}
            </svg>
        </Box>
    );
}
