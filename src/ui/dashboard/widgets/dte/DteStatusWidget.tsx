import { useState } from 'react';
import { Box, Typography, Button, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { StackedBar } from '../../components/primitives/StackedBar';
import { StatusPill } from '../../components/primitives/StatusPill';
import { formatNumber } from '../../theme/formatters';
import { useDteMetrics } from './useDteMetrics';
import { useNavigate } from 'react-router';

type MetricMode = 'heads' | 'documents';

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

  const denominator = mode === 'heads' ? totalHeads : totalDtes;
  const calcPct = (val: number) => (denominator > 0 ? `${Math.round((val / denominator) * 100)} %` : '0 %');

  return (
    <WidgetCard
      title={instance.title ?? 'Control y Estado de DTe'}
      subtitle={`Total: ${formatNumber(totalDtes)} documentos amparando ${formatNumber(totalHeads)} cabezas de hacienda`}
      actions={actions}
      footnote="Datos en vivo sincronizados con órdenes de compra y DTe oficiales de SENASA."
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Visual Progress Stacked Bar */}
        <StackedBar segments={activeSegments} height={14} showLegend legendWithValues />

        {/* 4 Summary Metric Badges */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          {/* 1. En Tránsito */}
          <Box sx={{ p: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <StatusPill tone="info" label="En Tránsito" />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {calcPct(mode === 'heads' ? inTransit.heads : inTransit.dtes)}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1 }}>
              {mode === 'heads' ? `${formatNumber(inTransit.heads)} cab.` : `${inTransit.dtes} DTe`}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {mode === 'heads' ? `${inTransit.dtes} DTe en viaje` : `${formatNumber(inTransit.heads)} cabezas`}
            </Typography>
          </Box>

          {/* 2. Por Identificar */}
          <Box sx={{ p: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <StatusPill tone="warn" label="Por Identificar" />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {calcPct(mode === 'heads' ? inIdentification.heads : inIdentification.dtes)}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1 }}>
              {mode === 'heads' ? `${formatNumber(inIdentification.heads)} cab.` : `${inIdentification.dtes} DTe`}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {mode === 'heads' ? `${inIdentification.dtes} DTe recibidos` : `${formatNumber(inIdentification.heads)} cabezas`}
            </Typography>
          </Box>

          {/* 3. Completados */}
          <Box sx={{ p: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <StatusPill tone="ok" label="Completados" />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {calcPct(mode === 'heads' ? completed.heads : completed.dtes)}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1 }}>
              {mode === 'heads' ? `${formatNumber(completed.heads)} cab.` : `${completed.dtes} DTe`}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {mode === 'heads' ? `${completed.dtes} DTe conciliados` : `${formatNumber(completed.heads)} cabezas`}
            </Typography>
          </Box>

          {/* 4. Con Novedades */}
          <Box sx={{ p: 1.5, borderRadius: '8px', border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <StatusPill tone="bad" label="Con Novedades" />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {calcPct(mode === 'heads' ? withIncidents.heads : withIncidents.dtes)}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1 }}>
              {mode === 'heads' ? `${formatNumber(withIncidents.heads)} cab.` : `${withIncidents.dtes} DTe`}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {mode === 'heads' ? `${withIncidents.dtes} DTe observados` : `${formatNumber(withIncidents.heads)} cabezas`}
            </Typography>
          </Box>
        </Box>
      </Box>
    </WidgetCard>
  );
}

export default DteStatusWidget;
