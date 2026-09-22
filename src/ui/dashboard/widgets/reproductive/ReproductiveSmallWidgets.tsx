import { Box, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StackedBar } from '../../components/primitives/StackedBar';
import { HorizontalBarList } from '../../components/primitives/HorizontalBarList';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatPercent, toPercentOfRange } from '../../theme/formatters';
import { BULL_RATIO_BY_BATCH, GESTATION_LOSSES, SERVICE_ORDERS } from '../../mocks/reproductiveMocks';

const RATIO_SCALE_MAX = 8;

/** Actual bulls per 100 females vs. the target declared on the service batch. */
export function BullRatioByBatchWidget({ instance }: WidgetRenderProps) {
	const below = BULL_RATIO_BY_BATCH.filter((r) => r.actual < r.target).length;

	return (
		<KpiCard
			label={instance.title ?? 'Toros por cada 100 vientres'}
			status={
				<StatusPill
					tone={below > 0 ? 'bad' : 'ok'}
					label={below > 0 ? `${below} lote bajo objetivo` : 'Todos en objetivo'}
				/>
			}
			value={String(BULL_RATIO_BY_BATCH.length)}
			unit="lotes de servicio"
			context={
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
					{BULL_RATIO_BY_BATCH.map((row) => (
						<Box
							key={row.label}
							sx={{ display: 'grid', gridTemplateColumns: '56px 1fr 36px', gap: 1, alignItems: 'center' }}
						>
							<span>{row.label}</span>
							<Box
								role="img"
								aria-label={`${row.label}: ${row.actual} contra objetivo ${row.target}`}
								sx={{ position: 'relative', height: 10, borderRadius: '3px', bgcolor: 'action.hover' }}
							>
								<Box
									sx={{
										width: `${toPercentOfRange(row.actual, 0, RATIO_SCALE_MAX)}%`,
										height: 10,
										borderRadius: '3px',
										bgcolor:
											row.actual >= row.target ? DASHBOARD_COLORS.accent : DASHBOARD_COLORS.danger
									}}
								/>
								<Box
									sx={{
										position: 'absolute',
										left: `${toPercentOfRange(row.target, 0, RATIO_SCALE_MAX)}%`,
										top: -4,
										width: 2,
										height: 18,
										bgcolor: 'text.primary'
									}}
								/>
							</Box>
							<strong style={{ textAlign: 'right' }}>{formatNumber(row.actual, 1)}</strong>
						</Box>
					))}
				</Box>
			}
			footnote="Barra = real · línea = objetivo del lote · escala 0–8"
		/>
	);
}

export function GestationLossesWidget({ instance }: WidgetRenderProps) {
	const d = GESTATION_LOSSES;

	return (
		<KpiCard
			label={instance.title ?? 'Pérdidas de gestación'}
			status={
				<StatusPill
					tone="neutral"
					label={`Campaña ${d.campaign}`}
				/>
			}
			value={String(d.total)}
			unit="pérdidas"
			context={
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					<span>{`${formatPercent((d.total / d.pregnancies) * 100)} de ${d.pregnancies} preñeces`}</span>
					<HorizontalBarList
						labelWidth={96}
						valueWidth={24}
						rows={d.rows.map((r) => ({
							...r,
							color: r.label === 'Sin motivo' ? DASHBOARD_COLORS.neutral : DASHBOARD_COLORS.accent
						}))}
					/>
				</Box>
			}
			footnote="Motivos del catálogo del establecimiento"
		/>
	);
}

const ORDER_COLORS: Record<(typeof SERVICE_ORDERS)[number]['status'], string> = {
	DRAFT: DASHBOARD_COLORS.neutral,
	APPROVED: DASHBOARD_COLORS.info,
	SUCCESS: DASHBOARD_COLORS.accent,
	REJECTED: DASHBOARD_COLORS.danger,
	CANCELLED: DASHBOARD_COLORS.neutralDark
};

export function ServiceOrdersWidget({ instance }: WidgetRenderProps) {
	const total = SERVICE_ORDERS.reduce((acc, o) => acc + o.value, 0);
	const toExecute = SERVICE_ORDERS.find((o) => o.status === 'APPROVED')?.value ?? 0;

	return (
		<KpiCard
			label={instance.title ?? 'Órdenes de servicio'}
			status={
				<StatusPill
					tone="info"
					label={`${toExecute} por ejecutar`}
				/>
			}
			value={String(total)}
			unit="órdenes"
			visual={
				<StackedBar
					showLegend={false}
					segments={SERVICE_ORDERS.map((o) => ({
						label: o.label,
						value: o.value,
						color: ORDER_COLORS[o.status]
					}))}
				/>
			}
			context={
				<Box>
					{SERVICE_ORDERS.map((o) => (
						<Box
							key={o.status}
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								py: 0.75,
								borderBottom: 1,
								borderColor: 'divider'
							}}
						>
							<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
								<Box
									sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: ORDER_COLORS[o.status] }}
								/>
								<Typography sx={{ fontSize: '0.8125rem' }}>{o.label}</Typography>
							</Box>
							<strong>{o.value}</strong>
						</Box>
					))}
				</Box>
			}
		/>
	);
}
