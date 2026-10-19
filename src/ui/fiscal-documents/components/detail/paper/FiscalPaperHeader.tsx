import { Box, Typography } from '@mui/material';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { formatDate } from '@/core/stock/domain/rules/quantityFormat';
import { useCompany } from '@/contexts/CompanyContext';
import { INK, paperBoxSx, paperTextSx } from './paperStyles';

const KIND_TITLE: Record<FiscalDocumentDetail['type']['kind'], string> = {
	INVOICE: 'Factura',
	CREDIT_NOTE: 'Nota de crédito',
	TICKET: 'Ticket',
	DELIVERY_NOTE: 'Remito'
};

/**
 * The top of the paper as the provider printed it: issuer on the left, the letter hanging from the
 * top rule with its code and a rule down the middle, kind, number, date and CUIT on the right; below,
 * who received it. The company has no CUIT in the system yet: the row stays, flagged as pending.
 */
export default function FiscalPaperHeader({ document: d }: { document: FiscalDocumentDetail }) {
	const { activeCompanyId, companies } = useCompany();
	const company = companies.find((c) => c.id === activeCompanyId);
	const letter = d.type.letter ?? (d.type.kind === 'DELIVERY_NOTE' ? 'R' : null);
	const associated = d.related?.label ?? (d.deliveryNotes.length ? d.deliveryNotes.map((n) => n.label).join(', ') : null);

	return (
		<>
			<Box component="section" sx={{ ...paperBoxSx, display: 'grid', gridTemplateColumns: '1fr 64px 1fr' }}>
				<Box sx={{ p: '18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25, textAlign: 'center' }}>
					<Typography sx={{ fontSize: '1.25rem', fontWeight: 800 }}>{d.provider.name}</Typography>
					<Typography sx={paperTextSx}>{d.provider.location ?? 'Domicilio sin cargar'}</Typography>
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					{letter ? (
						<Box sx={{ width: 64, border: `1.5px solid ${INK}`, borderTop: 0, bgcolor: '#FFFFFF', textAlign: 'center', pt: 0.5, pb: '3px' }}>
							<Typography sx={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>{letter}</Typography>
							{d.type.afipCode && <Typography sx={{ fontSize: '0.6rem', fontWeight: 700 }}>CÓD. {d.type.afipCode}</Typography>}
						</Box>
					) : null}
					<Box sx={{ flex: 1, width: 0, borderLeft: `1.5px solid ${INK}` }} />
				</Box>
				<Box sx={{ p: '18px 20px', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
					<Typography sx={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.01em', textTransform: 'uppercase' }}>{KIND_TITLE[d.type.kind]}</Typography>
					<Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem' }}>{d.formattedNumber}</Typography>
					<Typography sx={paperTextSx}>
						<b>Fecha de emisión:</b> {formatDate(d.issuedAt)}
					</Typography>
					<Typography sx={{ ...paperTextSx, mt: 1.75 }}>
						<b>CUIT:</b> {d.provider.cuit ?? '—'}
					</Typography>
				</Box>
			</Box>
			<Box component="section" sx={{ ...paperBoxSx, ...paperTextSx, p: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 3, rowGap: '2px' }}>
				<div>
					<b>Razón social:</b> {company?.name ?? '—'}
				</div>
				<div>
					<b>CUIT:</b>{' '}
					<Box component="span" sx={{ color: '#B26A00' }}>
						pendiente de cargar en el sistema
					</Box>
				</div>
				<div>
					<b>RENSPA:</b> {company?.renspa ?? '—'}
				</div>
				<div>{associated && <><b>Comprobante asociado:</b> {associated}</>}</div>
			</Box>
		</>
	);
}
