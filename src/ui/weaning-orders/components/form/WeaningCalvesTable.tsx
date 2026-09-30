import React from 'react';
import { Checkbox, IconButton, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CategoryChangeCell from '@/components/caravan/CategoryChangeCell';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import type { WeaningOrderFormState } from '../../hooks/useWeaningOrderForm';
import { useWeaningOrderTableStyles } from '../weaningOrderFormat';

interface WeaningCalvesTableProps {
  form: WeaningOrderFormState;
  recordsById: Map<number, BirthHistoryRecord>;
  /** Label of each declared destination, by its key. */
  destinationLabels: Map<string, string>;
  /** What the server said about each calf, by caravan. */
  errorsByTag: Record<string, string[]>;
  /** Ticked calves, for giving a batch to several at once (one batch per calf only). */
  selected?: number[];
  onSelectedChange?: (ids: number[]) => void;
}

/**
 * The calves of the order, one row each: its mother and rodeo, and only what is said calf by calf —
 * its weaning batch when there is one per calf, its new C/S when the category is declared, and,
 * when registering, what the chute measured.
 */
export const WeaningCalvesTable: React.FC<WeaningCalvesTableProps> = ({
  form,
  recordsById,
  destinationLabels,
  errorsByTag,
  selected = [],
  onSelectedChange
}) => {
  const { headerCell, bodyCell, headBg } = useWeaningOrderTableStyles();
  // A column of batches only when the order declares batches to choose from.
  const perAnimal = form.destinationMode === 'per_animal' && form.activeDestinations.length > 0;
  const declared = form.categoryMode === 'DECLARED';
  const register = form.mode === 'register';
  const selectable = perAnimal && Boolean(onSelectedChange);
  const ticked = new Set(selected);
  const toggle = (id: number) => onSelectedChange?.(ticked.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <Table size="small" stickyHeader>
      <TableHead sx={{ bgcolor: headBg }}>
        <TableRow>
          {selectable && (
            <TableCell sx={{ ...headerCell, width: 44, px: 1 }}>
              <Checkbox
                size="small"
                checked={form.calfIds.length > 0 && selected.length === form.calfIds.length}
                indeterminate={selected.length > 0 && selected.length < form.calfIds.length}
                onChange={(e) => onSelectedChange?.(e.target.checked ? [...form.calfIds] : [])}
              />
            </TableCell>
          )}
          <TableCell sx={headerCell}>Cría</TableCell>
          <TableCell sx={headerCell}>Madre</TableCell>
          <TableCell sx={headerCell}>Rodeo</TableCell>
          {perAnimal && <TableCell sx={headerCell}>Lote de destete</TableCell>}
          {declared && <TableCell sx={headerCell}>C/S nueva</TableCell>}
          {register && <TableCell sx={headerCell}>Peso (kg)</TableCell>}
          {register && <TableCell sx={headerCell}>Observaciones</TableCell>}
          <TableCell sx={{ ...headerCell, borderRight: 0, width: 48 }} />
        </TableRow>
      </TableHead>
      <TableBody>
        {form.calfIds.map((id) => {
          const record = recordsById.get(id);
          const calf = form.calves[id];
          const tag = record?.calf_identification ?? `#${id}`;
          const errors = errorsByTag[tag.toUpperCase()] ?? [];
          const sex = record?.calf_sex === 'M' || record?.calf_sex === 'H' ? record.calf_sex : null;
          const weight = calf?.weight.trim() ?? '';

          return (
            <TableRow key={id} sx={errors.length > 0 ? { bgcolor: 'rgba(220, 38, 38, 0.05)' } : undefined}>
              {selectable && (
                <TableCell sx={{ ...bodyCell, px: 1 }}>
                  <Checkbox size="small" checked={ticked.has(id)} onChange={() => toggle(id)} />
                </TableCell>
              )}
              <TableCell sx={{ ...bodyCell, fontFamily: 'monospace', fontWeight: 800 }}>
                {tag}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'inherit' }}>
                  {sex === 'M' ? 'Macho' : sex === 'H' ? 'Hembra' : 'Sexo s/d'} · nació {record?.birth_date ?? '—'}
                </Typography>
                {errors.map((message) => (
                  <Typography key={message} variant="caption" color="error" sx={{ display: 'block', fontFamily: 'inherit' }}>
                    {message}
                  </Typography>
                ))}
              </TableCell>
              <TableCell sx={{ ...bodyCell, fontFamily: 'monospace' }}>{record?.mother_identification ?? '—'}</TableCell>
              <TableCell sx={bodyCell}>{record?.calf_batch_name ?? 'Sin lote'}</TableCell>
              {perAnimal && (
                <TableCell sx={{ ...bodyCell, minWidth: 200 }}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    value={calf?.destinationKey ?? ''}
                    onChange={(e) => form.updateCalf(id, { destinationKey: e.target.value || null })}
                    SelectProps={{ displayEmpty: true }}
                    error={register && !calf?.destinationKey}
                  >
                    <MenuItem value="">
                      <Typography variant="body2" color="text.secondary">
                        {register ? 'Elegí el lote' : 'Se decide en la manga'}
                      </Typography>
                    </MenuItem>
                    {form.activeDestinations.map((d) => (
                      <MenuItem key={d.key} value={d.key}>
                        {destinationLabels.get(d.key) || 'Lote sin nombre'}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
              )}
              {declared && (
                <TableCell sx={bodyCell}>
                  <CategoryChangeCell
                    current={
                      record?.calf_category_id != null
                        ? { categoryId: record.calf_category_id, subcategoryId: record.calf_subcategory_id }
                        : null
                    }
                    value={calf?.category ?? null}
                    onChange={(category) => form.updateCalf(id, { category })}
                    sex={sex}
                  />
                </TableCell>
              )}
              {register && (
                <TableCell sx={{ ...bodyCell, width: 110 }}>
                  <TextField
                    size="small"
                    value={calf?.weight ?? ''}
                    onChange={(e) => form.updateCalf(id, { weight: e.target.value })}
                    placeholder="Opcional"
                    error={weight !== '' && !(Number(weight.replace(',', '.')) > 0)}
                    inputProps={{ inputMode: 'decimal', 'aria-label': `Peso de ${tag}` }}
                  />
                </TableCell>
              )}
              {register && (
                <TableCell sx={bodyCell}>
                  <TextField size="small" fullWidth value={calf?.observations ?? ''} onChange={(e) => form.updateCalf(id, { observations: e.target.value })} />
                </TableCell>
              )}
              <TableCell sx={{ ...bodyCell, borderRight: 0 }}>
                <Tooltip title="Quitar de la orden">
                  <IconButton size="small" onClick={() => form.removeCalf(id)}>
                    <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default WeaningCalvesTable;
