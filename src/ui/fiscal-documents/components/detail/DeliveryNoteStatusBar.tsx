import { Link as RouterLink } from 'react-router';
import { Alert, Chip, Link, Stack, Typography } from '@mui/material';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';

const TONE = { PENDING_INVOICE: 'warning', INVOICED: 'success', VOIDED: 'default' } as const;

/**
 * Where a delivery note stands (DC10), or what an invoice was converted from (DC5). An unpriced note
 * says that its value comes with the invoice.
 */
export default function DeliveryNoteStatusBar({ document }: { document: FiscalDocumentDetail }) {
	const status = document.deliveryNoteStatus;

	if (status) {
		return (
			<Stack spacing={1}>
				<Stack
					direction="row"
					spacing={1.5}
					alignItems="center"
					flexWrap="wrap"
					useFlexGap
				>
					<Chip
						size="small"
						color={TONE[status.code]}
						label={status.label}
						sx={{ fontWeight: 700 }}
					/>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						{document.isValued
							? 'Con precios: entró al stock a su precio.'
							: 'Sin precios: entró al stock sin valor; lo toma de la factura.'}
					</Typography>
					{document.invoicedBy && (
						<Link
							component={RouterLink}
							to={`/fiscal-documents/${document.invoicedBy.id}`}
							sx={{ fontWeight: 600, fontSize: '0.875rem' }}
						>
							En la {document.invoicedBy.label}
						</Link>
					)}
				</Stack>
				{!document.isValued && status.code === 'PENDING_INVOICE' && (
					<Alert
						severity="info"
						sx={{ fontSize: '0.8rem', py: 0.5, borderRadius: '6px' }}
					>
						Lo que se consuma de este remito queda con costo pendiente hasta que llegue la factura.
					</Alert>
				)}
			</Stack>
		);
	}

	if (document.deliveryNotes.length === 0) return null;

	return (
		<Typography
			variant="body2"
			color="text.secondary"
		>
			Convertida desde{' '}
			{document.deliveryNotes.map((note, i) => (
				<span key={note.id}>
					{i > 0 && ', '}
					<Link
						component={RouterLink}
						to={`/fiscal-documents/${note.id}`}
						sx={{ fontWeight: 600 }}
					>
						{note.label}
					</Link>
				</span>
			))}
			. No ingresó mercadería: la trajeron los remitos.
		</Typography>
	);
}
