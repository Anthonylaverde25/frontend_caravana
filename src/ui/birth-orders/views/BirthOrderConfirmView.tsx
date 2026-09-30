import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from '@/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBirthOrder } from '@/features/birth-orders/hooks/useBirthOrder';
import {
  useCreateBirthOrder,
  useIssueBirthOrder,
  useRegisterBirths,
  useUpdateBirthOrderDraft
} from '@/features/birth-orders/hooks/useBirthOrderMutations';
import { birthRowErrors } from '@/features/birth-orders/types';
import BirthOrderSummaryCard from '../components/confirm/BirthOrderSummaryCard';
import BirthOrderFemalesList from '../components/confirm/BirthOrderFemalesList';
import BirthRollGrid from '../components/grid/BirthRollGrid';
import { cellErrorsByFemale, femaleFromOrderAnimal, type BirthRollFemale } from '../components/grid/birthRollTypes';
import { useBirthRollState } from '../components/grid/useBirthRollState';
import { femaleFromCaravan } from '../components/start/usePregnantFemalesByBatch';
import { BirthFormMode, BirthOrderStart, startFromDraft, toOrderPayload } from '../components/start/birthOrderStart';

const actionSx = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

/**
 * The confirmation of "Nueva orden de parición" and "Registrar partos" (`…/confirm`). The order as a
 * whole was declared in the start dialog and is shown read-only ("Editar" goes back to it).
 *
 * An order only lists its females: what happened to each one is learned at the rounds. A
 * registration asks it here, female by female, in the calving grid.
 */
export const BirthOrderConfirmView: React.FC<{ mode: BirthFormMode }> = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);
  const draftId = mode === 'order' ? Number(searchParams.get('orderId')) || null : null;
  const { data: draft } = useBirthOrder(draftId);
  const startPath = mode === 'register' ? '/birth-orders/register' : '/birth-orders/new';
  const [start, setStart] = useState<BirthOrderStart | null>((location.state as BirthOrderStart | null)?.motherIds ? (location.state as BirthOrderStart) : null);

  // Without the dialog's state, a draft is reopened from the server; without either, back to the dialog.
  useEffect(() => {
    if (start) return;

    if (draftId) {
      if (draft) setStart(startFromDraft(draft));

      return;
    }

    navigate(startPath, { replace: true });
  }, [start, draft, draftId]);

  const females = useMemo<BirthRollFemale[]>(() => {
    if (!start) return [];

    const byId = new Map(caravans.map((c) => [c.id, c]));
    const fromDraft = new Map((draft?.animals ?? []).map((a) => [a.caravan_id, a]));

    return start.motherIds
      .map((id) => (byId.get(id) ? femaleFromCaravan(byId.get(id)!) : fromDraft.get(id) ? femaleFromOrderAnimal(fromDraft.get(id)!) : null))
      .filter((f): f is BirthRollFemale => f !== null);
  }, [start, caravans, draft]);

  const roll = useBirthRollState(females);
  const create = useCreateBirthOrder();
  const update = useUpdateBirthOrderDraft();
  const issue = useIssueBirthOrder();
  const register = useRegisterBirths();
  const errors = useMemo(() => cellErrorsByFemale(birthRowErrors(register.error), females), [register.error, females]);

  const batches = useMemo(() => [...new Set(females.map((f) => f.batchName ?? 'Sin lote'))], [females]);
  const isPending = create.isPending || update.isPending || issue.isPending || register.isPending;
  const done = (orderId: number) => navigate(`/birth-orders?orderId=${orderId}`);

  const removeFemale = (id: number) => setStart((prev) => (prev ? { ...prev, motherIds: prev.motherIds.filter((m) => m !== id) } : prev));

  const saveOrder = (andIssue: boolean) => {
    if (!start) return;

    if (draftId) {
      update.mutate(
        { id: draftId, payload: toOrderPayload(start, false) },
        { onSuccess: (order) => (andIssue ? issue.mutate(order.id, { onSuccess: () => done(order.id) }) : done(order.id)) }
      );
      return;
    }

    create.mutate(toOrderPayload(start, andIssue), { onSuccess: (order) => done(order.id) });
  };

  const registerBirths = () => {
    if (!start) return;

    register.mutate(
      { ...toOrderPayload(start, false), animals: roll.payload() },
      { onSuccess: (result) => done(result.order.id) }
    );
  };

  const registerBlocked = females.length === 0 || roll.unresolved > 0 || roll.problems.length > 0;

  return (
    <ViewLayout
      title={mode === 'register' ? 'Registrar partos' : draftId ? `Borrador ${draft?.code ?? ''}` : 'Confirmar orden de parición'}
      subtitle={
        mode === 'register'
          ? 'Indicá qué pasó con cada vientre. Se registra con su orden, ejecutada. Quitá los que todavía no parieron.'
          : 'Revisá los vientres antes de emitir. La orden se cumple en las recorridas con la planilla PAR-01, o desde esta bandeja.'
      }
      backUrl="/birth-orders"
      backTitle="Órdenes de parición"
    >
      {isLoading || !start ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Stack spacing={2}>
          <BirthOrderSummaryCard mode={mode} start={start} batches={batches} onEdit={() => navigate(startPath, { state: start })} />

          {mode === 'register' ? (
            <BirthRollGrid females={females} state={roll} errors={errors} onRemove={removeFemale} />
          ) : (
            <BirthOrderFemalesList females={females} />
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => navigate('/birth-orders')} color="inherit" sx={actionSx}>
              Cancelar
            </Button>
            {mode === 'order' ? (
              <>
                <Button variant="outlined" disabled={isPending || females.length === 0} onClick={() => saveOrder(false)} sx={actionSx}>
                  {draftId ? 'Guardar cambios' : 'Guardar borrador'}
                </Button>
                <Button
                  variant="contained"
                  disableElevation
                  disabled={isPending || females.length === 0}
                  onClick={() => saveOrder(true)}
                  startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:paper-airplane</FuseSvgIcon>}
                  sx={actionSx}
                >
                  {draftId ? 'Guardar y emitir' : 'Crear y emitir orden'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                disableElevation
                disabled={isPending || registerBlocked}
                onClick={registerBirths}
                startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
                sx={actionSx}
              >
                {roll.unresolved > 0 ? `Faltan ${roll.unresolved} vientre(s) sin resultado` : `Registrar ${females.length} vientre(s)`}
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ViewLayout>
  );
};

export default BirthOrderConfirmView;
