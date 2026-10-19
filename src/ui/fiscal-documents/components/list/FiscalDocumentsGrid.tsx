import { Fragment } from 'react';
import { TableBody, TableCell, TableFooter, TableHead, TableRow } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { SheetGridGroupRow } from 'src/components/sheet-grid/SheetGridGroupRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { FiscalDocument, FiscalRegisterSummary } from '@/core/fiscal/domain/entities/FiscalDocument';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { byMonth } from './fiscalRegisterRows';
import FiscalDocumentRow from './FiscalDocumentRow';

interface FiscalDocumentsGridProps {
	documents: FiscalDocument[];
	loading: boolean;
	emptyMessage: string;
	/** The period total of every page under the filters; null while loading. */
	summary: FiscalRegisterSummary | null;
	/** Delivery notes are left out of the period total unless they are what is listed. */
	listsDeliveryNotes: boolean;
	onOpen: (document: FiscalDocument) => void;
	onOpenOperation: (operationId: number) => void;
}

const COLUMNS = 10;

/**
 * The register (lienzo: FiscalDocumentsList): the papers grouped by month, newest first, and the
 * period total at the foot, signed (credit notes subtract).
 */
export default function FiscalDocumentsGrid(props: FiscalDocumentsGridProps) {
	const { documents, loading, emptyMessage, summary, listsDeliveryNotes, onOpen, onOpenOperation } = props;
	const { headSx, indexSx } = useGridCellStyles();
	const footSx = { ...headSx, position: 'sticky', bottom: 0, fontWeight: 800, borderTop: 1, borderColor: 'divider' } as const;
	let row = 0;

	return (
		<SheetGrid minWidth={1150} maxHeight={{ xs: 560, lg: 'calc(100vh - 330px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 100 }}>Fecha</TableCell>
					<TableCell sx={{ ...headSx, width: 260 }}>Comprobante</TableCell>
					<TableCell sx={headSx}>Proveedor</TableCell>
					<TableCell sx={{ ...headSx, width: 90 }} align="right">Renglones</TableCell>
					<TableCell sx={{ ...headSx, width: 140 }} align="right">Neto</TableCell>
					<TableCell sx={{ ...headSx, width: 130 }} align="right">Impuestos</TableCell>
					<TableCell sx={{ ...headSx, width: 150 }} align="right">Total</TableCell>
					<TableCell sx={{ ...headSx, width: 90 }}>Stock</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{loading && <SheetGridEmptyRow colSpan={COLUMNS}>Cargando comprobantes…</SheetGridEmptyRow>}
				{!loading && documents.length === 0 && <SheetGridEmptyRow colSpan={COLUMNS}>{emptyMessage}</SheetGridEmptyRow>}
				{byMonth(documents).map((group) => (
					<Fragment key={group.key}>
						<SheetGridGroupRow colSpan={COLUMNS} name={group.label} caption={`${group.documents.length} ${group.documents.length === 1 ? 'comprobante' : 'comprobantes'}`} />
						{group.documents.map((d) => {
							row += 1;
							return <FiscalDocumentRow key={d.id} document={d} index={row - 1} onOpen={() => onOpen(d)} onOpenOperation={onOpenOperation} />;
						})}
					</Fragment>
				))}
			</TableBody>
			{summary && summary.totals.count > 0 && (
				<TableFooter>
					<TableRow>
						<TableCell sx={{ ...indexSx, position: 'sticky', bottom: 0 }} />
						<TableCell sx={footSx} colSpan={4}>
							Total del período · {summary.totals.count} {summary.totals.count === 1 ? 'comprobante' : 'comprobantes'}
							{listsDeliveryNotes ? '' : ' (sin remitos: su factura los repite)'}
						</TableCell>
						<TableCell sx={footSx} align="right">{formatMoney(summary.totals.net)}</TableCell>
						<TableCell sx={footSx} align="right">{formatMoney(summary.totals.taxes)}</TableCell>
						<TableCell sx={footSx} align="right">{formatMoney(summary.totals.total)}</TableCell>
						<TableCell sx={footSx} colSpan={2} />
					</TableRow>
				</TableFooter>
			)}
		</SheetGrid>
	);
}
