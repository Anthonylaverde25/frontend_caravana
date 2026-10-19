import { useState } from 'react';
import { Box } from '@mui/material';
import { type Dec } from '@/core/stock/domain/rules/decimal';
import { SummaryRow } from '@/core/fiscal/domain/rules/fiscalPreview';
import { EntryMode, FiscalHeaderState } from './fiscalEntryState';
import FiscalTotalsBox from './FiscalTotalsBox';
import InternalNotesDialog from './InternalNotesDialog';

interface FiscalSheetFooterProps {
	header: FiscalHeaderState;
	onChange: (patch: Partial<FiscalHeaderState>) => void;
	errors: Record<string, string>;
	mode: EntryMode;
	isCreditNote: boolean;
	unpriced: boolean;
	summary: { net: Dec; rows: SummaryRow[]; total: Dec };
}

/**
 * The spreadsheet footer: right-docked financial summary with integrated internal notes.
 */
export default function FiscalSheetFooter(props: FiscalSheetFooterProps) {
	const { header, onChange, errors, mode, unpriced, summary } = props;
	const [notesOpen, setNotesOpen] = useState(false);

	return (
		<Box
			component="footer"
			sx={{
				p: { xs: 1.5, sm: 2 },
				px: { xs: 2, sm: 2.5 },
				borderTop: 1,
				borderColor: 'divider',
				bgcolor: 'background.paper',
				display: 'flex',
				justifyContent: 'flex-end',
				alignItems: 'center',
				zIndex: 2
			}}
		>
			{!unpriced && (
				<Box sx={{ width: { xs: '100%', sm: 380, md: 420 } }}>
					<FiscalTotalsBox
						net={summary.net}
						rows={summary.rows}
						total={summary.total}
						declaredTotal={header.declaredTotal}
						onDeclaredTotal={(declaredTotal) => onChange({ declaredTotal })}
						error={errors.declared_total}
						controlsTotal={mode !== 'delivery-note'}
						notes={header.notes}
						onOpenNotes={() => setNotesOpen(true)}
						onClearNotes={() => onChange({ notes: '' })}
					/>
				</Box>
			)}

			<InternalNotesDialog
				open={notesOpen}
				initialNote={header.notes}
				onClose={() => setNotesOpen(false)}
				onSave={(notes) => onChange({ notes })}
			/>
		</Box>
	);
}
