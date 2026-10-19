import { Box, Stack, Typography } from '@mui/material';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { formatDate, formatMoney } from '@/core/stock/domain/rules/quantityFormat';

export interface HistoryEvent {
	title: string;
	detail: string;
	at: string | null;
}

/** What happened to the paper, newest first, from what the system already records (no new log). */
export function historyOf(d: FiscalDocumentDetail): HistoryEvent[] {
	const events: HistoryEvent[] = [
		{
			title: 'Registrado',
			detail: `Cargado desde el papel${d.createdBy ? ` por ${d.createdBy}` : ''}${d.totalAmount !== null ? ` · total ${d.type.sign < 0 ? '−' : ''}${formatMoney(d.totalAmount)}` : ''}`,
			at: d.createdAt
		}
	];
	if (d.stockOperation) events.push({ title: `Generó el movimiento de stock N.º ${d.stockOperation.number}`, detail: d.lines.filter((l) => l.item.trackStock).map((l) => l.item.name).join(', '), at: d.createdAt });
	if (d.related) events.push({ title: `Acreditó la ${d.related.label}`, detail: '', at: d.createdAt });
	if (d.deliveryNotes.length) events.push({ title: `Convirtió ${d.deliveryNotes.length === 1 ? 'el remito' : 'los remitos'} en factura`, detail: d.deliveryNotes.map((n) => n.label).join(', '), at: d.createdAt });
	if (d.invoicedBy) events.push({ title: `Facturado en la ${d.invoicedBy.label}`, detail: '', at: null });
	if (d.status === 'VOIDED') events.push({ title: 'Anulado', detail: d.voidReason ?? '', at: d.voidedAt });
	return events.reverse();
}

/** "Historial": a timeline of the events above. */
export default function HistoryTab({ document }: { document: FiscalDocumentDetail }) {
	return (
		<Stack spacing={0} sx={{ px: 2.5, py: 2 }}>
			{historyOf(document).map((e, i, all) => (
				<Box key={e.title} sx={{ display: 'grid', gridTemplateColumns: '14px 1fr', columnGap: 1.5 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
						<Box sx={{ width: 10, height: 10, mt: 0.5, borderRadius: '50%', bgcolor: i === 0 ? 'primary.main' : 'divider' }} />
						{i < all.length - 1 && <Box sx={{ flex: 1, width: '1px', bgcolor: 'divider' }} />}
					</Box>
					<Box sx={{ pb: 2 }}>
						<Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{e.title}</Typography>
						{e.detail && <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{e.detail}</Typography>}
						{e.at && <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>{formatDate(e.at)}</Typography>}
					</Box>
				</Box>
			))}
		</Stack>
	);
}
