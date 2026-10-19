import { useEffect, useMemo, useRef } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useItems } from '@/features/items/hooks/useItems';
import { useOwnActiveBatches } from '@/features/batches/hooks/useOwnActiveBatches';
import { useFiscalCatalog } from '@/features/fiscal/hooks/useFiscalDocuments';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { InvoiceDraft } from '@/core/fiscal/domain/entities/DeliveryNote';
import { LinePreview, previewLine, summarize } from '@/core/fiscal/domain/rules/fiscalPreview';
import { EntryMode, entryModeOf, FiscalHeaderState, isBlankLine } from './fiscalEntryState';
import { useFiscalEntry } from './useFiscalEntry';
import { useFiscalEntrySubmit } from './useFiscalEntrySubmit';
import FiscalSheetHeader from './FiscalSheetHeader';
import FiscalSheetFooter from './FiscalSheetFooter';
import FiscalLinesGrid from './FiscalLinesGrid';

/** Batches that never receive a cost: the animals are dead or slaughtered (DS10). */
const EXCLUDED_BATCH_TYPES = ['INTERNAL_DEATH', 'INTERNAL_CONSUMPTION'];

export interface FiscalDocumentEntryFormProps {
	initial: Partial<FiscalHeaderState>;
	/** "Convertir a factura": what the delivery notes declared (DC5). */
	draft?: InvoiceDraft | null;
	canClearProvider?: boolean;
	backUrl: string;
	backTitle: string;
	onCancel: () => void;
	onDone: (document: FiscalDocumentDetail) => void;
}

const COPY: Record<EntryMode, { title: string; subtitle: string; primary: string }> = {
	document: {
		title: 'Cargar comprobante',
		subtitle:
			'La factura, nota de crédito, ticket o remito del proveedor, renglón por renglón. Lo que lleva stock entra al almacén al registrarlo.',
		primary: 'Registrar comprobante'
	},
	'delivery-note': {
		title: 'Cargar remito',
		subtitle:
			'La mercadería que llegó, renglón por renglón. Entra al almacén al registrarlo; la deuda llega con la factura.',
		primary: 'Registrar remito'
	},
	conversion: {
		title: 'Convertir a factura',
		subtitle:
			'La factura de los remitos: copiá del papel tipo, número, precios e impuestos. No vuelve a ingresar la mercadería; cada diferencia con los remitos queda como novedad.',
		primary: 'Registrar factura'
	}
};

/**
 * "Cargar comprobante" as a dedicated full-page view (lienzo: FiscalDocumentEditor).
 * Its stock-tracked lines enter the warehouse (or leave it, for a credit note) when registered;
 * services and non-stock articles stay on the document, charged to their batch.
 */
export default function FiscalDocumentEntryForm({
	initial,
	draft = null,
	canClearProvider = true,
	backUrl,
	backTitle,
	onCancel,
	onDone
}: FiscalDocumentEntryFormProps) {
	const { data: catalog, isLoading } = useFiscalCatalog();
	const types = catalog?.types ?? [];
	const taxes = catalog?.taxes ?? [];
	const { data: items = [] } = useItems({});
	const { batches } = useOwnActiveBatches();
	const chargeable = useMemo(
		() => batches.filter((b) => !EXCLUDED_BATCH_TYPES.includes(b.batch_type_code ?? '')),
		[batches]
	);
	const entry = useFiscalEntry(initial, types, taxes);
	const discriminates = !!entry.type?.discriminatesVat;
	const mode = entryModeOf(entry.header, entry.type);
	const unpriced = mode === 'delivery-note' && entry.header.isValued === false;
	const copy = COPY[draft ? 'conversion' : mode];

	const loaded = useRef(false);
	useEffect(() => {
		if (draft && entry.type && !loaded.current) {
			loaded.current = true;
			entry.loadDraft(draft);
		}
	}, [draft, entry]);
	const submit = useFiscalEntrySubmit({ ...entry, type: entry.type, taxes, onDone });

	const previews = useMemo(() => {
		const map: Record<string, LinePreview> = {};
		entry.lines.forEach((line) => (map[line.key] = previewLine(line, taxes, discriminates)));
		return map;
	}, [entry.lines, taxes, discriminates]);
	const filled = entry.lines.filter((l) => !isBlankLine(l) && !l.removed);
	const summary = summarize(
		filled.map((l) => ({ preview: previews[l.key], otherTaxes: discriminates ? l.otherTaxes : [] })),
		discriminates
			? entry.documentTaxes
					.filter((t) => t.taxId !== null)
					.map((t) => ({ taxId: t.taxId as number, amount: t.amount }))
			: [],
		taxes
	);

	const actions = (
		<Stack direction="row" spacing={1.5} alignItems="center">
			<Button
				variant="outlined"
				color="inherit"
				onClick={onCancel}
				disabled={submit.isSaving}
				sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '6px', borderColor: 'divider' }}
			>
				Cancelar
			</Button>
			<Button
				variant="contained"
				color="primary"
				onClick={submit.submit}
				disabled={submit.isSaving}
				startIcon={
					submit.isSaving ? (
						<CircularProgress size={16} color="inherit" />
					) : (
						<FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
					)
				}
				sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '6px', boxShadow: 'none' }}
			>
				{copy.primary}
			</Button>
		</Stack>
	);

	return (
		<ViewLayout
			title={copy.title}
			subtitle={copy.subtitle}
			backUrl={backUrl}
			showBackButton
			backTitle={backTitle}
			actions={actions}
			scroll="content"
			className="p-2 sm:p-3 md:p-4 flex flex-col flex-1 h-full min-h-0"
		>
			{isLoading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress size={28} />
				</Box>
			) : (
				<Box
					component="article"
					aria-label="Cargar comprobante"
					sx={{
						width: '100%',
						flex: '1 1 auto',
						minHeight: 0,
						height: '100%',
						overflow: 'hidden',
						p: 0,
						bgcolor: 'background.paper',
						border: 1,
						borderColor: 'divider',
						borderRadius: '8px',
						boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
						display: 'flex',
						flexDirection: 'column'
					}}
				>
					<FiscalSheetHeader
						header={entry.header}
						types={types}
						type={entry.type}
						onChange={entry.setHeader}
						errors={submit.errors.header}
						mode={mode}
						draft={draft}
						canClearProvider={canClearProvider}
					/>
					<Box
						sx={{
							flex: '1 1 auto',
							minHeight: 0,
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							overflow: 'hidden'
						}}
					>
						<FiscalLinesGrid
							lines={entry.lines}
							previews={previews}
							taxes={taxes}
							batches={chargeable}
							discriminates={discriminates}
							items={items.filter((i) => i.isActive && (mode !== 'delivery-note' || i.trackStock))}
							errors={submit.errors.cells}
							onChange={entry.updateLine}
							onPickItem={entry.pickItem}
							onRemove={entry.removeLine}
							onToggleRemoved={entry.toggleRemoved}
							mode={mode}
							unpriced={unpriced}
							notes={draft?.deliveryNotes ?? []}
						/>
					</Box>
					<FiscalSheetFooter
						header={entry.header}
						onChange={entry.setHeader}
						errors={submit.errors.header}
						mode={mode}
						isCreditNote={entry.type?.kind === 'CREDIT_NOTE'}
						unpriced={unpriced}
						summary={summary}
					/>
				</Box>
			)}
		</ViewLayout>
	);
}
