import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import type { ExitLoadForm } from '../../../hooks/useExitLoadForm';
import { formatMoney } from '../../exitOrderFormat';

interface ExitTotalCellProps {
	form: ExitLoadForm;
	/** A category still without its $/kg: the total is partial. */
	partial: boolean;
}

const wholeMoney = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

/** Whole pesos without the ,00; cents only when there are. */
const moneyOf = (value: number): string => (Number.isInteger(value) ? wholeMoney.format(value) : formatMoney(value));

const LABELS = { issue: 'Total estimado', execute: 'Total de la salida', register: 'Total de la venta' } as const;

/**
 * The total of the load drawn as the selected cell of the sheet (border and fill handle), so the
 * figure that matters is the one the eye finds first. Amber and "parcial" while a price is missing.
 */
export const ExitTotalCell: React.FC<ExitTotalCellProps> = ({ form, partial }) => {
	const { totals, mode } = form;
	const hasAmount = totals.amount > 0;
	const average = totals.weightKg > 0 && hasAmount ? totals.amount / totals.weightKg : null;
	const approx = totals.weightEstimated ? '≈ ' : '';

	return (
		<Box
			sx={(theme) => ({
				position: 'relative',
				px: 1.5,
				py: 1.25,
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'baseline',
				justifyContent: 'space-between',
				columnGap: 1.5,
				rowGap: 0.5,
				border: partial
					? `1px dashed ${theme.palette.warning.main}`
					: hasAmount
						? `2px solid ${theme.palette.primary.main}`
						: `1px dashed ${theme.palette.divider}`,
				bgcolor:
					hasAmount || partial
						? alpha(partial ? theme.palette.warning.main : theme.palette.primary.main, 0.06)
						: 'background.default'
			})}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column' }}>
				<Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
					{partial ? 'Total parcial' : LABELS[mode]}
				</Typography>
				<Typography
					sx={{
						fontSize: '0.7rem',
						fontWeight: partial ? 600 : 400,
						color: partial ? 'warning.dark' : 'text.secondary',
						fontVariantNumeric: 'tabular-nums'
					}}
				>
					{partial
						? 'falta el precio de una categoría'
						: average != null
							? `$/kg prom. ${average.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
							: ''}
				</Typography>
			</Box>
			<Typography
				sx={{
					fontSize: hasAmount ? '1.35rem' : '1.05rem',
					fontWeight: hasAmount ? 800 : 700,
					letterSpacing: '-0.01em',
					whiteSpace: 'nowrap',
					fontVariantNumeric: 'tabular-nums',
					color: hasAmount && !partial ? 'text.primary' : 'text.secondary'
				}}
			>
				{hasAmount ? `${approx}${moneyOf(totals.amount)}` : 'Sin importe'}
			</Typography>
			{hasAmount && !partial && (
				<Box
					aria-hidden
					sx={{
						position: 'absolute',
						right: -5,
						bottom: -5,
						width: 8,
						height: 8,
						bgcolor: 'primary.main',
						border: 1,
						borderColor: 'background.paper'
					}}
				/>
			)}
		</Box>
	);
};

export default ExitTotalCell;
