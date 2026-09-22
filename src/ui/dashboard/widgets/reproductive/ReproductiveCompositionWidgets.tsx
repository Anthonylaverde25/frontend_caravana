import { Box, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { Legend, StackedBar } from '../../components/primitives/StackedBar';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatPercent } from '../../theme/formatters';
import { PHYSIOLOGICAL_STATE, PREGNANCY_BY_THIRD, PREGNANCY_BY_THIRD_TOTAL } from '../../mocks/reproductiveMocks';

const THIRD_COLORS = {
	head: DASHBOARD_COLORS.accent,
	body: DASHBOARD_COLORS.accentMid,
	tail: DASHBOARD_COLORS.accentLight
};

interface ThirdRowProps {
	label: string;
	pregnant: number;
	head: number;
	body: number;
	tail: number;
	emphasis?: boolean;
}

function ThirdRow({ label, pregnant, head, body, tail, emphasis = false }: ThirdRowProps) {
	const cells = [
		{ key: 'head', value: head, color: THIRD_COLORS.head, text: '#FFFFFF' },
		{ key: 'body', value: body, color: THIRD_COLORS.body, text: '#10281D' },
		{ key: 'tail', value: tail, color: THIRD_COLORS.tail, text: '#10281D' }
	];

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
				<Typography sx={{ fontSize: '0.8125rem', fontWeight: emphasis ? 700 : 600 }}>{label}</Typography>
				<Typography
					sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
				>{`${pregnant} preñadas`}</Typography>
			</Box>
			<Box
				role="img"
				aria-label={`${label}: cabeza ${head} %, cuerpo ${body} %, cola ${tail} %`}
				sx={{
					display: 'flex',
					height: 26,
					borderRadius: '4px',
					overflow: 'hidden',
					fontSize: '0.75rem',
					fontWeight: 600
				}}
			>
				{cells.map((c) => (
					<Box
						key={c.key}
						sx={{
							width: `${c.value}%`,
							bgcolor: c.color,
							color: c.text,
							display: 'flex',
							alignItems: 'center',
							pl: 1,
							fontVariantNumeric: 'tabular-nums',
							whiteSpace: 'nowrap',
							overflow: 'hidden'
						}}
					>
						{c.key === 'tail'
							? formatNumber(c.value, c.value % 1 ? 1 : 0)
							: formatPercent(c.value, c.value % 1 ? 1 : 0)}
					</Box>
				))}
			</Box>
		</Box>
	);
}

/** caravan_gestations.gestation_stage (head · body · tail) over the pregnant females of each batch. */
export function PregnancyByThirdWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? '¿Cuándo quedaron preñadas?'}
			subtitle="Reparto de las preñadas por tercio del servicio (21 días cada uno). Más cabeza = parición temprana y terneros más pesados."
		>
			<Legend
				items={[
					{ label: 'Cabeza', color: THIRD_COLORS.head },
					{ label: 'Cuerpo', color: THIRD_COLORS.body },
					{ label: 'Cola', color: THIRD_COLORS.tail }
				]}
			/>
			{PREGNANCY_BY_THIRD.map((row) => (
				<ThirdRow
					key={row.label}
					{...row}
				/>
			))}
			<Box sx={{ pt: 1.75, borderTop: 1, borderColor: 'divider' }}>
				<ThirdRow
					{...PREGNANCY_BY_THIRD_TOTAL}
					emphasis
				/>
			</Box>
		</WidgetCard>
	);
}

const STATE_COLORS: Record<string, string> = {
	PREGNANT_LACTATING: DASHBOARD_COLORS.accent,
	PREGNANT_DRY: DASHBOARD_COLORS.accentMid,
	IN_SERVICE: DASHBOARD_COLORS.info,
	EMPTY_DRY: DASHBOARD_COLORS.danger,
	EMPTY_LACTATING: DASHBOARD_COLORS.ochre,
	UNKNOWN: DASHBOARD_COLORS.neutral
};

/** Every cow sits in exactly one PhysiologicalState; undeterminable ones stay as "Sin dato", never redistributed. */
export function PhysiologicalStateWidget({ instance }: WidgetRenderProps) {
	const d = PHYSIOLOGICAL_STATE;

	return (
		<WidgetCard
			title={instance.title ?? 'Estado fisiológico de los vientres'}
			subtitle={`${d.total} vacas. Preñez y lactancia combinadas definen la exigencia nutricional de cada grupo.`}
			footnote="“Vacía seca” es la candidata a refugo inmediato"
		>
			<StackedBar
				height={22}
				showLegend={false}
				segments={d.rows.map((r) => ({ label: r.label, value: r.value, color: STATE_COLORS[r.state] }))}
			/>
			<Box>
				{d.rows.map((r) => (
					<Box
						key={r.state}
						sx={{
							display: 'grid',
							gridTemplateColumns: '14px 1fr 44px 56px',
							gap: 1,
							alignItems: 'center',
							py: 0.75,
							borderBottom: 1,
							borderColor: 'divider',
							fontSize: '0.8125rem',
							fontVariantNumeric: 'tabular-nums'
						}}
					>
						<Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: STATE_COLORS[r.state] }} />
						<span>{r.label}</span>
						<strong style={{ textAlign: 'right' }}>{r.value}</strong>
						<Box
							component="span"
							sx={{ textAlign: 'right', color: 'text.secondary' }}
						>
							{formatPercent((r.value / d.total) * 100)}
						</Box>
					</Box>
				))}
			</Box>
		</WidgetCard>
	);
}
