import { Link as RouterLink } from 'react-router';
import { Link } from '@mui/material';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { formatDate, formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { DrawerBlock, DrawerTotal, Facts, LinkCard } from './drawerParts';

import { formatCuit } from '@/core/shared/domain/cuit';
/**
 * "Resumen": the total and its taxes, what the paper is, and what it is tied to. The payment status is
 * left out until the debt with providers is tracked.
 */
export default function SummaryTab({ document: d }: { document: FiscalDocumentDetail }) {
	const credit = d.type.sign < 0;
	const sign = credit ? '−' : '';
	const totalLabel = credit ? 'Total acreditado' : d.type.kind === 'DELIVERY_NOTE' ? 'Valor del remito' : 'Total';
	const number = (label: string | null) => label?.split(' ').pop() ?? '';
	const kindOf = (label: string | null) => label?.split(' ').slice(0, -1).join(' ') ?? '';

	return (
		<>
			<DrawerTotal label={totalLabel} value={d.totalAmount === null ? 'Sin precios' : `${sign}${formatMoney(d.totalAmount)}`} tone={credit ? '#B42318' : undefined}>
				{d.linesAmount !== null && (
					<Facts rows={[{ term: 'Neto', value: `${sign}${formatMoney(d.linesAmount)}` }, ...d.taxSummary.map((t) => ({ term: t.label, value: `${sign}${formatMoney(t.amount)}` }))]} />
				)}
			</DrawerTotal>
			<DrawerBlock title="Comprobante">
				<Facts
					rows={[
						{ term: 'Proveedor', value: <Link component={RouterLink} to={`/providers`}>{d.provider.name}</Link> },
						{ term: 'CUIT', value: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{d.provider.cuit ? formatCuit(d.provider.cuit) : '—'}</span> },
						{ term: 'Tipo', value: d.type.name },
						...(d.type.afipCode ? [{ term: 'Código', value: d.type.afipCode }] : []),
						{ term: 'Emisión', value: formatDate(d.issuedAt) },
						{ term: 'Estado', value: d.status === 'VOIDED' ? `Anulado el ${formatDate(d.voidedAt)}` : (d.deliveryNoteStatus?.label ?? 'Registrado') }
					]}
				/>
			</DrawerBlock>
			{d.related && (
				<DrawerBlock title="Acredita">
					<LinkCard to={`/fiscal-documents/${d.related.id}`} title={<>{kindOf(d.related.label)} <span style={{ fontFamily: 'monospace' }}>{number(d.related.label)}</span></>} />
				</DrawerBlock>
			)}
			{d.invoicedBy && (
				<DrawerBlock title="Facturado en">
					<LinkCard to={`/fiscal-documents/${d.invoicedBy.id}`} title={d.invoicedBy.label} />
				</DrawerBlock>
			)}
			{d.deliveryNotes.length > 0 && (
				<DrawerBlock title="Remitos">
					{d.deliveryNotes.map((n) => (
						<LinkCard key={n.id} to={`/fiscal-documents/${n.id}`} title={n.label} caption={`${formatDate(n.issuedAt)} · ${n.isValued ? 'con precios' : 'sin precios'}`} />
					))}
				</DrawerBlock>
			)}
			{d.stockOperation && (
				<DrawerBlock title="Movimiento de stock">
					<LinkCard to={`/item-documents/${d.stockOperation.id}`} title={`N.º ${d.stockOperation.number}`} caption={d.lines.filter((l) => l.item.trackStock).map((l) => l.item.name).join(', ')} />
				</DrawerBlock>
			)}
			{d.discrepancies && d.discrepancies.open + d.discrepancies.resolved > 0 && (
				<DrawerBlock title="Diferencias con remitos">
					<Facts rows={[{ term: 'Abiertas', value: d.discrepancies.open }, { term: 'Resueltas', value: d.discrepancies.resolved }]} />
				</DrawerBlock>
			)}
			{d.status === 'VOIDED' && d.voidReason && (
				<DrawerBlock title="Anulación">
					<Facts rows={[{ term: 'Motivo', value: d.voidReason }]} />
				</DrawerBlock>
			)}
		</>
	);
}
