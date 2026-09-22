import { Box, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { SimpleColumn, SimpleTable } from '../../components/primitives/SimpleTable';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber } from '../../theme/formatters';
import { ACTIVE_BATCHES, ActiveBatchRow } from '../../mocks/stockMocks';
import { managementSystemLabel } from '@/ui/activities/components/production-sheet/managementSystem';

const FULL_COVERAGE = 90;

function CoverageCell({ row }: { row: ActiveBatchRow }) {
	if (row.weighed === 0) {
		return <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Sin pesajes</Typography>;
	}

	const pct = Math.round((row.weighed / row.heads) * 100);

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			<Box
				role="img"
				aria-label={`${pct} % pesados`}
				sx={{ width: 90, height: 8, borderRadius: '2px', bgcolor: 'action.hover' }}
			>
				<Box
					sx={{
						width: `${pct}%`,
						height: 8,
						borderRadius: '2px',
						bgcolor: pct >= FULL_COVERAGE ? DASHBOARD_COLORS.accent : DASHBOARD_COLORS.ochre
					}}
				/>
			</Box>
			<span>{`${row.weighed} de ${row.heads}`}</span>
		</Box>
	);
}

const COLUMNS: SimpleColumn<ActiveBatchRow>[] = [
	{ key: 'name', header: 'Lote', render: (r) => <strong>{r.name}</strong> },
	{ key: 'type', header: 'Tipo de lote', render: (r) => r.batchType },
	{ key: 'system', header: 'Manejo', render: (r) => managementSystemLabel(r) },
	{ key: 'heads', header: 'Cabezas', align: 'right', render: (r) => <strong>{r.heads}</strong> },
	{ key: 'coverage', header: 'Cobertura de pesaje', render: (r) => <CoverageCell row={r} /> },
	{
		key: 'avg',
		header: 'Peso prom.',
		align: 'right',
		render: (r) => (r.averageKg === null ? '—' : <strong>{`${formatNumber(r.averageKg)} kg`}</strong>)
	},
	{
		key: 'range',
		header: 'Mín–máx (kg)',
		align: 'right',
		render: (r) => (r.minKg === null || r.maxKg === null ? '—' : `${r.minKg}–${r.maxKg}`)
	}
];

export function ActiveBatchesWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? 'Lotes activos'}
			subtitle="Cobertura de pesaje = animales con al menos un peso sobre las cabezas del lote."
			flush
		>
			<SimpleTable
				columns={COLUMNS}
				rows={ACTIVE_BATCHES}
				getRowKey={(r) => r.name}
			/>
		</WidgetCard>
	);
}

export default ActiveBatchesWidget;
