import type { Insemination } from '@/features/gestation/types/insemination';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { lotsInTank, type SemenOption } from '@/features/semen/hooks/useSemenOptions';

/** The lot of a row: a lot id, "Sin identificar" (sent without lot, IA8) or not chosen yet. */
export type LotChoice = number | 'NONE' | null;

/** What the sheet holds for one female while loading. */
export interface InseminationDraft {
  itemId: number | null;
  lot: LotChoice;
  straws: number;
  date: string;
  warehouseId: number | null;
  notes: string;
  /** Typed by hand: the defaults no longer overwrite it. */
  touched: boolean;
}

/** One female of the order on the sheet, with her live inseminations. */
export interface InseminationFemale {
  id: number;
  identification: string;
  plannedItemId: number | null;
  live: Insemination[];
}

export type InseminationFilter = 'pending' | 'inseminated' | 'all';
export const INSEMINATION_FILTERS: InseminationFilter[] = ['pending', 'inseminated', 'all'];
export const INSEMINATION_FILTER_LABELS: Record<InseminationFilter, string> = {
  pending: 'Pendientes',
  inseminated: 'Inseminadas',
  all: 'Todas',
};

export interface InseminationDefaults {
  date: string;
  warehouseId: number | null;
  straws: number;
  /** The lot chosen once per semen for the whole load (IATF: one lot for every cow). */
  lots: Record<number, LotChoice>;
}

/** The females of the order with their live inseminations, by ear tag. */
export function femalesOf(order: ServiceOrder, inseminations: Insemination[], tags: Map<number, string>): InseminationFemale[] {
  const live = inseminations.filter((i) => !i.voided_at);
  return (order.female_exposures ?? order.female_caravan_ids.map((id) => ({ female_caravan_id: id, planned_semen_item_id: null })))
    .map((exposure) => ({
      id: exposure.female_caravan_id,
      identification:
        tags.get(exposure.female_caravan_id) ??
        live.find((i) => i.female_caravan_id === exposure.female_caravan_id)?.identification ??
        `#${exposure.female_caravan_id}`,
      plannedItemId: exposure.planned_semen_item_id ?? null,
      live: live.filter((i) => i.female_caravan_id === exposure.female_caravan_id),
    }))
    .sort((a, b) => a.identification.localeCompare(b.identification));
}

/** The lot preloaded for a semen in a tank (SL5): the only lot with straws, or "Sin identificar" when none has. */
export function defaultLot(option: SemenOption | undefined, warehouseId: number | null): LotChoice {
  if (!option || !warehouseId) return null;
  const lots = lotsInTank(option, warehouseId);
  if (lots.length === 1) return lots[0].id;
  return lots.length === 0 ? 'NONE' : null;
}

export function draftFor(female: InseminationFemale, defaults: InseminationDefaults, byId: Map<number, SemenOption>): InseminationDraft {
  const itemId = female.plannedItemId ?? (byId.size === 1 ? [...byId.keys()][0] : null);
  return {
    itemId,
    lot: itemId && defaults.lots[itemId] !== undefined ? defaults.lots[itemId] : defaultLot(itemId ? byId.get(itemId) : undefined, defaults.warehouseId),
    straws: defaults.straws,
    date: defaults.date,
    warehouseId: defaults.warehouseId,
    notes: '',
    touched: false,
  };
}

/** What blocks a marked row before asking the server: the semen or the lot not chosen. */
export function missingOf(draft: InseminationDraft): Record<string, string> {
  const missing: Record<string, string> = {};
  if (!draft.itemId) missing.item_id = 'Elegí el semen.';
  else if (draft.lot === null) missing.semen_lot_id = 'Elegí la partida, o "Sin identificar" si no se sabe cuál.';
  if (!draft.warehouseId) missing.warehouse_id = 'Elegí el termo.';
  return missing;
}
