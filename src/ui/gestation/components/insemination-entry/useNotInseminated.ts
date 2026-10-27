import { useMemo, useState } from 'react';
import type { NotInseminatedReason, ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useServiceOrderDiagnosis } from '@/features/gestation/hooks/useServiceOrders';
import type { NotInseminatedReasonsPayload } from '@/features/gestation/hooks/useInseminations';

/** The never inseminated females of an AI order with their optional reasons, for ending or closing it. */
export function useNotInseminated(order: ServiceOrder | null) {
  const isAi = order?.service_method === 'AI';
  const { data: diagnosis } = useServiceOrderDiagnosis(isAi ? order?.id : null);
  const [reasons, setReasons] = useState<Record<number, NotInseminatedReason | null>>({});

  const females = useMemo(() => {
    if (!isAi || !order) return [];
    const tags = new Map((diagnosis?.females ?? []).map((f) => [f.female_caravan_id, f.identification]));
    return (order.female_exposures ?? [])
      .filter((e) => !e.last_insemination_on)
      .map((e) => ({ id: e.female_caravan_id, identification: tags.get(e.female_caravan_id) ?? `#${e.female_caravan_id}` }));
  }, [isAi, order, diagnosis]);

  const payload = (): NotInseminatedReasonsPayload => females.map((f) => ({ female_caravan_id: f.id, reason: reasons[f.id] ?? null }));

  return {
    females,
    reasons,
    setReason: (id: number, reason: NotInseminatedReason | null) => setReasons((prev) => ({ ...prev, [id]: reason })),
    payload,
  };
}
