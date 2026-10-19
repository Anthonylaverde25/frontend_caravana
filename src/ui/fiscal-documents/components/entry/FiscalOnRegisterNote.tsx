import { Box, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { type Dec, isPositive } from '@/core/stock/domain/rules/decimal';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { sheetLabelSx } from '../sheet/sheetStyles';
import { EntryMode } from './fiscalEntryState';

interface FiscalOnRegisterNoteProps {
	mode: EntryMode;
	isCreditNote: boolean;
	unpriced: boolean;
	stockedCount: number;
	stockedCost: Dec;
	expenseCost: Dec;
	/** Batches charged by the lines without stock. */
	batches: string[];
}

/**
 * "Al registrar": what registering this paper does, said before it is done. Only what the system does
 * today: the debt with the provider is not tracked yet, so it is not announced.
 */
export default function FiscalOnRegisterNote(props: FiscalOnRegisterNoteProps) {
	const { mode, isCreditNote, unpriced, stockedCount, stockedCost, expenseCost, batches } = props;
	const articles = `${stockedCount} ${stockedCount === 1 ? 'artículo' : 'artículos'} con stock`;
	const items: { icon: string; text: string }[] = [];

	if (mode === 'conversion') {
		items.push({ icon: 'heroicons-outline:archive-box', text: 'No vuelve a ingresar mercadería: valoriza lo que llegó sin precio en los remitos.' });
		items.push({ icon: 'heroicons-outline:exclamation-triangle', text: 'Cada diferencia con los remitos queda como novedad para resolver con el proveedor.' });
	} else if (stockedCount > 0) {
		items.push({
			icon: 'heroicons-outline:archive-box',
			text: isCreditNote
				? `Salen del almacén ${articles}, al costo promedio.`
				: unpriced
					? `Entran al almacén ${articles}, sin valor: lo toman de su factura.`
					: `Entran al almacén ${articles}, por ${formatMoney(stockedCost)}.`
		});
	}
	if (mode !== 'delivery-note' && isPositive(expenseCost)) {
		items.push({
			icon: 'heroicons-outline:rectangle-stack',
			text: `Gasto directo ${formatMoney(expenseCost)}${batches.length ? `, imputado a ${batches.join(', ')}` : ''}.`
		});
	}
	if (mode === 'delivery-note') {
		items.push({ icon: 'heroicons-outline:document-text', text: 'La deuda con el proveedor llega con la factura.' });
	}

	return (
		<Stack spacing={1} sx={{ p: 1.5, px: 1.75, border: 1, borderColor: 'divider', borderRadius: '6px' }}>
			<Typography sx={sheetLabelSx}>Al registrar</Typography>
			{items.length === 0 ? (
				<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Cargá los renglones para ver qué pasa al registrar.</Typography>
			) : (
				items.map((item) => (
					<Box key={item.text} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
						<FuseSvgIcon size={16} sx={{ color: 'primary.main', mt: '2px', flex: 'none' }}>
							{item.icon}
						</FuseSvgIcon>
						<Typography sx={{ fontSize: '0.8rem' }}>{item.text}</Typography>
					</Box>
				))
			)}
		</Stack>
	);
}
