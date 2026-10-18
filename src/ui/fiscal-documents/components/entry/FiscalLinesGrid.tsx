import React from 'react';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridGroupRow } from 'src/components/sheet-grid/SheetGridGroupRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { Item } from '@/core/items/domain/entities/Item';
import { Tax } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { InvoiceDraft } from '@/core/fiscal/domain/entities/DeliveryNote';
import { LinePreview } from '@/core/fiscal/domain/rules/fiscalPreview';
import { EntryMode, FiscalLineState } from './fiscalEntryState';
import FiscalLineRow from './FiscalLineRow';

interface FiscalLinesGridProps {
	lines: FiscalLineState[];
	previews: Record<string, LinePreview>;
	items: Item[];
	batches: Batch[];
	taxes: Tax[];
	discriminates: boolean;
	errors: Record<string, Record<string, string>>;
	onChange: (key: string, patch: Partial<FiscalLineState>) => void;
	onPickItem: (key: string, item: Item | null) => void;
	onRemove: (key: string) => void;
	/** A line inherited from a delivery note is struck through instead of removed (Q4). */
	onToggleRemoved: (key: string) => void;
	mode: EntryMode;
	unpriced: boolean;
	/** The notes being converted, to name each group. */
	notes: InvoiceDraft['deliveryNotes'];
}

interface Group {
	key: string;
	name: string;
	caption: string;
	lines: FiscalLineState[];
}

/** In a conversion, the rows grouped by the delivery note they come from, and the new ones last. */
const groupsOf = (lines: FiscalLineState[], notes: InvoiceDraft['deliveryNotes']): Group[] => [
	...notes.map((note) => ({
		key: `note-${note.id}`,
		name: note.label,
		caption: note.isValued ? 'con precios' : 'sin precios',
		lines: lines.filter((l) => l.deliveryNoteId === note.id)
	})),
	{
		key: 'new',
		name: 'Sin remito',
		caption: 'servicios y otros renglones de la factura',
		lines: lines.filter((l) => l.deliveryNoteId === null)
	}
];

/** "3. Renglones": the paper line by line; the last row is always empty to keep typing. */
export default function FiscalLinesGrid(props: FiscalLinesGridProps) {
	const {
		lines,
		previews,
		items,
		batches,
		taxes,
		discriminates,
		errors,
		onChange,
		onPickItem,
		onRemove,
		onToggleRemoved,
		mode,
		unpriced,
		notes
	} = props;
	const { headSx, indexSx } = useGridCellStyles();
	const vat = taxes.find((t) => t.code === 'VAT');
	const otherLineTaxes = taxes.filter((t) => t.appliesTo === 'LINE' && t.code !== 'VAT');
	const converting = mode === 'conversion';
	const columns = converting ? 14 : 13;
	const head = (label: string, width?: number, align?: 'right') => (
		<TableCell
			sx={{ ...headSx, ...(width ? { width } : {}) }}
			align={align}
		>
			{label}
		</TableCell>
	);

	let index = 0;
	const row = (line: FiscalLineState) => (
		<FiscalLineRow
			key={line.key}
			index={index++}
			line={line}
			items={items}
			batches={batches}
			vat={vat}
			otherLineTaxes={otherLineTaxes}
			discriminates={discriminates}
			preview={previews[line.key]}
			errors={errors[line.key] ?? {}}
			onChange={(patch) => onChange(line.key, patch)}
			onPickItem={(item) => onPickItem(line.key, item)}
			onRemove={() => (line.deliveryNoteLineId !== null ? onToggleRemoved(line.key) : onRemove(line.key))}
			mode={mode}
			unpriced={unpriced}
		/>
	);

	return (
		<SheetGrid
			minWidth={converting ? 1530 : 1420}
			maxHeight={{ xs: 520, lg: 'calc(100vh - 420px)' }}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					{head(converting ? 'Artículo o servicio (del remito)' : 'Artículo o servicio')}
					{head('Cant.', 90)}
					{head('Unidad o presentación', 190)}
					{head(discriminates ? 'Precio u. (neto)' : 'Precio u.', 110)}
					{converting && head('Remito', 110, 'right')}
					{head('IVA', 110)}
					{head('Importe', 120, 'right')}
					{head('IVA $', 120, 'right')}
					{head('Otros imp.', 110, 'right')}
					{head('Equivale a', 110)}
					{head('Lote', 170)}
					{head('Cab.', 70)}
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{converting
					? groupsOf(lines, notes).map((group) => (
							<React.Fragment key={group.key}>
								<SheetGridGroupRow
									colSpan={columns}
									name={group.name}
									caption={group.caption}
								/>
								{group.lines.map(row)}
							</React.Fragment>
						))
					: lines.map(row)}
			</TableBody>
		</SheetGrid>
	);
}
