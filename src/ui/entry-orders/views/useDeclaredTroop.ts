import { useMemo } from 'react';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import { SEX_COMPOSITION_LABELS, TROOP_CONDITION_LABELS } from '@/features/entry-orders/types';
import { inheritedSexOf, needsCategoryPerAnimal } from '@/features/entry-orders/categoryLines';
import { headCountOf, type ExternalBatchFormValues } from '@/ui/batches/components/external/externalBatchSchema';
import type { TroopSummaryItem } from '../components/EntryTroopSummaryCard';
import type { ReceptionTroopContext } from '../components/reception/useReceptionRows';
import { formatDate, yesNo } from '../components/entryOrderFormat';

/**
 * A troop declared in the form but not saved yet, as the confirmation shows it: the ids resolved
 * to names, and what the reception grid needs. Names still loading show as "…"; nothing is guessed.
 */
export function useDeclaredTroop(values: ExternalBatchFormValues | null) {
  const { data: suppliers = [] } = useSuppliers();
  const { data: farms = [] } = useFarms(values?.provider_id);
  const { data: categories = [] } = useAnimalCategories();
  const { data: breeds = [] } = useBreeds();

  return useMemo(() => {
    if (!values) return null;

    const provider = suppliers.find((s) => s.id === values.provider_id);
    const farm = farms.find((f) => f.id === values.farm_id);
    const categoryLines = values.categories.map((line, index) => {
      const category = categories.find((c) => c.id === line.category_id);

      return { position: index + 1, name: category?.name ?? '…', sex: (category?.sex ?? null) as 'M' | 'H' | 'BOTH' | null, head: line.head_count };
    });
    const bought = categoryLines.map((c) => `${c.head} ${c.name}`).join(' + ');
    const breedLines = values.breeds.map((line, index) => {
      const breed = breeds.find((b) => b.id === line.breed_id);
      const color = breed?.colors?.find((c) => c.id === line.color_id);

      return {
        position: index + 1,
        letter: String.fromCharCode(65 + index),
        label: [breed?.name ?? '…', color?.name].filter(Boolean).join(' '),
        breedName: breed?.name ?? '…',
        colorName: color?.name ?? null
      };
    });
    const sexes =
      values.sex_composition === 'MIXED'
        ? `Ambos (${values.male_count} M / ${values.female_count} H)`
        : SEX_COMPOSITION_LABELS[values.sex_composition];
    const name = values.batch_name_mode === 'AUTO' ? `${values.auction_number}-(N° de orden)` : values.batch_name;

    const items: TroopSummaryItem[] = [
      { label: 'Proveedor', value: provider?.name ?? '…' },
      { label: 'Establecimiento', value: farm ? `${farm.name}${farm.renspa ? ` · ${farm.renspa}` : ''}` : '…' },
      { label: 'Subasta', value: values.auction_number || 'No' },
      { label: 'Lote', value: name },
      {
        label: 'Tropa',
        value: `${categoryLines.length > 1 ? `${headCountOf(values.categories)} cab. (${bought})` : bought} · ${sexes}`
      },
      { label: 'Razas', value: breedLines.map((b) => `${b.letter} · ${b.label}`).join(', ') },
      { label: 'Estado', value: TROOP_CONDITION_LABELS[values.condition] },
      { label: 'Edad', value: values.age_min_months != null ? `${values.age_min_months}/${values.age_max_months} meses` : 'Sin declarar' },
      {
        label: 'Peso',
        value: `${values.estimated_weight} kg${values.min_weight != null || values.max_weight != null ? ` (${values.min_weight ?? '—'}–${values.max_weight ?? '—'})` : ''}`
      },
      { label: 'Desbaste', value: values.shrink_percent != null ? `${values.shrink_percent} %` : 'Sin declarar' },
      { label: 'Sabe comer', value: yesNo(values.knows_to_eat) },
      { label: 'Garrapata (vacunado)', value: yesNo(values.tick_vaccinated) },
      { label: 'Fecha de compra', value: formatDate(values.purchase_date) }
    ];

    const context: ReceptionTroopContext = {
      isMixed: values.sex_composition === 'MIXED',
      breeds: breedLines,
      categories: categoryLines,
      // While a category is still loading its sex is unknown: the column is shown rather than hidden.
      needsCategory: categoryLines.some((c) => c.sex == null) ? categoryLines.length > 1 : needsCategoryPerAnimal(categoryLines, values.sex_composition),
      inheritedSex: inheritedSexOf(values.sex_composition),
      minWeight: values.min_weight,
      maxWeight: values.max_weight
    };

    return { items, context, subtitle: values.observations || undefined };
  }, [values, suppliers, farms, categories, breeds]);
}
