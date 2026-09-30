import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import CategoryChangeCell, { CategoryPairValue } from '@/components/caravan/CategoryChangeCell';
import type { WeaningOrderAnimal } from '@/features/weaning-orders/types';
import { useWeaningOrderTableStyles } from '../weaningOrderFormat';

export interface ExecuteRowDraft {
  weight?: string;
  observations?: string;
  category?: CategoryPairValue | null;
}

interface ExecuteWeaningRollTableProps {
  animals: WeaningOrderAnimal[];
  labelByKey: Map<string, string>;
  drafts: Record<number, ExecuteRowDraft>;
  onChange: (caravanId: number, patch: ExecuteRowDraft) => void;
  /** The order left the category for the chute: somebody decides it here, per calf. */
  askCategory: boolean;
  /** What the server said about each calf, by caravan. */
  errorsByTag: Record<string, string[]>;
}

/** The pending calves of the order, with what the desk declares for each: weight, notes and C/S. */
export const ExecuteWeaningRollTable: React.FC<ExecuteWeaningRollTableProps> = ({
  animals,
  labelByKey,
  drafts,
  onChange,
  askCategory,
  errorsByTag
}) => {
  const { headerCell, bodyCell, headBg } = useWeaningOrderTableStyles();

  return (
    <Table size="small" stickyHeader>
      <TableHead sx={{ bgcolor: headBg }}>
        <TableRow>
          <TableCell sx={headerCell}>Cría</TableCell>
          <TableCell sx={headerCell}>Lote de destete</TableCell>
          {askCategory && <TableCell sx={headerCell}>C/S nueva</TableCell>}
          <TableCell sx={headerCell}>Peso (kg)</TableCell>
          <TableCell sx={{ ...headerCell, borderRight: 0 }}>Observaciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {animals.map((animal) => {
          const draft = drafts[animal.caravan_id] ?? {};
          const errors = errorsByTag[(animal.identification ?? '').toUpperCase()] ?? [];
          const weight = draft.weight?.trim() ?? '';
          const invalidWeight = weight !== '' && !(Number(weight.replace(',', '.')) > 0);

          return (
            <TableRow key={animal.id} sx={errors.length > 0 ? { bgcolor: 'rgba(220, 38, 38, 0.05)' } : undefined}>
              <TableCell sx={{ ...bodyCell, fontFamily: 'monospace', fontWeight: 700 }}>
                {animal.identification}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'inherit' }}>
                  {animal.sex ?? '—'} · {animal.source_batch_name ?? 'Sin lote'}
                </Typography>
                {errors.map((message) => (
                  <Typography key={message} variant="caption" color="error" sx={{ display: 'block', fontFamily: 'inherit' }}>
                    {message}
                  </Typography>
                ))}
              </TableCell>
              <TableCell sx={bodyCell}>{animal.destination_key ? labelByKey.get(animal.destination_key) : 'En la manga'}</TableCell>
              {askCategory && (
                <TableCell sx={bodyCell}>
                  <CategoryChangeCell
                    current={animal.category_id != null ? { categoryId: animal.category_id, subcategoryId: animal.subcategory_id } : null}
                    value={draft.category ?? null}
                    onChange={(category) => onChange(animal.caravan_id, { category })}
                    sex={animal.sex === 'M' || animal.sex === 'H' ? animal.sex : null}
                  />
                </TableCell>
              )}
              <TableCell sx={{ ...bodyCell, width: 120 }}>
                <TextField
                  size="small"
                  value={draft.weight ?? ''}
                  onChange={(e) => onChange(animal.caravan_id, { weight: e.target.value })}
                  error={invalidWeight}
                  placeholder="Opcional"
                  inputProps={{ inputMode: 'decimal', 'aria-label': `Peso de ${animal.identification}` }}
                />
              </TableCell>
              <TableCell sx={{ ...bodyCell, borderRight: 0 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={draft.observations ?? ''}
                  onChange={(e) => onChange(animal.caravan_id, { observations: e.target.value })}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ExecuteWeaningRollTable;
