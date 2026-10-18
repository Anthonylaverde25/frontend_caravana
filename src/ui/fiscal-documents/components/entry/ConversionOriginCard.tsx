import { Link as RouterLink } from 'react-router';
import { Box, Link, Stack, Typography } from '@mui/material';
import { InvoiceDraft } from '@/core/fiscal/domain/entities/DeliveryNote';
import { formatDate } from '@/core/stock/domain/rules/quantityFormat';

interface ConversionOriginCardProps {
	draft: InvoiceDraft;
}

/** Provider and delivery notes of a conversion, read-only: the notes declared them (DC5). */
export default function ConversionOriginCard({ draft }: ConversionOriginCardProps) {
	return (
		<Box sx={{ p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}>
			<Typography
				variant="caption"
				color="text.secondary"
			>
				Proveedor (de los remitos)
			</Typography>
			<Typography sx={{ fontWeight: 700 }}>{draft.provider.name}</Typography>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="baseline"
				sx={{ mt: 1 }}
			>
				<Typography
					variant="caption"
					color="text.secondary"
				>
					Desde
				</Typography>
				<Link
					component={RouterLink}
					to="/fiscal-documents/delivery-notes"
					sx={{ fontSize: '0.78rem', fontWeight: 600 }}
				>
					Cambiar
				</Link>
			</Stack>
			{draft.deliveryNotes.map((note) => (
				<Typography
					key={note.id}
					variant="body2"
					sx={{ fontFamily: 'monospace', fontWeight: 600 }}
				>
					{note.label} · {formatDate(note.issuedAt)} · {note.isValued ? 'con precios' : 'sin precios'}
				</Typography>
			))}
		</Box>
	);
}
