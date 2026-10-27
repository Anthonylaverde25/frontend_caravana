import { useMemo, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { usePendingPaternities } from '@/features/paternity/hooks/usePendingPaternities';
import PaternityGrid from '../components/paternity/PaternityGrid';
import PaternityToolbar from '../components/paternity/PaternityToolbar';
import { calfTag, groupByOrder } from '../components/paternity/paternityModel';
import { usePaternityState } from '../components/paternity/usePaternityState';
import { usePaternitySubmit } from '../components/paternity/usePaternitySubmit';

/**
 * "Paternidad pendiente": the calves born without a confirmed sire — their mother was served by
 * more than one bull, or the sire was never confirmed — grouped by service order. The user picks
 * the sire among the bulls that were with the mother (or any other male) and how it was identified.
 */
export default function PaternityView() {
  const { activeCompanyId } = useCompany();
  const { data: calves = [], isLoading } = usePendingPaternities();
  const { data: caravans = [] } = useCaravans(activeCompanyId);
  const state = usePaternityState();
  const { submit, isSaving } = usePaternitySubmit(state);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('all');

  const males = useMemo(
    () => caravans.filter((c) => c.sex === 'M' && c.id).map((c) => ({ id: c.id as number, identification: c.identification })),
    [caravans]
  );
  const allGroups = useMemo(() => groupByOrder(calves), [calves]);
  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    return groupByOrder(
      calves.filter(
        (calf) =>
          (order === 'all' || String(calf.service_order_id ?? 'none') === order) &&
          (term === '' || `${calfTag(calf)} ${calf.mother_identification ?? ''}`.toLowerCase().includes(term))
      )
    );
  }, [calves, search, order]);
  const shownIds = groups.flatMap((group) => group.calves.map((calf) => calf.calf_id));

  return (
    <ViewLayout
      title="Paternidad pendiente"
      subtitle="Crías nacidas de un servicio con más de un toro, o sin padre confirmado: elegí el padre entre los toros que estuvieron con la madre y cómo se identificó."
      actions={
        <Button
          variant="contained"
          disabled={isSaving}
          onClick={submit}
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>}
          sx={{ px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none' }}
        >
          Confirmar {state.chosenCount} paternidad(es)
        </Button>
      }
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : calves.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '8px' }}>
          <FuseSvgIcon size={48} className="text-disabled mb-2">
            heroicons-outline:check-badge
          </FuseSvgIcon>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
            No hay crías con la paternidad pendiente.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          <PaternityToolbar
            search={search}
            onSearch={setSearch}
            orders={allGroups.map((group) => ({ key: group.key, name: group.name }))}
            order={order}
            onOrder={setOrder}
            pendingCount={calves.length}
            chosenCount={state.chosenCount}
            shownCount={shownIds.length}
            selectedCount={state.selected.size}
            onSelectShown={() => state.selectMany(shownIds, true)}
            onClearSelection={() => state.selectMany([...state.selected], false)}
            onApplyMethod={(method) => state.applyMethod([...state.selected], method)}
          />
          <PaternityGrid groups={groups} state={state} males={males} />
        </Stack>
      )}
    </ViewLayout>
  );
}
