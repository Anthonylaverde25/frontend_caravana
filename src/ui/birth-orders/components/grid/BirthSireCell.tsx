import React from 'react';
import { Divider, MenuItem, TextField } from '@mui/material';
import type { SireDTO } from '@/core/caravans/domain/entities/Caravan';
import { suggestedSire } from './birthRollTypes';

interface BirthSireCellProps {
  sires: SireDTO[];
  males: { id: number; identification: string }[];
  value: number | '';
  onChange: (value: number | '') => void;
  disabled: boolean;
  error: boolean;
  sx: object;
}

/**
 * The sire of a live calf: optional. Empty means "what the gestation says" — its confirmed sire —
 * or, without one, the calf waits in "Paternidad pendiente", even with a single candidate. The
 * candidates of the service come first; any other male can be chosen.
 */
export const BirthSireCell: React.FC<BirthSireCellProps> = ({ sires, males, value, onChange, disabled, error, sx }) => {
  const suggested = suggestedSire(sires);
  const emptyLabel = suggested
    ? `Confirmado: ${suggested.identification}`
    : sires.length > 0
      ? 'Sin asignar (Paternidad pendiente)'
      : 'Desconocido';
  const others = males.filter((male) => !sires.some((s) => s.id === male.id));

  return (
    <TextField
      select
      fullWidth
      variant="outlined"
      disabled={disabled}
      error={error}
      value={value}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      SelectProps={{ displayEmpty: true, renderValue: (v) => (v === '' ? emptyLabel : (males.find((m) => m.id === v)?.identification ?? sires.find((s) => s.id === v)?.identification ?? String(v))) }}
      sx={sx}
    >
      <MenuItem value="">
        <em>{emptyLabel}</em>
      </MenuItem>
      {sires.map((sire) => (
        <MenuItem key={`s-${sire.id}`} value={sire.id}>
          ⭐ {sire.identification}
          {sire.is_confirmed ? ' (confirmado)' : ''}
        </MenuItem>
      ))}
      {sires.length > 0 && others.length > 0 && <Divider />}
      {others.map((male) => (
        <MenuItem key={male.id} value={male.id}>
          {male.identification}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default BirthSireCell;
