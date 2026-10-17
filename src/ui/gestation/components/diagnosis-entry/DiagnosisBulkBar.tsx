import { Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import type { NotDiagnosedReason } from '@/features/gestation/hooks/useServiceOrders';
import { NOT_DIAGNOSED_REASON_LABELS } from '@/ui/gestation/utils/reproductiveVerdict';
import type { EntryResult } from './diagnosisEntryModel';

interface DiagnosisBulkBarProps {
  selectedCount: number;
  allowNotDiagnosed: boolean;
  onApply: (result: EntryResult, reason?: NotDiagnosedReason) => void;
}

/**
 * Same result for every selected female (a whole group that did not come down to the chute, a
 * paddock scanned pregnant...). Each row can still be corrected afterwards.
 */
export default function DiagnosisBulkBar({ selectedCount, allowNotDiagnosed, onApply }: DiagnosisBulkBarProps) {
  const [reason, setReason] = useState<NotDiagnosedReason>('NOT_GATHERED');

  if (selectedCount === 0) return null;

  const buttonSx = { textTransform: 'none', fontWeight: 700 } as const;

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {selectedCount} seleccionada{selectedCount === 1 ? '' : 's'}:
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        <Button size="small" variant="outlined" color="success" sx={buttonSx} onClick={() => onApply('PREGNANT')}>
          Preñadas
        </Button>
        <Button size="small" variant="outlined" color="error" sx={buttonSx} onClick={() => onApply('EMPTY')}>
          Vacías
        </Button>
        {allowNotDiagnosed && (
          <>
            <TextField
              select
              size="small"
              variant="filled"
              hiddenLabel
              value={reason}
              onChange={(e) => setReason(e.target.value as NotDiagnosedReason)}
              sx={{ bgcolor: 'action.hover', minWidth: 170, '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.8 } }}
            >
              {(['NOT_GATHERED', 'NOT_FOUND'] as NotDiagnosedReason[]).map((option) => (
                <MenuItem key={option} value={option}>
                  {NOT_DIAGNOSED_REASON_LABELS[option]}
                </MenuItem>
              ))}
            </TextField>
            <Button size="small" variant="outlined" color="warning" sx={buttonSx} onClick={() => onApply('NOT_DIAGNOSED', reason)}>
              Sin diagnóstico
            </Button>
          </>
        )}
        <Button size="small" variant="text" sx={buttonSx} onClick={() => onApply('UNCHECKED')}>
          Limpiar
        </Button>
      </Stack>
    </Paper>
  );
}
