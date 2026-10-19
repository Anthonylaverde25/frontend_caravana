import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Box, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import ViewLayout from 'src/components/ViewLayout';
import { useFiscalCatalog } from '@/features/fiscal/hooks/useFiscalDocuments';
import { useInvoiceDraft } from '@/features/fiscal/hooks/useDeliveryNotes';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import FiscalDocumentEntryForm from '../components/entry/FiscalDocumentEntryForm';

/**
 * `/fiscal-documents/new`: Dedicated page view to register provider documents (invoices, delivery notes, credit notes).
 * With `?type=CREDIT_NOTE_A&provider=14&related=31` it loads a credit note for that invoice, with
 * `?type=DELIVERY_NOTE` a delivery note, and with `?deliveryNotes=77,80` the invoice converted from
 * those delivery notes (DC5).
 */
export default function FiscalDocumentEntryView() {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const [params] = useSearchParams();
	const { data: catalog, isLoading: isCatalogLoading } = useFiscalCatalog();
	const noteIds = useMemo(
		() =>
			(params.get('deliveryNotes') ?? '')
				.split(',')
				.map(Number)
				.filter((n) => Number.isInteger(n) && n > 0),
		[params]
	);
	const { data: draft, error: draftError, isLoading: isDraftLoading } = useInvoiceDraft(noteIds);
	const typeCode = params.get('type') ?? 'INVOICE_A';
	const typeId = catalog?.types.find((t) => t.code === typeCode)?.id ?? null;
	const initial = useMemo(
		() => ({
			typeId,
			providerId: Number(params.get('provider')) || null,
			relatedId: Number(params.get('related')) || null
		}),
		[typeId, params]
	);

	const backUrl = noteIds.length ? '/fiscal-documents/delivery-notes' : '/fiscal-documents';
	const backTitle = noteIds.length ? 'Remitos pendientes' : 'Comprobantes';

	useEffect(() => {
		if (!draftError) return;

		const { fields, domain } = readApiErrors(draftError, 'No se pudieron convertir los remitos.');
		enqueueSnackbar(domain ?? Object.values(fields)[0] ?? 'No se pudieron convertir los remitos.', {
			variant: 'error'
		});
		navigate('/fiscal-documents/delivery-notes');
	}, [draftError, enqueueSnackbar, navigate]);

	if (isCatalogLoading || (noteIds.length > 0 && isDraftLoading)) {
		return (
			<ViewLayout
				title="Cargar comprobante"
				backUrl={backUrl}
				showBackButton
				backTitle={backTitle}
			>
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress size={28} />
				</Box>
			</ViewLayout>
		);
	}

	const hasUrlProvider = Boolean(params.get('provider'));
	const hasUrlRelated = Boolean(params.get('related'));
	const hasUrlDeliveryNotes = noteIds.length > 0;
	const canClearProvider = !hasUrlProvider && !hasUrlRelated && !hasUrlDeliveryNotes;

	return (
		<FiscalDocumentEntryForm
			key={`${typeId}-${initial.providerId}-${initial.relatedId}-${noteIds.join('.')}`}
			initial={initial}
			draft={draft ?? null}
			canClearProvider={canClearProvider}
			backUrl={backUrl}
			backTitle={backTitle}
			onCancel={() => navigate(backUrl)}
			onDone={(document) => navigate(`/fiscal-documents/${document.id}`)}
		/>
	);
}

