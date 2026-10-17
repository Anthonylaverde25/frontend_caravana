import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import type { CaravanWeightRecord } from '@/core/weighing/domain/entities/Weighing';
import { formatDate, formatKg } from 'src/ui/herd/utils/herdFormat';
import { chartPoints, weighingRows } from './caravanDrawerModel';

interface CaravanWeightsTabProps {
	identification: string;
	weights: CaravanWeightRecord[];
}

const CHART_W = 440;
const CHART_H = 150;

const headSx = {
	fontSize: '0.72rem',
	fontWeight: 600,
	color: 'text.secondary',
	py: 1,
	bgcolor: 'background.default'
} as const;

/** Weight curve and every weighing, each with its difference and where it came from. */
export function CaravanWeightsTab({ identification, weights }: CaravanWeightsTabProps) {
	const theme = useTheme();

	if (weights.length === 0) {
		return (
			<Typography
				variant="body2"
				sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}
			>
				La caravana todavía no tiene pesajes.
			</Typography>
		);
	}

	const points = chartPoints(weights, CHART_W, CHART_H);
	const rows = weighingRows(weights);
	const accent = theme.palette.primary.main;

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
			<Box
				component="section"
				aria-label="Evolución del peso"
			>
				<Typography
					component="h3"
					sx={{ fontSize: '0.82rem', fontWeight: 600, mb: 1.25 }}
				>
					Evolución del peso
				</Typography>
				<Paper
					variant="outlined"
					sx={{ borderRadius: '8px', overflow: 'hidden' }}
				>
					<svg
						viewBox={`0 0 ${CHART_W} ${CHART_H}`}
						role="img"
						aria-label={`Peso de ${identification}: ${points.map((p) => `${formatDate(p.date)} ${p.weight} kg`).join(', ')}`}
						style={{ display: 'block', width: '100%', height: 'auto' }}
					>
						<line
							x1={16}
							y1={CHART_H - 14}
							x2={CHART_W - 16}
							y2={CHART_H - 14}
							stroke={theme.palette.divider}
						/>
						<polyline
							points={points.map((p) => `${p.x},${p.y}`).join(' ')}
							fill="none"
							stroke={accent}
							strokeWidth={2}
							strokeLinejoin="round"
						/>
						{points.map((p) => (
							<g key={`${p.date}-${p.x}`}>
								<circle
									cx={p.x}
									cy={p.y}
									r={4}
									fill={theme.palette.background.paper}
									stroke={accent}
									strokeWidth={2}
								/>
								<text
									x={p.x}
									y={p.y - 10}
									textAnchor="middle"
									fontSize={11}
									fontWeight={600}
									fill={theme.palette.text.primary}
								>
									{p.weight.toLocaleString('es-AR')}
								</text>
							</g>
						))}
					</svg>
				</Paper>
			</Box>

			<Paper
				variant="outlined"
				sx={{ borderRadius: '8px', overflow: 'hidden' }}
			>
				<Table
					size="small"
					aria-label="Pesajes"
				>
					<TableHead>
						<TableRow>
							<TableCell sx={headSx}>Fecha</TableCell>
							<TableCell
								sx={headSx}
								align="right"
							>
								Peso
							</TableCell>
							<TableCell
								sx={headSx}
								align="right"
							>
								Dif.
							</TableCell>
							<TableCell sx={headSx}>Origen</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row) => (
							<TableRow key={row.id}>
								<TableCell sx={{ fontSize: '0.8rem' }}>{formatDate(row.date)}</TableCell>
								<TableCell
									sx={{ fontSize: '0.8rem', fontWeight: 600 }}
									align="right"
								>
									{formatKg(row.weight)}
								</TableCell>
								<TableCell
									sx={{
										fontSize: '0.8rem',
										color: row.diff !== null && row.diff > 0 ? 'success.dark' : 'text.secondary'
									}}
									align="right"
								>
									{row.diff === null ? '—' : `${row.diff >= 0 ? '+' : ''}${formatKg(row.diff)}`}
								</TableCell>
								<TableCell
									sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
									title={row.typeName}
								>
									{row.source}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Paper>
		</Box>
	);
}

export default CaravanWeightsTab;
