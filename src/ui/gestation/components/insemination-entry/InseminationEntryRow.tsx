import { Checkbox, MenuItem, TableCell, TableRow, TextField } from '@mui/material';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';
import { formatDay } from '../../utils/reproductiveVerdict';
import InseminationLotCell from './InseminationLotCell';
import InseminationRowStatus from './InseminationRowStatus';
import type { InseminationDraft, InseminationFemale } from './inseminationEntryModel';

interface InseminationEntryRowProps {
  female: InseminationFemale;
  draft: InseminationDraft | undefined;
  editable: boolean;
  selected: boolean;
  errors: Record<string, string>;
  options: SemenOption[];
  byId: Map<number, SemenOption>;
  tanks: { id: number; code: string; name: string }[];
  zebra: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<InseminationDraft>) => void;
  onAddAnother: () => void;
  onVoid: (inseminationId: number) => void;
}

/**
 * One female on the insemination sheet. Not inseminated yet: every cell editable, prefilled. Already
 * inseminated: her last insemination in grey, with "Agregar otra" and "Anular" in the status cell (DB10).
 */
export default function InseminationEntryRow(props: InseminationEntryRowProps) {
  const { female, draft, editable, selected, errors, options, byId, tanks, zebra } = props;
  const { cellSx, inputSx, indexSx, textCellSx, errorRing, zebraBg, selectedBg } = useGridCellStyles();
  const last = female.live[female.live.length - 1];
  const planned = female.plannedItemId ? byId.get(female.plannedItemId)?.label ?? '—' : 'En la manga';
  const ring = (field: string) => (errors[field] ? errorRing : {});
  const firstError = Object.values(errors)[0];
  const readOnly = !editable;

  const caption = female.live.length > 0 ? `${female.live.length} inseminación(es) · última ${formatDay(last.inseminated_on)}` : 'Sin inseminar';

  return (
    <TableRow sx={{ bgcolor: selected ? selectedBg : zebra ? zebraBg : 'inherit' }}>
      <TableCell sx={indexSx}>
        <Checkbox size="small" checked={selected} disabled={readOnly} onChange={props.onToggle} />
      </TableCell>
      <SheetGridTagCell tag={female.identification} caption={caption} error={Boolean(errors.female_caravan_id)} />
      <TableCell sx={{ ...textCellSx, color: 'text.secondary', minWidth: 180, whiteSpace: 'nowrap' }}>{planned}</TableCell>
      {readOnly ? (
        <>
          <TableCell sx={{ ...textCellSx, color: 'text.disabled', minWidth: 200 }}>{byId.get(last.item_id)?.label ?? last.sire_name ?? last.item_name}</TableCell>
          <TableCell sx={{ ...textCellSx, color: 'text.disabled' }}>{last.lot_code ?? 'Sin identificar'}</TableCell>
          <TableCell sx={{ ...textCellSx, color: 'text.disabled' }}>{last.straws_used}</TableCell>
          <TableCell sx={{ ...textCellSx, color: 'text.disabled' }}>{formatDay(last.inseminated_on)}</TableCell>
          <TableCell sx={{ ...textCellSx, color: 'text.disabled' }}>{last.warehouse_code ?? '—'}</TableCell>
          <TableCell sx={{ ...textCellSx, color: 'text.disabled' }}>{last.notes ?? ''}</TableCell>
        </>
      ) : (
        <>
          <TableCell sx={{ ...cellSx, minWidth: 200, ...ring('item_id') }}>
            <TextField select fullWidth size="small" value={draft?.itemId ?? ''} error={Boolean(errors.item_id)} onChange={(e) => props.onChange({ itemId: Number(e.target.value) })} SelectProps={{ displayEmpty: true }} sx={inputSx}>
              <MenuItem value="" disabled sx={{ fontSize: '0.8rem' }}>Elegí el semen</MenuItem>
              {options.map((o) => (
                <MenuItem key={o.itemId} value={o.itemId} sx={{ fontSize: '0.8rem' }}>{o.label}</MenuItem>
              ))}
            </TextField>
          </TableCell>
          <InseminationLotCell
            value={draft?.lot ?? null}
            option={draft?.itemId ? byId.get(draft.itemId) : undefined}
            warehouseId={draft?.warehouseId ?? null}
            disabled={false}
            error={errors.semen_lot_id}
            onChange={(lot) => props.onChange({ lot })}
          />
          <TableCell sx={{ ...cellSx, width: 90, ...ring('straws_used') }}>
            <TextField type="number" fullWidth size="small" value={draft?.straws ?? 1} error={Boolean(errors.straws_used)} onChange={(e) => props.onChange({ straws: Math.max(1, Number(e.target.value) || 1) })} inputProps={{ min: 1 }} sx={inputSx} />
          </TableCell>
          <TableCell sx={{ ...cellSx, width: 150, ...ring('inseminated_on') }}>
            <TextField type="date" fullWidth size="small" value={draft?.date ?? ''} error={Boolean(errors.inseminated_on)} onChange={(e) => props.onChange({ date: e.target.value })} sx={inputSx} />
          </TableCell>
          <TableCell sx={{ ...cellSx, minWidth: 130, ...ring('warehouse_id') }}>
            <TextField select fullWidth size="small" value={draft?.warehouseId ?? ''} error={Boolean(errors.warehouse_id)} onChange={(e) => props.onChange({ warehouseId: Number(e.target.value) })} sx={inputSx}>
              {tanks.map((t) => (
                <MenuItem key={t.id} value={t.id} sx={{ fontSize: '0.8rem' }}>{t.code} · {t.name}</MenuItem>
              ))}
            </TextField>
          </TableCell>
          <TableCell sx={{ ...cellSx, minWidth: 150 }}>
            <TextField fullWidth size="small" value={draft?.notes ?? ''} onChange={(e) => props.onChange({ notes: e.target.value })} sx={inputSx} />
          </TableCell>
        </>
      )}
      <InseminationRowStatus
        error={firstError}
        unidentified={editable && draft?.lot === 'NONE'}
        live={female.live}
        canAddAnother={readOnly}
        onAddAnother={props.onAddAnother}
        onVoid={props.onVoid}
      />
    </TableRow>
  );
}
