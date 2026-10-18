import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { Item } from '@/core/items/domain/entities/Item';
import { Tax } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { LinePreview } from '@/core/fiscal/domain/rules/fiscalPreview';
import { FiscalLineState } from './fiscalEntryState';
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
}

/** "3. Renglones": the paper line by line; the last row is always empty to keep typing. */
export default function FiscalLinesGrid({ lines, previews, items, batches, taxes, discriminates, errors, onChange, onPickItem, onRemove }: FiscalLinesGridProps) {
	const { headSx, indexSx } = useGridCellStyles();
	const vat = taxes.find((t) => t.code === 'VAT');
	const otherLineTaxes = taxes.filter((t) => t.appliesTo === 'LINE' && t.code !== 'VAT');
	const head = (label: string, width?: number, align?: 'right') => (
		<TableCell sx={{ ...headSx, ...(width ? { width } : {}) }} align={align}>
			{label}
		</TableCell>
	);

	return (
		<SheetGrid minWidth={1420} maxHeight={{ xs: 520, lg: 'calc(100vh - 420px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					{head('Artículo o servicio')}
					{head('Cant.', 90)}
					{head('Unidad o presentación', 190)}
					{head(discriminates ? 'Precio u. (neto)' : 'Precio u.', 110)}
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
				{lines.map((line, index) => (
					<FiscalLineRow
						key={line.key}
						index={index}
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
						onRemove={() => onRemove(line.key)}
					/>
				))}
			</TableBody>
		</SheetGrid>
	);
}
