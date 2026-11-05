import React, { useState } from 'react';
import {
	Box,
	Chip,
	Divider,
	Skeleton,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { useCategoryWeightsData } from './hooks/useCategoryWeightsData';
import {
	CategoryWeightAreaPiecesPlot,
	CategoryWeightPlotMode,
	CategoryWeightChartStyle
} from './components/CategoryWeightAreaPiecesPlot';
import { formatNumber, formatPercent } from '../../theme/formatters';

type ViewOption = 'bar_avg' | 'area_avg' | 'biomass';

export function CategoryWeightAreaPiecesWidget({ instance }: WidgetRenderProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const [viewOption, setViewOption] = useState<ViewOption>('bar_avg');

	const {
		categories,
		totalHeads,
		totalWeighed,
		totalBiomass,
		overallAvgWeight,
		overallCoveragePct,
		isLoading,
		hasData
	} = useCategoryWeightsData();

	const mode: CategoryWeightPlotMode = viewOption === 'biomass' ? 'biomass' : 'average';
	const chartStyle: CategoryWeightChartStyle = viewOption === 'area_avg' ? 'area' : 'bar';

	return (
		<WidgetCard flush>
			{/* 1. Header Dedicado y Organizado */}
			<Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', sm: 'row' },
						justifyContent: 'space-between',
						alignItems: { xs: 'flex-start', sm: 'center' },
						gap: 1.5,
						mb: 1.5
					}}
				>
					<Stack direction="row" spacing={1.25} alignItems="center">
						<Box
							sx={{
								width: 34,
								height: 34,
								borderRadius: '8px',
								bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
								color: 'primary.main',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							<FuseSvgIcon size={20}>heroicons-outline:scale</FuseSvgIcon>
						</Box>
						<Box>
							<Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
								{instance.title ?? 'Kilogramos por Categoría'}
							</Typography>
							<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
								Evaluación zootécnica de peso y biomasa por estrato animal
							</Typography>
						</Box>
					</Stack>

					<ToggleButtonGroup
						size="small"
						exclusive
						value={viewOption}
						onChange={(_, val: ViewOption | null) => val && setViewOption(val)}
						aria-label="Tipo de visualización de peso"
						sx={{
							height: 28,
							'& .MuiToggleButton-root': {
								py: 0.25,
								px: 1.25,
								fontSize: '0.75rem',
								textTransform: 'none',
								fontWeight: 600
							}
						}}
					>
						<ToggleButton value="bar_avg">Barras (kg/cab)</ToggleButton>
						<ToggleButton value="area_avg">Área (kg/cab)</ToggleButton>
						<ToggleButton value="biomass">Biomasa (kg)</ToggleButton>
					</ToggleButtonGroup>
				</Box>

				{/* Strip de Métricas Zootécnicas de Cabecera */}
				<Stack
					direction="row"
					spacing={1}
					flexWrap="wrap"
					useFlexGap
					alignItems="center"
					sx={{ pt: 0.5 }}
				>
					<Chip
						size="small"
						color="primary"
						variant="filled"
						label={
							mode === 'average'
								? `Promedio ponderado: ${formatNumber(overallAvgWeight)} kg/cab`
								: `Biomasa total: ${formatNumber(totalBiomass)} kg`
						}
						sx={{ fontWeight: 700, fontSize: '0.75rem', height: 24 }}
					/>
					<Chip
						size="small"
						variant="outlined"
						label={`Cobertura: ${formatNumber(totalWeighed)} de ${formatNumber(totalHeads)} animales (${formatPercent(overallCoveragePct, 1)})`}
						sx={{ fontWeight: 600, fontSize: '0.75rem', height: 24 }}
					/>
					<Chip
						size="small"
						variant="outlined"
						label={`${categories.length} categorías activas`}
						sx={{ fontWeight: 500, fontSize: '0.75rem', height: 24, color: 'text.secondary' }}
					/>
				</Stack>
			</Box>

			<Divider sx={{ borderColor: 'divider' }} />

			{/* 2. Cuerpo del Gráfico con Altura Ampliada (380px) */}
			{isLoading ? (
				<Box sx={{ p: 3 }}>
					<Skeleton variant="rounded" height={380} />
				</Box>
			) : !hasData ? (
				<Box sx={{ py: 8, textAlign: 'center' }}>
					<Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
						No hay animales activos registrados para graficar pesos por categoría.
					</Typography>
				</Box>
			) : (
				<Box sx={{ px: 2, pt: 1, pb: 1.5 }}>
					<CategoryWeightAreaPiecesPlot
						categories={categories}
						mode={mode}
						chartStyle={chartStyle}
						height={380}
					/>
				</Box>
			)}

			<Divider sx={{ borderColor: 'divider' }} />

			{/* 3. Pie de Tarjeta */}
			<Box sx={{ px: 3, py: 1.25, bgcolor: isDark ? 'rgba(255,255,255,0.015)' : '#fafafa' }}>
				<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary' }}>
					💡 <strong>Escala Zootécnica Area Pieces:</strong> Colores segmentados por umbrales productivos
					(Destete &lt; 180 kg, Recría 180–280 kg, Entore 280–380 kg, Adultos 380–500 kg, Toros &gt; 500 kg).
				</Typography>
			</Box>
		</WidgetCard>
	);
}

export default CategoryWeightAreaPiecesWidget;
