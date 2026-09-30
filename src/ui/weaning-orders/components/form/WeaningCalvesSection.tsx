import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import type { WeaningOrderFormState } from '../../hooks/useWeaningOrderForm';
import WeaningCalvesTable from './WeaningCalvesTable';
import WeaningPerAnimalAssignBar from '../confirm/WeaningPerAnimalAssignBar';
import WeaningCategoryBySexBar from '../confirm/WeaningCategoryBySexBar';
import { sectionTitleSx } from './formStyles';

interface WeaningCalvesSectionProps {
  form: WeaningOrderFormState;
  recordsById: Map<number, BirthHistoryRecord>;
  sexById: Record<number, 'M' | 'H' | null>;
  destinationLabels: Map<string, string>;
  errorsByTag: Record<string, string[]>;
}

/**
 * The calves of the order, to confirm. With one batch for all and nothing declared per calf, it is
 * only the list; the per-calf columns (batch, new C/S, weight) appear only when the order asks them.
 * Calves are added in the start dialog ("Editar"); here one can only be taken out.
 */
export const WeaningCalvesSection: React.FC<WeaningCalvesSectionProps> = ({ form, recordsById, sexById, destinationLabels, errorsByTag }) => {
  const [selected, setSelected] = useState<number[]>([]);
  // One batch per calf with every batch written at the chute: nothing to assign here.
  const lotsAtChute = form.destinationMode === 'per_animal' && form.activeDestinations.length === 0;
  const perAnimal = form.destinationMode === 'per_animal' && !lotsAtChute;
  const declared = form.categoryMode === 'DECLARED';
  const register = form.mode === 'register';
  const asksPerCalf = perAnimal || declared || register;

  const title = perAnimal ? 'Lote de cada cría' : register ? 'Lo que midió la manga' : declared ? 'C/S nueva de cada cría' : 'Crías de la orden';
  const hint = !asksPerCalf
    ? lotsAtChute
      ? 'Revisá las caravanas antes de emitir. El lote de cada cría se escribe en la manga, en la planilla DEST-01.'
      : 'Revisá las caravanas antes de emitir. Para sumar crías o cambiar el lote, usá "Editar".'
    : [
        perAnimal && 'Asigná el lote de cada cría, de a una o marcando varias.',
        declared && 'Asigná la C/S nueva, de a una o por sexo.',
        register && 'El peso y las observaciones son opcionales.'
      ]
        .filter(Boolean)
        .join(' ');

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={sectionTitleSx}>
          {title} ({form.calfIds.length})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      </Box>

      {perAnimal && (
        <WeaningPerAnimalAssignBar form={form} destinationLabels={destinationLabels} selected={selected} onAssigned={() => setSelected([])} />
      )}
      {declared && <WeaningCategoryBySexBar form={form} sexById={sexById} />}

      {form.calfIds.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>
          La orden se quedó sin crías. Usá "Editar" para elegirlas.
        </Typography>
      ) : (
        <Box sx={{ maxHeight: 560, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
          <WeaningCalvesTable
            form={form}
            recordsById={recordsById}
            destinationLabels={destinationLabels}
            errorsByTag={errorsByTag}
            selected={selected}
            onSelectedChange={setSelected}
          />
        </Box>
      )}
    </Paper>
  );
};

export default WeaningCalvesSection;
