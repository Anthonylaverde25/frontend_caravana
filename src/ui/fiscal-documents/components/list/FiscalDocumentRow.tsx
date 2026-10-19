import { Box, Link, TableCell, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { FiscalDocument } from '@/core/fiscal/domain/entities/FiscalDocument';
import { type Dec, dec, isZero } from '@/core/stock/domain/rules/decimal';
import { formatDate, formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { captionOf, letterOf, taxesOf } from './fiscalRegisterRows';

interface FiscalDocumentRowProps {
	document: FiscalDocument;
	index: number;
	onOpen: () => void;
	onOpenOperation: (id: number) => void;
}

/**
 * One paper of the register (lienzo: FiscalDocumentsList): the letter in its box, number and kind,
 * provider, amounts (a credit note subtracts, in red), its stock operation, and the status mark.
 */
export default function FiscalDocumentRow({ document: d, index, onOpen, onOpenOperation }: FiscalDocumentRowProps) {
	const { indexSx, textCellSx, zebraBg } = useGridCellStyles();
	const difference = dec(d.totalDifference);
	const credit = d.type.sign < 0;
	const letter = letterOf(d);
	const taxes = taxesOf(d);
	const money = (value: string | Dec | null) => (value === null ? '—' : `${credit ? '−' : ''}${formatMoney(value)}`);
	const amountSx = { ...textCellSx, color: credit ? 'error.dark' : undefined };

	return (
		<TableRow hover onClick={onOpen} sx={{ cursor: 'pointer', bgcolor: index % 2 === 1 ? zebraBg : undefined }}>
			<TableCell sx={indexSx}>{index + 1}</TableCell>
			<TableCell sx={textCellSx}>{formatDate(d.issuedAt)}</TableCell>
			<TableCell sx={{ ...textCellSx, py: 0.5 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box aria-hidden sx={{ width: 22, height: 22, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: letter ? '1.5px solid' : 0, borderColor: 'text.primary', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 800 }}>
						{letter}
					</Box>
					<Box sx={{ minWidth: 0 }}>
						<Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', fontSize: '0.82rem', lineHeight: 1.3, textDecoration: d.status === 'VOIDED' ? 'line-through' : undefined }}>
							{d.formattedNumber}
						</Typography>
						<Typography sx={{ fontSize: '0.66rem', color: 'text.secondary', lineHeight: 1.3 }}>{captionOf(d)}</Typography>
					</Box>
				</Box>
			</TableCell>
			<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{d.provider.name}</TableCell>
			<TableCell sx={textCellSx} align="right">{d.linesCount}</TableCell>
			<TableCell sx={amountSx} align="right">{money(d.linesAmount)}</TableCell>
			<TableCell sx={{ ...amountSx, color: taxes === null ? 'text.disabled' : amountSx.color }} align="right">
				{money(taxes)}
			</TableCell>
			<TableCell sx={{ ...amountSx, fontWeight: 700 }} align="right">{money(d.totalAmount)}</TableCell>
			<TableCell sx={textCellSx} onClick={(e) => e.stopPropagation()}>
				{d.stockOperation ? (
					<Link component="button" onClick={() => onOpenOperation(d.stockOperation!.id)} sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
						N.º {d.stockOperation.number}
					</Link>
				) : (
					<Box component="span" sx={{ color: 'text.disabled' }}>—</Box>
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
}
