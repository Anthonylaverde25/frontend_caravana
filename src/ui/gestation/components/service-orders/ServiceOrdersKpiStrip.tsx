import { Box, Link, Paper, Stack, Typography } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface ServiceOrdersKpiStripProps {
	orders: ServiceOrder[];
	onOpenTray: () => void;
}

const OPEN_STATUSES = new Set(['APPROVED', 'BULLS_WITHDRAWN']);

const cardSx = {
	p: 2,
	borderRadius: '8px',
	border: 1,
	borderColor: 'divider',
	bgcolor: 'background.paper',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	minHeight: 88
} as const;

interface KpiCardProps {
	title: string;
	value: ReactNode;
	caption: ReactNode;
	color?: string;
}

function KpiCard({ title, value, caption, color = 'text.secondary' }: KpiCardProps) {
	return (
		<Paper
			elevation={0}
			sx={cardSx}
		>
			<Typography
				variant="caption"
				sx={{ color, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}
			>
				{title}
			</Typography>
			<Stack
				direction="row"
				alignItems="baseline"
				spacing={1}
			>
				<Typography
					variant="h5"
					sx={{ fontWeight: 800, color: 'text.primary' }}
				>
					{value}
				</Typography>
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary' }}
				>
					{caption}
				</Typography>
			</Stack>
		</Paper>
	);
}

/**
 * Outcomes of the service orders. The pregnancy rate is weighted over the closed orders (pregnant
 * over pregnant + empty of all of them), never an average of each order's rate. The work still to
 * do lives in the diagnosis tray, linked from "Abiertas".
 */
export function ServiceOrdersKpiStrip({ orders, onOpenTray }: ServiceOrdersKpiStripProps) {
	const metrics = useMemo(() => {
		const open = orders.filter((o) => OPEN_STATUSES.has(o.status));
		const closed = orders.filter((o) => o.status === 'SUCCESS');
		const pregnant = closed.reduce((sum, o) => sum + (o.diagnosis_summary?.pregnant ?? 0), 0);
		const empty = closed.reduce((sum, o) => sum + (o.diagnosis_summary?.empty ?? 0), 0);
		const activeMales = open.reduce(
			(sum, o) =>
				sum +
				(o.male_details && o.male_details.length > 0
					? o.male_details.filter((d) => d.status === 'ACTIVE').length
					: (o.active_male_caravan_ids?.length ?? o.male_caravan_ids.length)),
			0
		);
		const females = open.reduce((sum, o) => sum + o.female_caravan_ids.length, 0);

		return {
			total: orders.length,
			open: open.length,
			closed: closed.length,
			rate: pregnant + empty > 0 ? (pregnant * 100) / (pregnant + empty) : null,
			pregnant,
			diagnosed: pregnant + empty,
			activeMales,
			females
		};
	}, [orders]);

	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
				gap: 2,
				mb: 3
			}}
		>
			<KpiCard
				title="Total órdenes"
				value={metrics.total}
				caption="registradas"
			/>
			<KpiCard
				title="Abiertas"
				color="info.main"
				value={metrics.open}
				caption={
					metrics.open > 0 ? (
						<Link
							component="button"
							variant="caption"
							onClick={onOpenTray}
							sx={{ fontWeight: 700 }}
						>
							Ir a la bandeja de tacto
						</Link>
					) : (
						'sin trabajo pendiente'
					)
				}
			/>
			<KpiCard
				title="Cerradas"
				color="success.main"
				value={metrics.closed}
				caption="con su diagnóstico"
			/>
			<KpiCard
				title="Preñez final"
				color="success.main"
				value={metrics.rate !== null ? `${metrics.rate.toFixed(1)}%` : '—'}
				caption={metrics.diagnosed > 0 ? `${metrics.pregnant} de ${metrics.diagnosed} diagnosticadas` : 'sin órdenes cerradas'}
			/>
			<KpiCard
				title="En servicio"
				value={metrics.activeMales}
				caption={`toros · ${metrics.females} vientres`}
			/>
		</Box>
	);
}

export default ServiceOrdersKpiStrip;
