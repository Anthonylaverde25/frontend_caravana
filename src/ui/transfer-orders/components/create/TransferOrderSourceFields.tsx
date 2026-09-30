import React from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { TransferOrderSummary } from '@/features/transfer-orders/types';
import type { TransferFormActivity } from '../../hooks/useTransferOrderFormOptions';
import { headCountLabel, transferSelectFieldProps } from './transferFormFieldProps';

interface TransferOrderSourceFieldsProps {
  activities: TransferFormActivity[];
  activityId: number | '';
  onActivityChange: (activityId: number | '') => void;
  batchId: number | '';
  onBatchChange: (batchId: number | '') => void;
  /** The draft, issued or partial order the chosen batch already has: it blocks a new one. */
  activeOrder: TransferOrderSummary | null;
  isCheckingOrders: boolean;
  onOpenActiveOrder: (order: TransferOrderSummary) => void;
}

/** Where the animals leave from: the activity first, then one of its batches with animals. */
export const TransferOrderSourceFields: React.FC<TransferOrderSourceFieldsProps> = ({
  activities,
  activityId,
  onActivityChange,
  batchId,
  onBatchChange,
  activeOrder,
  isCheckingOrders,
  onOpenActiveOrder
}) => {
  const batches = activities.find((activity) => activity.id === activityId)?.batches ?? [];

  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', lineHeight: 1.5 }}>
        Origen
      </Typography>

      <TextField
        {...transferSelectFieldProps}
        autoFocus
        required
        label="Actividad de origen"
        value={activityId}
        onChange={(e) => onActivityChange(e.target.value === '' ? '' : Number(e.target.value))}
        helperText={activities.length === 0 ? 'No hay lotes con animales' : undefined}
      >
        {activities.map((activity) => (
          <MenuItem key={activity.id} value={activity.id}>
            {activity.name} ({activity.batches.length} {activity.batches.length === 1 ? 'lote' : 'lotes'})
          </MenuItem>
        ))}
      </TextField>

      <TextField
        {...transferSelectFieldProps}
        required
        disabled={activityId === ''}
        label="Lote de origen"
        value={batchId}
        onChange={(e) => onBatchChange(e.target.value === '' ? '' : Number(e.target.value))}
        helperText={
          activityId === ''
            ? 'Primero elegí la actividad de origen.'
            : isCheckingOrders
              ? 'Buscando órdenes del lote…'
              : 'Sólo aparecen los lotes que tienen animales.'
        }
      >
        {batches.map((batch) => (
          <MenuItem key={batch.id} value={batch.id}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
              <span>{batch.name}</span>
              <Typography component="span" variant="caption" color="text.secondary">
                {headCountLabel(batch.count)}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </TextField>

      {activeOrder && (
        <Alert
          severity="error"
          sx={{ fontSize: '0.78rem', py: 0.5, alignItems: 'center', '& .MuiAlert-message': { lineHeight: 1.35 } }}
          action={
            <Button
              size="small"
              color="inherit"
              onClick={() => onOpenActiveOrder(activeOrder)}
              sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              Abrir la orden
            </Button>
          }
        >
          Este lote ya tiene la orden <strong>{activeOrder.code}</strong> ({activeOrder.status_label}). Ejecutala,
          cerrala o anulala antes de crear otra.
        </Alert>
      )}
    </Stack>
  );
};

export default TransferOrderSourceFields;
