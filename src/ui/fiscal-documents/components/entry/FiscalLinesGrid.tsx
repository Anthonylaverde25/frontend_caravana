import React, { useState } from 'react';
import { Box, IconButton, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
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
import ItemFormDialog from '@/ui/items/components/dialogs/ItemFormDialog';

interface FiscalLinesGridProps {
	lines: FiscalLineState[];
	previews: Record<string, LinePreview>;
	items: Item[];
	batches: Batch[];
	taxes: Tax[];
	discriminates: boolean;
	errors: Record<string, Record<string, string>>;
	onChange: (key: string, patch: Partial<FiscalLineState>) => void;
	onPickItem: (key: string, item: Item | null, origin?: 'MANUAL' | 'LINKED') => void;
	onRemove: (key: string) => void;
	/** A line inherited from a delivery note is struck through instead of removed (Q4). */
	onToggleRemoved: (key: string) => void;
	mode: EntryMode;
	unpriced: boolean;
	/** The notes being converted, to name each group. */
	notes: InvoiceDraft['deliveryNotes'];
	showOtherTaxes?: boolean;
	onToggleOtherTaxes?: (show: boolean) => void;
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
		notes,
		showOtherTaxes = false,
		onToggleOtherTaxes
	} = props;
	const { headSx, indexSx } = useGridCellStyles();
	const vat = taxes.find((t) => t.code === 'VAT');
	const otherLineTaxes = taxes.filter((t) => t.appliesTo === 'LINE' && t.code !== 'VAT');
	const converting = mode === 'conversion';
	const columns = converting ? (showOtherTaxes ? 13 : 12) : (showOtherTaxes ? 12 : 11);
	const head = (label: string, width?: number, align?: 'right') => (
		<TableCell
			sx={{
				...headSx,
				...(width ? { width } : {}),
				whiteSpace: 'nowrap',
				verticalAlign: 'middle',
				boxSizing: 'border-box'
			}}
			align={align}
		>
			{label}
		</TableCell>
	);

	const [creating, setCreating] = useState<{
		lineKey: string;
		name: string;
	} | null>(null);

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
			onPickItem={(item, origin) => onPickItem(line.key, item, origin)}
			onCreateItem={(name) => setCreating({ lineKey: line.key, name })}
			onRemove={() => (line.deliveryNoteLineId !== null ? onToggleRemoved(line.key) : onRemove(line.key))}
			mode={mode}
			unpriced={unpriced}
			showOtherTaxes={showOtherTaxes}
		/>
	);

	return (
		<>
			<SheetGrid
				minWidth={converting ? 1410 : 1300}
				borderless
			>
				<TableHead>
					<TableRow sx={{ height: 38 }}>
						<TableCell
							sx={{ ...indexSx, whiteSpace: 'nowrap', verticalAlign: 'middle' }}
							align="center"
						>
							#
						</TableCell>
						{head(converting ? 'Artículo o servicio (del remito)' : 'Artículo o servicio')}
						{head('Cant.', 90)}
						{head('Unidad o presentación', 190)}
						{head(discriminates ? 'Precio u. (neto)' : 'Precio u.', 110)}
						{converting && head('Remito', 110, 'right')}
						{head('IVA', 110)}
						{head('Importe', 120, 'right')}
						{showOtherTaxes && (
							<TableCell
								sx={{
									...headSx,
									width: 110,
									p: 0,
									px: 1,
									whiteSpace: 'nowrap',
									verticalAlign: 'middle',
									boxSizing: 'border-box'
								}}
								align="right"
							>
								<Box
									sx={{
										display: 'inline-flex',
										alignItems: 'center',
										justifyContent: 'flex-end',
										gap: 0.5,
										whiteSpace: 'nowrap',
										height: '100%'
									}}
								>
									<Typography
										component="span"
										sx={{
											fontSize: '0.74rem',
											fontWeight: 700,
											color: 'inherit',
											whiteSpace: 'nowrap',
											lineHeight: 1
										}}
									>
										Otros imp.
									</Typography>
									{onToggleOtherTaxes && (
										<Tooltip title="Ocultar columna de otros importes">
											<IconButton
												size="small"
												aria-label="Ocultar columna de otros importes"
												onClick={() => onToggleOtherTaxes(false)}
												sx={{
													width: 18,
													height: 18,
													p: 0,
													color: 'text.secondary',
													borderRadius: '4px',
													transition: 'all 0.15s ease',
													'&:hover': {
														color: 'error.main',
														bgcolor: (theme) => alpha(theme.palette.error.main, 0.1)
													}
												}}
											>
												<FuseSvgIcon size={12}>heroicons-outline:x-mark</FuseSvgIcon>
											</IconButton>
										</Tooltip>
									)}
								</Box>
							</TableCell>
						)}
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

			{/* An item missing from the catalogue must not cost the sheet already typed: it comes back selected. */}
			<ItemFormDialog
				open={creating !== null}
				initialName={creating?.name ?? ''}
				onClose={() => setCreating(null)}
				onSaved={(saved) => {
					if (creating) onPickItem(creating.lineKey, saved);

					setCreating(null);
				}}
			/>
		</>
	);
}
