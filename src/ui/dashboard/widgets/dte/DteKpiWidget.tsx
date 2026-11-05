import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
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
				status={
					<Box
						sx={{
							fontSize: '0.6875rem',
							fontWeight: 600,
							color: 'text.secondary',
							bgcolor: (theme) =>
								theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
							px: 0.875,
							py: 0.25,
							borderRadius: '4px'
						}}
					>
						Sin tropas
					</Box>
				}
				context={
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', pt: 0.5 }}>
						Sin movimientos oficiales registrados.
					</Typography>
				}
				footnote={<span>Documentos SENASA al día</span>}
			/>
		);
	}

	const hasTransit = inTransit.heads > 0;

	return (
		<KpiCard
			label={instance.title ?? 'Hacienda en tránsito (DTe)'}
			value={formatNumber(inTransit.heads)}
			unit="cabezas"
			status={
				<Box
					sx={{
						fontSize: '0.6875rem',
						fontWeight: 600,
						color: hasTransit ? 'primary.main' : 'success.main',
						bgcolor: hasTransit
							? (theme) => (theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.08)')
							: (theme) => (theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)'),
						px: 0.875,
						py: 0.25,
						borderRadius: '4px',
						display: 'inline-flex',
						alignItems: 'center',
						gap: 0.5
					}}
				>
					<Box
						sx={{
							width: 5,
							height: 5,
							borderRadius: '50%',
							bgcolor: hasTransit ? 'primary.main' : 'success.main'
						}}
					/>
					{hasTransit ? `${inTransit.dtes} en viaje` : 'Al día'}
				</Box>
			}
			visual={<StackedBar segments={segmentsByHeads} height={4} showLegend={false} />}
			context={
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.875, pt: 0.25 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
							<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
								Tropas en viaje
							</Typography>
							<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{inTransit.dtes}{' '}
								<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
									de {totalDtes} DTe
								</Box>
							</Typography>
						</Box>

						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
							<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
								Por identificar
							</Typography>
							<Typography
								sx={{
									fontSize: '0.8125rem',
									fontWeight: 600,
									color: inIdentification.heads > 0 ? 'warning.main' : 'text.primary',
									fontVariantNumeric: 'tabular-nums'
								}}
							>
								{formatNumber(inIdentification.heads)}{' '}
								<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
									cab.
								</Box>
							</Typography>
						</Box>
					</Box>
				</Box>
			}
			footnote={<span>Órdenes de ingreso con DTe oficial</span>}
		/>
	);
}

export default DteKpiWidget;
