import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ExitOrder } from '@/features/exit-orders/types';
import { formatCuit } from '@/core/shared/domain/cuit';
import { formatDate, formatDateTime, formatKg, formatMoney } from '../exitOrderFormat';

const Kpi: React.FC<{ label: string; value: React.ReactNode; tone?: string }> = ({ label, value, tone }) => (
	<Paper
		variant="outlined"
		sx={{ p: 1.25, borderRadius: '8px', flex: 1, minWidth: 96 }}
	>
		<Typography
			variant="caption"
			sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.64rem' }}
		>
			{label}
		</Typography>
		<Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: tone ?? 'text.primary', lineHeight: 1.2 }}>
			{value}
		</Typography>
	</Paper>
);

const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box>
		<Typography
			variant="caption"
			color="text.secondary"
			sx={{ fontWeight: 700, display: 'block' }}
		>
			{label}
		</Typography>
		<Typography
			variant="body2"
			component="div"
			sx={{ fontWeight: 600 }}
		>
			{children}
		</Typography>
	</Box>
);

/** The figures of the order, who buys, and its dates. */
export const ExitOrderDetailSummary: React.FC<{ order: ExitOrder }> = ({ order }) => (
	<Stack spacing={2}>
		<Stack
			direction="row"
			spacing={1}
			flexWrap="wrap"
			useFlexGap
		>
			<Kpi
				label="En la orden"
				value={order.planned_head_count}
			/>
			<Kpi
				label="Salieron"
				value={order.exited_count}
				tone="success.main"
			/>
			<Kpi
				label="Pendientes"
				value={order.pending_count}
				tone={order.pending_count > 0 ? 'warning.main' : undefined}
			/>
			<Kpi
				label="No salieron"
				value={order.skipped_count}
			/>
		</Stack>

		<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
			<Fact label="Comprador">
				{order.buyer?.name ?? '—'}
				{order.buyer?.cuit && (
					<Typography
						component="span"
						variant="caption"
						color="text.secondary"
					>
						{` · CUIT ${formatCuit(order.buyer.cuit)}`}
					</Typography>
				)}
			</Fact>
			<Fact label={order.kind === 'REGISTERED' ? 'Fecha del egreso' : 'Fecha prevista'}>
				{formatDate(order.exit_date)}
			</Fact>
			<Fact label="Kg vendidos">{formatKg(order.total_weight_kg || null)}</Fact>
			<Fact label="Importe">{formatMoney(order.total_amount || null)}</Fact>
			{order.kind === 'PLANNED' && <Fact label="Emitida">{formatDateTime(order.emitted_at)}</Fact>}
			{order.first_executed_at && <Fact label="Primera salida">{formatDateTime(order.first_executed_at)}</Fact>}
			{order.closed_at && <Fact label="Cerrada">{formatDateTime(order.closed_at)}</Fact>}
			{order.responsable && <Fact label="Responsable">{order.responsable}</Fact>}
			{order.closing_reason && <Fact label="Motivo de cierre">{order.closing_reason}</Fact>}
			{order.observations && <Fact label="Observaciones">{order.observations}</Fact>}
		</Box>
	</Stack>
);

export default ExitOrderDetailSummary;
