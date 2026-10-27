import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useOrderInseminations } from '@/features/gestation/hooks/useInseminations';
import { formatDay } from '../../utils/reproductiveVerdict';

interface ServiceOrderInseminationsPanelProps {
  order: ServiceOrder | null;
}

/**
 * The inseminations of an AI order (semen S-B), read-only: day, sire, lot, straws, tank and the
 * consumption that took them out. Voided ones stay, struck through, with their reason.
 */
export function ServiceOrderInseminationsPanel({ order }: ServiceOrderInseminationsPanelProps) {
  const isAi = order?.service_method === 'AI';
  const { data: inseminations = [] } = useOrderInseminations(isAi ? order?.id : null);
  if (!isAi) return null;

  const summary = order?.insemination_summary;

  return (
    <>
      <Divider sx={{ my: 2.5 }} />
      <Box sx={{ mb: 1.5, pl: 1, borderLeft: (theme) => `3px solid ${theme.palette.primary.main}` }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
          Inseminaciones · {summary?.inseminated ?? 0} de {summary?.females ?? 0} vientres
        </Typography>
      </Box>
      <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        {inseminations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Todavía no se cargaron inseminaciones.
          </Typography>
        ) : (
          inseminations.map((i, index) => (
            <Stack
              key={i.id}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ px: 2, py: 1, borderTop: index === 0 ? 0 : 1, borderColor: 'divider', opacity: i.voided_at ? 0.55 : 1 }}
            >
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', fontSize: '0.8rem', minWidth: 90 }}>
                {i.identification}
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, textDecoration: i.voided_at ? 'line-through' : 'none' }} noWrap>
                  {formatDay(i.inseminated_on)} · {i.sire_name ?? i.item_name} · {i.lot_code ?? 'sin identificar'} · {i.straws_used} paj.
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap component="div">
                  {i.voided_at ? `Anulada: ${i.void_reason}` : `${i.warehouse_code ?? ''}${i.document_number ? ` · consumo N.º ${i.document_number}` : ''}`}
                </Typography>
              </Box>
            </Stack>
          ))
        )}
      </Paper>
    </>
  );
}

export default ServiceOrderInseminationsPanel;
