import { MenuItem, TableCell, TextField } from '@mui/material';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { STAGE_LABELS, stageFromMonths } from '@/ui/gestation/utils/reproductiveVerdict';
import type { DiagnosisEntryValue, GestationStageCode } from './diagnosisEntryModel';

interface DiagnosisPregnancyCellsProps {
  value: DiagnosisEntryValue;
  onChange: (patch: Partial<DiagnosisEntryValue>) => void;
  bulls: { id: number; identification: string }[];
}

/**
 * Estadio · Meses · Toro, open only for a pregnant female. Stage and months are optional and
 * independent: months (a scan) determine the stage, shown as derived. With one bull the sire is
 * known and shown read-only.
 */
export default function DiagnosisPregnancyCells({ value, onChange, bulls }: DiagnosisPregnancyCellsProps) {
  const { cellSx, inputSx } = useGridCellStyles();
  const pregnant = value.result === 'PREGNANT';
  const derivedStage = value.gestation_months !== null ? stageFromMonths(value.gestation_months) : null;

  return (
    <>
      <TableCell sx={cellSx}>
        <TextField
          select
          fullWidth
          SelectProps={{ displayEmpty: true }}
          disabled={!pregnant || derivedStage !== null}
          value={pregnant ? (derivedStage ?? value.gestation_stage ?? '') : ''}
          onChange={(e) => onChange({ gestation_stage: (e.target.value || null) as GestationStageCode | null })}
          sx={inputSx}
        >
          <MenuItem value="">
            <em>{pregnant ? 'Sin estadio' : '—'}</em>
          </MenuItem>
          {(Object.keys(STAGE_LABELS) as GestationStageCode[]).map((stage) => (
            <MenuItem key={stage} value={stage}>
              {STAGE_LABELS[stage]}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>

      <TableCell sx={cellSx}>
        <TextField
          fullWidth
          type="number"
          placeholder={pregnant ? '0.0' : ''}
          disabled={!pregnant}
          value={pregnant ? (value.gestation_months ?? '') : ''}
          inputProps={{ step: 0.5, min: 0.5, max: 9.5 }}
          onChange={(e) => onChange({ gestation_months: e.target.value === '' ? null : Number(e.target.value) })}
          sx={{ ...inputSx, '& input': { padding: '8px 10px', textAlign: 'right' } }}
        />
      </TableCell>

      <TableCell sx={cellSx}>
        <TextField
          select
          fullWidth
          SelectProps={{ displayEmpty: true }}
          disabled={!pregnant || bulls.length < 2}
          value={pregnant ? (value.confirmed_sire_id ?? '') : ''}
          onChange={(e) => onChange({ confirmed_sire_id: e.target.value === '' ? null : Number(e.target.value) })}
          sx={inputSx}
        >
          <MenuItem value="">
            <em>{pregnant ? 'Sin confirmar' : '—'}</em>
          </MenuItem>
          {bulls.map((bull) => (
            <MenuItem key={bull.id} value={bull.id}>
              {bull.identification}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
    </>
  );
}
