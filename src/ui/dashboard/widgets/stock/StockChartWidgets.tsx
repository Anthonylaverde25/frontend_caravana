import { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { HorizontalBarList } from '../../components/primitives/HorizontalBarList';
import { StatusPill } from '../../components/primitives/StatusPill';
import { LineTrendChart } from '../../components/charts/LineTrendChart';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatPercent } from '../../theme/formatters';
import { DENTITION, STOCK_BY_BATCH, STOCK_BY_CATEGORY, STOCK_TOTAL, STOCK_TREND } from '../../mocks/stockMocks';

type StockGrouping = 'category' | 'batch';

export function StockByCategoryWidget({ instance }: WidgetRenderProps) {
	const [grouping, setGrouping] = useState<StockGrouping>('category');
	const rows = grouping === 'category' ? STOCK_BY_CATEGORY : STOCK_BY_BATCH;

	return (
		<WidgetCard
			title={instance.title ?? 'Existencias por categoría'}
			subtitle={`${formatNumber(STOCK_TOTAL.heads)} cabezas al ${STOCK_TOTAL.asOf}`}
			actions={
				<ToggleButtonGroup
					size="small"
					exclusive
					value={grouping}
					onChange={(_, value: StockGrouping | null) => value && setGrouping(value)}
					aria-label="Agrupar existencias por"
				>
					<ToggleButton
						value="category"
						sx={{ textTransform: 'none', px: 1.5 }}
					>
						Categoría
					</ToggleButton>
					<ToggleButton
						value="batch"
						sx={{ textTransform: 'none', px: 1.5 }}
					>
						Lote
					</ToggleButton>
				</ToggleButtonGroup>
			}
			footnote="Ordenado de mayor a menor"
		>
			<HorizontalBarList
				rows={rows}
				labelWidth={grouping === 'category' ? 120 : 190}
			/>
		</WidgetCard>
	);
}

export function StockTrendWidget({ instance }: WidgetRenderProps) {
	const points = STOCK_TREND.months.map((label, i) => ({
		label,
		value: STOCK_TREND.values[i],
		sublabel: STOCK_TREND.yearMarks[i]
	}));

	return (
		<WidgetCard
			title={instance.title ?? 'Existencias · últimos 12 meses'}
			subtitle="Cabezas a fin de cada mes. Las variaciones grandes se rotulan con el evento que las produjo."
			footnote="El eje empieza en 1.000 cabezas para ver la variación mensual; las etiquetas marcan los cambios absolutos."
		>
			<LineTrendChart
				points={points}
				yMin={1000}
				yMax={1350}
				yTicks={[1000, 1100, 1200, 1300]}
				formatValue={(v) => formatNumber(v)}
				annotations={STOCK_TREND.annotations}
				showArea
				ariaLabel="Existencias mensuales de octubre 2025 a septiembre 2026, con caída en marzo por venta de destete y suba en agosto por parición"
			/>
		</WidgetCard>
	);
}

export function DentitionWidget({ instance }: WidgetRenderProps) {
	const fullMouth = DENTITION.rows[DENTITION.rows.length - 1].value;
	const share = (fullMouth / DENTITION.total) * 100;

	return (
		<WidgetCard
			title={instance.title ?? 'Dentición de los vientres'}
			subtitle={`${formatNumber(DENTITION.total)} vientres (vacas, vacas vacías y vaquillonas). Sirve para planificar la reposición.`}
		>
			<HorizontalBarList
				labelWidth={130}
				rows={DENTITION.rows.map((r, i) => ({
					...r,
					color: i === DENTITION.rows.length - 1 ? DASHBOARD_COLORS.ochre : DASHBOARD_COLORS.accent
				}))}
			/>
			<Box
				sx={{
					mt: 'auto',
					pt: 1.5,
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 1
				}}
			>
				<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
					<strong>{formatPercent(share, 0)}</strong> de los vientres tiene boca llena
				</Typography>
				<StatusPill
					tone="warn"
					label="Revisar en el próximo boqueo"
				/>
			</Box>
		</WidgetCard>
	);
}
