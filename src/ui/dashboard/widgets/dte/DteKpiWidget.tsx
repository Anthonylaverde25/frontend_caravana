import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StackedBar } from '../../components/primitives/StackedBar';
import { formatNumber } from '../../theme/formatters';
import { useDteMetrics } from './useDteMetrics';
import { CircularProgress, Box, Typography } from '@mui/material';

export function DteKpiWidget({ instance }: WidgetRenderProps) {
  const {
    totalDtes,
    inTransit,
    inIdentification,
    segmentsByHeads,
    isLoading,
    hasData,
  } = useDteMetrics();

  if (isLoading) {
    return (
      <KpiCard
        label={instance.title ?? 'DTe en Tránsito'}
        value="—"
        context="Cargando información..."
        visual={
          <Box sx={{ py: 1, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={20} />
          </Box>
        }
      />
    );
  }

  if (!hasData) {
    return (
      <KpiCard
        label={instance.title ?? 'DTe en Tránsito'}
        value="0"
        unit="cab."
        status={<StatusPill tone="neutral" label="Sin DTe" />}
        context={<Typography variant="caption" color="text.secondary">Sin movimientos registrados</Typography>}
      />
    );
  }

  const tone = inTransit.heads > 0 ? 'info' : 'ok';
  const statusLabel = inTransit.heads > 0 ? `${inTransit.dtes} en viaje` : 'Al día';

  return (
    <KpiCard
      label={instance.title ?? 'Hacienda en Tránsito (DTe)'}
      value={formatNumber(inTransit.heads)}
      unit="cab."
      status={<StatusPill tone={tone} label={statusLabel} />}
      visual={<StackedBar segments={segmentsByHeads} height={8} showLegend={false} />}
      context={
        <span>
          <strong>{inTransit.dtes}</strong> de {totalDtes} DTe activos · <strong>{formatNumber(inIdentification.heads)}</strong> por identificar
        </span>
      }
      footnote="Órdenes de entrada con DTe oficial · Datos en vivo"
    />
  );
}

export default DteKpiWidget;
