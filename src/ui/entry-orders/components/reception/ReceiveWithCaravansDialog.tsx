import React, { forwardRef, useEffect, useState } from 'react';
import { AppBar, Box, Button, Dialog, IconButton, Paper, Slide, Toolbar, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';
import type { EntryOrder, EntryOrderDte } from '@/features/entry-orders/types';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import DiscardChangesDialog from '../DiscardChangesDialog';
import FullReceptionSidebar from './FullReceptionSidebar';
import ReceptionRowsSection from './ReceptionRowsSection';
import { useDteReception } from './useDteReception';
import { troopContextOf } from './useReceptionRows';

/** The slide-up of the Material UI full-screen dialog. */
const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ReceiveWithCaravansDialogProps {
  order: EntryOrder;
  /** The DTE being received, or null when closed. */
  dte: EntryOrderDte | null;
  onClose: () => void;
}

/**
 * "Recibir y registrar caravanas": receiving a DTE and identifying its animals in one step, on a full
 * screen like "Nueva orden de parición". It is the same reception as "Recibir" — the head confirmed
 * against the DTE close it, a difference raises an incident — with the caravans at the center: the
 * grid takes the screen, written, pasted or read from the TRI, with sex, category, breed, weight,
 * body condition and injuries per animal. The head left without caravan are written later.
 */
export const ReceiveWithCaravansDialog: React.FC<ReceiveWithCaravansDialogProps> = ({ order, dte, onClose }) => {
  const reception = useDteReception(order, dte, onClose, { withCaravansAlways: true });
  const [confirmingClose, setConfirmingClose] = useState(false);
  const { ensureRows } = reception.rows;

  // A row per head expected from the start, like the blank lines of the ING-03.
  useEffect(() => {
    if (dte) ensureRows(reception.caravansExpected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dte?.id, reception.caravansExpected]);
  const { settings: contrast } = useContrastTheme();
  const barBg = (contrast.enabled && (contrast.headerBg || contrast.primaryButtonBg)) || 'primary.main';
  const barText = (contrast.enabled && contrast.headerBg && contrast.headerText) || 'common.white';

  const requestClose = () => {
    if (reception.isPending) return;
    if (reception.isDirty) setConfirmingClose(true);
    else onClose();
  };

  return (
    <Dialog fullScreen open={dte != null} onClose={requestClose} TransitionComponent={SlideUp} PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}>
      <AppBar position="relative" elevation={0} sx={{ bgcolor: barBg, color: barText }}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton edge="start" color="inherit" onClick={requestClose} aria-label="Cerrar" disabled={reception.isPending}>
            <FuseSvgIcon size={22}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              Recibir y registrar caravanas · DTE {dte?.dte_number}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: { xs: 'none', md: 'block' } }} noWrap>
              {order.code} · {order.batch_name ?? 'Lote externo'} · confirmá las cabezas que llegaron y cargá la caravana de cada animal.
            </Typography>
          </Box>
          <Button color="inherit" onClick={requestClose} disabled={reception.isPending} sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="inherit"
            disableElevation
            disabled={reception.isPending}
            onClick={reception.submit}
            endIcon={<FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', bgcolor: 'common.white', color: barBg, '&:hover': { bgcolor: 'grey.100' } }}
          >
            {reception.isPending ? 'Registrando…' : `Registrar recepción · ${reception.caravans} caravana(s)`}
          </Button>
        </Toolbar>
      </AppBar>

      {dte && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 2, md: 3 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '360px minmax(0, 1fr)' },
            gap: 2.5,
            alignItems: 'start'
          }}
        >
          <FullReceptionSidebar order={order} dte={dte} reception={reception} />

          <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>3. Caravanas de los animales que llegaron</Typography>
            <ReceptionRowsSection
              draft={reception.rows}
              troop={troopContextOf(order)}
              expected={reception.caravansExpected}
              expectedLabel={reception.caravansExpectedLabel}
              excessIsError
              sheet
            />
          </Paper>
        </Box>
      )}

      <DiscardChangesDialog
        open={confirmingClose}
        detail="Se pierden las cabezas y las caravanas cargadas."
        onKeep={() => setConfirmingClose(false)}
        onDiscard={() => {
          setConfirmingClose(false);
          onClose();
        }}
      />
    </Dialog>
  );
};

export default ReceiveWithCaravansDialog;
