import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StackedBar } from '../../components/primitives/StackedBar';
import { formatNumber } from '../../theme/formatters';
import { useDteMetrics } from './useDteMetrics';
import { CircularProgress, Box, Typography } from '@mui/material';

export function DteKpiWidget({ instance }: WidgetRenderProps) {
	const {
		totalDtes,
		inTransit,
		inIdentification,
		segmentsByHeads,
		isLoading,
		hasData
	} = useDteMetrics();

	if (isLoading) {
		return (
			<KpiCard
				label={instance.title ?? 'Hacienda en tránsito (DTe)'}
				value="—"
				unit="cabezas"
				visual={
					<Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<CircularProgress size={20} />
					</Box>
				}
				context="Cargando logística..."
			/>
		);
	}

	if (!hasData) {
		return (
			<KpiCard
				label={instance.title ?? 'Hacienda en tránsito (DTe)'}
				value="0"
				unit="cabezas"
				status={<StatusPill tone="neutral" label="Sin tropas" />}
				context={
					<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', pt: 0.5 }}>
						Sin movimientos oficiales registrados.
					</Typography>
				}
				footnote={<span>Documentos SENASA al día</span>}
			/>
		);
	}

	const tone = inTransit.heads > 0 ? 'info' : 'ok';
	const statusLabel = inTransit.heads > 0 ? `${inTransit.dtes} en viaje` : 'Al día';

	return (
		<KpiCard
			label={instance.title ?? 'Hacienda en tránsito (DTe)'}
			value={formatNumber(inTransit.heads)}
			unit="cabezas"
			status={<StatusPill tone={tone} label={statusLabel} />}
			visual={<StackedBar segments={segmentsByHeads} height={7} showLegend={false} />}
			context={
				<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, pt: 0.25 }}>
					<Box>
						<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
							Tropas en viaje
						</Typography>
						<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
							{inTransit.dtes}{' '}
							<Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.secondary' }}>
								de {totalDtes} DTe
							</Box>
						</Typography>
					</Box>
					<Box>
						<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
							Por identificar
						</Typography>
						<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: inIdentification.heads > 0 ? 'warning.main' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
							{formatNumber(inIdentification.heads)}{' '}
							<Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.secondary' }}>
								cab.
							</Box>
						</Typography>
					</Box>
				</Box>
			}
			footnote={<span>Órdenes de ingreso con DTe oficial</span>}
		/>
	);
}

export default DteKpiWidget;
