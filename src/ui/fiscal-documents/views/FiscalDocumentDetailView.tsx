import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, Link, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import ViewLayout from 'src/components/ViewLayout';
import { useFiscalDocument, useVoidFiscalDocument } from '@/features/fiscal/hooks/useFiscalDocuments';
import { formatDate } from '@/core/stock/domain/rules/quantityFormat';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import ReasonDialog from '@/ui/stock/components/dialogs/ReasonDialog';
import FiscalDocumentLinesGrid from '../components/detail/FiscalDocumentLinesGrid';
import FiscalDocumentTotals from '../components/detail/FiscalDocumentTotals';
import DeliveryNoteStatusBar from '../components/detail/DeliveryNoteStatusBar';
import DiscrepanciesSection from '../components/discrepancies/DiscrepanciesSection';

const TEXT_BUTTON = { fontWeight: 600, textTransform: 'none' } as const;

/** `/fiscal-documents/:documentId`: the paper as registered, its stock operation, and "Anular" (DS20). */
export default function FiscalDocumentDetailView() {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const { documentId } = useParams();
	const id = /^\d+$/.test(documentId ?? '') ? Number(documentId) : null;
	const { data: document, isLoading, isError } = useFiscalDocument(id);
	const { mutateAsync: voidDocument, isPending } = useVoidFiscalDocument();
	const [voiding, setVoiding] = useState(false);
	const [voidError, setVoidError] = useState<string | null>(null);

	if (isLoading) {
		return (
			<ViewLayout title="Comprobante">
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress />
				</Box>
			</ViewLayout>
		);
	}

	if (!document || isError) {
		return (
			<ViewLayout
				title="Comprobante no encontrado"
				backUrl="/fiscal-documents"
				showBackButton
				backTitle="Comprobantes"
			>
				<Typography color="text.secondary">El comprobante no existe en esta empresa.</Typography>
			</ViewLayout>
		);
	}

	const registered = document.status === 'REGISTERED';
	const stockLines = document.lines.filter((l) => l.item.trackStock);
	const batchLines = document.lines.filter((l) => l.batch);
	const creditNoteCode =
		document.type.kind === 'INVOICE' && document.type.letter ? `CREDIT_NOTE_${document.type.letter}` : null;
	const isNote = document.type.kind === 'DELIVERY_NOTE';
	const convertible = isNote && document.deliveryNoteStatus?.code === 'PENDING_INVOICE';
	const consequences = [
		`${document.label} queda anulado y se puede volver a cargar con el mismo número.`,
		...(document.deliveryNotes.length
			? [
					`${document.deliveryNotes.map((n) => n.label).join(', ')} ${document.deliveryNotes.length === 1 ? 'vuelve' : 'vuelven'} a quedar pendiente(s) de factura; lo que valorizó vuelve a quedar sin valor y sus diferencias se cancelan.`
				]
			: []),
		...(stockLines.length
			? [
					`Se revierte su movimiento de stock N.º ${document.stockOperation?.number} (${stockLines.map((l) => l.item.name).join(', ')}).`
				]
			: []),
		...(batchLines.length
			? [`Sale de la historia de ${[...new Set(batchLines.map((l) => l.batch?.name))].join(', ')}.`]
			: [])
	];

	const confirmVoid = async (reason: string) => {
		try {
			await voidDocument({ id: document.id, reason });
			setVoiding(false);
			enqueueSnackbar(`${document.label} anulado.`, { variant: 'success' });
		} catch (error) {
			setVoidError(readApiErrors(error, 'No se pudo anular.').domain ?? 'No se pudo anular.');
		}
	};

	return (
		<ViewLayout
			title={document.label}
			subtitle={`${document.provider.name} · ${formatDate(document.issuedAt)}`}
			backUrl="/fiscal-documents"
			showBackButton
			backTitle="Comprobantes"
			actions={
				registered && (
					<Stack
						direction="row"
						spacing={1}
					>
						{convertible && (
							<Button
								variant="contained"
								onClick={() => navigate(`/fiscal-documents/new?deliveryNotes=${document.id}`)}
								startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-check</FuseSvgIcon>}
								sx={{ ...TEXT_BUTTON, fontWeight: 700, borderRadius: '6px', boxShadow: 'none' }}
							>
								Convertir a factura
							</Button>
						)}
						{creditNoteCode && (
							<Button
								onClick={() =>
									navigate(
										`/fiscal-documents/new?type=${creditNoteCode}&provider=${document.provider.id}&related=${document.id}`
									)
								}
								startIcon={<FuseSvgIcon size={18}>heroicons-outline:receipt-refund</FuseSvgIcon>}
								sx={TEXT_BUTTON}
							>
								Cargar nota de crédito
							</Button>
						)}
						<Button
							color="error"
							onClick={() => {
								setVoidError(null);
								setVoiding(true);
							}}
							startIcon={<FuseSvgIcon size={18}>heroicons-outline:no-symbol</FuseSvgIcon>}
							sx={TEXT_BUTTON}
						>
							Anular
						</Button>
					</Stack>
				)
			}
		>
			<Stack spacing={2}>
				{!registered && (
					<Alert severity="warning">
						Anulado el {formatDate(document.voidedAt)}: {document.voidReason}
					</Alert>
				)}
				<Typography
					variant="body2"
					color="text.secondary"
				>
					{document.createdBy
						? `Cargado por ${document.createdBy} el ${formatDate(document.createdAt)}`
						: `Cargado el ${formatDate(document.createdAt)}`}
					{document.stockOperation && (
						<>
							{' · '}
							<Link
								component={RouterLink}
								to={`/item-documents/${document.stockOperation.id}`}
								sx={{ fontWeight: 600 }}
							>
								Movimiento de stock N.º {document.stockOperation.number}
							</Link>
						</>
					)}
					{document.related && ` · Acredita ${document.related.label}`}
					{document.notes && ` · ${document.notes}`}
				</Typography>
				<DeliveryNoteStatusBar document={document} />
				<FiscalDocumentLinesGrid lines={document.lines} />
				{document.linesAmount !== null && <FiscalDocumentTotals document={document} />}
				{(document.deliveryNotes.length > 0 || isNote) && (
					<DiscrepanciesSection
						filters={isNote ? { deliveryNoteId: document.id } : { invoiceId: document.id }}
					/>
				)}
			</Stack>

			<ReasonDialog
				open={voiding}
				title={`Anular ${document.label}`}
				consequences={consequences}
				confirmLabel="Anular comprobante"
				busy={isPending}
				error={voidError}
				onClose={() => setVoiding(false)}
				onConfirm={confirmVoid}
			/>
		</ViewLayout>
	);
}
