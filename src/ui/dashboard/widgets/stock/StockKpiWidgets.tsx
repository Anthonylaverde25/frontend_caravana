import { Box, CircularProgress, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StackedBar } from '../../components/primitives/StackedBar';
import { formatNumber } from '../../theme/formatters';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';

/** Active caravans in the currently active company/hacienda (Minimalist executive design). */
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
		{ label: 'Hembras', value: females, color: '#10B981' },
		{ label: 'Machos', value: males, color: '#3B82F6' },
		...(undefinedSex > 0 ? [{ label: 'S/D', value: undefinedSex, color: '#94A3B8' }] : [])
	];

	return (
		<KpiCard
			label={instance.title ?? 'Existencias del rodeo'}
			status={
				totalHeads > 0 ? (
					<Box
						sx={{
							fontSize: '0.6875rem',
							fontWeight: 600,
							color: unassigned > 0 ? 'warning.main' : 'text.secondary',
							bgcolor: unassigned > 0
								? (theme) => (theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)')
								: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
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
								bgcolor: unassigned > 0 ? 'warning.main' : 'success.main'
							}}
						/>
						{unassigned > 0 ? `${unassigned} sin lote` : `${inBatch} en lote`}
					</Box>
				) : null
			}
			value={formatNumber(totalHeads)}
			unit="cabezas"
			visual={
				totalHeads > 0 ? (
					<StackedBar
						height={4}
						showLegend={false}
						segments={segments}
					/>
				) : null
			}
			context={
				totalHeads > 0 ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.875, pt: 0.25 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
								<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
									Hembras
								</Typography>
								<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
									{formatNumber(females)}{' '}
									<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
										({femalePct}%)
									</Box>
								</Typography>
							</Box>

							<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
								<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3B82F6', flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
									Machos
								</Typography>
								<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
									{formatNumber(males)}{' '}
									<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
										({malePct}%)
									</Box>
								</Typography>
							</Box>
						</Box>

						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								pt: 0.75,
								borderTop: '1px solid',
								borderColor: (theme) =>
									theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
							}}
						>
							<Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
								Asignación a lotes
							</Typography>
							<Typography
								sx={{
									fontSize: '0.75rem',
									fontWeight: 600,
									color: unassigned > 0 ? 'warning.main' : 'text.primary',
									fontVariantNumeric: 'tabular-nums'
								}}
							>
								{formatNumber(inBatch)} en lote {unassigned > 0 ? `· ${unassigned} sin lote` : `(100%)`}
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
						height={4}
						showLegend={false}
						segments={segments}
					/>
				) : null
			}
			context={
				femalesCount > 0 ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.875, pt: 0.25 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
								<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#059669', flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
									Vacas adultas
								</Typography>
								<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
									{formatNumber(adultCows)}{' '}
									<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
										({cowPct}%)
									</Box>
								</Typography>
							</Box>

							<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
								<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34D399', flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
									Reposición
								</Typography>
								<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
									{formatNumber(replacements)}{' '}
									<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
										({repPct}%)
									</Box>
								</Typography>
							</Box>
						</Box>

						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								pt: 0.75,
								borderTop: '1px solid',
								borderColor: (theme) =>
									theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
							}}
						>
							<Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
								Impacto en rodeo general
							</Typography>
							<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
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
						height={4}
						showLegend={false}
						segments={segments}
					/>
				) : null
			}
			context={
				malesCount > 0 ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.875, pt: 0.25 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
								<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563EB', flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
									Recría / Invernada
								</Typography>
								<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
									{formatNumber(steersAndGrowing)}{' '}
									<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
										({steerPct}%)
									</Box>
								</Typography>
							</Box>

							<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
								<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#60A5FA', flexShrink: 0 }} />
								<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
									Toros
								</Typography>
								<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
									{formatNumber(sires)}{' '}
									<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
										({sirePct}%)
									</Box>
								</Typography>
							</Box>
						</Box>

						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								pt: 0.75,
								borderTop: '1px solid',
								borderColor: (theme) =>
									theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
							}}
						>
							<Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
								Impacto en rodeo general
							</Typography>
							<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', fontVariantNumeric: 'tabular-nums' }}>
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

/** Breed composition widget redesigned with dominant breed focus and minimal progress tracks. */
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

	return (
		<KpiCard
			label={instance.title ?? 'Raza predominante'}
			value={
				totalHeads > 0 ? (
					<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
						<Box sx={{ minWidth: 0, flex: 1 }}>
							<Typography
								sx={{
									fontSize: { xs: '1.25rem', sm: '1.4rem' },
									fontWeight: 700,
									letterSpacing: '-0.02em',
									color: 'text.primary',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									lineHeight: 1.2
								}}
							>
								{dominant.label}
							</Typography>
							<Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: 500 }}>
								Raza predominante
							</Typography>
						</Box>
						<Typography
							sx={{
								fontSize: { xs: '1.75rem', sm: '2rem' },
								fontWeight: 700,
								letterSpacing: '-0.03em',
								lineHeight: 1,
								fontVariantNumeric: 'tabular-nums',
								color: 'primary.main',
								flexShrink: 0
							}}
						>
							{dominant.pct}%
						</Typography>
					</Box>
				) : (
					'—'
				)
			}
			context={
				totalHeads > 0 ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.875, pt: 0.5 }}>
						{topBreeds.map((b, index) => (
							<Box key={b.label}>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.375 }}>
									<Typography
										sx={{
											fontSize: '0.75rem',
											color: 'text.primary',
											fontWeight: index === 0 ? 600 : 500,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											maxWidth: '65%'
										}}
									>
										{b.label}
									</Typography>
									<Typography
										sx={{
											fontSize: '0.75rem',
											fontWeight: 600,
											color: 'text.primary',
											fontVariantNumeric: 'tabular-nums'
										}}
									>
										{formatNumber(b.value)}{' '}
										<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
											({b.pct}%)
										</Box>
									</Typography>
								</Box>
								<Box
									sx={{
										width: '100%',
										height: 3,
										bgcolor: (theme) =>
											theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
										borderRadius: 999,
										overflow: 'hidden'
									}}
								>
									<Box
										sx={{
											width: `${b.pct}%`,
											height: '100%',
											bgcolor: index === 0 ? 'primary.main' : 'text.disabled',
											borderRadius: 999
										}}
									/>
								</Box>
							</Box>
						))}
					</Box>
				) : (
					'Sin razas registradas.'
				)
			}
			footnote={<span>Distribución genética sobre {formatNumber(totalHeads)} cabezas</span>}
		/>
	);
}
