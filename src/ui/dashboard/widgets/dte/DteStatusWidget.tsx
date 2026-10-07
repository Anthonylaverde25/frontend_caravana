import { useState } from 'react';
import { Box, Typography, Button, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { StackedBar } from '../../components/primitives/StackedBar';
import { StatusPill } from '../../components/primitives/StatusPill';
import { SimpleColumn, SimpleTable } from '../../components/primitives/SimpleTable';
import { formatNumber } from '../../theme/formatters';
import { useDteMetrics, DteTableItem, DteLifecycleStatus } from './useDteMetrics';
import { StatusTone } from '../../theme/dashboardTokens';
import { useNavigate } from 'react-router';

type MetricMode = 'heads' | 'documents';

const STATUS_TONES: Record<DteLifecycleStatus, StatusTone> = {
  IN_TRANSIT: 'info',
  IN_IDENTIFICATION: 'warn',
  COMPLETED: 'ok',
  INCIDENT: 'bad',
};

const COLUMNS: SimpleColumn<DteTableItem>[] = [
  {
    key: 'dte',
    header: 'Nº DTe',
    render: (r) => <strong>{r.dteNumber}</strong>,
  },
  {
    key: 'order',
    header: 'Orden',
    render: (r) => r.orderCode,
  },
  {
    key: 'provider',
    header: 'Proveedor / Origen',
    render: (r) => r.providerName,
  },
  {
    key: 'heads',
    header: 'Cabezas (Rec. / Decl.)',
    align: 'right',
    render: (r) => (
      <span>
        <strong>{formatNumber(r.receivedHeads)}</strong> de {formatNumber(r.declaredHeads)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (r) => <StatusPill tone={STATUS_TONES[r.status]} label={r.statusLabel} />,
  },
  {
    key: 'date',
    header: 'Fecha',
    align: 'right',
    render: (r) => r.dteDate,
  },
];

export function DteStatusWidget({ instance }: WidgetRenderProps) {
  const [mode, setMode] = useState<MetricMode>('heads');
  const {
    totalDtes,
    totalHeads,
    inTransit,
    inIdentification,
    completed,
    withIncidents,
    segmentsByHeads,
    segmentsByDtes,
    recentDtes,
    isLoading,
    hasData,
  } = useDteMetrics();
  const navigate = useNavigate();

  const activeSegments = mode === 'heads' ? segmentsByHeads : segmentsByDtes;

  const actions = (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={(_, val) => val && setMode(val)}
      size="small"
      sx={{ height: 26 }}
    >
      <ToggleButton value="heads" sx={{ px: 1, py: 0.2, fontSize: '0.72rem', textTransform: 'none' }}>
        Cabezas
      </ToggleButton>
      <ToggleButton value="documents" sx={{ px: 1, py: 0.2, fontSize: '0.72rem', textTransform: 'none' }}>
        DTe
      </ToggleButton>
    </ToggleButtonGroup>
  );

  if (isLoading) {
    return (
      <WidgetCard title={instance.title ?? 'Control y Estado de DTe'} subtitle="Cargando información en vivo...">
        <Box sx={{ py: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={28} />
        </Box>
      </WidgetCard>
    );
  }

  if (!hasData) {
    return (
      <WidgetCard
        title={instance.title ?? 'Control y Estado de DTe'}
        subtitle="Contabilización de tropas en tránsito y documentos oficiales de SENASA"
      >
        <Box sx={{ py: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            No se registran DTe ni órdenes de ingreso activas en esta empresa.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/entry-orders')}
            sx={{ textTransform: 'none', borderRadius: '6px' }}
          >
            Registrar primer ingreso / Cargar DTe
          </Button>
        </Box>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title={instance.title ?? 'Control y Estado de DTe'}
      subtitle={`Total: ${formatNumber(totalDtes)} documentos amparando ${formatNumber(totalHeads)} cabezas de hacienda`}
      actions={actions}
      footnote="Datos en vivo sincronizados con el registro oficial de Órdenes de Entrada (ING-02/DTe)."
      flush
    >
      <Box sx={{ px: 3, pt: 2, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Visual Progress Stacked Bar */}
        <StackedBar segments={activeSegments} height={14} showLegend legendWithValues />

        {/* 4 Summary Metric Badges */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          <Box sx={{ p: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider' }}>
            <Box sx={{ mb: 0.8 }}>
              <StatusPill tone="info" label="En Tránsito" />
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1 }}>
              {mode === 'heads' ? `${formatNumber(inTransit.heads)} cab.` : `${inTransit.dtes} DTe`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {mode === 'heads' ? `${inTransit.dtes} DTe en viaje` : `${formatNumber(inTransit.heads)} cabezas`}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider' }}>
            <Box sx={{ mb: 0.8 }}>
              <StatusPill tone="warn" label="Por Identificar" />
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1 }}>
              {mode === 'heads' ? `${formatNumber(inIdentification.heads)} cab.` : `${inIdentification.dtes} DTe`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {mode === 'heads' ? `${inIdentification.dtes} DTe recibidos` : `${formatNumber(inIdentification.heads)} cabezas`}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider' }}>
            <Box sx={{ mb: 0.8 }}>
              <StatusPill tone="ok" label="Completados" />
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1 }}>
              {mode === 'heads' ? `${formatNumber(completed.heads)} cab.` : `${completed.dtes} DTe`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {mode === 'heads' ? `${completed.dtes} DTe conciliados` : `${formatNumber(completed.heads)} cabezas`}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider' }}>
            <Box sx={{ mb: 0.8 }}>
              <StatusPill tone="bad" label="Con Novedades" />
            </Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1 }}>
              {mode === 'heads' ? `${formatNumber(withIncidents.heads)} cab.` : `${withIncidents.dtes} DTe`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {mode === 'heads' ? `${withIncidents.dtes} DTe con faltante/sobrante` : `${formatNumber(withIncidents.heads)} cabezas`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Recent DTE Documents Table */}
      <SimpleTable columns={COLUMNS} rows={recentDtes} getRowKey={(r) => r.id} />
    </WidgetCard>
  );
}

export default DteStatusWidget;
