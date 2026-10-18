import { useMemo } from 'react';
import { useItem } from '@/features/items/hooks/useItems';
import { useUnitsOfMeasure } from '@/features/items/hooks/useUnitsOfMeasure';
import { InputOption, inputOptions } from '@/core/stock/domain/rules/lineConversion';

/** The unit and presentation choices of the item picked in a row (its file is cached per item). */
export function useItemInputOptions(itemId: number | null): { options: InputOption[]; unitSymbol: string | null } {
	const { data: item } = useItem(itemId);
	const { data: units = [] } = useUnitsOfMeasure();

	return useMemo(
		() => ({ options: item ? inputOptions(item.unit?.id, units, item.presentations) : [], unitSymbol: item?.unit?.symbol ?? null }),
		[item, units]
	);
}
