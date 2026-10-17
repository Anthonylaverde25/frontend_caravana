import { MenuItem, TableCell, TextField } from '@mui/material';
import type { NotDiagnosedReason } from '@/features/gestation/hooks/useServiceOrders';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { NOT_DIAGNOSED_REASON_LABELS } from '@/ui/gestation/utils/reproductiveVerdict';
import type { DiagnosisEntryValue } from './diagnosisEntryModel';
import type { BatchOption } from './DiagnosisEntryRow';

interface DiagnosisExitCellsProps {
  value: DiagnosisEntryValue;
  onChange: (patch: Partial<DiagnosisEntryValue>) => void;
  emptyDestinations: BatchOption[];
  inServiceBatch: boolean;
}

/**
 * Salida / motivo · Nota. An empty female in the service batch may leave it at the chute; a
 * female without diagnosis states why (declared, never inferred: "Otro" needs the note).
 */
export default function DiagnosisExitCells({ value, onChange, emptyDestinations, inServiceBatch }: DiagnosisExitCellsProps) {
  const { cellSx, inputSx } = useGridCellStyles();
  const empty = value.result === 'EMPTY';
  const notDiagnosed = value.result === 'NOT_DIAGNOSED';

  return (
    <>
      <TableCell sx={cellSx}>
        {notDiagnosed ? (
          <TextField
            select
            fullWidth
            SelectProps={{ displayEmpty: true }}
            value={value.not_diagnosed_reason ?? ''}
            onChange={(e) => onChange({ not_diagnosed_reason: (e.target.value || null) as NotDiagnosedReason | null })}
            sx={inputSx}
          >
            <MenuItem value="">
              <em>Motivo…</em>
            </MenuItem>
            {(Object.keys(NOT_DIAGNOSED_REASON_LABELS) as NotDiagnosedReason[]).map((reason) => (
              <MenuItem key={reason} value={reason}>
                {NOT_DIAGNOSED_REASON_LABELS[reason]}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            select
            fullWidth
            SelectProps={{ displayEmpty: true }}
            disabled={!empty || !inServiceBatch}
            value={empty ? (value.empty_destination_batch_id ?? '') : ''}
            onChange={(e) => onChange({ empty_destination_batch_id: e.target.value === '' ? null : Number(e.target.value) })}
            sx={inputSx}
          >
            <MenuItem value="">
              <em>{empty ? (inServiceBatch ? 'Queda en el lote' : 'Ya fuera del lote') : '—'}</em>
            </MenuItem>
            {emptyDestinations.map((batch) => (
              <MenuItem key={batch.id} value={batch.id}>
                Sale a: {batch.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      </TableCell>

      <TableCell sx={cellSx}>
        <TextField
          fullWidth
          disabled={!notDiagnosed}
          placeholder={notDiagnosed ? (value.not_diagnosed_reason === 'OTHER' ? 'Obligatoria' : 'Opcional') : ''}
          value={notDiagnosed ? value.not_diagnosed_notes : ''}
          onChange={(e) => onChange({ not_diagnosed_notes: e.target.value })}
          sx={inputSx}
        />
      </TableCell>
    </>
  );
}
