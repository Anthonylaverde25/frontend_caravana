import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import type { ExitLoadForm } from '../../hooks/useExitLoadForm';
import ExitFormulaBar from './summary/ExitFormulaBar';
import ExitBalanceSheet from './summary/ExitBalanceSheet';
import ExitTotalCell from './summary/ExitTotalCell';

interface ExitInvoiceSummaryProps {
	form: ExitLoadForm;
	/** The order being executed or edited, for its code. */
	orderCode?: string;
	onEditPrice: () => void;
}

const TITLES = {
	issue: 'Orden de egreso',
	execute: 'Salida de la orden',
	register: 'Liquidación de venta'
} as const;

/**
 * The money of the load as a small spreadsheet that always fits the left column: the formula bar
 * with the price, the balance by category with its Σ row, and the total as the selected cell.
 */
export const ExitInvoiceSummary: React.FC<ExitInvoiceSummaryProps> = ({ form, orderCode, onEditPrice }) => {
	const { totals, balance, mode, pricing } = form;
	const partial =
		pricing.mode === 'PER_CATEGORY' && balance.some((group) => !pricing.categoryPrices[group.category]?.trim());

	return (
		<Paper
			variant="outlined"
			sx={{ p: { xs: 2, md: 2.5 }, borderRadius: '8px' }}
		>
			<Stack spacing={1.5}>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
					spacing={1}
				>
					<Typography sx={sectionTitleSx}>
						{TITLES[mode]}
						{orderCode ? ` · ${orderCode}` : ''}
					</Typography>
					{balance.length > 0 && (
						<Typography
							variant="caption"
							color="text.secondary"
						>
							{balance.length} {balance.length === 1 ? 'categoría' : 'categorías'}
						</Typography>
					)}
				</Stack>

				<ExitFormulaBar
					mode={mode}
					pricing={pricing}
					gap={form.pricingGap}
					onEditPrice={onEditPrice}
				/>
				<ExitBalanceSheet
					form={form}
					onEditPrice={onEditPrice}
				/>
				{balance.length > 0 && (
					<ExitTotalCell
						form={form}
						partial={partial}
					/>
				)}

				{(totals.weightEstimated || totals.calves > 0) && (
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ display: 'block' }}
					>
						{totals.weightEstimated && '≈ con el último peso de cada animal. '}
						{totals.calves > 0 &&
							`Incluye ${totals.calves} cría(s) al pie que salen con su madre, sin importe.`}
					</Typography>
				)}
			</Stack>
		</Paper>
	);
};

export default ExitInvoiceSummary;
