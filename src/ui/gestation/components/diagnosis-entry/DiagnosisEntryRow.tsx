import { Box, Checkbox, TableCell, TableRow, Typography } from '@mui/material';
import type { DiagnosisFemale } from '@/features/gestation/hooks/useServiceOrders';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { verdictChip } from '@/ui/gestation/utils/reproductiveVerdict';
import DiagnosisResultToggle from './DiagnosisResultToggle';
import DiagnosisPregnancyCells from './DiagnosisPregnancyCells';
import DiagnosisExitCells from './DiagnosisExitCells';
import { previousVerdictNotices } from './previousVerdictNotices';
import type { DiagnosisEntryValue, EntryResult } from './diagnosisEntryModel';

export interface BatchOption {
  id: number;
  name: string;
}

interface DiagnosisEntryRowProps {
  female: DiagnosisFemale;
  value: DiagnosisEntryValue;
  selected: boolean;
  problem?: string;
  bulls: { id: number; identification: string }[];
  emptyDestinations: BatchOption[];
  serviceBatchId: number;
  allowNotDiagnosed: boolean;
  roundDate: string;
  suggestedDate: string | null;
  onToggleSelected: () => void;
  onResult: (result: EntryResult) => void;
  onChange: (patch: Partial<DiagnosisEntryValue>) => void;
}

/**
 * One female of the tacto sheet, in the spreadsheet look of the bulk birth entry: every value in
 * its own bordered cell, the cells that do not apply to the result disabled, and a problem drawn
 * as an inset ring on the result with its message under it; the notices of the previous verdict
 * are told by the last cell.
 */
export default function DiagnosisEntryRow({
  female,
  value,
  selected,
  problem,
  bulls,
  emptyDestinations,
  serviceBatchId,
  allowNotDiagnosed,
  roundDate,
  suggestedDate,
  onToggleSelected,
  onResult,
  onChange,
}: DiagnosisEntryRowProps) {
  const { cellSx, indexSx, zebraBg, selectedBg, errorRing } = useGridCellStyles();
  const current = verdictChip(female);
  const notices = previousVerdictNotices(female, value.result, roundDate, suggestedDate);
  const inServiceBatch = female.current_batch_id === serviceBatchId;

  return (
    <TableRow
      sx={{
        '&:nth-of-type(even)': { bgcolor: zebraBg },
        ...(selected && { bgcolor: `${selectedBg} !important` }),
      }}
    >
      <TableCell align="center" sx={{ ...indexSx, width: 44 }}>
        <Checkbox size="small" checked={selected} onChange={onToggleSelected} />
      </TableCell>

      <SheetGridTagCell
        tag={female.identification}
        caption={
          <Box component="span" sx={{ fontWeight: 600, color: current.color === 'default' ? 'text.secondary' : `${current.color}.main` }}>
            {current.label}
          </Box>
        }
      />

      <TableCell sx={{ ...cellSx, px: 1, ...(problem ? errorRing : {}) }}>
        <DiagnosisResultToggle value={value.result} onChange={onResult} allowNotDiagnosed={allowNotDiagnosed} />
        {problem && (
          <Typography variant="caption" sx={{ display: 'block', color: 'error.main', fontWeight: 700, mt: 0.25 }}>
            {problem}
          </Typography>
        )}
      </TableCell>

      <DiagnosisPregnancyCells value={value} onChange={onChange} bulls={bulls} />
      <DiagnosisExitCells value={value} onChange={onChange} emptyDestinations={emptyDestinations} inServiceBatch={inServiceBatch} />

      <SheetGridStatusCell error={problem} warning={notices.warning} info={notices.info} />
    </TableRow>
  );
}
