import React, { useState } from 'react';
import { Button, CircularProgress, Stack, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TransferOrderReasonDialog from '@/ui/transfer-orders/components/TransferOrderReasonDialog';
import type { TransferOrderSession } from '../../hooks/useTransferOrderSession';
import TransferCreateOrderSplitButton from './TransferCreateOrderSplitButton';
import TransferOrderMoreMenu, { TransferOrderMenuItem } from './TransferOrderMoreMenu';
import { useTransferPalette } from './transferPalette';

interface TransferActionBarProps {
  session: TransferOrderSession;
  /** Why the screen is not a valid order yet; null when it is. */
  orderBlockedReason: string | null;
  /** The transfer without an order, as before orders existed. */
  transferLabel: string;
  canTransfer: boolean;
  transferBlockedReason: string | null;
  onTransfer: () => void;
  isTransferring: boolean;
  onPrint: () => void;
  onViewInList: () => void;
}

type Closing = 'discard' | 'cancel' | 'close' | null;

const secondarySx = { fontWeight: 600, textTransform: 'none', borderRadius: '6px', px: 2 } as const;

/**
 * Every action of /transfer, in one row that changes with the state of the order.
 *
 * One rule governs it: at most three controls — the "⋯" menu, one secondary button and one
 * primary. The primary is the step that moves the order forward (transfer, issue, execute); the
 * secondary is the one that comes right before it; everything else lives in the menu. The band
 * over the table only reports, it offers nothing.
 */
export const TransferActionBar: React.FC<TransferActionBarProps> = ({
  session,
  orderBlockedReason,
  transferLabel,
  canTransfer,
  transferBlockedReason,
  onTransfer,
  isTransferring,
  onPrint,
  onViewInList
}) => {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));
  const palette = useTransferPalette();
  const [closing, setClosing] = useState<Closing>(null);
  const { order, isDraft, isDirty, isLocked, isBusy } = session;

  const primarySx = {
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: '6px',
    px: 2.5,
    bgcolor: palette.sapGreen,
    color: '#ffffff',
    boxShadow: 'none',
    '&:hover': { bgcolor: palette.sapGreenHover, boxShadow: 'none' },
    '&.Mui-disabled': { bgcolor: palette.sapGreen, color: '#ffffff', opacity: 0.45 }
  } as const;

  const primary = (label: string, icon: string, onClick: () => void, disabled: boolean, reason: string | null) => (
    <Tooltip title={reason ?? ''}>
      <span>
        <Button
          variant="contained"
          onClick={onClick}
          disabled={disabled}
          startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : <FuseSvgIcon size={18}>{icon}</FuseSvgIcon>}
          sx={primarySx}
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );

  const menu: TransferOrderMenuItem[] = [];
  let secondary: React.ReactNode = null;
  let main: React.ReactNode;

  if (order && isDraft) {
    menu.push(
      // With unsaved changes the preview would show the old draft, and leaving would lose them:
      // the label says it saves first, so nothing happens behind the user's back.
      isDirty
        ? {
            label: 'Guardar y previsualizar',
            icon: 'heroicons-outline:eye',
            onClick: () => void session.saveChanges().then((saved) => saved && onPrint()),
            disabled: orderBlockedReason !== null
          }
        : { label: 'Previsualizar planilla', icon: 'heroicons-outline:eye', onClick: onPrint },
      { label: 'Ver en el listado', icon: 'heroicons-outline:queue-list', onClick: onViewInList },
      { label: 'Descartar borrador…', icon: 'heroicons-outline:trash', onClick: () => setClosing('discard'), danger: true }
    );
    secondary = (
      <Tooltip title={!isDirty ? 'No hay cambios sin guardar' : (orderBlockedReason ?? '')}>
        <span>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => void session.saveChanges()}
            disabled={!isDirty || orderBlockedReason !== null || isBusy}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-down-tray</FuseSvgIcon>}
            sx={secondarySx}
          >
            Guardar cambios
          </Button>
        </span>
      </Tooltip>
    );
    main = primary(
      'Emitir orden',
      'heroicons-outline:clipboard-document-check',
      () => void session.issue(),
      orderBlockedReason !== null || isBusy,
      orderBlockedReason ?? (isDirty ? 'Guarda los cambios y emite la orden' : 'Compromete los animales; después se imprime y se ejecuta')
    );
  } else if (order && isLocked) {
    const executeReason =
      order.unassigned_head_count > 0
        ? `${order.unassigned_head_count} animal(es) se deciden en la manga: se ejecuta escaneando la planilla.`
        : null;

    menu.push({ label: 'Ver en el listado', icon: 'heroicons-outline:queue-list', onClick: onViewInList });
    menu.push(
      order.status === 'PARTIAL'
        ? { label: 'Cerrar incompleta…', icon: 'heroicons-outline:stop-circle', onClick: () => setClosing('close'), danger: true }
        : { label: 'Anular y volver a armar…', icon: 'heroicons-outline:arrow-uturn-left', onClick: () => setClosing('cancel'), danger: true }
    );
    secondary = (
      <Button
        variant="outlined"
        color="inherit"
        onClick={onPrint}
        startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
        sx={secondarySx}
      >
        {order.status === 'PARTIAL' ? 'Imprimir pendientes' : 'Imprimir planilla'}
      </Button>
    );
    main = primary(
      `Ejecutar orden (${order.pending_head_count})`,
      'heroicons-outline:arrows-right-left',
      onTransfer,
      executeReason !== null || isBusy,
      executeReason
    );
  } else {
    secondary = (
      <TransferCreateOrderSplitButton
        onSaveDraft={() => void session.create(false)}
        onCreateIssued={() => void session.create(true)}
        blockedReason={orderBlockedReason}
        isBusy={isBusy}
      />
    );
    main = primary(transferLabel, 'heroicons-outline:arrows-right-left', onTransfer, !canTransfer || isTransferring, transferBlockedReason);
  }

  // On a narrow screen the secondary button of an existing order joins the menu. The split
  // button stays: it is how an order is born, and it has no other door.
  if (isNarrow && order && (isDraft || isLocked)) {
    menu.unshift(
      isDraft
        ? { label: 'Guardar cambios', icon: 'heroicons-outline:arrow-down-tray', onClick: () => void session.saveChanges(), disabled: !isDirty }
        : { label: 'Imprimir planilla', icon: 'heroicons-outline:printer', onClick: onPrint }
    );
    secondary = null;
  }

  const confirmClosing = async (reason: string | null) => {
    const done =
      closing === 'close' ? await session.closeIncomplete(reason ?? '') : await session.cancel(reason);

    if (done) setClosing(null);
  };

  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <TransferOrderMoreMenu items={menu} />
      {secondary}
      {main}

      {order && (
        <TransferOrderReasonDialog
          open={closing !== null}
          onClose={() => setClosing(null)}
          onConfirm={(reason) => void confirmClosing(reason)}
          isPending={isBusy}
          code={order.code}
          reasonRequired={closing !== 'discard'}
          title={closing === 'discard' ? 'Descartar borrador' : closing === 'close' ? 'Cerrar incompleta' : 'Anular orden'}
          explanation={
            closing === 'discard'
              ? 'El borrador no comprometía animales ni salió en papel. Queda descartado y la pantalla sigue con la misma selección.'
              : closing === 'close'
                ? `Se movieron ${order.moved_head_count} de ${order.planned_head_count}. La orden se da por terminada y los ${order.pending_head_count} pendientes quedan como que no viajaron.`
                : 'La orden queda anulada con su motivo en el historial, los animales dejan de estar comprometidos y la pantalla vuelve a edición con la misma selección.'
          }
          confirmLabel={closing === 'discard' ? 'Descartar borrador' : closing === 'close' ? 'Cerrar incompleta' : 'Anular y volver a armar'}
        />
      )}
    </Stack>
  );
};

export default TransferActionBar;
