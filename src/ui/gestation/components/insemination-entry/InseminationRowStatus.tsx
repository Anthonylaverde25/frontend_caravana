import { useState } from 'react';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import type { Insemination } from '@/features/gestation/types/insemination';
import { formatDay } from '../../utils/reproductiveVerdict';

interface InseminationRowStatusProps {
  error?: string;
  /** The row goes without lot: it will open "Identificar partida". */
  unidentified: boolean;
  live: Insemination[];
  canAddAnother: boolean;
  onAddAnother: () => void;
  onVoid: (inseminationId: number) => void;
}

/** Last cell of a row: the server's objection, the "without lot" notice, or the row's actions. */
export default function InseminationRowStatus({ error, unidentified, live, canAddAnother, onAddAnother, onVoid }: InseminationRowStatusProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const hasActions = live.length > 0;

  return (
    <SheetGridStatusCell error={error} warning={unidentified ? 'Sin partida: la inseminación se registra y queda la novedad "Identificar partida".' : undefined}>
      {hasActions && (
        <>
          <IconButton size="small" aria-label="Acciones de la fila" onClick={(e) => setAnchor(e.currentTarget)}>
            <FuseSvgIcon size={16}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
          </IconButton>
          <Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { borderRadius: '10px', minWidth: 240 } } }}>
            {canAddAnother && (
              <MenuItem onClick={() => { setAnchor(null); onAddAnother(); }}>
                <ListItemIcon><FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon></ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: '0.82rem' }}>Agregar otra inseminación</ListItemText>
              </MenuItem>
            )}
            {live.map((insemination) => (
              <MenuItem key={insemination.id} onClick={() => { setAnchor(null); onVoid(insemination.id); }}>
                <ListItemIcon><FuseSvgIcon size={16} color="error">heroicons-outline:x-circle</FuseSvgIcon></ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: '0.82rem' }}>Anular la del {formatDay(insemination.inseminated_on)}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </SheetGridStatusCell>
  );
}
