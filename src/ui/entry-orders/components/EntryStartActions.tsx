import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { EntryOrderResult } from '@/features/entry-orders/types';
import CreateExternalBatchDialog, { ExternalBatchDialogMode } from '@/ui/batches/components/external/CreateExternalBatchDialog';
import type { RegisterEntryState } from '../views/RegisterEntryConfirmView';

interface EntryStartActionsProps {
  /** Label of the main button: "Nuevo lote externo" on the batches, "Nueva orden de ingreso" on the tray. */
  newLabel: string;
  onSaved?: (result: EntryOrderResult) => void;
}

/**
 * The two ways a purchase of external livestock starts, wherever they are offered: the DTE has
 * not arrived yet ("Nuevo lote externo": the order waits for it) or it is already in hand
 * ("Registrar ingreso": the troop, then the DTE on its confirmation page).
 */
export const EntryStartActions: React.FC<EntryStartActionsProps> = ({ newLabel, onSaved }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ExternalBatchDialogMode | null>(null);

  return (
    <>
      <Stack direction="row" spacing={1.5}>
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
          {newLabel}
        </Button>
      </Stack>

      <CreateExternalBatchDialog
        open={mode !== null}
        mode={mode ?? 'order'}
        onClose={() => setMode(null)}
        onSaved={onSaved}
        onContinue={(troop) => {
          setMode(null);
          navigate('/entry-orders/register/confirm', { state: { troop } satisfies RegisterEntryState });
        }}
      />
    </>
  );
};

export default EntryStartActions;
