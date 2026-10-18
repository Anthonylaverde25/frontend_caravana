import { useNavigate } from 'react-router';
import { Alert, Button } from '@mui/material';
import { usePendingDeliveryNotes } from '@/features/fiscal/hooks/useDeliveryNotes';

interface PendingDeliveryNotesNoticeProps {
	providerId: number | null;
	providerName: string | null;
}

/**
 * DC9: a direct invoice of a provider with delivery notes waiting. If it is that merchandise, it is
 * converted, so it does not enter twice; a different purchase goes on as is.
 */
export default function PendingDeliveryNotesNotice({ providerId, providerName }: PendingDeliveryNotesNoticeProps) {
	const navigate = useNavigate();
	const { data: pending = [] } = usePendingDeliveryNotes(providerId, !!providerId);

	// Without a provider the query is off, but its key is the whole tray's: nothing to warn yet.
	if (!providerId || pending.length === 0) return null;

	return (
		<Alert
			severity="info"
			sx={{ fontSize: '0.8rem', py: 0.5, borderRadius: '6px' }}
			action={
				<Button
					size="small"
					sx={{ textTransform: 'none', fontWeight: 700 }}
					onClick={() =>
						navigate(`/fiscal-documents/new?deliveryNotes=${pending.map((n) => n.id).join(',')}`)
					}
				>
					Convertir
				</Button>
			}
		>
			{providerName ?? 'El proveedor'} tiene {pending.length} remito(s) sin facturar (
			{pending.map((n) => n.label.replace(/^\D+/, '')).join(', ')}). Si esta factura es de esa mercadería,
			convertilos para que no entre dos veces.
		</Alert>
	);
}
