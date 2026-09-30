import React, { useState } from 'react';
import { Box, Button, Chip, Collapse, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryOptionSelect from '@/components/caravan/CategoryOptionSelect';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { formatRange, pregnantToCull, weightOutOfRange } from '@/features/transfer-orders/zootechnicalFlags';
import type { CategoryTarget, TransferCategoryPlan } from '../../hooks/useTransferCategoryPlan';
import type { TransferableCaravan } from './transferMath';

interface TransferCategoryTargetsProps {
  plan: TransferCategoryPlan;
  caravans: TransferableCaravan[];
  selectedIds: number[];
  readOnly?: boolean;
  /** Code of the destination activity: a pregnant female to finishing is warned about. */
  destinationActivityCode?: string | null;
}

const SEX_LABEL: Record<string, string> = { M: 'Macho', H: 'Hembra' };

/**
 * The new C/S of each animal of a DECLARED order.
 *
 * Decided by group first — current category and sex — because that is how it is decided at
 * the desk ("the male calves become Novillito"). Any animal can then be adjusted on its own,
 * and a group whose animals were adjusted differently says so instead of pretending to agree.
 */
export const TransferCategoryTargets: React.FC<TransferCategoryTargetsProps> = ({
  plan,
  caravans,
  selectedIds,
  readOnly = false,
  destinationActivityCode = null
}) => {
  const [showAnimals, setShowAnimals] = useState(false);
  const { categories } = useAnimalCategories();
  const selected = caravans.filter((c) => selectedIds.includes(c.id));
  const byId = new Map(caravans.map((c) => [c.id, c]));

  /**
   * The warnings the backend will give, per animal: a pregnant female going to finishing or to a
   * cull subcategory, and a weight outside the range of the new category. Seen while deciding.
   */
  const flagsOf = (caravanId: number, target: CategoryTarget | null | undefined): string[] => {
    const caravan = byId.get(caravanId);

    if (!caravan) return [];

    const categoryId = target?.categoryId ?? caravan.category_id ?? null;
    const subcategoryId = target ? target.subcategoryId : (caravan.subcategory_id ?? null);
    const category = categories.find((c) => c.id === categoryId);
    const subcategoryCode = category?.subcategories?.find((s) => s.id === subcategoryId)?.code ?? null;
    const flags: string[] = [];

    if (pregnantToCull({ gestationMonths: caravan.active_gestation?.gestation_months, destinationActivityCode, subcategoryCode })) {
      flags.push(`preñada (${caravan.active_gestation?.gestation_months} m)`);
    }

    const range = target ? weightOutOfRange(category, caravan.current_weight != null ? Number(caravan.current_weight) : null) : null;

    if (range) flags.push(`fuera de rango ${formatRange(range)}`);

    return flags;
  };

  const groupWarnings = (caravanIds: number[]): string | null => {
    const all = caravanIds.map((id) => flagsOf(id, plan.targets[id]));
    const pregnant = all.filter((f) => f.some((x) => x.startsWith('preñada'))).length;
    const outOfRange = all.filter((f) => f.some((x) => x.startsWith('fuera'))).length;
    const parts = [
      pregnant && `${pregnant} preñada${pregnant > 1 ? 's' : ''} a terminación o descarte`,
      outOfRange && `${outOfRange} fuera del rango de peso`
    ].filter(Boolean);

    return parts.length ? parts.join(' · ') : null;
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" color="text.secondary">
        {plan.assignedCount} de {selectedIds.length} animal(es) cambian de categoría. Los que queden en «No cambia»
        conservan la suya.
      </Typography>

      {plan.groups.map((group) => {
        const mixed = group.sharedTarget === null && group.caravanIds.some((id) => plan.targets[id] != null);

        return (
          <Stack
            key={group.key}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ sm: 'center' }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 280 }}>
              <Typography sx={{ fontWeight: 700 }}>{group.categoryLabel}</Typography>
              {group.sex && <Chip size="small" label={SEX_LABEL[group.sex] ?? group.sex} />}
              <Typography variant="caption" color="text.secondary">
                {group.caravanIds.length} cab.
              </Typography>
            </Stack>

            <Typography color="text.disabled">→</Typography>

            <Box sx={{ flex: 1, maxWidth: 360 }}>
              <CategoryOptionSelect
                value={group.sharedTarget}
                onChange={(target) => plan.assignGroup(group.key, target)}
                sex={group.sex}
                placeholder={mixed ? 'Distinta por animal' : 'No cambia'}
                disabled={readOnly}
              />
            </Box>

            {groupWarnings(group.caravanIds) && (
              <Chip size="small" color="warning" variant="outlined" label={groupWarnings(group.caravanIds)} />
            )}
          </Stack>
        );
      })}

      <Box>
        <Button
          size="small"
          onClick={() => setShowAnimals((open) => !open)}
          endIcon={<ExpandMoreIcon sx={{ transform: showAnimals ? 'rotate(180deg)' : 'none' }} />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Ajustar por animal
        </Button>

        <Collapse in={showAnimals} unmountOnExit>
          <Stack spacing={1} sx={{ mt: 1, maxHeight: 360, overflowY: 'auto', pr: 1 }}>
            {selected.map((caravan) => (
              <Stack key={caravan.id} direction="row" spacing={1.5} alignItems="center">
                <Typography sx={{ fontFamily: 'monospace', minWidth: 140 }}>{caravan.identification}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>
                  {caravan.category_name ?? 'Sin categoría'}
                </Typography>
                <Box sx={{ flex: 1, maxWidth: 360 }}>
                  <CategoryOptionSelect
                    value={plan.targets[caravan.id] ?? null}
                    onChange={(target) => plan.assignAnimal(caravan.id, target)}
                    sex={caravan.sex ?? null}
                    disabled={readOnly}
                  />
                </Box>
                {flagsOf(caravan.id, plan.targets[caravan.id]).map((flag) => (
                  <Chip key={flag} size="small" color="warning" variant="outlined" label={flag} />
                ))}
              </Stack>
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Stack>
  );
};

export default TransferCategoryTargets;
