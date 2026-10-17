import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { verdictChip } from '@/ui/gestation/utils/reproductiveVerdict';

interface ServiceOrderFemalesVerdictTableProps {
  order: ServiceOrder;
  caravans: { id: number; identification: string; category?: string | null; active_gestation?: { gestation_stage?: string | null } | null }[];
}

/**
 * Females of the order with their verdict for THIS order: pregnant (with stage only when declared),
 * empty, provisional empty, without diagnosis, pending. "Empty" and "not checked" are never mixed.
 */
export default function ServiceOrderFemalesVerdictTable({ order, caravans }: ServiceOrderFemalesVerdictTableProps) {
  const byId = new Map(caravans.map((caravan) => [caravan.id, caravan]));
  const provisional = new Set(order.diagnosis_summary?.provisional_empty_female_ids ?? []);
  const rows = (order.female_exposures ?? []).map((exposure) => ({ exposure, caravan: byId.get(exposure.female_caravan_id) }));
  const headSx = { fontSize: '0.68rem', fontWeight: 800, py: 1 };

  return (
    <TableContainer sx={{ maxHeight: 240 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headSx}>Caravana</TableCell>
            <TableCell sx={headSx}>Categoría</TableCell>
            <TableCell sx={headSx}>Diagnóstico en esta orden</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(({ exposure, caravan }) => {
            const chip = verdictChip({
              reproductive_status: exposure.reproductive_status ?? 'UNCHECKED',
              gestation_stage: caravan?.active_gestation?.gestation_stage ?? null,
              is_provisional_empty: provisional.has(exposure.female_caravan_id),
            });
            return (
              <TableRow key={exposure.female_caravan_id} hover>
                <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, py: 1, fontFamily: 'monospace', color: 'primary.main' }}>
                  {caravan?.identification ?? `#${exposure.female_caravan_id}`}
                </TableCell>
                <TableCell sx={{ fontSize: '0.72rem', py: 1 }}>{caravan?.category || 'Vientre'}</TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip label={chip.label} size="small" color={chip.color} variant="outlined" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }} />
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ fontStyle: 'italic', py: 2 }}>
                Sin vientres asignados en esta orden.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
