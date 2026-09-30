import { useCallback, useMemo, useState } from 'react';
import type { CategoryPairValue } from '@/components/caravan/CategoryChangeCell';
import type {
  EmitWeaningOrderPayload,
  RegisterWeaningPayload,
  WeaningDestinationMode,
  WeaningOrder,
  WeaningOrderCategoryMode,
  WeaningType
} from '@/features/weaning-orders/types';

export type WeaningFormMode = 'order' | 'register';

/** One weaning batch the screen declares: an existing one, or the name of one to create. */
export interface DestinationDraft {
  key: string;
  kind: 'existing' | 'new';
  batchId: number | null;
  name: string;
  /** Only for a new batch: corral, pasture, or left for the scan (orders only). */
  isConfined: boolean | null;
}

/** What the screen says about one calf. */
export interface CalfDraft {
  destinationKey: string | null;
  category: CategoryPairValue | null;
  weight: string;
  observations: string;
}

/**
 * What the "Nueva orden de destete" / "Registrar destete" dialog declares, carried to the
 * confirmation and back ("Editar"). Partos only sends the calves.
 */
export interface WeaningOrderStart {
  /** The draft being edited, when there is one. */
  orderId?: number | null;
  /** Its code, to name it while it is edited. */
  orderCode?: string | null;
  calfIds: number[];
  destinationMode?: WeaningDestinationMode;
  /** One for all, or the batches the calves are assigned to one by one. */
  destinations?: DestinationDraft[];
  header?: WeaningFormHeader;
  categoryMode?: WeaningOrderCategoryMode;
  /** What the confirmation already said per calf: kept across "Editar". */
  calves?: Record<number, CalfDraft>;
}

export interface WeaningFormHeader {
  weaningDate: string;
  weaningType: WeaningType | '';
  responsable: string;
  observations: string;
}

const today = (): string => new Date().toISOString().slice(0, 10);

let destinationSequence = 0;

export const newDestination = (): DestinationDraft => {
  destinationSequence += 1;

  return { key: `d${Date.now()}-${destinationSequence}`, kind: 'existing', batchId: null, name: '', isConfined: null };
};

const emptyCalf = (): CalfDraft => ({ destinationKey: null, category: null, weight: '', observations: '' });

export const destinationIsDeclared = (d: DestinationDraft): boolean =>
  d.kind === 'existing' ? d.batchId != null : d.name.trim() !== '';

/**
 * The state of the weaning form, shared by "Nueva orden de destete" and "Registrar destete": which
 * calves, where they go (one batch for all or one per calf), whether their category changes, and —
 * only when registering — what the chute measured.
 */
export function useWeaningOrderForm(mode: WeaningFormMode) {
  const [header, setHeader] = useState<WeaningFormHeader>({
    weaningDate: today(),
    weaningType: '',
    responsable: '',
    observations: ''
  });
  const [destinationMode, setDestinationMode] = useState<WeaningDestinationMode>('single');
  const [categoryMode, setCategoryMode] = useState<WeaningOrderCategoryMode>('KEEP');
  const [destinations, setDestinations] = useState<DestinationDraft[]>([newDestination()]);
  const [calfIds, setCalfIds] = useState<number[]>([]);
  const [calves, setCalves] = useState<Record<number, CalfDraft>>({});

  const setHeaderField = useCallback(<K extends keyof WeaningFormHeader>(field: K, value: WeaningFormHeader[K]) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addCalves = useCallback((ids: number[]) => {
    setCalfIds((prev) => [...prev, ...ids.filter((id) => !prev.includes(id))]);
    setCalves((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] ??= emptyCalf();
      });

      return next;
    });
  }, []);

  const removeCalf = useCallback((id: number) => setCalfIds((prev) => prev.filter((c) => c !== id)), []);

  const updateCalf = useCallback((id: number, patch: Partial<CalfDraft>) => {
    setCalves((prev) => ({ ...prev, [id]: { ...(prev[id] ?? emptyCalf()), ...patch } }));
  }, []);

  const updateDestination = useCallback((key: string, patch: Partial<DestinationDraft>) => {
    setDestinations((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }, []);

  const addDestination = useCallback(() => setDestinations((prev) => [...prev, newDestination()]), []);

  const removeDestination = useCallback((key: string) => {
    setDestinations((prev) => (prev.length > 1 ? prev.filter((d) => d.key !== key) : prev));
    setCalves((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, calf]) => [id, calf.destinationKey === key ? { ...calf, destinationKey: null } : calf])
      )
    );
  }, []);

  /** The confirmation starts from what the start dialog declared. */
  const applyStart = useCallback((start: WeaningOrderStart) => {
    const keys = new Set((start.destinations ?? []).map((d) => d.key));

    if (start.destinationMode) setDestinationMode(start.destinationMode);
    // A batch per calf may declare none: every batch is written at the chute.
    if (start.destinations && (start.destinations.length > 0 || start.destinationMode === 'per_animal')) setDestinations(start.destinations);
    if (start.header) setHeader(start.header);
    if (start.categoryMode) setCategoryMode(start.categoryMode);
    setCalfIds(start.calfIds);
    setCalves((prev) =>
      Object.fromEntries(
        start.calfIds.map((id) => {
          const calf = start.calves?.[id] ?? prev[id] ?? emptyCalf();

          // A calf keeps its batch only while that batch is still declared.
          return [id, calf.destinationKey && !keys.has(calf.destinationKey) ? { ...calf, destinationKey: null } : calf];
        })
      )
    );
  }, []);

  /** Everything declared so far, to go back to the start dialog and change it. */
  const toStart = (orderId: number | null, orderCode: string | null = null): WeaningOrderStart => ({
    orderId,
    orderCode,
    calfIds,
    destinationMode,
    destinations: activeDestinations,
    header,
    categoryMode,
    calves
  });

  /** A draft being edited: everything it declared, back on the screen. */
  const hydrate = useCallback((order: WeaningOrder) => {
    const keyByOrderKey = new Map<string, string>();
    const drafts = order.destinations.map((d) => {
      const draft: DestinationDraft = {
        ...newDestination(),
        kind: d.target_batch_id ? 'existing' : 'new',
        batchId: d.target_batch_id,
        name: d.new_batch_name ?? d.label,
        isConfined: d.is_confined
      };
      keyByOrderKey.set(d.key, draft.key);

      return draft;
    });

    setHeader({
      weaningDate: order.weaning_date,
      weaningType: order.weaning_type ?? '',
      responsable: order.responsable ?? '',
      observations: order.observations ?? ''
    });
    setDestinationMode(order.destination_mode);
    setCategoryMode(order.category_mode);
    setDestinations(drafts.length > 0 || order.destination_mode === 'per_animal' ? drafts : [newDestination()]);
    setCalfIds(order.animals.map((a) => a.caravan_id));
    setCalves(
      Object.fromEntries(
        order.animals.map((a) => [
          a.caravan_id,
          {
            ...emptyCalf(),
            destinationKey: a.destination_key ? (keyByOrderKey.get(a.destination_key) ?? null) : null,
            category: a.target_category_id ? { categoryId: a.target_category_id, subcategoryId: a.target_subcategory_id } : null
          }
        ])
      )
    );
  }, []);

  const activeDestinations = destinationMode === 'single' ? destinations.slice(0, 1) : destinations;

  /** What stops the form from being sent, in plain words; empty when it can go. */
  const problems = useMemo(() => {
    const list: string[] = [];

    if (calfIds.length === 0) list.push('Elegí al menos una cría.');
    if (!header.weaningDate) list.push('Indicá la fecha del destete.');
    if (mode === 'register' && header.weaningDate > today()) list.push('La fecha de un destete registrado no puede ser futura.');
    if (activeDestinations.some((d) => !destinationIsDeclared(d))) list.push('Completá cada lote de destete: uno existente o el nombre de uno nuevo.');

    if (mode === 'register') {
      if (activeDestinations.some((d) => d.kind === 'new' && d.isConfined === null)) {
        list.push('Indicá si cada lote de destete nuevo es a corral o a pastura.');
      }
      if (destinationMode === 'per_animal' && calfIds.some((id) => !calves[id]?.destinationKey)) {
        list.push('En un destete registrado cada cría dice a qué lote fue.');
      }
    }

    if (categoryMode === 'DECLARED' && !calfIds.some((id) => calves[id]?.category)) {
      list.push('La categoría cambia: asigná la C/S nueva al menos a una cría, o elegí "No cambia".');
    }

    return list;
  }, [calfIds, calves, header, mode, activeDestinations, destinationMode, categoryMode]);

  const destinationPayload = () =>
    activeDestinations.map((d) => ({
      key: d.key,
      label: d.kind === 'new' ? d.name.trim() : '',
      target_batch_id: d.kind === 'existing' ? d.batchId : null,
      new_batch_name: d.kind === 'new' ? d.name.trim() : null,
      is_confined: d.kind === 'new' ? d.isConfined : null
    }));

  const animalPayload = (id: number) => {
    const calf = calves[id] ?? emptyCalf();
    const category = categoryMode === 'DECLARED' ? calf.category : null;

    return {
      caravan_id: id,
      destination_key: destinationMode === 'single' ? activeDestinations[0]?.key ?? null : calf.destinationKey,
      target_category_id: category?.categoryId ?? null,
      target_subcategory_id: category?.subcategoryId ?? null
    };
  };

  const toOrderPayload = (issue: boolean): EmitWeaningOrderPayload => ({
    destination_mode: destinationMode,
    category_mode: categoryMode,
    weaning_date: header.weaningDate,
    weaning_type: header.weaningType || null,
    responsable: header.responsable.trim() || null,
    observations: header.observations.trim() || null,
    destinations: destinationPayload(),
    animals: calfIds.map(animalPayload),
    issue
  });

  const toRegisterPayload = (): RegisterWeaningPayload => {
    const { issue: _issue, ...order } = toOrderPayload(true);

    return {
      ...order,
      animals: calfIds.map((id) => {
        const weight = calves[id]?.weight.trim().replace(',', '.') ?? '';

        return {
          ...animalPayload(id),
          weight: weight !== '' ? Number(weight) : null,
          observations: calves[id]?.observations.trim() || null
        };
      })
    };
  };

  return {
    mode,
    header,
    setHeaderField,
    destinationMode,
    setDestinationMode,
    categoryMode,
    setCategoryMode,
    destinations,
    activeDestinations,
    addDestination,
    updateDestination,
    removeDestination,
    calfIds,
    calves,
    addCalves,
    removeCalf,
    updateCalf,
    hydrate,
    applyStart,
    toStart,
    problems,
    toOrderPayload,
    toRegisterPayload
  };
}

export type WeaningOrderFormState = ReturnType<typeof useWeaningOrderForm>;
