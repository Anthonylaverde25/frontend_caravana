import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { TrayViewMode } from './useTrayViewMode';

interface TrayViewToggleProps {
  value: TrayViewMode;
  onChange: (mode: TrayViewMode) => void;
}

const buttonSx = { width: 36, height: 34, border: 0, borderRadius: '6px !important', color: 'text.secondary' } as const;

/** Switches the tray between its cards and its table. */
export default function TrayViewToggle({ value, onChange }: TrayViewToggleProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      aria-label="Vista"
      value={value}
      onChange={(_, next: TrayViewMode | null) => next && onChange(next)}
      sx={{ p: '3px', gap: '2px', bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '8px', '& .Mui-selected': { color: 'primary.main' } }}
    >
      <Tooltip title="Tarjetas">
        <ToggleButton value="cards" aria-label="Vista tarjetas" sx={buttonSx}>
          <FuseSvgIcon size={18}>heroicons-outline:squares-2x2</FuseSvgIcon>
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Tabla">
        <ToggleButton value="table" aria-label="Vista tabla" sx={buttonSx}>
          <FuseSvgIcon size={18}>heroicons-outline:bars-3</FuseSvgIcon>
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}
