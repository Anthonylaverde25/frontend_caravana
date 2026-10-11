import React from 'react';
import { Box, FormHelperText, Stack, TextField, Typography } from '@mui/material';
import type { EntryOrderPossibleBatch } from '@/features/entry-orders/types';
import { filledSx } from '@/ui/batches/components/external/externalFormParts';

interface HeadsByBatchFieldProps {
  batches: EntryOrderPossibleBatch[];
  values: Record<number, string>;
  onChange: (batchId: number, value: string) => void;
  received: number | null;
  error: string | null;
}

/**
 * How many of the head received went to each batch, when the order sends its animals to more than
 * one: whoever unloaded them knows, because they separated them. Each batch counts them as pending
 * identification until their caravans are written.
 */
export const HeadsByBatchField: React.FC<HeadsByBatchFieldProps> = ({ batches, values, onChange, received, error }) => {
  const sum = batches.reduce((total, b) => total + (Number(values[b.id]) || 0), 0);

  return (
    <Box>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 1 }}
      >
        ¿Cuántas cabezas fueron a cada lote?
      </Typography>
      <Stack spacing={1}>
        {batches.map((batch) => (
          <Stack
            key={batch.id}
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                noWrap
              >
                {batch.name ?? `Lote #${batch.id}`}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                component="div"
              >
                {batch.is_transit
                  ? 'Lote de tránsito · lo que no tiene destino'
                  : batch.rules.join(' · ')}
              </Typography>
            </Box>
            <TextField
              type="number"
              size="small"
              variant="filled"
              hiddenLabel
              value={values[batch.id] ?? ''}
              onChange={(e) => onChange(batch.id, e.target.value)}
              inputProps={{ min: 0, 'aria-label': `Cabezas a ${batch.name ?? batch.id}` }}
              InputProps={{ disableUnderline: true }}
              sx={{ ...filledSx, width: 110 }}
            />
          </Stack>
        ))}
      </Stack>
      <FormHelperText error={!!error}>
        {error ??
          (received != null
            ? `${sum} de ${received} cabezas repartidas.`
            : 'Primero indicá cuántas cabezas llegaron.')}
      </FormHelperText>
    </Box>
  );
};

export default HeadsByBatchField;
