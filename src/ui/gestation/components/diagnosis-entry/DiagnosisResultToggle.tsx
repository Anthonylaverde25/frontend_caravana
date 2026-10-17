import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { EntryResult } from './diagnosisEntryModel';

interface DiagnosisResultToggleProps {
  value: EntryResult;
  onChange: (result: EntryResult) => void;
  /** "Sin diagnóstico" is offered only once the bulls are gone or while closing the order. */
  allowNotDiagnosed: boolean;
}

const OPTIONS: { value: EntryResult; label: string; color: 'standard' | 'success' | 'error' | 'warning' }[] = [
  { value: 'UNCHECKED', label: 'Sin tactar', color: 'standard' },
  { value: 'PREGNANT', label: 'Preñada', color: 'success' },
  { value: 'EMPTY', label: 'Vacía', color: 'error' },
  { value: 'NOT_DIAGNOSED', label: 'Sin diagnóstico', color: 'warning' },
];

/**
 * Result of the female in this round. "Sin tactar" is the default: a female nobody stated is
 * never sent, so she can never be saved as empty by omission.
 */
export default function DiagnosisResultToggle({ value, onChange, allowNotDiagnosed }: DiagnosisResultToggleProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, next: EntryResult | null) => next && onChange(next)}
      sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', px: 1.2, py: 0.4 } }}
    >
      {OPTIONS.filter((option) => allowNotDiagnosed || option.value !== 'NOT_DIAGNOSED').map((option) => (
        <ToggleButton key={option.value} value={option.value} color={option.color}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
