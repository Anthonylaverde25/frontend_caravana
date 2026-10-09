import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBullReplacements } from '@/features/gestation/hooks/useReplaceServiceBull';

interface ServiceOrderBullReplacementsHistoryProps {
  serviceOrderId?: number | null;
}

export const ServiceOrderBullReplacementsHistory: React.FC<ServiceOrderBullReplacementsHistoryProps> = ({
  serviceOrderId,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: replacements = [], isLoading } = useBullReplacements(serviceOrderId);

  if (!serviceOrderId || replacements.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Accordion
        defaultExpanded
        elevation={0}
        sx={{
          borderRadius: '8px !important',
          border: 1,
          borderColor: 'divider',
          '&:before': { display: 'none' },
          bgcolor: isDark ? 'background.paper' : '#f8fafc',
        }}
      >
        <AccordionSummary
          expandIcon={<FuseSvgIcon size={18}>heroicons-outline:chevron-down</FuseSvgIcon>}
          sx={{ px: 2, py: 1 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: '6px',
                bgcolor: 'info.main',
                color: 'info.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FuseSvgIcon size={16}>heroicons-outline:arrows-right-left</FuseSvgIcon>
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
              Historial de Sustituciones de Toros ({replacements.length})
            </Typography>
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
          <Stack spacing={1.5}>
            {replacements.map((rep) => (
              <Paper
                key={rep.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: '6px',
                  border: 1,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                  bgcolor: isDark ? 'background.default' : '#ffffff',
                }}
              >
                {/* Cabecera del evento: Toros y Fecha */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: 'error.main',
                      }}
                    >
                      #{rep.retired_male?.identification || rep.retired_male_caravan_id}
                    </Typography>
                    <FuseSvgIcon size={14}>heroicons-outline:arrow-right</FuseSvgIcon>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: 'success.main',
                      }}
                    >
                      #{rep.replacement_male?.identification || rep.replacement_male_caravan_id}
                    </Typography>
                  </Stack>

                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {rep.replacement_date ? new Date(rep.replacement_date).toLocaleDateString() : '—'}
                  </Typography>
                </Box>

                {/* Motivo y Destino */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Chip
                    label={rep.reason_label || rep.reason}
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                  />

                  {rep.destination_batch ? (
                    <Chip
                      icon={<FuseSvgIcon size={12}>heroicons-outline:map-pin</FuseSvgIcon>}
                      label={`Destino: ${rep.destination_batch.name}`}
                      size="small"
                      variant="filled"
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: isDark ? 'action.hover' : '#e2e8f0' }}
                    />
                  ) : (
                    <Chip
                      label="Baja definitiva"
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>

                {/* Notas clínicas */}
                {rep.notes && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      bgcolor: isDark ? 'action.hover' : '#f8fafc',
                      p: 1,
                      borderRadius: '4px',
                    }}
                  >
                    "{rep.notes}"
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ServiceOrderBullReplacementsHistory;
