import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Box, Button, CircularProgress, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from '@/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBirthOrder } from '@/features/birth-orders/hooks/useBirthOrder';
import { useCreateBirthOrder, useIssueBirthOrder, useUpdateBirthOrderDraft } from '@/features/birth-orders/hooks/useBirthOrderMutations';
import BirthOrderSummaryCard from '../components/confirm/BirthOrderSummaryCard';
import BirthOrderFemalesList from '../components/confirm/BirthOrderFemalesList';
import { femaleFromOrderAnimal, type BirthRollFemale } from '../components/grid/birthRollTypes';
import { femaleFromCaravan } from '../components/start/usePregnantFemalesByBatch';
import { BirthOrderStart, startFromDraft, toOrderPayload } from '../components/start/birthOrderStart';

const actionSx = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

/**
 * The confirmation of "Nueva orden de parición" (`/birth-orders/new/confirm`). The order as a whole
 * was declared in the start dialog and is shown read-only ("Editar" goes back to it). An order only
 * lists its females: what happened to each one is learned at the rounds.
 */
export const BirthOrderConfirmView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);
  const draftId = Number(searchParams.get('orderId')) || null;
  const { data: draft } = useBirthOrder(draftId);
  const startPath = '/birth-orders/new';
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

  const create = useCreateBirthOrder();
  const update = useUpdateBirthOrderDraft();
  const issue = useIssueBirthOrder();

  const batches = useMemo(() => [...new Set(females.map((f) => f.batchName ?? 'Sin lote'))], [females]);
  const isPending = create.isPending || update.isPending || issue.isPending;
  const done = (orderId: number) => navigate(`/birth-orders?orderId=${orderId}`);

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

  return (
    <ViewLayout
      title={draftId ? `Borrador ${draft?.code ?? ''}` : 'Confirmar orden de parición'}
      subtitle="Revisá los vientres antes de emitir. La orden se cumple en las recorridas con la planilla PAR-01, o desde esta bandeja."
      backUrl="/birth-orders"
      backTitle="Órdenes de parición"
    >
      {isLoading || !start ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Stack spacing={2}>
          <BirthOrderSummaryCard start={start} batches={batches} onEdit={() => navigate(startPath, { state: start })} />

          <BirthOrderFemalesList females={females} />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => navigate('/birth-orders')} color="inherit" sx={actionSx}>
              Cancelar
            </Button>
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
          </Stack>
        </Stack>
      )}
    </ViewLayout>
  );
};

export default BirthOrderConfirmView;
