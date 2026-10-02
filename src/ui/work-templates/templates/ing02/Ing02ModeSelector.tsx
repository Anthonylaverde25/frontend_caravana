import React, { useMemo } from 'react';
import { Autocomplete, Box, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useEntryOrders } from '@/features/entry-orders/hooks/useEntryOrders';
import { useIng02Print } from './Ing02PrintContext';

/**
 * A blank sheet to fill in by hand (at the auction, say) and scan later, or the document of an
 * entry order, which comes out complete with what the purchase declared.
 */
export const Ing02ModeSelector: React.FC = () => {
  const { mode, setMode, entryOrderId, setEntryOrderId } = useIng02Print();
  const { data: orders = [], isLoading } = useEntryOrders();
  // Confirmed orders go out on paper; drafts are previewed. A cancelled purchase is not printed.
  const printable = useMemo(() => orders.filter((o) => o.status !== 'CANCELLED'), [orders]);
  const selected = printable.find((o) => o.id === entryOrderId) ?? null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
        <FormControlLabel
          value="blank"
          control={<Radio size="small" />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Planilla en blanco</Typography>
              <Typography variant="caption" color="text.secondary">
                Se completa a mano. Al escanearla se crea la orden, en espera de DTE.
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="from_order"
          control={<Radio size="small" />}
          sx={{ mt: 1 }}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Desde una orden de ingreso</Typography>
              <Typography variant="caption" color="text.secondary">
                Sale completa: código, proveedor, tropa, razas, pesos y sanidad.
              </Typography>
            </Box>
          }
        />
      </RadioGroup>

      {mode === 'from_order' && (
        <Autocomplete
          options={printable}
          loading={isLoading}
          value={selected}
          getOptionLabel={(o) => `${o.code} · ${o.batch_name} · ${o.status_label}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          onChange={(_, order) => setEntryOrderId(order?.id ?? null)}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Orden de ingreso" helperText={`${printable.length} orden(es) confirmadas o en borrador`} />
          )}
        />
      )}
    </Box>
  );
};

export default Ing02ModeSelector;
