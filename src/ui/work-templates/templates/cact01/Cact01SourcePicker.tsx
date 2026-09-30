import React, { useEffect } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { formatAverage, formatKg } from '@/ui/activities/components/transfer/transferMath';
import { useCact01Print } from './Cact01PrintContext';
import { useCact01SourceAnimals } from '../../hooks/useCact01SourceAnimals';

const DENTITION_LABELS: Record<number, string> = { 0: 'DL', 2: '2D', 4: '4D', 6: '6D', 8: '8D' };

/**
 * Picks the source batch and the animals to pre-load.
 *
 * Every animal starts ticked, the same default TransferAnimalsView uses: moving the
 * whole batch is the usual case and the partial move is the exception. The figures come
 * from `figuresOfSelection` rather than a second arithmetic written here, so the paper
 * and the transfer screen can never disagree about what the troop weighs.
 *
 * When a work order arrives from the transfer screen it overrides that default: the sheet
 * is an order to fulfil, so it lists the animals that screen chose and no others.
 */
export const Cact01SourcePicker: React.FC = () => {
  const {
    sourceBatchId,
    setSourceBatchId,
    excludedCaravanIds: excludedIds,
    setExcludedCaravanIds: setExcludedIds,
    setHeaderField,
  } = useCact01Print();

  // Presentation only: the loading and the publishing belong to the hook, called once by
  // the printable sheet, which is mounted whether or not this drawer was ever opened.
  const { batchOptions, candidates, figures } = useCact01SourceAnimals();

  // The header names of origin travel to the paper so that a loose page still says
  // where the troop came from.
  const selectedBatch = batchOptions.find((batch) => batch.id === sourceBatchId);

  useEffect(() => {
    if (!selectedBatch) return;

    setHeaderField('lote_origen', selectedBatch.name);
    setHeaderField('actividad_origen', selectedBatch.activityName);
  }, [selectedBatch?.id, selectedBatch?.name, selectedBatch?.activityName, setHeaderField]);

  const toggle = (caravanId: number) => {
    const next = new Set(excludedIds);
    next.has(caravanId) ? next.delete(caravanId) : next.add(caravanId);
    setExcludedIds(next);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Autocomplete
        options={batchOptions}
        value={batchOptions.find((batch) => batch.id === sourceBatchId) ?? null}
        onChange={(_, option) => {
          setSourceBatchId(option?.id ?? null);
          setExcludedIds(new Set());
        }}
        getOptionLabel={(option) => `${option.name} (${option.count} cab.)`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => <TextField {...params} label="Lote de origen" size="small" />}
      />

      {sourceBatchId != null && (
        <>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`${figures.count} cabezas`} sx={{ fontWeight: 700 }} />
            <Chip size="small" variant="outlined" label={`${formatKg(figures.kg)} kg`} />
            <Chip size="small" variant="outlined" label={`Prom. ${formatAverage(figures.average)}`} />
            <Button size="small" onClick={() => setExcludedIds(new Set())} sx={{ textTransform: 'none' }}>
              Incluir todos
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Los pesos que ves son los últimos registrados. El peso del día se anota en la manga.
          </Typography>

          <List dense sx={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            {candidates.map((caravan) => (
              <ListItem key={caravan.id} disablePadding>
                <ListItemButton onClick={() => toggle(caravan.id)} dense>
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    <Checkbox edge="start" size="small" checked={!excludedIds.has(caravan.id)} tabIndex={-1} disableRipple />
                  </ListItemIcon>
                  <ListItemText
                    primary={caravan.identification}
                    secondary={[
                      caravan.sex,
                      caravan.category_name ?? caravan.category,
                      caravan.teeth != null ? DENTITION_LABELS[caravan.teeth] ?? `${caravan.teeth}D` : null,
                      caravan.current_weight != null ? `${Math.round(Number(caravan.current_weight))} kg` : 'sin peso',
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                    primaryTypographyProps={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem' }}
                    secondaryTypographyProps={{ fontSize: '0.68rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {candidates.length === 0 && (
              <ListItem>
                <ListItemText secondary="El lote elegido no tiene animales propios cargados." />
              </ListItem>
            )}
          </List>
        </>
      )}
    </Box>
  );
};

export default Cact01SourcePicker;
