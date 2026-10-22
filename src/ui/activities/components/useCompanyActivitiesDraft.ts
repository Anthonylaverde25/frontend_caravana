import { useEffect, useState } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useUpdateCompanyActivitiesConfig } from '@/features/activities/hooks/useUpdateCompanyActivitiesConfig';

export interface ActivityDraft {
  id: number;
  name: string;
  code: string;
  isEnabled: boolean;
  isInitial: boolean;
  isFinal: boolean;
  sortOrder: number;
}

/**
 * The company's activity flow being edited: which activities it uses, in what order, which one
 * starts it and which one ends it. Nothing is sent until `save`.
 */
export function useCompanyActivitiesDraft(onSaved?: () => void) {
  const { activeCompanyId } = useCompany();
  const { data: activities = [], isLoading } = useActivities(activeCompanyId);
  const { mutate: updateConfig, isPending } = useUpdateCompanyActivitiesConfig();
  const [items, setItems] = useState<ActivityDraft[]>([]);

  useEffect(() => {
    if (activities.length > 0) {
      setItems(
        [...activities]
          .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
          .map((a, index) => ({
            id: a.id,
            name: a.name,
            code: a.code,
            isEnabled: !!a.isEnabled,
            isInitial: !!a.isInitial,
            isFinal: !!a.isFinal,
            sortOrder: a.sortOrder ?? index + 1,
          }))
      );
    }
  }, [activities]);

  const toggle = (id: number) =>
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== id) return item;
        const isEnabled = !item.isEnabled;

        return { ...item, isEnabled, isInitial: isEnabled ? item.isInitial : false, isFinal: isEnabled ? item.isFinal : false };
      });

      // A single enabled activity is both the start and the end of the flow.
      const enabled = updated.filter((i) => i.isEnabled);

      return enabled.length === 1 ? updated.map((i) => (i.id === enabled[0].id ? { ...i, isInitial: true, isFinal: true } : i)) : updated;
    });

  const setInitial = (id: number) => setItems((prev) => prev.map((item) => ({ ...item, isInitial: item.id === id })));

  const setFinal = (id: number) => setItems((prev) => prev.map((item) => ({ ...item, isFinal: item.id === id })));

  const move = (index: number, direction: 'up' | 'down') =>
    setItems((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;

      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];

      return copy.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    });

  const save = () => {
    if (!activeCompanyId) return;

    updateConfig(
      {
        companyId: activeCompanyId,
        config: items.map((item, idx) => ({
          activity_id: item.id,
          is_enabled: item.isEnabled,
          is_initial: item.isEnabled ? item.isInitial : false,
          is_final: item.isEnabled ? item.isFinal : false,
          sort_order: idx + 1,
        })),
      },
      { onSuccess: () => onSaved?.() }
    );
  };

  const pipeline = items.filter((i) => i.isEnabled);

  return { items, pipeline, isLoading, isPending, toggle, setInitial, setFinal, move, save };
}
