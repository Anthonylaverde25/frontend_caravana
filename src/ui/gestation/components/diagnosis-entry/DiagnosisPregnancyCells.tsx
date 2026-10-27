import { MenuItem, TableCell, TextField, Tooltip, Typography } from '@mui/material';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { STAGE_LABELS, stageFromMonths } from '@/ui/gestation/utils/reproductiveVerdict';
import type { DiagnosisEntryValue, GestationStageCode } from './diagnosisEntryModel';

interface DiagnosisPregnancyCellsProps {
  value: DiagnosisEntryValue;
  onChange: (patch: Partial<DiagnosisEntryValue>) => void;
  /** Bulls that were with her: her candidate sires. */
  candidates: { id: number; identification: string }[];
  /** The only bull the order ever had: the sire is confirmed on the pregnant verdict. */
  soleBull: { id: number; identification: string } | null;
  /** Sire already confirmed for her current gestation. */
  confirmedSireId: number | null;
}

/**
 * Estadio · Meses · Toro, open only for a pregnant female. Stage and months are optional and
 * independent: months (a scan) determine the stage, shown as derived. The sire is read-only: known
 * when the order had a single bull all along; with more than one, her candidates wait for the
 * paternity to be confirmed on the calf.
 */
export default function DiagnosisPregnancyCells({ value, onChange, candidates, soleBull, confirmedSireId }: DiagnosisPregnancyCellsProps) {
  const { cellSx, inputSx } = useGridCellStyles();
  const pregnant = value.result === 'PREGNANT';
  const derivedStage = value.gestation_months !== null ? stageFromMonths(value.gestation_months) : null;
  const confirmedId = confirmedSireId ?? soleBull?.id ?? null;
  const confirmed = candidates.find((bull) => bull.id === confirmedId) ?? (confirmedId === soleBull?.id ? soleBull : undefined);
  const sireText = !pregnant
    ? '—'
    : confirmed
      ? confirmed.identification
      : `${candidates.length} candidato(s) · se confirma al nacer`;

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
        <Tooltip title={!pregnant || confirmed ? '' : candidates.map((bull) => bull.identification).join(', ')}>
          <Typography variant="body2" sx={{ px: 1.25, color: confirmed && pregnant ? 'text.primary' : 'text.secondary', fontWeight: confirmed && pregnant ? 600 : 400 }}>
            {sireText}
          </Typography>
        </Tooltip>
      </TableCell>
    </>
  );
}
