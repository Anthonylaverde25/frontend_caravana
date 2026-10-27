import { useMemo } from 'react';
import { SemenInventoryRow } from '@/core/semen/domain/entities/Semen';
import { useSemenInventory } from './useSemen';

/** An active semen to pick in an AI order: sire and type, with its lots per tank. */
export interface SemenOption {
  itemId: number;
  label: string;
  sireName: string;
  typeLabel: string;
  row: SemenInventoryRow;
}

/** Lots of a semen with what each holds in one tank, for the lot picker (IA8). */
export function lotsInTank(option: SemenOption | undefined, warehouseId: number | null): { id: number; code: string; quantity: number }[] {
  if (!option || !warehouseId) return [];
  return option.row.lots
    .map((lot) => ({ id: lot.id, code: lot.code, quantity: Number(lot.balances.find((b) => b.warehouse.id === warehouseId)?.quantity ?? 0) }))
    .filter((lot) => lot.quantity > 0);
}

/** The active semen items of the company (semen S-B), from the semen inventory. */
export function useSemenOptions() {
  const query = useSemenInventory({ includeInactive: false });
  const options = useMemo<SemenOption[]>(
    () =>
      (query.data ?? [])
        .filter((row) => row.item.isActive)
        .map((row) => ({
          itemId: row.item.id,
          label: `${row.sire.name} · ${row.semenType.label}`,
          sireName: row.sire.name,
          typeLabel: row.semenType.label,
          row,
        })),
    [query.data]
  );
  const byId = useMemo(() => new Map(options.map((o) => [o.itemId, o])), [options]);

  return { options, byId, isLoading: query.isLoading };
}
