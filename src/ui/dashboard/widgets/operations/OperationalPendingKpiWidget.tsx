import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StackedBar } from '../../components/primitives/StackedBar';
import { formatNumber } from '../../theme/formatters';
import { useOperationalKpis } from '../../hooks/useOperationalKpis';

export function OperationalPendingKpiWidget({ instance }: WidgetRenderProps) {
	const { summary, categories, isLoading, isError } = useOperationalKpis();

	if (isLoading) {
		return (
			<KpiCard
				label={instance.title ?? 'Órdenes operativas'}
				status={<StatusPill tone="neutral" label="Sincronizando..." />}
				value="—"
				unit="órdenes"
				visual={
					<Box sx={{ py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<CircularProgress size={20} />
					</Box>
				}
				context="Consultando tareas de campo..."
			/>
		);
	}

	const totalPending = summary?.total_pending_documents ?? 0;

	if (isError || !categories) {
		return (
			<KpiCard
				label={instance.title ?? 'Órdenes operativas'}
				value="0"
				unit="órdenes"
				status={<StatusPill tone="neutral" label="Sin conexión" />}
				context="No se pudieron sincronizar las órdenes"
			/>
		);
	}

	const entryPending = categories.entry_orders?.total_pending ?? 0;
	const birthPending = categories.birth_orders?.total_pending ?? 0;
	const transferPending = categories.transfer_orders?.total_pending ?? 0;
	const weaningPending = categories.weaning_orders?.total_pending ?? 0;

	const totalPlannedHeads =
		(categories.entry_orders?.total_planned_heads ?? 0) +
		(categories.birth_orders?.total_planned_heads ?? 0) +
		(categories.transfer_orders?.total_planned_heads ?? 0) +
		(categories.weaning_orders?.total_planned_heads ?? 0);

	const segments = [
		{ label: 'Entradas', value: entryPending, color: '#059669' },
		{ label: 'Traslados', value: transferPending, color: '#2563EB' },
		{ label: 'Destetes', value: weaningPending, color: '#7C3AED' },
		{ label: 'Partos', value: birthPending, color: '#D97706' }
	].filter((s) => s.value > 0);

	const hasPending = totalPending > 0;

	return (
		<KpiCard
			label={instance.title ?? 'Órdenes de trabajo'}
			value={formatNumber(totalPending)}
			unit="pendientes"
			status={
				<Box
					sx={{
						fontSize: '0.6875rem',
						fontWeight: 600,
						color: hasPending ? (totalPending > 5 ? 'warning.main' : 'primary.main') : 'success.main',
						bgcolor: hasPending
							? (totalPending > 5
									? (theme) => (theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.08)')
									: (theme) => (theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.08)'))
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
							bgcolor: hasPending ? (totalPending > 5 ? 'warning.main' : 'primary.main') : 'success.main'
						}}
					/>
					{hasPending ? `${totalPending} activas` : 'Al día'}
				</Box>
			}
			visual={
				totalPending > 0 ? (
					<StackedBar height={4} showLegend={false} segments={segments} />
				) : null
			}
			context={
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.875, pt: 0.25 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
							<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
								Entradas / Traslados
							</Typography>
							<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{entryPending + transferPending}{' '}
								<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
									doc.
								</Box>
							</Typography>
						</Box>

						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
							<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
								Destetes / Partos
							</Typography>
							<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
								{weaningPending + birthPending}{' '}
								<Box component="span" sx={{ fontSize: '0.6875rem', fontWeight: 400, color: 'text.secondary' }}>
									doc.
								</Box>
							</Typography>
						</Box>
					</Box>
				</Box>
			}
			footnote={
				totalPlannedHeads > 0
					? `${formatNumber(totalPlannedHeads)} cabezas involucradas en tareas`
					: 'Sin movimientos pendientes'
			}
		/>
	);
}
