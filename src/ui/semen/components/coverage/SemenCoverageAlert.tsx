import { Alert, Stack } from '@mui/material';
import { useSemenCoverage } from '@/features/gestation/hooks/useInseminations';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';

interface SemenCoverageAlertProps {
  /** Straws this screen expects per semen item (the new order, or the rows being loaded). */
  straws: Record<number, number>;
  byId: Map<number, SemenOption>;
  /** Count the open orders' expectation too (the start dialog); the loading sheet already belongs to one. */
  includeCommitted?: boolean;
}

/**
 * Will the semen be enough? (P4, IA5). One compact line per semen that falls short. Informative: it
 * never blocks and nothing is reserved.
 */
export default function SemenCoverageAlert({ straws, byId, includeCommitted = true }: SemenCoverageAlertProps) {
  const itemIds = Object.keys(straws).map(Number);
  const { data = [] } = useSemenCoverage(itemIds, straws);

  const short = data
    .map((c) => {
      const committed = includeCommitted ? c.committed : 0;
      const shortage = Math.max(0, committed + c.extra - c.balance);
      return { ...c, committed, shortage };
    })
    .filter((c) => c.shortage > 0);
  if (short.length === 0) return null;

  return (
    <Stack spacing={0.75}>
      {short.map((c) => (
        <Alert key={c.item_id} severity="warning" sx={{ fontSize: '0.8rem', py: 0.5 }}>
          <strong>{byId.get(c.item_id)?.label ?? `Semen ${c.item_id}`}</strong>: faltan {c.shortage} pajuelas (hay {c.balance} en termos
          {c.committed > 0 ? `; ${c.committed} comprometidas en otras órdenes` : ''}; {c.extra} acá). No se bloquea: se descuenta al inseminar.
        </Alert>
      ))}
    </Stack>
  );
}
