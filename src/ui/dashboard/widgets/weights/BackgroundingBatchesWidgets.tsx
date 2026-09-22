import { Box, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { SimpleColumn, SimpleTable, StackedCell } from '../../components/primitives/SimpleTable';
import { StatusPill } from '../../components/primitives/StatusPill';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, toPercentOfRange } from '../../theme/formatters';
import { BACKGROUNDING_BATCHES, BackgroundingBatchRow, STALE_WEIGHT_DAYS } from '../../mocks/weightsMocks';
import { managementSystemLabel } from '@/ui/activities/components/production-sheet/managementSystem';

const ADPV_SCALE_MAX = 0.8;

function AdpvBar({ value, width = 150 }: { value: number; width?: number }) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
			<Box
				role="img"
				aria-label={`${formatNumber(value, 2)} kilos por día`}
				sx={{ width, height: 8, borderRadius: '2px', bgcolor: 'action.hover' }}
			>
				<Box
					sx={{
						width: `${toPercentOfRange(value, 0, ADPV_SCALE_MAX)}%`,
						height: 8,
						borderRadius: '2px',
						bgcolor: DASHBOARD_COLORS.accent
					}}
				/>
			</Box>
			<strong>{formatNumber(value, 2)}</strong>
		</Box>
	);
}

const isStale = (row: BackgroundingBatchRow) => row.daysSinceWeighing > STALE_WEIGHT_DAYS;

const COLUMNS: SimpleColumn<BackgroundingBatchRow>[] = [
	{ key: 'name', header: 'Lote', render: (r) => <strong>{r.name}</strong> },
	{ key: 'system', header: 'Manejo', render: (r) => managementSystemLabel(r) },
	{ key: 'heads', header: 'Cabezas', align: 'right', render: (r) => r.heads },
	{ key: 'kg', header: 'Kg totales', align: 'right', render: (r) => formatNumber(r.totalKg) },
	{ key: 'avg', header: 'Peso prom.', align: 'right', render: (r) => <strong>{`${r.averageKg} kg`}</strong> },
	{ key: 'adpv', header: 'ADPV 60 días', width: 230, render: (r) => <AdpvBar value={r.adpv} /> },
	{
		key: 'last',
		header: 'Último pesaje',
		render: (r) => (
			<StackedCell
				primary={
					<Box
						component="span"
						sx={{ color: isStale(r) ? 'warning.dark' : 'text.primary' }}
					>
						{r.lastWeighing}
					</Box>
				}
				secondary={`hace ${r.daysSinceWeighing} días`}
			/>
		)
	},
	{
		key: 'freshness',
		header: 'Vigencia',
		render: (r) =>
			isStale(r) ? (
				<StatusPill
					tone="warn"
					label="Dato desactualizado"
				/>
			) : (
				<StatusPill
					tone="ok"
					label="Pesos vigentes"
				/>
			)
	}
];

export function BackgroundingBatchesWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? 'Lotes de recría'}
			subtitle={`ADPV en una escala común de 0 a 0,8 kg/día. Un pesaje de más de ${STALE_WEIGHT_DAYS} días se marca como desactualizado.`}
			flush
		>
			<SimpleTable
				columns={COLUMNS}
				rows={BACKGROUNDING_BATCHES}
				getRowKey={(r) => r.name}
			/>
		</WidgetCard>
	);
}

export function AdpvByBatchWidget({ instance }: WidgetRenderProps) {
	const rows = [...BACKGROUNDING_BATCHES].sort((a, b) => b.adpv - a.adpv);

	return (
		<WidgetCard
			title={instance.title ?? 'ADPV por lote'}
			subtitle="Ordenado de mayor a menor, en una escala común de 0 a 0,8 kg/día."
			footnote="Un lote con pesos vencidos muestra su antigüedad debajo del nombre"
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				{rows.map((r) => (
					<Box
						key={r.name}
						sx={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 1.5, alignItems: 'center' }}
					>
						<Box>
							<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{r.name}</Typography>
							<Typography
								sx={{ fontSize: '0.75rem', color: isStale(r) ? 'warning.dark' : 'text.secondary' }}
							>
								{`${managementSystemLabel(r, 'Manejo sin declarar')}${isStale(r) ? ` · pesos de hace ${r.daysSinceWeighing} d` : ''}`}
							</Typography>
						</Box>
						<AdpvBar
							value={r.adpv}
							width={220}
						/>
					</Box>
				))}
			</Box>
		</WidgetCard>
	);
}
