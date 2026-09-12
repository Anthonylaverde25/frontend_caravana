import React from 'react';
import { Box, Divider, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BullEvaluationRowData } from './BullEvaluationSheetRow';

interface Props {
  rows: BullEvaluationRowData[];
  tubesCount: number;
}

/** Live counters for the chute session, extracted so the view stays an orchestrator. */
export const SheetSummaryBar: React.FC<Props> = ({ rows, tubesCount }) => {
  const theme = useTheme();
  const accent = theme.palette.primary.main;

  const scrapes = rows.filter((r) => r.prepuce_scrape).length;
  const serologies = rows.filter((r) => r.blood_serology).length;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        px: 2.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: '8px',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: alpha(accent, 0.12),
            color: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:table-cells</FuseSvgIcon>
        </Box>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Planilla de manga activa (TOR-01)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {rows.length} {rows.length === 1 ? 'toro cargado' : 'toros cargados'} · {tubesCount}{' '}
            {tubesCount === 1 ? 'tubo' : 'tubos'} a rotular
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={3} alignItems="center">
        <Metric label="Toros en planilla" value={String(rows.length)} />
        <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto' }} />
        <Metric label="Raspajes ETS" value={`${scrapes} tubos`} />
        <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto' }} />
        <Metric label="Serologías" value={`${serologies} tubos`} />
      </Stack>
    </Paper>
  );
};

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography
      variant="caption"
      sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
      {value}
    </Typography>
  </Box>
);
