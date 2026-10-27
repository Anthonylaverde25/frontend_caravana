import { Checkbox, MenuItem, TableCell, TableRow, TextField } from '@mui/material';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { PendingPaternity, SireIdentificationMethod } from '@/features/paternity/hooks/usePendingPaternities';
import { formatDate } from '@/ui/herd/utils/herdFormat';
import PaternitySireCell, { type MaleOption } from './PaternitySireCell';
import { METHOD_LABELS, type PaternityValue, calfTag } from './paternityModel';

interface PaternityRowProps {
  calf: PendingPaternity;
  value: PaternityValue;
  males: MaleOption[];
  selected: boolean;
  problem?: string;
  onToggleSelected: () => void;
  onChange: (patch: Partial<PaternityValue>) => void;
}

/** What the row tells besides an error: a sire outside the service or out of the dates. */
function rowNotice(calf: PendingPaternity, fatherId: number | null): { warning?: string; info?: string } {
  if (fatherId !== null) {
    const candidate = calf.candidates.find((c) => c.id === fatherId);
    if (!candidate) return { warning: 'No estuvo en el servicio de la madre: se confirma igual y queda advertido.' };
    if (candidate.compatible_by_date === false) return { warning: 'Su estadía no coincide con la concepción estimada.' };
  }
  if (calf.candidates.length === 0) return { info: 'Sin toros registrados en el servicio de la madre.' };
  return {};
}

/** One pending calf: its sire, how it was identified and a note. */
export default function PaternityRow({ calf, value, males, selected, problem, onToggleSelected, onChange }: PaternityRowProps) {
  const { cellSx, inputSx, indexSx, textCellSx, zebraBg, selectedBg, errorRing } = useGridCellStyles();
  const notice = rowNotice(calf, value.father_id);
  const sexLabel = calf.calf_sex === 'M' ? 'Macho' : calf.calf_sex === 'H' ? 'Hembra' : '';

  return (
    <TableRow sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg }, ...(selected && { bgcolor: `${selectedBg} !important` }) }}>
      <TableCell align="center" sx={{ ...indexSx, width: 44 }}>
        <Checkbox size="small" checked={selected} onChange={onToggleSelected} />
      </TableCell>
      <SheetGridTagCell tag={calfTag(calf)} caption={`Madre ${calf.mother_identification ?? '—'}${sexLabel ? ` · ${sexLabel}` : ''}`} />
      <TableCell sx={textCellSx}>{formatDate(calf.birth_date)}</TableCell>
      <TableCell sx={{ ...textCellSx, color: 'text.secondary' }}>
        {formatDate(calf.conception_window.from)} – {formatDate(calf.conception_window.to)}
      </TableCell>
      <PaternitySireCell
        candidates={calf.candidates}
        males={males}
        value={value.father_id}
        error={Boolean(problem) && value.father_id === null}
        onChange={(fatherId) => onChange({ father_id: fatherId })}
      />
      <TableCell sx={{ ...cellSx, ...(problem && value.method === null ? errorRing : {}) }}>
        <TextField
          select
          fullWidth
          value={value.method ?? ''}
          onChange={(e) => onChange({ method: (e.target.value || null) as SireIdentificationMethod | null })}
          SelectProps={{ displayEmpty: true }}
          sx={inputSx}
        >
          <MenuItem value="">
            <em>—</em>
          </MenuItem>
          {(Object.keys(METHOD_LABELS) as SireIdentificationMethod[]).map((method) => (
            <MenuItem key={method} value={method}>
              {METHOD_LABELS[method]}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell sx={cellSx}>
        <TextField fullWidth placeholder="Evidencia (opcional)" value={value.notes} onChange={(e) => onChange({ notes: e.target.value })} sx={inputSx} />
      </TableCell>
      <SheetGridStatusCell error={problem} warning={notice.warning} info={notice.info} />
    </TableRow>
  );
}
