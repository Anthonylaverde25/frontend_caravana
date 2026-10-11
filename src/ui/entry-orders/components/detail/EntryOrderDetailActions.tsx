import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { EntryOrder } from '@/features/entry-orders/types';
import OrderDistributionDialog from '../destinations/OrderDistributionDialog';
import { isTroopComplete, sheetUrl } from '../entryOrderFormat';
import WriteOffPendingHeadsDialog from './WriteOffPendingHeadsDialog';

interface EntryOrderDetailActionsProps {
  order: EntryOrder;
  isConfirming: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onLoadDte: () => void;
  onCancel: () => void;
  onCloseIncomplete: () => void;
}

const actionSx = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

/**
 * What can still be done with an order, at the foot of its detail: edit and confirm a draft, print
 * its ING-02, load a DTE, change where its animals go, assign the caravans of its transit batch,
 * write off head that will never get a caravan, cancel it or close it incomplete.
 */
export const EntryOrderDetailActions: React.FC<EntryOrderDetailActionsProps> = ({
  order,
  isConfirming,
  onEdit,
  onConfirm,
  onLoadDte,
  onCancel,
  onCloseIncomplete
}) => {
  const navigate = useNavigate();
  const [isDistributing, setIsDistributing] = useState(false);
  const [isWritingOff, setIsWritingOff] = useState(false);
  // Only caravans written down in the transit batch are assigned by hand: the rest entered their own batch.
  const inTransitBatch = order.batch
    ? order.dtes.flatMap((d) => d.animals ?? []).filter((a) => a.current_batch?.id === order.batch?.id).length
    : 0;

  return (
    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {order.is_editable && (
        <>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onEdit}
            sx={actionSx}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
          >
            Editar borrador
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={isConfirming}
            onClick={() => (isTroopComplete(order) ? onConfirm() : onEdit())}
            sx={actionSx}
          >
            Confirmar compra
          </Button>
        </>
      )}
      {!order.is_editable && order.status !== 'CANCELLED' && (
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => navigate(sheetUrl(order.id))}
          sx={actionSx}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
        >
          {order.printed_at ? 'Reimprimir ING-02' : 'Imprimir ING-02'}
        </Button>
      )}
      {order.accepts_dte && (
        <Button
          variant="contained"
          disableElevation
          onClick={onLoadDte}
          sx={actionSx}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:document-arrow-down</FuseSvgIcon>}
        >
          Cargar DTE
        </Button>
      )}
      {!order.is_editable && order.can_redistribute && (
        <Button
          variant="text"
          onClick={() => setIsDistributing(true)}
          sx={actionSx}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrows-pointing-out</FuseSvgIcon>}
        >
          Editar distribución
        </Button>
      )}
      {/* Only caravans written down can move: head received by count are not animals yet. */}
      {order.batch && inTransitBatch > 0 && (
        <Button
          variant="text"
          onClick={() => navigate(`/batches/external-assignment?batchId=${order.batch?.id}`)}
          sx={actionSx}
        >
          Asignar a lote propio
        </Button>
      )}
      {order.can_write_off && (
        <Button
          variant="text"
          color="inherit"
          onClick={() => setIsWritingOff(true)}
          sx={actionSx}
        >
          Dar de baja pendientes…
        </Button>
      )}
      <Box sx={{ flexGrow: 1 }} />
      {order.can_cancel && (
        <Button
          variant="outlined"
          color="error"
          onClick={onCancel}
          sx={actionSx}
        >
          {order.status === 'DRAFT' ? 'Descartar borrador…' : 'Anular…'}
        </Button>
      )}
      {order.can_close_incomplete && (
        <Button
          variant="outlined"
          color="warning"
          onClick={onCloseIncomplete}
          sx={actionSx}
        >
          Cerrar incompleta…
        </Button>
      )}

      <OrderDistributionDialog
        order={order}
        open={isDistributing}
        onClose={() => setIsDistributing(false)}
      />
      <WriteOffPendingHeadsDialog
        order={order}
        open={isWritingOff}
        onClose={() => setIsWritingOff(false)}
      />
    </Box>
  );
};

export default EntryOrderDetailActions;
