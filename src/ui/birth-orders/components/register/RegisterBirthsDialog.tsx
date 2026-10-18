import React, { forwardRef, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Dialog, Paper, Slide, Stack, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import BirthRollGrid from '../grid/BirthRollGrid';
import { isDeclared } from '../grid/birthRollTypes';
import { useBirthRollState } from '../grid/useBirthRollState';
import RegisterBirthsContextCard from './RegisterBirthsContextCard';
import RegisterBirthsRoundCard from './RegisterBirthsRoundCard';
import RegisterBirthsSheetToolbar from './RegisterBirthsSheetToolbar';
import { type BirthSheetFilter, type BirthSheetQuery, emptyRegisterHeader, matchesSheetQuery } from './registerBirths';
import { useRegisterBirthsFemales } from './useRegisterBirthsFemales';
import { useRegisterBirthsSubmit } from './useRegisterBirthsSubmit';

/** The slide-up of the Material UI full-screen dialog. */
const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface RegisterBirthsDialogProps {
  /** One batch (Monitoreo Gestacional), or every batch when null. */
  batchId: number | null;
  onClose: () => void;
  /** The registration was saved: the first order it touched (the new one, when there is one). */
  onDone: (orderId: number) => void;
}

const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * "Registrar partos", one screen: the pregnant females of the batch and what happened to each one.
 * There is no order to create beforehand: registering creates it, already executed, with the
 * females that have a result; a female an open order holds is registered in that order. The ones
 * left empty did not calve yet and are not sent.
 */
export default function RegisterBirthsDialog({ batchId, onClose, onDone }: RegisterBirthsDialogProps) {
  const { females, batchName, batchCount, isLoading } = useRegisterBirthsFemales(batchId);
  const roll = useBirthRollState(females);
  const [roundDate, setRoundDate] = useState(today);
  const [header, setHeader] = useState(emptyRegisterHeader);
  const [query, setQuery] = useState<BirthSheetQuery>({ search: '', filter: 'all', stage: 'ALL' });
  const submit = useRegisterBirthsSubmit({ females, roll, header, onDone });

  const stated = (id: number) => isDeclared(roll.valueOf(id));
  const shown = useMemo(() => females.filter((f) => matchesSheetQuery(f, query, stated(f.caravanId))), [females, query, roll]);
  const counts: Record<BirthSheetFilter, number> = { pending: females.length - roll.resolved.length, stated: roll.resolved.length, all: females.length };
  const missingDates = roll.resolved.filter((f) => !roll.valueOf(f.caravanId).birthDate).length;
  const { LIVE, STILLBORN, PERINATAL_DEATH } = roll.counts;
  const breakdown = [LIVE && `${LIVE} vivo(s)`, STILLBORN && `${STILLBORN} nació(eron) muerto(s)`, PERINATAL_DEATH && `${PERINATAL_DEATH} murió(eron) al pie`]
    .filter(Boolean)
    .join(', ');

  return (
    <Dialog fullScreen open onClose={onClose} TransitionComponent={SlideUp} PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}>
      <FullScreenEntryBar
        title={`Registrar partos${batchName ? ` · ${batchName}` : ''}`}
        subtitle="Qué pasó con cada vientre que parió. Los que quedan sin resultado no se registran. Cada parto queda en su orden de parición, o en una nueva ya ejecutada."
        primaryLabel={`Registrar ${submit.statedCount} parto(s)`}
        primaryIcon="heroicons-outline:check"
        busy={submit.isSaving}
        onClose={onClose}
        onPrimary={submit.submit}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 2, md: 3 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' },
            gap: 2.5,
            alignItems: 'start'
          }}
        >
          <Stack spacing={2.5}>
            <RegisterBirthsContextCard batchId={batchId} batchName={batchName} batchCount={batchCount} females={females} />
            <RegisterBirthsRoundCard
              roundDate={roundDate}
              maxDate={today()}
              onRoundDate={setRoundDate}
              missingDates={missingDates}
              onFillDates={() => roll.fillMissingDates(roundDate)}
              header={header}
              onHeader={setHeader}
            />
            <Alert severity={submit.statedCount > 0 ? 'success' : 'info'} sx={{ borderRadius: '6px' }}>
              {submit.statedCount > 0
                ? `${submit.statedCount} con resultado: ${breakdown}. ${counts.pending} quedan sin registrar.`
                : 'Marcá el resultado de cada vientre que parió.'}
            </Alert>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', minWidth: 0, position: { lg: 'sticky' }, top: 0 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>3. Partos</Typography>
            {females.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center', fontStyle: 'italic' }}>
                {batchId ? 'Este lote no tiene vientres preñados.' : 'No hay vientres preñados.'}
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                <RegisterBirthsSheetToolbar query={query} onQuery={setQuery} counts={counts} />
                <BirthRollGrid
                  females={shown}
                  state={submit.state}
                  errors={submit.errors}
                  grouped={batchId == null}
                  externalRoundDate
                  maxHeight={{ xs: 520, lg: 'calc(100vh - 300px)' }}
                />
              </Stack>
            )}
          </Paper>
        </Box>
      )}
    </Dialog>
  );
}
