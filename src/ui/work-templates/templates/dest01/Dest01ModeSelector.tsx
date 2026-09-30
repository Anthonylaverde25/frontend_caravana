import React, { useMemo } from 'react';
import { Autocomplete, Box, FormControlLabel, Radio, RadioGroup, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useWeaningOrders } from '@/features/weaning-orders/hooks/useWeaningOrders';
import { useDest01Print } from './Dest01PrintContext';

/**
 * A blank sheet to fill at the chute (one weaning batch for all, or a column per calf), or the sheet
 * of a weaning order: a sheet with calves printed on it is an order to fulfil, so it carries a code.
 */
export const Dest01ModeSelector: React.FC = () => {
  const { mode, setMode, blankPages, setBlankPages, destinationMode, setDestinationMode, weaningOrderId, setWeaningOrderId } = useDest01Print();
  const { data: orders = [], isLoading } = useWeaningOrders();
  // Open orders go out on paper; drafts are previewed. Registered ones never had paper.
  const printable = useMemo(() => orders.filter((o) => o.kind === 'PLANNED' && (o.is_open || o.is_editable)), [orders]);
  const selected = printable.find((o) => o.id === weaningOrderId) ?? orders.find((o) => o.id === weaningOrderId) ?? null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
        <FormControlLabel
          value="blank"
          control={<Radio size="small" />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Planilla en blanco</Typography>
              <Typography variant="caption" color="text.secondary">En la manga se escribe todo. Al cargarla se crea su orden, ya ejecutada.</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="from_order"
          control={<Radio size="small" />}
          sx={{ mt: 1 }}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Desde una orden de destete</Typography>
              <Typography variant="caption" color="text.secondary">Sale completa: código, crías, lotes y C/S. En la manga se anotan pesos y observaciones.</Typography>
            </Box>
          }
        />
      </RadioGroup>

      {mode === 'blank' ? (
        <>
          <ToggleButtonGroup size="small" exclusive value={destinationMode} onChange={(_, value) => value && setDestinationMode(value)}>
            <ToggleButton value="single" sx={{ textTransform: 'none' }}>Un lote para todas</ToggleButton>
            <ToggleButton value="per_animal" sx={{ textTransform: 'none' }}>Lote por cría</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            label="Cantidad de hojas"
            type="number"
            size="small"
            value={blankPages}
            onChange={(e) => setBlankPages(Number(e.target.value))}
            inputProps={{ min: 1, max: 20 }}
            sx={{ maxWidth: 180 }}
          />
        </>
      ) : (
        <Autocomplete
          options={printable}
          loading={isLoading}
          value={selected}
          getOptionLabel={(o) => `${o.code} · ${o.planned_head_count} crías · ${o.status_label}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          onChange={(_, order) => setWeaningOrderId(order?.id ?? null)}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Orden de destete" helperText={`${printable.length} orden(es) emitidas o en borrador`} />
          )}
        />
      )}
    </Box>
  );
};

export default Dest01ModeSelector;
