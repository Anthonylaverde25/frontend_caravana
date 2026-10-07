import { Box, CircularProgress } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StackedBar } from '../../components/primitives/StackedBar';
import { HorizontalBarList } from '../../components/primitives/HorizontalBarList';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber } from '../../theme/formatters';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';

/** Active caravans in the currently active company/hacienda. */
export function StockTotalWidget({ instance }: WidgetRenderProps) {
	const { activeCompanyId } = useCompany();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'all');

	if (isLoading) {
		return (
			<KpiCard
				label={instance.title ?? 'Existencias'}
				status={<StatusPill tone="neutral" label="Sincronizando..." />}
				value="—"
				unit="cabezas"
				visual={
					<Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<CircularProgress size={20} />
					</Box>
				}
				context="Consultando rodeo en vivo..."
				footnote="Caravanas activas en la hacienda"
			/>
		);
	}

	const totalHeads = caravans.length;
	const females = caravans.filter((c) => c.sex === 'H').length;
	const males = caravans.filter((c) => c.sex === 'M').length;
	const undefinedSex = totalHeads - females - males;
	const inBatch = caravans.filter((c) => c.batch_id != null).length;
	const unassigned = totalHeads - inBatch;

	const femalePct = totalHeads > 0 ? Math.round((females / totalHeads) * 100) : 0;
	const malePct = totalHeads > 0 ? Math.round((males / totalHeads) * 100) : 0;

	const segments = [
		{ label: 'Hembras', value: females, color: '#059669' },
		{ label: 'Machos', value: males, color: '#2563EB' },
		...(undefinedSex > 0 ? [{ label: 'S/D', value: undefinedSex, color: '#9CA3AF' }] : [])
	];

	return (
		<KpiCard
			label={instance.title ?? 'Existencias'}
			status={
				<StatusPill
					tone={totalHeads > 0 ? 'ok' : 'neutral'}
					label={totalHeads > 0 ? 'En rodeo' : 'Sin stock'}
				/>
			}
			value={formatNumber(totalHeads)}
			unit="cabezas"
			visual={
				totalHeads > 0 ? (
					<StackedBar
						height={12}
						showLegend={false}
						segments={segments}
					/>
				) : null
			}
			context={
				totalHeads > 0 ? (
					<>
						<strong>{formatNumber(females)}</strong> hembras ({femalePct}%) · <strong>{formatNumber(males)}</strong> machos ({malePct}%)
						<br />
						<strong>{formatNumber(inBatch)}</strong> en lote · <strong>{formatNumber(unassigned)}</strong> sin lote
					</>
				) : (
					'Sin animales registrados para esta hacienda.'
				)
			}
			footnote={`Caravanas activas en la hacienda · ${totalHeads > 0 ? 'En vivo' : '0 registros'}`}
		/>
	);
}

export function StockByBreedWidget({ instance }: WidgetRenderProps) {
	const { activeCompanyId } = useCompany();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'all');

	if (isLoading) {
		return (
			<KpiCard
				label={instance.title ?? 'Composición por raza'}
				status={<StatusPill tone="neutral" label="Sincronizando..." />}
				value="—"
				unit="cabezas"
				visual={
					<Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<CircularProgress size={20} />
					</Box>
				}
				context="Consultando razas del rodeo..."
				footnote="Sin raza cargada cuenta como “Sin especificar”"
			/>
		);
	}

	const totalHeads = caravans.length;
	const breedCounts: Record<string, number> = {};
	for (const c of caravans) {
		const breed = c.breed?.trim() || 'Sin especificar';
		breedCounts[breed] = (breedCounts[breed] || 0) + 1;
	}

	const sortedBreeds = Object.entries(breedCounts)
		.map(([label, value]) => ({
			label,
			value,
			pct: totalHeads > 0 ? Math.round((value / totalHeads) * 100) : 0
		}))
		.sort((a, b) => b.value - a.value);

	const topBreeds = sortedBreeds.slice(0, 4);
	if (sortedBreeds.length > 4) {
		const otherValue = sortedBreeds.slice(4).reduce((sum, b) => sum + b.value, 0);
		topBreeds.push({
			label: 'Otras',
			value: otherValue,
			pct: totalHeads > 0 ? Math.round((otherValue / totalHeads) * 100) : 0
		});
	}

	const colors = [DASHBOARD_COLORS.accent, DASHBOARD_COLORS.accentMid, '#9DBFAE', DASHBOARD_COLORS.neutral, '#64748B'];

	return (
		<KpiCard
			label={instance.title ?? 'Composición por raza'}
			value={formatNumber(totalHeads)}
			unit="cabezas"
			visual={
				topBreeds.length > 0 ? (
					<StackedBar
						height={16}
						showLegend={false}
						segments={topBreeds.map((row, i) => ({
							label: row.label,
							value: row.value,
							color: colors[i % colors.length]
						}))}
					/>
				) : null
			}
			context={
				topBreeds.length > 0 ? (
					<HorizontalBarList
						labelWidth={110}
						rows={topBreeds.map((row, i) => ({
							label: row.label,
							value: row.value,
							display: `${row.pct} %`,
							color: colors[i % colors.length]
						}))}
					/>
				) : (
					'Sin animales registrados.'
				)
			}
			footnote="Sin raza cargada cuenta como “Sin especificar”"
		/>
	);
}
