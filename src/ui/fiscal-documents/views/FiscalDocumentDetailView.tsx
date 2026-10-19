import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import ViewLayout from 'src/components/ViewLayout';
import { useFiscalDocument, useVoidFiscalDocument } from '@/features/fiscal/hooks/useFiscalDocuments';
import { formatDate } from '@/core/stock/domain/rules/quantityFormat';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import ReasonDialog from '@/ui/stock/components/dialogs/ReasonDialog';
import FiscalPaperSheet from '../components/detail/paper/FiscalPaperSheet';
import FiscalDetailDrawer from '../components/detail/drawer/FiscalDetailDrawer';
import DeliveryNoteStatusBar from '../components/detail/DeliveryNoteStatusBar';
import DiscrepanciesSection from '../components/discrepancies/DiscrepanciesSection';

const TEXT_BUTTON = { fontWeight: 600, textTransform: 'none' } as const;

/**
 * `/fiscal-documents/:documentId`: the paper as registered, drawn like the original, with a side panel
 * (summary, imputation, history) and its actions (lienzo: FiscalDocumentDetail). Payments, sending and
 * sharing wait for their logic.
 */
export default function FiscalDocumentDetailView() {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const { documentId } = useParams();
	const id = /^\d+$/.test(documentId ?? '') ? Number(documentId) : null;
	const { data: document, isLoading, isError } = useFiscalDocument(id);
	const { mutateAsync: voidDocument, isPending } = useVoidFiscalDocument();
	const [voiding, setVoiding] = useState(false);
	const [voidError, setVoidError] = useState<string | null>(null);
	const [panel, setPanel] = useState(true);

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
			scroll="content"
			className="p-0 flex flex-col flex-1 h-full min-h-0"
			actions={
				<Stack
					direction="row"
					spacing={1}
					sx={{ displayPrint: 'none' }}
				>
					{!panel && (
						<Button onClick={() => setPanel(true)} startIcon={<FuseSvgIcon size={18}>heroicons-outline:chevron-double-left</FuseSvgIcon>} sx={TEXT_BUTTON}>
							Ver detalle
						</Button>
					)}
					<Button
						variant="outlined"
						color="inherit"
						onClick={() => window.print()}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
						sx={{ ...TEXT_BUTTON, fontWeight: 700, borderRadius: '6px', borderColor: 'divider' }}
					>
						Imprimir
					</Button>
					{registered && (
						<>
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
						</>
					)}
				</Stack>
			}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', lg: 'row' },
					flex: '1 1 auto',
					minHeight: 0,
					height: '100%',
					width: '100%',
					overflow: 'hidden'
				}}
			>
				<Box
					sx={{
						flex: '1 1 auto',
						minWidth: 0,
						height: '100%',
						overflowY: 'auto',
						p: { xs: 2, sm: 3, md: 4 },
						bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : '#F1F3F5'),
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center'
					}}
				>
					<Stack spacing={2.5} sx={{ maxWidth: '800px', width: '100%', minWidth: 0, pb: 6 }}>
						{!registered && (
							<Alert severity="warning">
								Anulado el {formatDate(document.voidedAt)}: {document.voidReason}
							</Alert>
						)}
						{document.deliveryNoteStatus && <DeliveryNoteStatusBar document={document} />}
						<FiscalPaperSheet document={document} />
						{(document.deliveryNotes.length > 0 || isNote) && (
							<DiscrepanciesSection filters={isNote ? { deliveryNoteId: document.id } : { invoiceId: document.id }} />
						)}
					</Stack>
				</Box>
				{panel && <FiscalDetailDrawer document={document} onHide={() => setPanel(false)} />}
			</Box>

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
