import React from 'react';
import { Box, Button, Typography, alpha } from '@mui/material';
import type { ExitLoadMode } from '../exitRows';
import type { ExitPricing } from '../exitPricing';

interface ExitFormulaBarProps {
	mode: ExitLoadMode;
	pricing: ExitPricing;
	/** What the price still lacks (the kg of the truck, a value), said instead of the formula. */
	gap?: string | null;
	onEditPrice: () => void;
}

const amount = (raw: string): string => {
	const value = Number(raw.replace(',', '.'));

	return Number.isFinite(value) && raw.trim() !== '' ? value.toLocaleString('es-AR') : '—';
};

/** No price to apply yet: none chosen, or the one chosen still without its value. */
const isPriceMissing = (pricing: ExitPricing): boolean =>
	pricing.mode === 'NONE' ||
	(pricing.mode === 'PER_KG' && pricing.pricePerKg.trim() === '') ||
	(pricing.mode === 'PER_HEAD' && pricing.pricePerHead.trim() === '') ||
	(pricing.mode === 'TOTAL' && pricing.total.trim() === '');

/** The pricing condition written as the formula of the sheet: the one place the price is told. */
const formulaOf = (pricing: ExitPricing): string => {
	switch (pricing.mode) {
		case 'PER_KG':
			return pricing.weightSource === 'LOAD'
				? `= Kg del camión × $ ${amount(pricing.pricePerKg)}`
				: `= Kg × $ ${amount(pricing.pricePerKg)}`;
		case 'PER_CATEGORY':
			return '= Kg × $/kg de cada categoría';
		case 'PER_HEAD':
			return `= Cab. × $ ${amount(pricing.pricePerHead)}`;
		case 'TOTAL':
			return `= Monto pactado $ ${amount(pricing.total)}`;
		default:
			return '';
	}
};

/**
 * The spreadsheet's formula bar over the balance: how the load is charged and the button that
 * changes it. Without a price it turns amber and the button asks for one.
 */
export const ExitFormulaBar: React.FC<ExitFormulaBarProps> = ({ mode, pricing, gap, onEditPrice }) => {
	// A category without its $/kg is asked in its own cell, not here.
	const missing = isPriceMissing(pricing) || (gap != null && pricing.mode !== 'PER_CATEGORY');
	const label = missing ? (mode === 'issue' ? 'Agregar precio' : 'Definir precio') : 'Editar precio';

	return (
		<Box
			sx={(theme) => ({
				height: 36,
				display: 'flex',
				alignItems: 'center',
				border: 1,
				borderColor: missing ? alpha(theme.palette.warning.main, 0.5) : 'divider',
				bgcolor: missing ? alpha(theme.palette.warning.main, 0.08) : 'background.paper'
			})}
		>
			<Box
				sx={(theme) => ({
					width: 36,
					height: '100%',
					flex: 'none',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					borderRight: 1,
					borderColor: missing ? alpha(theme.palette.warning.main, 0.5) : 'divider',
					bgcolor: missing ? alpha(theme.palette.warning.main, 0.14) : 'action.hover',
					fontFamily: 'monospace',
					fontStyle: 'italic',
					fontWeight: 800,
					fontSize: '0.8rem',
					color: missing ? 'warning.dark' : 'primary.main'
				})}
			>
				fx
			</Box>
			<Typography
				noWrap
				title={missing ? undefined : formulaOf(pricing)}
				sx={{
					flex: 1,
					minWidth: 0,
					px: 1.25,
					fontSize: '0.78rem',
					fontFamily: missing ? undefined : 'monospace',
					fontWeight: missing ? 600 : 500,
					color: missing ? 'warning.dark' : 'text.primary'
				}}
			>
				{missing
					? pricing.mode !== 'NONE' && gap
						? gap
						: mode === 'issue'
							? 'Sin precio pactado'
							: 'Sin definir cómo se cobró'
					: formulaOf(pricing)}
			</Typography>
			<Button
				size="small"
				onClick={onEditPrice}
				color={missing ? 'warning' : 'primary'}
				sx={{
					flex: 'none',
					height: 28,
					mr: 0.5,
					px: 1.25,
					borderRadius: '4px',
					textTransform: 'none',
					fontWeight: 600,
					fontSize: '0.8rem',
					whiteSpace: 'nowrap',
					...(missing && { color: 'warning.dark' })
				}}
			>
				{label}
			</Button>
		</Box>
	);
};

export default ExitFormulaBar;
