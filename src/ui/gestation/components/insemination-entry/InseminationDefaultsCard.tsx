import { MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { lotsInTank, type SemenOption } from '@/features/semen/hooks/useSemenOptions';
import { defaultLot, type InseminationDefaults, type LotChoice } from './inseminationEntryModel';

interface InseminationDefaultsCardProps {
  defaults: InseminationDefaults;
  tanks: { id: number; code: string; name: string }[];
  /** The semen used by the rows: one lot each for the whole load. */
  semenInUse: SemenOption[];
  onChange: (patch: Partial<InseminationDefaults>) => void;
}

/** "2. Carga": the day, the tank and the straws that fill every row not typed by hand. */
export default function InseminationDefaultsCard({ defaults, tanks, semenInUse, onChange }: InseminationDefaultsCardProps) {
  const lotOf = (option: SemenOption): LotChoice => defaults.lots[option.itemId] ?? defaultLot(option, defaults.warehouseId);
  const setLot = (itemId: number, value: string) =>
    onChange({ lots: { ...defaults.lots, [itemId]: value === 'NONE' ? 'NONE' : value === '' ? null : Number(value) } });

  const field = { variant: 'filled' as const, fullWidth: true, size: 'small' as const, InputProps: { sx: { borderRadius: '6px', bgcolor: 'action.hover' } } };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
      <Typography sx={sectionTitleSx}>2. Carga</Typography>
      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        <TextField {...field} type="date" label="Fecha" value={defaults.date} onChange={(e) => onChange({ date: e.target.value })} InputLabelProps={{ shrink: true }} />
        <TextField {...field} select label="Termo" value={defaults.warehouseId ?? ''} onChange={(e) => onChange({ warehouseId: Number(e.target.value) })}>
          {tanks.length === 0 && <MenuItem value="" disabled>No hay termos activos</MenuItem>}
          {tanks.map((t) => (
            <MenuItem key={t.id} value={t.id}>{t.code} · {t.name}</MenuItem>
          ))}
        </TextField>
        {semenInUse.map((option) => (
          <TextField key={option.itemId} {...field} select label={`Partida · ${option.label}`} value={lotOf(option) ?? ''} onChange={(e) => setLot(option.itemId, e.target.value)}>
            <MenuItem value="" disabled>Elegí la partida</MenuItem>
            {lotsInTank(option, defaults.warehouseId).map((lot) => (
              <MenuItem key={lot.id} value={lot.id}>{lot.code} · {lot.quantity} pajuelas</MenuItem>
            ))}
            <MenuItem value="NONE"><em>Sin identificar</em></MenuItem>
          </TextField>
        ))}
        <TextField {...field} type="number" label="Pajuelas por vientre" value={defaults.straws} onChange={(e) => onChange({ straws: Math.max(1, Number(e.target.value) || 1) })} inputProps={{ min: 1 }} />
        <Typography variant="caption" color="text.secondary">
          Se aplican a las filas que no tocaste. Cada carga descuenta las pajuelas del termo y las imputa al lote.
        </Typography>
      </Stack>
    </Paper>
  );
}
