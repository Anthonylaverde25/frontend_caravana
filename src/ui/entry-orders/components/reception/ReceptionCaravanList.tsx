import React from 'react';
import {
  Checkbox,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import type { ReceptionDraft, UntickedFate } from './useReceptionDraft';

const cellSx = { py: 0.5, px: 1 } as const;

/**
 * The caravans of the DTE still in transit. A ticked one is received, with its weight if the
 * scale was used; an unticked one shows what happens to it.
 */
export const ReceptionCaravanList: React.FC<{ draft: ReceptionDraft; showDte?: boolean }> = ({ draft, showDte = false }) => {
  const theme = useTheme();
  const allChecked = draft.lines.length > 0 && draft.counts.received === draft.lines.length;

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 360 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...cellSx, width: 44 }}>
                <Checkbox
                  size="small"
                  checked={allChecked}
                  indeterminate={!allChecked && draft.counts.received > 0}
                  onChange={(e) => draft.setAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ ...cellSx, fontWeight: 700 }}>Caravana</TableCell>
              <TableCell sx={{ ...cellSx, width: 190, fontWeight: 700 }}>Peso (kg) / Si no llegó</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {draft.lines.map((line) => {
              const error = draft.errorOf(line.caravanId);

              return (
                <TableRow
                  key={line.caravanId}
                  sx={{ bgcolor: error ? alpha(theme.palette.error.main, 0.06) : !line.checked ? alpha(theme.palette.warning.main, 0.06) : undefined }}
                >
                  <TableCell sx={cellSx}>
                    <Checkbox size="small" checked={line.checked} onChange={(e) => draft.update(line.caravanId, { checked: e.target.checked })} />
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>{line.identification}</Typography>
                    {showDte && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                        DTE {line.dteNumber}
                      </Typography>
                    )}
                    {error && (
                      <Typography variant="caption" color="error">
                        {error}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={cellSx}>
                    {line.checked ? (
                      <TextField
                        size="small"
                        type="number"
                        fullWidth
                        placeholder="Opcional"
                        value={line.weight}
                        onChange={(e) => draft.update(line.caravanId, { weight: e.target.value })}
                      />
                    ) : (
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={line.fate}
                        onChange={(e) => draft.update(line.caravanId, { fate: e.target.value as UntickedFate })}
                      >
                        <MenuItem value="LATER">Llega después</MenuItem>
                        <MenuItem value="MISSING">No va a llegar</MenuItem>
                      </TextField>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ReceptionCaravanList;
