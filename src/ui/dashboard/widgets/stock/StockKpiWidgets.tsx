import { Box, CircularProgress, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StackedBar } from '../../components/primitives/StackedBar';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatPercent } from '../../theme/formatters';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';

/** Active caravans in the currently active company/hacienda. */
export function StockTotalWidget({ instance }: WidgetRenderProps) {
	const { activeCompanyId } = useCompany();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'all');

	if (isLoading) {
		return (
			<KpiCard
				label={instance.title ?? 'Existencias del rodeo'}
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
			label={instance.title ?? 'Existencias del rodeo'}
			value={formatNumber(totalHeads)}
			unit="cabezas"
			visual={
				totalHeads > 0 ? (
					<StackedBar
						height={7}
						showLegend={false}
						segments={segments}
					/>
				) : null
			}
			context={
				totalHeads > 0 ? (
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, pt: 0.25 }}>
						<Box>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								Hembras
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{formatNumber(females)}{' '}
								<Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.secondary' }}>
									({femalePct}%)
								</Box>
							</Typography>
						</Box>
						<Box>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								Machos
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{formatNumber(males)}{' '}
								<Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.secondary' }}>
									({malePct}%)
								</Box>
							</Typography>
						</Box>
						<Box>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								En lote
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{formatNumber(inBatch)}
							</Typography>
						</Box>
						<Box>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								Sin lote
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: unassigned > 0 ? 'warning.main' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{formatNumber(unassigned)}
							</Typography>
						</Box>
					</Box>
				) : (
					'Sin animales registrados para esta hacienda.'
				)
			}
			footnote={<span>Hacienda activa en establecimiento</span>}
		/>
	);
}

/** Vientres Productivos KPI: Females, Cows vs Replacement breakdown. */
export function StockFemalesKpiWidget({ instance }: WidgetRenderProps) {
	const { activeCompanyId } = useCompany();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'all');

	if (isLoading) {
		return (
			<KpiCard
				label={instance.title ?? 'Vientres productivos'}
				value="—"
				unit="vientres"
				visual={
					<Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<CircularProgress size={20} />
					</Box>
				}
				context="Cargando vientres..."
			/>
		);
	}

	const totalHeads = caravans.length;
	const females = caravans.filter((c) => c.sex === 'H');
	const femalesCount = females.length;
	const pctOfHerd = totalHeads > 0 ? ((femalesCount / totalHeads) * 100).toFixed(1) : '0';

	let adultCows = 0;
	let replacements = 0;

	females.forEach((c) => {
		const cat = (c.category_name || c.category || '').toLowerCase();
		if (cat.includes('vaca')) {
			adultCows++;
		} else {
			replacements++;
		}
	});

	const cowPct = femalesCount > 0 ? Math.round((adultCows / femalesCount) * 100) : 0;
	const repPct = femalesCount > 0 ? Math.round((replacements / femalesCount) * 100) : 0;

	const segments = [
		{ label: 'Vacas', value: adultCows, color: '#059669' },
		{ label: 'Reposición', value: replacements, color: '#34D399' }
	];

	return (
		<KpiCard
			label={instance.title ?? 'Vientres productivos'}
			value={formatNumber(femalesCount)}
			unit="vientres"
			visual={
				femalesCount > 0 ? (
					<StackedBar
						height={7}
						showLegend={false}
						segments={segments}
					/>
				) : null
			}
			context={
				femalesCount > 0 ? (
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, pt: 0.25 }}>
						<Box>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								Vacas adultas
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{formatNumber(adultCows)}{' '}
								<Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.secondary' }}>
									({cowPct}%)
								</Box>
							</Typography>
						</Box>
						<Box>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								Reposición
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{formatNumber(replacements)}{' '}
								<Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.secondary' }}>
									({repPct}%)
								</Box>
							</Typography>
						</Box>
						<Box sx={{ gridColumn: 'span 2' }}>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								Impacto en rodeo general
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
								{pctOfHerd}% del total
							</Typography>
						</Box>
					</Box>
				) : (
					'Sin hembras registradas.'
				)
			}
			footnote={<span>Fábrica de terneros y reposición</span>}
		/>
	);
}

/** Invernada & Toros KPI: Males, Steers/Growing vs Sires breakdown. */
export function StockMalesKpiWidget({ instance }: WidgetRenderProps) {
	const { activeCompanyId } = useCompany();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'all');

	if (isLoading) {
		return (
			<KpiCard
				label={instance.title ?? 'Invernada y toros'}
				value="—"
				unit="machos"
				visual={
					<Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<CircularProgress size={20} />
					</Box>
				}
				context="Cargando machos..."
			/>
		);
	}

	const totalHeads = caravans.length;
	const males = caravans.filter((c) => c.sex === 'M');
	const malesCount = males.length;
	const pctOfHerd = totalHeads > 0 ? ((malesCount / totalHeads) * 100).toFixed(1) : '0';

	let sires = 0;
	let steersAndGrowing = 0;

	males.forEach((c) => {
		const cat = (c.category_name || c.category || '').toLowerCase();
		if (cat.includes('toro')) {
			sires++;
		} else {
			steersAndGrowing++;
		}
	});

	const steerPct = malesCount > 0 ? Math.round((steersAndGrowing / malesCount) * 100) : 0;
	const sirePct = malesCount > 0 ? Math.round((sires / malesCount) * 100) : 0;

	const segments = [
		{ label: 'Recría / Invernada', value: steersAndGrowing, color: '#2563EB' },
		{ label: 'Toros', value: sires, color: '#60A5FA' }
	];

	return (
		<KpiCard
			label={instance.title ?? 'Invernada y toros'}
			value={formatNumber(malesCount)}
			unit="machos"
			visual={
				malesCount > 0 ? (
					<StackedBar
						height={7}
						showLegend={false}
						segments={segments}
					/>
				) : null
			}
			context={
				malesCount > 0 ? (
					<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, pt: 0.25 }}>
						<Box>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								Recría / Invernada
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{formatNumber(steersAndGrowing)}{' '}
								<Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.secondary' }}>
									({steerPct}%)
								</Box>
							</Typography>
						</Box>
						<Box>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								Toros
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{formatNumber(sires)}{' '}
								<Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.secondary' }}>
									({sirePct}%)
								</Box>
							</Typography>
						</Box>
						<Box sx={{ gridColumn: 'span 2' }}>
							<Typography sx={{ fontSize: '0.71875rem', color: 'text.secondary', fontWeight: 500 }}>
								Impacto en rodeo general
							</Typography>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563EB', fontVariantNumeric: 'tabular-nums' }}>
								{pctOfHerd}% del total
							</Typography>
						</Box>
					</Box>
				) : (
					'Sin machos registrados.'
				)
			}
			footnote={<span>Torada reproductora y ciclo de engorde</span>}
		/>
	);
}

/** Breed composition widget redesigned with dominant breed focus and tabular bars. */
export function StockByBreedWidget({ instance }: WidgetRenderProps) {
	const { activeCompanyId } = useCompany();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'all');

	if (isLoading) {
		return (
			<KpiCard
				label={instance.title ?? 'Composición por raza'}
				value="—"
				unit="razas"
				visual={
					<Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<CircularProgress size={20} />
					</Box>
				}
				context="Consultando razas del rodeo..."
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

	const dominant = sortedBreeds[0] ?? { label: 'Sin especificar', value: 0, pct: 0 };
	const topBreeds = sortedBreeds.slice(0, 3);

	const colors = [DASHBOARD_COLORS.accent, DASHBOARD_COLORS.accentMid, '#64748B'];

	return (
		<KpiCard
			label={instance.title ?? 'Raza predominante'}
			value={dominant.label}
			unit={`${dominant.pct}%`}
			visual={
				topBreeds.length > 0 ? (
					<StackedBar
						height={7}
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
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pt: 0.25 }}>
					{topBreeds.map((b) => (
						<Box key={b.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Typography sx={{ fontSize: '0.78125rem', color: 'text.secondary' }}>
								{b.label}
							</Typography>
							<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{formatNumber(b.value)} <Box component="span" sx={{ fontSize: '0.71875rem', fontWeight: 400, color: 'text.secondary' }}>({b.pct}%)</Box>
							</Typography>
						</Box>
					))}
				</Box>
			}
			footnote={<span>Distribución genética sobre {formatNumber(totalHeads)} cabezas</span>}
		/>
	);
}
