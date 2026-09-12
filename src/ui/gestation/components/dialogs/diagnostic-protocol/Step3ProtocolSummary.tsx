import React from 'react';
import { Alert, Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface Step3ProtocolSummaryProps {
  protocolNumber: string;
  veterinarianLabel: string;
  sampleDate: string;
  resultDate: string;
  sampleTypeLabel: string;
  sampleRound: number;
  selectedBullsCount: number;
  determinationsCount: number;
  positiveBullsCount: number;
  attachmentsCount: number;
}

const MetricCard: React.FC<{ label: string; value: string | number; color?: string }> = ({
  label,
  value,
  color,
}) => (
  <Card variant="outlined" sx={{ flex: 1, borderRadius: '8px' }}>
    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: color ?? 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

/**
 * Step 3 — the operator confirms what is about to be written, including how many bulls the
 * ingestion will disqualify. Everything lands in a single transaction.
 */
export const Step3ProtocolSummary: React.FC<Step3ProtocolSummaryProps> = ({
  protocolNumber,
  veterinarianLabel,
  sampleDate,
  resultDate,
  sampleTypeLabel,
  sampleRound,
  selectedBullsCount,
  determinationsCount,
  positiveBullsCount,
  attachmentsCount,
}) => (
  <Stack spacing={2}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <MetricCard label="Reproductores" value={selectedBullsCount} />
      <MetricCard label="Determinaciones" value={determinationsCount} />
      <MetricCard
        label="Positivos (quedarán no aptos)"
        value={positiveBullsCount}
        color={positiveBullsCount > 0 ? 'error.main' : undefined}
      />
      <MetricCard label="Archivos de evidencia" value={attachmentsCount} />
    </Stack>

    <Card variant="outlined" sx={{ borderRadius: '8px' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Protocolo {protocolNumber}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        <Stack spacing={0.75}>
          <SummaryRow label="Profesional actuante" value={veterinarianLabel} />
          <SummaryRow label="Toma de muestra" value={sampleDate} />
          <SummaryRow label="Resultado" value={resultDate} />
          <SummaryRow label="Ensayo" value={`${sampleTypeLabel} · ${sampleRound}º muestreo`} />
        </Stack>
      </CardContent>
    </Card>

    <Alert severity="info" icon={<FuseSvgIcon size={18}>heroicons-outline:shield-check</FuseSvgIcon>} sx={{ fontSize: '0.8rem' }}>
      La ingestión es atómica: protocolo, determinaciones, hallazgos derivados y recálculo de
      aptitud se escriben juntos o no se escribe nada.
    </Alert>

    {positiveBullsCount > 0 && (
      <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
        {positiveBullsCount} reproductor(es) quedarán bloqueados para nuevas órdenes de servicio.
      </Alert>
    )}
  </Stack>
);

const SummaryRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
      {value}
    </Typography>
  </Box>
);

export default Step3ProtocolSummary;
