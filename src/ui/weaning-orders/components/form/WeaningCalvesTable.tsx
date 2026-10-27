import React, { useMemo } from 'react';
import { IconButton, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CategoryChangeCell from '@/components/caravan/CategoryChangeCell';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import type { WeaningOrderFormState } from '../../hooks/useWeaningOrderForm';

interface WeaningCalvesTableProps {
  form: WeaningOrderFormState;
  recordsById: Map<number, BirthHistoryRecord>;
  /** Label of each declared destination, by its key. */
  destinationLabels: Map<string, string>;
  /** What the server said about each calf, by caravan. */
  errorsByTag: Record<string, string[]>;
}

/**
 * The calves of the order, one row each and sorted by ear tag: its mother and rodeo, and only what
 * is said calf by calf — its weaning batch when there is one per calf (chosen in the start dialog,
 * shown here), its new C/S when the category is declared, and, when registering, what the chute measured.
 */
export const WeaningCalvesTable: React.FC<WeaningCalvesTableProps> = ({
  form,
  recordsById,
  destinationLabels,
  errorsByTag
}) => {
  const { cellSx, inputSx, headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
  // A column of batches only when the order declares batches to choose from.
  const perAnimal = form.destinationMode === 'per_animal' && form.activeDestinations.length > 0;
  const declared = form.categoryMode === 'DECLARED';
  const register = form.mode === 'register';

  const tagOf = (id: number) => {
    const record = recordsById.get(id);

    return record?.calf_identification ?? record?.calf_label ?? `#${id}`;
  };
  // The order the calves were ticked in means nothing on paper: they are read by ear tag.
  const rows = useMemo(
    () => [...form.calfIds].sort((a, b) => tagOf(a).localeCompare(tagOf(b), 'es', { numeric: true })),
    [form.calfIds, recordsById]
  );

  const minWidth = 520 + (perAnimal ? 200 : 0) + (declared ? 200 : 0) + (register ? 330 : 0);

  return (
    <SheetGrid minWidth={minWidth} maxHeight={560}>
      <TableHead>
        <TableRow>
          <TableCell sx={indexSx}>#</TableCell>
          <TableCell sx={{ ...headSx, width: 170 }}>Cría</TableCell>
          <TableCell sx={{ ...headSx, width: 140 }}>Madre</TableCell>
          <TableCell sx={headSx}>Rodeo</TableCell>
          {perAnimal && <TableCell sx={{ ...headSx, width: 200 }}>Lote de destete</TableCell>}
          {declared && <TableCell sx={{ ...headSx, width: 200 }}>C/S nueva</TableCell>}
          {register && <TableCell sx={{ ...headSx, width: 110 }}>Peso (kg)</TableCell>}
          {register && <TableCell sx={{ ...headSx, width: 220 }}>Observaciones</TableCell>}
          <TableCell sx={{ ...headSx, borderRight: 0, width: 48 }} />
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((id, index) => {
          const record = recordsById.get(id);
          const calf = form.calves[id];
          const tag = tagOf(id);
          const errors = errorsByTag[tag.toUpperCase()] ?? [];
          const sex = record?.calf_sex === 'M' || record?.calf_sex === 'H' ? record.calf_sex : null;
          const weight = calf?.weight.trim() ?? '';
          const rowBg = index % 2 === 1 ? zebraBg : undefined;

          return (
            <TableRow key={id} sx={{ bgcolor: rowBg }}>
              <TableCell sx={{ ...indexSx, bgcolor: 'transparent' }}>{index + 1}</TableCell>
              <SheetGridTagCell
                tag={tag}
                caption={`${sex === 'M' ? 'Macho' : sex === 'H' ? 'Hembra' : 'Sexo s/d'} · nació ${record?.birth_date ?? '—'}`}
                error={errors.length > 0}
              />
              <TableCell sx={{ ...textCellSx, fontFamily: 'monospace' }}>{record?.mother_identification ?? '—'}</TableCell>
              <TableCell sx={textCellSx}>{record?.calf_batch_name ?? 'Sin lote'}</TableCell>
              {perAnimal && (
                <TableCell sx={{ ...textCellSx, color: calf?.destinationKey ? 'text.primary' : 'text.secondary' }}>
                  {calf?.destinationKey
                    ? destinationLabels.get(calf.destinationKey) || 'Lote sin nombre'
                    : register
                      ? 'Sin lote'
                      : 'Se decide en la manga'}
                </TableCell>
              )}
              {declared && (
                <TableCell sx={{ ...cellSx, px: 1 }}>
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
                <TableCell sx={{ ...cellSx, ...inputSx }}>
                  <TextField
                    size="small"
                    fullWidth
                    value={calf?.weight ?? ''}
                    onChange={(e) => form.updateCalf(id, { weight: e.target.value })}
                    placeholder="Opcional"
                    error={weight !== '' && !(Number(weight.replace(',', '.')) > 0)}
                    inputProps={{ inputMode: 'decimal', 'aria-label': `Peso de ${tag}` }}
                  />
                </TableCell>
              )}
              {register && (
                <TableCell sx={{ ...cellSx, ...inputSx }}>
                  <TextField size="small" fullWidth value={calf?.observations ?? ''} onChange={(e) => form.updateCalf(id, { observations: e.target.value })} />
                </TableCell>
              )}
              <SheetGridStatusCell error={errors.length > 0 ? errors.join(' ') : undefined}>
                <Tooltip title="Quitar de la orden">
                  <IconButton size="small" onClick={() => form.removeCalf(id)}>
                    <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                  </IconButton>
                </Tooltip>
              </SheetGridStatusCell>
            </TableRow>
          );
        })}
      </TableBody>
    </SheetGrid>
  );
};

export default WeaningCalvesTable;
