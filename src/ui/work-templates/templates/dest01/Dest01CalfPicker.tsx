import React, { useEffect, useMemo } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useBirthHistory, BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import { useDest01Print } from './Dest01PrintContext';

interface BreedingBatchOption {
  id: number;
  name: string;
  nursingCount: number;
}

/**
 * Picks the breeding batch and the calves to pre-load. The batch is the one the mothers are in now,
 * not the calves' batch: LSER-01 moves the cows to a service batch and leaves the calves behind.
 */
export const Dest01CalfPicker: React.FC = () => {
  const {
    sourceBatchId,
    setSourceBatchId,
    excludedCalfIds: excludedIds,
    setExcludedCalfIds: setExcludedIds,
    setCalves,
    header,
    setHeaderField,
  } = useDest01Print();
  const { data: births = [], isLoading } = useBirthHistory();

  const nursing = useMemo(() => births.filter((b) => b.is_nursing && b.mother_batch_id !== null), [births]);

  const batchOptions = useMemo<BreedingBatchOption[]>(() => {
    const byId = new Map<number, BreedingBatchOption>();
    nursing.forEach((b) => {
      const id = b.mother_batch_id as number;
      const current = byId.get(id) ?? { id, name: b.mother_batch_name ?? `Lote ${id}`, nursingCount: 0 };
      current.nursingCount += 1;
      byId.set(id, current);
    });
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [nursing]);

  const candidates = useMemo<BirthHistoryRecord[]>(
    () =>
      nursing
        .filter((b) => b.mother_batch_id === sourceBatchId)
        .sort((a, b) => a.mother_identification.localeCompare(b.mother_identification)),
    [nursing, sourceBatchId]
  );

  useEffect(() => {
    setCalves(
      candidates
        .filter((c) => !excludedIds.has(c.calf_id))
        .map((c) => ({
          calfId: c.calf_id,
          calfIdentification: c.calf_identification,
          motherIdentification: c.mother_identification,
          calfSex: c.calf_sex,
        }))
    );
  }, [candidates, excludedIds, setCalves]);

  const selectedBatch = batchOptions.find((b) => b.id === sourceBatchId) ?? null;

  const handleBatchChange = (batch: BreedingBatchOption | null) => {
    setSourceBatchId(batch?.id ?? null);
    setExcludedIds(new Set());
    if (batch && (!header.lote_origen || batchOptions.some((b) => b.name === header.lote_origen))) {
      setHeaderField('lote_origen', batch.name);
    }
  };

  const toggle = (calfId: number) => {
    const next = new Set(excludedIds);
    if (next.has(calfId)) next.delete(calfId);
    else next.add(calfId);
    setExcludedIds(next);
  };

  const includedCount = candidates.length - candidates.filter((c) => excludedIds.has(c.calf_id)).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Autocomplete
        options={batchOptions}
        loading={isLoading}
        value={selectedBatch}
        getOptionLabel={(b) => `${b.name} (${b.nursingCount} al pie)`}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onChange={(_, batch) => handleBatchChange(batch)}
        renderInput={(params) => (
          <TextField {...params} label="Lote de cría (lote actual de las madres)" size="small" helperText={`${batchOptions.length} lote(s) con crías al pie`} />
        )}
      />

      {sourceBatchId !== null && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
              {includedCount} de {candidates.length} crías incluidas
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Button size="small" onClick={() => setExcludedIds(new Set())} sx={{ textTransform: 'none' }}>Todas</Button>
              <Button size="small" onClick={() => setExcludedIds(new Set(candidates.map((c) => c.calf_id)))} sx={{ textTransform: 'none' }}>
                Ninguna
              </Button>
            </Stack>
          </Stack>
          <List dense sx={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', py: 0 }}>
            {candidates.map((calf) => (
              <ListItem key={calf.calf_id} disablePadding divider>
                <ListItemButton onClick={() => toggle(calf.calf_id)} sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    <Checkbox edge="start" size="small" checked={!excludedIds.has(calf.calf_id)} tabIndex={-1} disableRipple />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem' }}>{calf.calf_identification}</Typography>}
                    secondary={`Madre ${calf.mother_identification} · ${calf.calf_sex === 'M' ? 'Macho' : calf.calf_sex === 'H' ? 'Hembra' : 'Sexo s/d'}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

export default Dest01CalfPicker;
