import React from 'react';
import { Box, Checkbox, Collapse, FormControlLabel, Stack, Typography } from '@mui/material';
import type { EntryOrder } from '@/features/entry-orders/types';
import ReceptionRowsSection from './ReceptionRowsSection';
import TriAttachment from './TriAttachment';
import { troopContextOf, type ReceptionRows } from './useReceptionRows';

interface ReceptionCaravansPanelProps {
  order: EntryOrder;
  rows: ReceptionRows;
  /** "Cargar caravanas": the panel is the whole point, so it is always open. */
  identifying: boolean;
  /** Whether the caravans are loaded now; a reception by head usually has none. */
  enabled: boolean;
  onEnabled: (enabled: boolean) => void;
  /** Head the caravans are counted against. */
  expected: number;
  expectedLabel: string;
  onTriNumber: (triNumber: string | null) => void;
}

/**
 * The caravans of a reception. Receiving by head they are usually unknown, so the panel stays
 * closed behind "Cargar caravanas ahora"; opened, they are written, pasted or read from the TRI.
 * Closing it drops what was loaded.
 */
export const ReceptionCaravansPanel: React.FC<ReceptionCaravansPanelProps> = ({
  order,
  rows,
  identifying,
  enabled,
  onEnabled,
  expected,
  expectedLabel,
  onTriNumber
}) => {
  const open = identifying || enabled;

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', px: 1.5, py: open ? 1.25 : 0.5 }}>
      {!identifying && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={enabled}
                onChange={(e) => {
                  if (!e.target.checked) {
                    rows.reset();
                    onTriNumber(null);
                  }
                  onEnabled(e.target.checked);
                }}
              />
            }
            label={<Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Cargar caravanas ahora</Typography>}
            sx={{ mr: 0 }}
          />
          {!enabled && (
            <Typography variant="caption" color="text.secondary">
              Opcional: si no, quedan sin caravana y se cargan después (a mano o con la hoja ING-03).
            </Typography>
          )}
        </Stack>
      )}
      <Collapse in={open} unmountOnExit>
        <Stack spacing={1.25} sx={{ pt: identifying ? 0 : 0.5 }}>
          <TriAttachment orderId={order.id} onCaravans={rows.appendTags} onTriNumber={onTriNumber} />
          <ReceptionRowsSection
            draft={rows}
            troop={troopContextOf(order)}
            expected={expected}
            expectedLabel={expectedLabel}
            excessIsError
          />
        </Stack>
      </Collapse>
    </Box>
  );
};

export default ReceptionCaravansPanel;
