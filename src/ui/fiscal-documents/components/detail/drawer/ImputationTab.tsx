import { Stack, Typography } from '@mui/material';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { add, dec, ZERO } from '@/core/stock/domain/rules/decimal';
import { formatMoney, formatQuantity, formatUnitCost } from '@/core/stock/domain/rules/quantityFormat';
import { destination } from '../lineDestination';
import { DrawerBlock, DrawerTotal, Facts, LinkCard } from './drawerParts';

/**
 * "Imputación": where each peso of the paper went (lienzo: FiscalDocumentDetail): to the warehouse,
 * as a direct expense charged to a batch, or recoverable VAT; then line by line, with its cost and
 * the stock operation it generated. A credit note subtracts.
 */
export default function ImputationTab({ document: d }: { document: FiscalDocumentDetail }) {
	const sign = d.type.sign < 0 ? '−' : '';
	const sumOf = (pick: (stocked: boolean) => boolean) =>
		d.lines.filter((l) => pick(l.item.trackStock)).reduce((acc, l) => add(acc, dec(l.costAmount) ?? ZERO), ZERO);
	const recoverable = d.taxSummary.filter((t) => t.isRecoverable).reduce((acc, t) => add(acc, dec(t.amount) ?? ZERO), ZERO);
	// A zero carries no sign: "−$ 0,00" reads as a credit that is not there.
	const money = (value: Parameters<typeof formatMoney>[0]) => {
		const amount = typeof value === 'string' ? dec(value) : (value ?? null);
		return `${amount !== null && amount !== ZERO ? sign : ''}${formatMoney(value)}`;
	};

	return (
		<>
			<DrawerTotal label="Costo imputado" value={money(add(sumOf((s) => s), sumOf((s) => !s)))} tone={d.type.sign < 0 ? '#B42318' : undefined}>
				<Facts
					rows={[
						{ term: 'Al almacén', value: money(sumOf((s) => s)) },
						{ term: 'Gasto directo', value: money(sumOf((s) => !s)) },
						{ term: 'IVA recuperable', value: money(recoverable) }
					]}
				/>
			</DrawerTotal>
			{d.lines.map((line) => (
				<DrawerBlock key={line.id} title={`Renglón ${line.position}`}>
					<Stack spacing={0.25}>
						<Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{line.item.name}</Typography>
						<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
							{[line.item.code, line.item.trackStock ? 'con stock' : 'sin stock'].filter(Boolean).join(' · ')}
							{line.deliveryNoteLabel ? ` · del ${line.deliveryNoteLabel}` : ''}
						</Typography>
					</Stack>
					<Facts
						rows={[
							{ term: 'En el papel', value: formatQuantity(line.inputQuantity, line.inputLabel ?? line.item.unitSymbol) },
							{ term: 'Cantidad', value: formatQuantity(line.quantity, line.item.unitSymbol) },
							...(line.lineAmount !== null ? [{ term: 'Importe', value: money(line.lineAmount) }] : []),
							...line.taxes.map((t) => ({ term: t.rateName ? `${t.name} ${t.rateName}` : t.name, value: money(t.amount) })),
							...(line.costAmount !== null ? [{ term: 'Costo', value: money(line.costAmount) }] : []),
							...(line.unitCost !== null ? [{ term: 'Costo unitario', value: `${formatUnitCost(line.unitCost)}${line.item.unitSymbol ? ` / ${line.item.unitSymbol}` : ''}` }] : []),
							{ term: 'Destino', value: destination(line) }
						]}
					/>
					{line.item.trackStock && d.stockOperation && (
						<LinkCard to={`/item-documents/${d.stockOperation.id}`} title={`Movimiento de stock N.º ${d.stockOperation.number}`} caption={formatQuantity(line.quantity, line.item.unitSymbol)} />
					)}
				</DrawerBlock>
			))}
		</>
	);
}
