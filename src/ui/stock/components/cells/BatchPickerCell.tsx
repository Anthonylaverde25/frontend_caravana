import { useState } from 'react';
import { Button, TableCell } from '@mui/material';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import OwnBatchPickerDialog from '@/ui/batches/components/external/OwnBatchPickerDialog';
import type { Batch } from '@/core/batches/domain/entities/Batch';

interface BatchPickerCellProps {
	batches: Batch[];
	value: number | null;
	label: string | null;
	onPick: (batch: Batch | null) => void;
	disabled?: boolean;
	error?: string;
	/** What is being charged, for the picker's subtitle. */
	subtitle: string;
}

/** The batch a service or a non-stock article went to, chosen in the batch picker (never typed). */
export default function BatchPickerCell({ batches, value, label, onPick, disabled, error, subtitle }: BatchPickerCellProps) {
	const { cellSx, errorRing } = useGridCellStyles();
	const [open, setOpen] = useState(false);

	return (
		<TableCell sx={{ ...cellSx, width: 170, bgcolor: disabled ? 'action.hover' : undefined, ...(error ? errorRing : {}) }}>
			<Button
				fullWidth
				disabled={disabled}
				onClick={() => setOpen(true)}
				sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: '0.82rem', height: 40, px: 1.25, color: value ? 'text.primary' : 'text.secondary', fontWeight: value ? 600 : 400 }}
			>
				{disabled ? '' : (label ?? 'Elegir lote…')}
			</Button>
			<OwnBatchPickerDialog
				open={open}
				batches={batches}
				selectedId={value ?? ''}
				subtitle={subtitle}
				onClose={() => setOpen(false)}
				onPick={(batch) => {
					onPick(batch);
					setOpen(false);
				}}
			/>
		</TableCell>
	);
}
