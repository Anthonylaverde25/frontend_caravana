import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, Link, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import ViewLayout from 'src/components/ViewLayout';
import { useItemDocument, useReverseItemDocument } from '@/features/stock/hooks/useItemDocuments';
import { useIdempotencyKey } from '@/features/stock/hooks/useIdempotencyKey';
import { formatDate } from '@/core/stock/domain/rules/quantityFormat';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import ReasonDialog from '@/ui/stock/components/dialogs/ReasonDialog';
import ItemDocumentLinesGrid from '../components/detail/ItemDocumentLinesGrid';

/** `/item-documents/:documentId`: a stock operation, its movements and "Anular" (DS11, E4). */
export default function ItemDocumentDetailView() {
	const { enqueueSnackbar } = useSnackbar();
	const { documentId } = useParams();
	const id = /^\d+$/.test(documentId ?? '') ? Number(documentId) : null;
	const { data: document, isLoading, isError } = useItemDocument(id);
	const { mutateAsync: reverse, isPending } = useReverseItemDocument();
	const [key, renewKey] = useIdempotencyKey();
	const [reversing, setReversing] = useState(false);
	const [reverseError, setReverseError] = useState<string | null>(null);

	if (isLoading) {
		return <ViewLayout title="Movimiento"><Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box></ViewLayout>;
	}
	if (!document || isError) {
		return (
			<ViewLayout title="Movimiento no encontrado" backUrl="/item-documents" showBackButton backTitle="Movimientos de stock">
				<Typography color="text.secondary">El movimiento no existe en esta empresa.</Typography>
			</ViewLayout>
		);
	}

	const confirm = async (reason: string) => {
		try {
			const reversal = await reverse({ id: document.id, reason, idempotencyKey: key });
			renewKey();
			setReversing(false);
			enqueueSnackbar(`Movimiento N.º ${document.number} anulado por el N.º ${reversal.number}.`, { variant: 'success' });
		} catch (error) {
			setReverseError(readApiErrors(error, 'No se pudo anular.').domain ?? 'No se pudo anular.');
		}
	};

	return (
		<ViewLayout
			title={`${document.typeLabel} N.º ${document.number}`}
			subtitle={`${formatDate(document.occurredAt)} · ${document.warehouse.name ?? ''}`}
			backUrl="/item-documents"
			showBackButton
			backTitle="Movimientos de stock"
			actions={
				document.canReverse && (
					<Button color="error" onClick={() => { setReverseError(null); setReversing(true); }}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:no-symbol</FuseSvgIcon>} sx={{ fontWeight: 600, textTransform: 'none' }}>
						Anular
					</Button>
				)
			}
		>
			<Stack spacing={2}>
				{document.reversedBy && (
					<Alert severity="warning">
						Anulado por el{' '}
						<Link component={RouterLink} to={`/item-documents/${document.reversedBy.id}`}>movimiento N.º {document.reversedBy.number}</Link>.
					</Alert>
				)}
				{document.reverses && (
					<Alert severity="info">
						Anula al <Link component={RouterLink} to={`/item-documents/${document.reverses.id}`}>movimiento N.º {document.reverses.number}</Link>
						{document.reason ? `: ${document.reason}` : '.'}
					</Alert>
				)}
				{!document.canReverse && document.fiscalDocument && !document.reversedBy && (
					<Alert severity="info">
						Viene de <Link component={RouterLink} to={`/fiscal-documents/${document.fiscalDocument.id}`}>{document.fiscalDocument.label}</Link>: para anularlo, anulá el comprobante.
					</Alert>
				)}
				<Typography variant="body2" color="text.secondary">
					{document.fiscalDocument && (
						<>
							<Link component={RouterLink} to={`/fiscal-documents/${document.fiscalDocument.id}`} sx={{ fontWeight: 600 }}>
								{document.fiscalDocument.label}
							</Link>
							{' · '}
						</>
					)}
					{document.batch ? `Lote ${document.batch.name} · ${document.headsTreated} cabezas · ` : ''}
					{document.createdBy ? `Cargado por ${document.createdBy}` : 'Cargado'} el {formatDate(document.createdAt)}
					{document.reason && !document.reverses ? ` · Motivo: ${document.reason}` : ''}
					{document.notes ? ` · ${document.notes}` : ''}
				</Typography>
				<ItemDocumentLinesGrid lines={document.lines} />
			</Stack>

			<ReasonDialog
				open={reversing}
				title={`Anular el movimiento N.º ${document.number}`}
				consequences={[
					`Se registra un movimiento de anulación que revierte ${document.lines.map((l) => l.item.name).join(', ')} con su mismo costo.`,
					...(document.batch ? [`Sale de la historia de ${document.batch.name}.`] : [])
				]}
				confirmLabel="Anular movimiento"
				busy={isPending}
				error={reverseError}
				onClose={() => setReversing(false)}
				onConfirm={confirm}
			/>
		</ViewLayout>
	);
}
