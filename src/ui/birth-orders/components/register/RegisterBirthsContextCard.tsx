import React from 'react';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import type { BirthRollFemale } from '../grid/birthRollTypes';
import BirthWindowBar from './BirthWindowBar';

interface RegisterBirthsContextCardProps {
  /** One batch, or every batch when null. */
  batchId: number | null;
  batchName: string | null;
  batchCount: number;
  females: BirthRollFemale[];
}

/**
 * "1. Vientres preñados", read-only and laid out as "1. Orden" of "Cargar tacto": which batch, the
 * expected calving and the females an open order already holds (their calving is registered there).
 */
export const RegisterBirthsContextCard: React.FC<RegisterBirthsContextCardProps> = ({ batchId, batchName, batchCount, females }) => {
  const { data: batch } = useBatch(batchId ?? undefined);
  const inOrders = females.filter((f) => f.openOrderCode);
  const orders = [...new Set(inOrders.map((f) => f.openOrderCode))];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Typography sx={sectionTitleSx}>1. Vientres preñados</Typography>
      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        <Stack spacing={0.25}>
          <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{batchName ?? `${batchCount} lote(s)`}</Typography>
          {batch?.farm_name && (
            <Typography variant="body2" color="text.secondary">
              {batch.farm_name}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            La cría nace en el lote de su madre
          </Typography>
        </Stack>

        <BirthWindowBar females={females} />

        {inOrders.length > 0 ? (
          <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5, borderRadius: '6px' }}>
            {inOrders.length === 1 ? '1 vientre ya está' : `${inOrders.length} vientres ya están`} en{' '}
            {orders.map((code, i) => (
              <React.Fragment key={code}>
                {i > 0 && ', '}
                <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  {code}
                </Box>
              </React.Fragment>
            ))}
            : su parto se registra en esa orden.
          </Alert>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Ningún vientre está en una orden abierta: al registrar se crea una orden nueva, ya ejecutada.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default RegisterBirthsContextCard;
