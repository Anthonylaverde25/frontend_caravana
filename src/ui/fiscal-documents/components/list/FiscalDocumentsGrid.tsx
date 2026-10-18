import { Link, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridTagCell } from 'src/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { FiscalDocument } from '@/core/fiscal/domain/entities/FiscalDocument';
import { dec, isZero } from '@/core/stock/domain/rules/decimal';
import { formatDate, formatMoney } from '@/core/stock/domain/rules/quantityFormat';

interface FiscalDocumentsGridProps {
	documents: FiscalDocument[];
	loading: boolean;
	emptyMessage: string;
	onOpen: (document: FiscalDocument) => void;
	onOpenOperation: (operationId: number) => void;
}

/** The register of provider papers, read-only; a row opens the document. */
export default function FiscalDocumentsGrid({ documents, loading, emptyMessage, onOpen, onOpenOperation }: FiscalDocumentsGridProps) {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();

	return (
		<SheetGrid minWidth={980} maxHeight={{ xs: 520, lg: 'calc(100vh - 330px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 110 }}>Fecha</TableCell>
					<TableCell sx={{ ...headSx, width: 170 }}>Número</TableCell>
					<TableCell sx={headSx}>Proveedor</TableCell>
					<TableCell sx={{ ...headSx, width: 90 }} align="right">Renglones</TableCell>
					<TableCell sx={{ ...headSx, width: 140 }} align="right">Neto</TableCell>
					<TableCell sx={{ ...headSx, width: 150 }} align="right">Total</TableCell>
					<TableCell sx={{ ...headSx, width: 100 }}>Stock</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{loading && <SheetGridEmptyRow colSpan={9}>Cargando comprobantes…</SheetGridEmptyRow>}
				{!loading && documents.length === 0 && <SheetGridEmptyRow colSpan={9}>{emptyMessage}</SheetGridEmptyRow>}
				{documents.map((d, index) => {
					const difference = dec(d.totalDifference);
					const credit = d.type.sign < 0;
					return (
						<TableRow key={d.id} hover onClick={() => onOpen(d)} sx={{ cursor: 'pointer', bgcolor: index % 2 === 1 ? zebraBg : undefined }}>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<TableCell sx={textCellSx}>{formatDate(d.issuedAt)}</TableCell>
							<SheetGridTagCell tag={d.formattedNumber} caption={d.type.name} />
							<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{d.provider.name}</TableCell>
							<TableCell sx={textCellSx} align="right">{d.linesCount}</TableCell>
							<TableCell sx={textCellSx} align="right">{credit ? '−' : ''}{formatMoney(d.linesAmount)}</TableCell>
							<TableCell sx={{ ...textCellSx, fontWeight: 700 }} align="right">{credit ? '−' : ''}{formatMoney(d.totalAmount)}</TableCell>
							<TableCell sx={textCellSx} onClick={(e) => e.stopPropagation()}>
								{d.stockOperation ? (
									<Link component="button" onClick={() => onOpenOperation(d.stockOperation!.id)} sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
										N.º {d.stockOperation.number}
									</Link>
								) : (
									'—'
								)}
							</TableCell>
							<SheetGridStatusCell
								warning={difference !== null && !isZero(difference) ? `Difiere en ${formatMoney(difference)} del total del papel.` : undefined}
								info={d.status === 'VOIDED' ? `Anulado: ${d.voidReason ?? ''}` : undefined}
							>
								<FuseSvgIcon size={16} color="action">heroicons-outline:chevron-right</FuseSvgIcon>
							</SheetGridStatusCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}
