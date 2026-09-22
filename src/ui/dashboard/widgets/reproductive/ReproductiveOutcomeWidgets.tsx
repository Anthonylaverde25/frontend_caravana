import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { Delta } from '../../components/primitives/Delta';
import { ReferenceBar } from '../../components/primitives/ReferenceBar';
import { formatNumber, formatPercent, formatPp } from '../../theme/formatters';
import { CALVINGS, WEANING } from '../../mocks/reproductiveMocks';

export function WeaningRateWidget({ instance }: WidgetRenderProps) {
	const d = WEANING;
	const delta = d.rate - d.previousRate;

	return (
		<KpiCard
			label={instance.title ?? `Destete · campaña ${d.campaign}`}
			status={
				<StatusPill
					tone={delta >= 0 ? 'ok' : 'warn'}
					label={delta >= 0 ? 'Mejoró' : 'Empeoró'}
					trend={delta >= 0 ? 'up' : 'down'}
				/>
			}
			value={formatNumber(d.rate, 1)}
			unit="%"
			visual={
				<ReferenceBar
					value={d.rate}
					min={60}
					max={100}
					minLabel="60 %"
					maxLabel="100 %"
					marker={{
						value: d.previousRate,
						label: `${d.previousCampaign}: ${formatNumber(d.previousRate, 1)}`
					}}
					ariaLabel={`${formatPercent(d.rate)}; campaña ${d.previousCampaign}: ${formatPercent(d.previousRate)}`}
				/>
			}
			context={
				<>
					{`${d.weaned} terneros destetados de `}
					<strong>{`${d.exposed} vientres expuestos`}</strong>
					{' · '}
					<Delta
						text={formatPp(delta)}
						favorable={delta >= 0}
					/>
					{` vs. ${d.previousCampaign}`}
				</>
			}
			footnote={`Campaña cerrada · destete ${d.date}`}
		/>
	);
}

export function CalvingsProgressWidget({ instance }: WidgetRenderProps) {
	const d = CALVINGS;

	return (
		<KpiCard
			label={instance.title ?? 'Pariciones 2025/26'}
			status={
				<StatusPill
					tone="info"
					label="En curso"
				/>
			}
			value={String(d.registered)}
			unit="nacidos"
			visual={
				<ReferenceBar
					value={d.registered}
					min={0}
					max={d.expectedTotal}
					minLabel="0"
					maxLabel={String(d.expectedTotal)}
					marker={{ value: d.expectedToDate, label: `esperados a hoy ${d.expectedToDate}` }}
					ariaLabel={`${d.registered} nacimientos registrados; ${d.expectedToDate} esperados a la fecha sobre ${d.expectedTotal} preñeces`}
				/>
			}
			context={
				<>
					<strong>{d.expectedToDate - d.registered}</strong>
					{` esperados sin registrar · quedan ${d.expectedTotal - d.expectedToDate} por parir hasta el ${d.lastDueDate}`}
				</>
			}
			footnote="Según fecha probable de parto de cada preñez"
		/>
	);
}
