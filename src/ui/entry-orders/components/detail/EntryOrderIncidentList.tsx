import React from 'react';
import { Box, Button, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import type { EntryOrderIncident } from '@/features/entry-orders/types';
import { formatDateTime } from '../entryOrderFormat';

interface EntryOrderIncidentListProps {
  incidents: EntryOrderIncident[];
  onResolve: (incident: EntryOrderIncident) => void;
}

/**
 * What the order has to settle with the provider. Independent of the status: a completed order
 * can still have one open.
 */
export const EntryOrderIncidentList: React.FC<EntryOrderIncidentListProps> = ({ incidents, onResolve }) => {
  const theme = useTheme();
  const open = theme.palette.mode === 'dark' ? '#fbbf24' : '#a16207';

  if (incidents.length === 0) return null;

  return (
    <Box>
      <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
        Novedades
      </Typography>
      <Stack spacing={1} sx={{ mt: 0.5 }}>
        {incidents.map((incident) => {
          const isOpen = incident.status === 'OPEN';

          return (
            <Paper
              key={incident.id}
              elevation={0}
              sx={{ p: 1.5, border: 1, borderColor: isOpen ? alpha(open, 0.4) : 'divider', borderRadius: '6px', bgcolor: isOpen ? alpha(open, 0.05) : undefined }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{incident.type_label}</Typography>
                    <Chip
                      size="small"
                      label={incident.status_label}
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, color: isOpen ? open : 'text.secondary', bgcolor: isOpen ? alpha(open, 0.12) : 'action.hover' }}
                    />
                  </Stack>
                  <Typography variant="body2">{incident.detail}</Typography>
                  {incident.resolution && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Resuelta{incident.resolved_by?.name ? ` por ${incident.resolved_by.name}` : ''}
                      {incident.resolved_at ? ` el ${formatDateTime(incident.resolved_at)}` : ''}: {incident.resolution}
                    </Typography>
                  )}
                </Box>
                {isOpen && (
                  <Button size="small" variant="outlined" onClick={() => onResolve(incident)} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', flexShrink: 0 }}>
                    Resolver
                  </Button>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default EntryOrderIncidentList;
