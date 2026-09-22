import { Box, Link, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { SimpleColumn, SimpleTable } from '../../components/primitives/SimpleTable';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StatusTone, DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, toPercentOfRange } from '../../theme/formatters';
import {
	ANDROLOGICAL,
	AndrologicalRow,
	BULLS_REQUIRING_ACTION,
	DIAGNOSES_BY_PATHOGEN,
	LAB_EXPECTED_DAYS,
	PENDING_PROTOCOLS,
	PENDING_PROTOCOLS_REST,
	PathogenRow,
	PendingProtocolRow
} from '../../mocks/healthMocks';

const WAIT_SCALE_MAX = 45;

const APTITUDE_STATUS: Record<AndrologicalRow['status'], { tone: StatusTone; label: string }> = {
	APT: { tone: 'ok', label: 'Apto' },
	UNFIT: { tone: 'bad', label: 'No apto' },
	IN_TREATMENT: { tone: 'warn', label: 'En tratamiento' },
	PENDING_EVALUATION: { tone: 'neutral', label: 'Sin evaluación vigente' }
};

function WaitCell({ days }: { days: number }) {
	const late = days > LAB_EXPECTED_DAYS;

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
			<Box
				role="img"
				aria-label={`${days} días de espera, plazo ${LAB_EXPECTED_DAYS}`}
				sx={{ position: 'relative', width: 150, height: 8, borderRadius: '2px', bgcolor: 'action.hover' }}
			>
				<Box
					sx={{
						width: `${toPercentOfRange(days, 0, WAIT_SCALE_MAX)}%`,
						height: 8,
						borderRadius: '2px',
						bgcolor: late ? DASHBOARD_COLORS.danger : DASHBOARD_COLORS.neutralDark
					}}
				/>
				<Box
					sx={{
						position: 'absolute',
						left: `${toPercentOfRange(LAB_EXPECTED_DAYS, 0, WAIT_SCALE_MAX)}%`,
						top: -4,
						width: 2,
						height: 16,
						bgcolor: 'text.primary'
					}}
				/>
			</Box>
			<strong>{`${days} d`}</strong>
		</Box>
	);
}

const PROTOCOL_COLUMNS: SimpleColumn<PendingProtocolRow>[] = [
	{ key: 'n', header: 'Protocolo', render: (r) => <strong>{r.protocolNumber}</strong> },
	{ key: 'analysis', header: 'Análisis', render: (r) => r.analysis },
	{ key: 'dest', header: 'Destino', render: (r) => r.destination },
	{
		key: 'samples',
		header: 'Sin resultado',
		align: 'right',
		render: (r) => `${r.pendingSamples} de ${r.totalSamples}`
	},
	{ key: 'vet', header: 'Profesional', render: (r) => r.veterinarian },
	{ key: 'wait', header: 'Espera', width: 220, render: (r) => <WaitCell days={r.daysWaiting} /> },
	{
		key: 'status',
		header: 'Estado',
		render: (r) =>
			r.daysWaiting > LAB_EXPECTED_DAYS ? (
				<StatusPill
					tone="bad"
					label="Demorado"
				/>
			) : (
				<StatusPill
					tone="neutral"
					label="En plazo"
				/>
			)
	}
];

/** Protocols not voided with PENDING_RESULTS samples; waiting = today − sample_date. */
export function PendingProtocolsWidget({ instance }: WidgetRenderProps) {
	const rows = [...PENDING_PROTOCOLS].sort((a, b) => b.daysWaiting - a.daysWaiting);

	return (
		<WidgetCard
			title={instance.title ?? 'Protocolos de laboratorio pendientes'}
			subtitle={`Ordenados por días de espera. Escala 0–${WAIT_SCALE_MAX} días; la línea negra es el plazo de ${LAB_EXPECTED_DAYS}.`}
			actions={
				<Link
					href="/gestation/diagnostic-protocols"
					sx={{ fontSize: '0.8125rem', fontWeight: 600 }}
				>
					{`Ver los ${PENDING_PROTOCOLS_REST.protocols} restantes (${PENDING_PROTOCOLS_REST.samples} muestras) →`}
				</Link>
			}
			flush
		>
			<SimpleTable
				columns={PROTOCOL_COLUMNS}
				rows={rows}
				getRowKey={(r) => r.id}
			/>
		</WidgetCard>
	);
}

export function BullsRequiringActionWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? 'Toros que requieren acción'}
			subtitle="Antes del próximo servicio. Los toros aptos no se listan."
		>
			<Box
				component="ul"
				sx={{ listStyle: 'none', m: 0, p: 0 }}
			>
				{BULLS_REQUIRING_ACTION.map((b, i) => (
					<Box
						component="li"
						key={b.id}
						sx={{
							display: 'grid',
							gridTemplateColumns: '110px 1fr auto',
							gap: 1.5,
							alignItems: 'center',
							py: 1.5,
							borderBottom: i === BULLS_REQUIRING_ACTION.length - 1 ? 0 : 1,
							borderColor: 'divider'
						}}
					>
						<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{b.tag}</Typography>
						<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{b.reason}</Typography>
						<StatusPill {...APTITUDE_STATUS[b.status]} />
					</Box>
				))}
			</Box>
		</WidgetCard>
	);
}

const PATHOGEN_COLUMNS: SimpleColumn<PathogenRow>[] = [
	{ key: 'name', header: 'Patógeno', render: (r) => <strong>{r.name}</strong> },
	{ key: 'cat', header: 'Categoría', render: (r) => r.category },
	{
		key: 'dq',
		header: 'Servicio',
		render: (r) =>
			r.isDisqualifying ? (
				<StatusPill
					tone="bad"
					label="Descalifica"
				/>
			) : (
				'No'
			)
	},
	{
		key: 'pos',
		header: 'Positivo',
		align: 'right',
		render: (r) => (r.confirmed ? <Box sx={{ color: 'error.main', fontWeight: 700 }}>{r.confirmed}</Box> : '—')
	},
	{ key: 'treat', header: 'Tratam.', align: 'right', render: (r) => r.inTreatment || '—' },
	{ key: 'susp', header: 'Sospecha', align: 'right', render: (r) => r.suspected || '—' }
];

export function DiagnosesByPathogenWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? 'Diagnósticos activos por patógeno'}
			subtitle="Casos abiertos: positivo confirmado, en tratamiento o sospecha. Los resueltos no se cuentan."
			flush
		>
			<SimpleTable
				columns={PATHOGEN_COLUMNS}
				rows={DIAGNOSES_BY_PATHOGEN}
				getRowKey={(r) => r.name}
			/>
		</WidgetCard>
	);
}

const ANDRO_COLUMNS: SimpleColumn<AndrologicalRow>[] = [
	{ key: 'tag', header: 'Toro', render: (r) => <strong>{r.tag}</strong> },
	{
		key: 'ce',
		header: 'CE (cm)',
		align: 'right',
		render: (r) => (r.scrotalCm === null ? '—' : formatNumber(r.scrotalCm, 1))
	},
	{
		key: 'cc',
		header: 'CC (1–5)',
		align: 'right',
		render: (r) => (r.bodyCondition === null ? '—' : formatNumber(r.bodyCondition, 1))
	},
	{ key: 'lib', header: 'Libido', render: (r) => (r.libido ? r.libido.replace('_', ' ').toLowerCase() : '—') },
	{ key: 'st', header: 'Estado', render: (r) => <StatusPill {...APTITUDE_STATUS[r.status]} /> }
];

export function AndrologicalWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? 'Evaluación andrológica'}
			subtitle="Última evaluación de cada toro. Referencia de circunferencia escrotal: [MÍNIMO POR EDAD Y RAZA]."
			flush
		>
			<SimpleTable
				columns={ANDRO_COLUMNS}
				rows={ANDROLOGICAL}
				getRowKey={(r) => r.id}
			/>
		</WidgetCard>
	);
}
