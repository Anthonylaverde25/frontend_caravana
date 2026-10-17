import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { EntryOrderResult } from '@/features/entry-orders/types';
import CreateExternalBatchDialog, { ExternalBatchDialogMode } from '@/ui/batches/components/external/CreateExternalBatchDialog';
import CreateExternalBatchDrawer from '@/ui/batches/components/external/CreateExternalBatchDrawer';
import type { RegisterEntryState } from '../views/RegisterEntryConfirmView';

interface EntryStartActionsProps {
  onSaved?: (result: EntryOrderResult) => void;
}

/**
 * The two ways a purchase of external livestock starts, wherever they are offered: the DTE has
 * not arrived yet ("Nueva orden de ingreso": the order waits for it) or it is already in hand
 * ("Registrar ingreso": the troop, then the DTE on its confirmation page).
 * Also offers a test action to open the form in a structured right-hand slide-over Drawer.
 */
export const EntryStartActions: React.FC<EntryStartActionsProps> = ({ onSaved }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<ExternalBatchDialogMode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          variant="outlined"
          onClick={() => setMode('register')}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', px: 2 }}
        >
          Registrar ingreso
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={() => setMode('order')}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', px: 3 }}
        >
          Nueva orden de ingreso
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setIsDrawerOpen(true)}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:bars-3-bottom-right</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', px: 2.5, borderWidth: 1.5 }}
        >
          Nueva orden (Drawer)
        </Button>
      </Stack>

      <CreateExternalBatchDialog
        open={mode !== null}
        mode={mode ?? 'order'}
        onClose={() => setMode(null)}
        onSaved={onSaved}
        onContinue={(troop) => {
          setMode(null);
          navigate('/entry-orders/register/confirm', { state: { troop, backTo: location.pathname } satisfies RegisterEntryState });
        }}
      />

      <CreateExternalBatchDrawer
        open={isDrawerOpen}
        mode="order"
        onClose={() => setIsDrawerOpen(false)}
        onSaved={onSaved}
        onContinue={(troop) => {
          setIsDrawerOpen(false);
          navigate('/entry-orders/register/confirm', { state: { troop, backTo: location.pathname } satisfies RegisterEntryState });
        }}
      />
    </>
  );
};

export default EntryStartActions;
