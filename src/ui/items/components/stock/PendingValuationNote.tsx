import { Link as RouterLink } from 'react-router';
import { Alert, Link, Stack, Typography } from '@mui/material';
import { PendingLot } from '@/core/stock/domain/entities/ItemStock';
import { formatDate, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';

interface PendingValuationNoteProps {
	lots: PendingLot[];
	unitSymbol: string | null;
}

/** Units of unpriced delivery notes still waiting for their invoice (delivery C): not in the value. */
export default function PendingValuationNote({ lots, unitSymbol }: PendingValuationNoteProps) {
	if (lots.length === 0) return null;

	return (
		<Alert
			severity="warning"
			sx={{ fontSize: '0.82rem', py: 0.5, borderRadius: '6px' }}
		>
			<Stack spacing={0.25}>
				<Typography
					variant="body2"
					sx={{ fontWeight: 700 }}
				>
					Pendiente de valorizar: entró sin precio y espera su factura.
				</Typography>
				{lots.map((lot) => (
					<Typography
						key={lot.deliveryNoteId}
						variant="body2"
					>
						{formatQuantity(lot.remainingQuantity, unitSymbol)} del{' '}
						<Link
							component={RouterLink}
							to={`/fiscal-documents/${lot.deliveryNoteId}`}
							sx={{ fontWeight: 600 }}
						>
							{lot.deliveryNoteLabel}
						</Link>{' '}
						({formatDate(lot.issuedAt)})
						{lot.consumedQuantity !== '0.0000' &&
							` · ya se consumieron ${formatQuantity(lot.consumedQuantity, unitSymbol)} con costo pendiente`}
					</Typography>
				))}
			</Stack>
		</Alert>
	);
}
