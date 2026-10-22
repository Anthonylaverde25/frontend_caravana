import { useState } from 'react';
import { Button, TableCell } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { Tax } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { LinePreview } from '@/core/fiscal/domain/rules/fiscalPreview';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { FiscalLineState, OtherTax } from './fiscalEntryState';
import LineTaxesDialog from './LineTaxesDialog';

interface LineOtherTaxesCellProps {
	line: FiscalLineState;
	itemName: string;
	/** Line taxes other than VAT: fuel tax, internal taxes. */
	taxes: Tax[];
	discriminates: boolean;
	amount: LinePreview['otherTaxes'];
	error?: string;
	onChange: (otherTaxes: OtherTax[]) => void;
}

/** "Otros imp." of a row: its total, and the dialog that edits them (letter A only). */
export default function LineOtherTaxesCell({
	line,
	itemName,
	taxes,
	discriminates,
	amount,
	error,
	onChange
}: LineOtherTaxesCellProps) {
	const { cellSx, errorRing } = useGridCellStyles();
	const [open, setOpen] = useState(false);
	const editable = discriminates && !!line.itemId;

	return (
		<TableCell
			sx={{
				...cellSx,
				width: 110,
				bgcolor: discriminates ? undefined : 'action.hover',
				...(error ? errorRing : {})
			}}
		>
			<Button
				fullWidth
				disabled={!editable}
				onClick={() => setOpen(true)}
				endIcon={editable ? <FuseSvgIcon size={14}>heroicons-outline:pencil-square</FuseSvgIcon> : undefined}
				sx={{
					height: 40,
					justifyContent: 'flex-end',
					textTransform: 'none',
					fontSize: '0.82rem',
					color: 'text.secondary'
				}}
			>
				{discriminates && line.otherTaxes.length > 0 ? formatMoney(amount) : ''}
			</Button>
			<LineTaxesDialog
				open={open}
				itemName={itemName}
				taxes={taxes}
				value={line.otherTaxes}
				onClose={() => setOpen(false)}
				onSave={(otherTaxes) => {
					onChange(otherTaxes);
					setOpen(false);
				}}
			/>
		</TableCell>
	);
}
