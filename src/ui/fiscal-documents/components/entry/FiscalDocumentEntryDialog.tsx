import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import { Box, CircularProgress, Dialog, Paper, Slide, Stack, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { useItems } from '@/features/items/hooks/useItems';
import { useOwnActiveBatches } from '@/features/batches/hooks/useOwnActiveBatches';
import { useFiscalCatalog } from '@/features/fiscal/hooks/useFiscalDocuments';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { InvoiceDraft } from '@/core/fiscal/domain/entities/DeliveryNote';
import { LinePreview, previewLine, summarize } from '@/core/fiscal/domain/rules/fiscalPreview';
import { sum, ZERO } from '@/core/stock/domain/rules/decimal';
import { EntryMode, entryModeOf, FiscalHeaderState, isBlankLine } from './fiscalEntryState';
import { useFiscalEntry } from './useFiscalEntry';
import { useFiscalEntrySubmit } from './useFiscalEntrySubmit';
import FiscalHeaderCard from './FiscalHeaderCard';
import FiscalSummaryCard from './FiscalSummaryCard';
import FiscalLinesGrid from './FiscalLinesGrid';
import DocumentTaxesGrid from './DocumentTaxesGrid';

const SlideUp = forwardRef(function SlideUp(
	props: TransitionProps & { children: React.ReactElement },
	ref: React.Ref<unknown>
) {
	return (
		<Slide
			direction="up"
			ref={ref}
			{...props}
		/>
	);
});

/** Batches that never receive a cost: the animals are dead or slaughtered (DS10). */
const EXCLUDED_BATCH_TYPES = ['INTERNAL_DEATH', 'INTERNAL_CONSUMPTION'];

interface FiscalDocumentEntryDialogProps {
	initial: Partial<FiscalHeaderState>;
	/** "Convertir a factura": what the delivery notes declared (DC5). */
	draft?: InvoiceDraft | null;
	onClose: () => void;
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
 * "Cargar comprobante": the provider's paper line by line (DS13). Its stock-tracked lines enter the
 * warehouse (or leave it, for a credit note) when it is registered; services and non-stock articles
 * stay on the document, charged to their batch.
 */
export default function FiscalDocumentEntryDialog({
	initial,
	draft = null,
	onClose,
	onDone
}: FiscalDocumentEntryDialogProps) {
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
	const stocked = (key: string) =>
		!!items.find((i) => i.id === entry.lines.find((l) => l.key === key)?.itemId)?.trackStock;
	const summary = summarize(
		filled.map((l) => ({ preview: previews[l.key], otherTaxes: discriminates ? l.otherTaxes : [] })),
		discriminates
			? entry.documentTaxes
					.filter((t) => t.taxId !== null)
					.map((t) => ({ taxId: t.taxId as number, amount: t.amount }))
			: [],
		taxes
	);
	const costOf = (pick: boolean) =>
		sum(filled.filter((l) => stocked(l.key) === pick).map((l) => previews[l.key].cost ?? ZERO));

	return (
		<Dialog
			fullScreen
			open
			onClose={onClose}
			TransitionComponent={SlideUp}
			PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}
		>
			<FullScreenEntryBar
				title={copy.title}
				subtitle={copy.subtitle}
				primaryLabel={copy.primary}
				primaryIcon="heroicons-outline:check"
				busy={submit.isSaving}
				onClose={onClose}
				onPrimary={submit.submit}
			/>
			{isLoading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress size={28} />
				</Box>
			) : (
				<Box
					sx={{
						flex: 1,
						minHeight: 0,
						overflow: 'auto',
						p: { xs: 2, md: 3 },
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' },
						gap: 2.5,
						alignItems: 'start'
					}}
				>
					<Stack spacing={2.5}>
						<FiscalHeaderCard
							header={entry.header}
							types={types}
							type={entry.type}
							onChange={entry.setHeader}
							errors={submit.errors.header}
							mode={mode}
							draft={draft}
						/>
						<FiscalSummaryCard
							lineCount={filled.length}
							stockedCost={costOf(true)}
							expenseCost={costOf(false)}
							net={summary.net}
							rows={summary.rows}
							total={summary.total}
							declaredTotal={entry.header.declaredTotal}
							isCreditNote={entry.type?.kind === 'CREDIT_NOTE'}
							mode={mode}
							unpriced={unpriced}
						/>
					</Stack>
					<Stack
						spacing={2.5}
						sx={{ minWidth: 0 }}
					>
						<Paper
							variant="outlined"
							sx={{ p: 2, borderRadius: '8px', minWidth: 0 }}
						>
							<Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>3. Renglones</Typography>
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
						</Paper>
						{discriminates && (
							<DocumentTaxesGrid
								rows={entry.documentTaxes}
								taxes={taxes}
								errors={submit.errors.documentTaxes}
								onAdd={entry.addDocumentTax}
								onChange={entry.updateDocumentTax}
								onRemove={entry.removeDocumentTax}
							/>
						)}
					</Stack>
				</Box>
			)}
		</Dialog>
	);
}
