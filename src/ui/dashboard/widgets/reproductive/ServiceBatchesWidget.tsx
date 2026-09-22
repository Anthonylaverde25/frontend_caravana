import { Box, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { SimpleColumn, SimpleTable, StackedCell } from '../../components/primitives/SimpleTable';
import { StatusPill } from '../../components/primitives/StatusPill';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatPp } from '../../theme/formatters';
import { HEAD_OF_CALVING, PREGNANCY, SERVICE_BATCHES, ServiceBatchRow } from '../../mocks/reproductiveMocks';

/** Establishment average over checked batches; each batch is compared against it. */
const AVERAGE = PREGNANCY.rate;

function RateCell({ row }: { row: ServiceBatchRow }) {
	if (row.rate === null) {
		return (
			<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
				Sin tacto: no entra en el total
			</Typography>
		);
	}

	return (
		<Box>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
				<Box
					role="img"
					aria-label={`${formatNumber(row.rate, 1)} %; promedio ${formatNumber(AVERAGE, 1)} %`}
					sx={{ position: 'relative', flexGrow: 1, height: 10, borderRadius: '3px', bgcolor: 'action.hover' }}
				>
					<Box
						sx={{
							width: `${row.rate}%`,
							height: 10,
							borderRadius: '3px',
							bgcolor: DASHBOARD_COLORS.accent
						}}
					/>
					<Box
						sx={{
							position: 'absolute',
							left: `${AVERAGE}%`,
							top: -4,
							width: 2,
							height: 18,
							bgcolor: 'text.primary'
						}}
					/>
				</Box>
				<strong style={{ width: 64 }}>{`${formatNumber(row.rate, 1)} %`}</strong>
			</Box>
			<Typography
				sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
			>{`${row.pregnant} preñadas`}</Typography>
		</Box>
	);
}

function ComparisonCell({ row }: { row: ServiceBatchRow }) {
	if (row.rate === null) {
		return (
			<StatusPill
				tone="info"
				label="Pendiente"
			/>
		);
	}

	const delta = row.rate - AVERAGE;

	return (
		<StatusPill
			tone={delta >= 0 ? 'ok' : 'warn'}
			trend={delta >= 0 ? 'up' : 'down'}
			label={`${formatPp(delta)} vs. promedio`}
		/>
	);
}

const COLUMNS: SimpleColumn<ServiceBatchRow>[] = [
	{
		key: 'name',
		header: 'Lote',
		render: (r) => (
			<StackedCell
				primary={r.name}
				secondary={r.description}
			/>
		)
	},
	{
		key: 'service',
		header: 'Servicio',
		render: (r) => (
			<StackedCell
				primary={r.service}
				secondary={r.serviceDetail}
			/>
		)
	},
	{ key: 'exposed', header: 'Expuestos', align: 'right', render: (r) => <strong>{r.exposed}</strong> },
	{
		key: 'check',
		header: 'Tacto',
		render: (r) =>
			r.checkDate ?? (
				<Typography
					sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'info.main' }}
				>{`Programado ${r.scheduledCheck}`}</Typography>
			)
	},
	{ key: 'rate', header: 'Preñez', width: 260, render: (r) => <RateCell row={r} /> },
	{ key: 'head', header: 'Cabeza', align: 'right', render: (r) => (r.headRate === null ? '—' : `${r.headRate} %`) },
	{ key: 'empty', header: 'Vacías', align: 'right', render: (r) => r.empty ?? '—' },
	{ key: 'cmp', header: 'Comparación', render: (r) => <ComparisonCell row={r} /> }
];

export function ServiceBatchesWidget({ instance }: WidgetRenderProps) {
	const checked = SERVICE_BATCHES.filter((b) => b.rate !== null);
	const exposed = checked.reduce((acc, b) => acc + b.exposed, 0);
	const empty = checked.reduce((acc, b) => acc + (b.empty ?? 0), 0);

	return (
		<WidgetCard
			title={instance.title ?? 'Lotes de servicio · campaña 2025/26'}
			subtitle={`La línea negra marca el promedio del establecimiento con tacto (${formatNumber(AVERAGE, 1)} %).`}
			flush
		>
			<SimpleTable
				columns={COLUMNS}
				rows={SERVICE_BATCHES}
				getRowKey={(r) => r.id}
				isRowMuted={(r) => r.rate === null}
				footer={[
					'Total con tacto',
					`${checked.length} de ${SERVICE_BATCHES.length} lotes`,
					String(exposed),
					'',
					`${formatNumber(PREGNANCY.rate, 1)} % · ${PREGNANCY.pregnant} preñadas`,
					`${formatNumber(HEAD_OF_CALVING.rate, 1)} %`,
					String(empty),
					''
				]}
			/>
		</WidgetCard>
	);
}

export default ServiceBatchesWidget;
