import { Box, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StackedBar, Legend } from '../../components/primitives/StackedBar';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { COLD_CHAIN, PROTOCOL_SOURCES, SAMPLES_BY_TYPE } from '../../mocks/healthMocks';

export function ColdChainWidget({ instance }: WidgetRenderProps) {
	const d = COLD_CHAIN;
	const incidents = d.total - d.ok;

	return (
		<KpiCard
			label={instance.title ?? 'Cadena de frío'}
			status={
				<StatusPill
					tone={incidents > 0 ? 'bad' : 'ok'}
					label={incidents > 0 ? `${incidents} incidencia` : 'Sin incidencias'}
				/>
			}
			value={String(d.ok)}
			unit={`de ${d.total} envíos`}
			visual={
				<StackedBar
					showLegend={false}
					segments={[
						{ label: 'Correctos', value: d.ok, color: DASHBOARD_COLORS.accent },
						{ label: 'Con incidencia', value: incidents, color: DASHBOARD_COLORS.danger }
					]}
				/>
			}
			context={d.incident}
			footnote="Declarado por el veterinario al despachar"
		/>
	);
}

export function ProtocolSourcesWidget({ instance }: WidgetRenderProps) {
	const d = PROTOCOL_SOURCES;

	return (
		<KpiCard
			label={instance.title ?? 'Origen de los protocolos'}
			value={String(d.total)}
			unit="protocolos"
			visual={
				<StackedBar
					segments={[
						{ label: 'Portal veterinario', value: d.portal, color: DASHBOARD_COLORS.accent },
						{
							label: 'Digitalizado, verificado',
							value: d.digitizedVerified,
							color: DASHBOARD_COLORS.accentMid
						},
						{
							label: 'Digitalizado, sin verificar',
							value: d.digitizedUnverified,
							color: DASHBOARD_COLORS.ochre
						}
					]}
				/>
			}
			context="Los digitalizados por el productor se separan según su verificación"
			footnote="Últimos 90 días"
		/>
	);
}

const RESULT_COLORS = {
	negative: DASHBOARD_COLORS.accent,
	positive: DASHBOARD_COLORS.danger,
	pending: DASHBOARD_COLORS.neutral
};

export function SamplesByTypeWidget({ instance }: WidgetRenderProps) {
	const total = SAMPLES_BY_TYPE.reduce((acc, r) => acc + r.negative + r.positive + r.pending, 0);
	const pending = SAMPLES_BY_TYPE.reduce((acc, r) => acc + r.pending, 0);
	const positives = SAMPLES_BY_TYPE.filter((r) => r.positive > 0);

	return (
		<WidgetCard
			title={instance.title ?? 'Muestras por tipo y resultado'}
			subtitle={`${total} muestras del período · ${pending} sin resultado todavía.`}
		>
			<Legend
				items={[
					{ label: 'Negativa', color: RESULT_COLORS.negative },
					{ label: 'Positiva', color: RESULT_COLORS.positive },
					{ label: 'Pendiente', color: RESULT_COLORS.pending }
				]}
			/>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
				{SAMPLES_BY_TYPE.map((row) => {
					const rowTotal = row.negative + row.positive + row.pending;

					return (
						<Box
							key={row.type}
							sx={{
								display: 'grid',
								gridTemplateColumns: '150px 1fr 48px',
								gap: 1.5,
								alignItems: 'center'
							}}
						>
							<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{row.label}</Typography>
							<StackedBar
								height={18}
								showLegend={false}
								ariaLabel={`${row.label}: ${row.negative} negativas, ${row.positive} positivas, ${row.pending} pendientes`}
								segments={[
									{ label: 'Negativa', value: row.negative, color: RESULT_COLORS.negative },
									{ label: 'Positiva', value: row.positive, color: RESULT_COLORS.positive },
									{ label: 'Pendiente', value: row.pending, color: RESULT_COLORS.pending }
								]}
							/>
							<Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, textAlign: 'right' }}>
								{rowTotal}
							</Typography>
						</Box>
					);
				})}
			</Box>
			{positives.length > 0 && (
				<Box
					sx={{
						mt: 'auto',
						pt: 1.5,
						borderTop: 1,
						borderColor: 'divider',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
						{positives.map((p) => `${p.positive} positivas en ${p.label.toLowerCase()}`).join(' · ')}
					</Typography>
					<StatusPill
						tone="bad"
						label="Ver diagnósticos"
					/>
				</Box>
			)}
		</WidgetCard>
	);
}
