import { useState } from 'react';
import { Box, Button, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import type { TrayOrderHandlers } from '../../diagnosis-tray/table/DiagnosisTrayTable';
import FemalesVerdictDialog from '../../service-order-work-card/FemalesVerdictDialog';
import { INSEMINATE_ICON, useAiWorkCardActions } from '../../service-order-work-card/useAiWorkCardActions';
import { pendingToClose } from '../../tacto-start/tactoStart';
import { getNextStep, type NextStep } from '../../../utils/servicesQueue';

/** What the queue can do with an order: the tray's actions plus the approval of an emitted one. */
export interface QueueOrderHandlers extends TrayOrderHandlers {
  onApprove: (order: ServiceOrder) => void;
  onReject: (order: ServiceOrder) => void;
  /** "Sustituir Reproductor en Servicio": one bull out, one from the resting torada in. */
  onReplaceBull: (order: ServiceOrder, bull: Caravan) => void;
}

interface ServicesNextStepActionsProps extends QueueOrderHandlers {
  order: ServiceOrder;
  batchName: string;
  caravans: Caravan[];
  isApproving?: boolean;
  /** "row": last cell of the queue; "panel": the "Próximo paso" block of the detail drawer. */
  variant?: 'row' | 'panel';
}

const TACTO_ICON = 'heroicons-outline:clipboard-document-check';
const CLOSE_ICON = 'heroicons-outline:lock-closed';
const WITHDRAW_ICON = 'lucide:flag';

const STEP_UI: Record<NextStep, { label: string; icon: string }> = {
  APPROVE: { label: 'Aprobar orden', icon: 'heroicons-outline:check-circle' },
  INSEMINATE: { label: 'Cargar inseminaciones', icon: INSEMINATE_ICON },
  WITHDRAW_BULLS: { label: 'Retirar torada', icon: WITHDRAW_ICON },
  TACTO: { label: 'Cargar tacto', icon: TACTO_ICON },
  CLOSE: { label: 'Cerrar orden', icon: CLOSE_ICON },
};

const menuTextProps = { primaryTypographyProps: { fontSize: '0.82rem' } } as const;

/**
 * ONE button with the step that moves the order forward today (see `getNextStep`); every other
 * action of the order lives in the ⋮ menu, so the operator never has to read the status to know
 * what to do.
 */
export default function ServicesNextStepActions({ order, batchName, caravans, isApproving = false, variant = 'row', ...handlers }: ServicesNextStepActionsProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [femalesOpen, setFemalesOpen] = useState(false);
  const ai = useAiWorkCardActions(order);
  const step = getNextStep(order);
  const isDraft = step === 'APPROVE';
  const pending = pendingToClose(order);
  const isPanel = variant === 'panel';
  // The backend swaps a bull only while the order is in service (bulls in the batch).
  const activeBullIds = order.male_details?.length
    ? order.male_details.filter((d) => d.status === 'ACTIVE').map((d) => d.male_caravan_id)
    : (order.active_male_caravan_ids ?? order.male_caravan_ids);
  const activeBulls = ai.inService ? caravans.filter((caravan) => activeBullIds.includes(caravan.id)) : [];

  const run: Record<NextStep, () => void> = {
    APPROVE: () => handlers.onApprove(order),
    INSEMINATE: ai.loadInseminations,
    WITHDRAW_BULLS: () => handlers.onWithdrawBulls(order),
    TACTO: () => handlers.onBulkEntry(order.id),
    CLOSE: () => handlers.onCloseOrder(order),
  };
  const fromMenu = (action: () => void) => () => {
    setMenuAnchor(null);
    action();
  };
  const item = (label: string, icon: string, action: () => void, extra?: string) => (
    <MenuItem key={label} onClick={fromMenu(action)}>
      <ListItemIcon>
        <FuseSvgIcon size={16}>{icon}</FuseSvgIcon>
      </ListItemIcon>
      <ListItemText {...menuTextProps}>{label}</ListItemText>
      {extra && (
        <Typography variant="caption" color="text.disabled">
          {extra}
        </Typography>
      )}
    </MenuItem>
  );

  const workItems = isDraft
    ? []
    : [
        step !== 'TACTO' && item('Cargar tacto', TACTO_ICON, run.TACTO),
        ai.showsWithdrawal && step !== 'WITHDRAW_BULLS' && item('Retirar torada', WITHDRAW_ICON, run.WITHDRAW_BULLS),
        ...activeBulls.map((bull) =>
          item(`Sustituir toro ${bull.identification}`, 'heroicons-outline:arrows-right-left', () => handlers.onReplaceBull(order, bull))
        ),
        ai.isAi && ai.inService && step !== 'INSEMINATE' && item('Cargar inseminaciones', INSEMINATE_ICON, ai.loadInseminations),
        ai.canAddRepaso && item('Agregar toros de repaso', 'lucide:plus', ai.openRepaso),
        ai.canEndService && item('Terminar servicio', WITHDRAW_ICON, ai.openEnd),
        item('Imprimir planilla REP-01', 'heroicons-outline:printer', () => handlers.onPrintSheet(order)),
      ].filter(Boolean);

  return (
    <Box onClick={(event) => event.stopPropagation()} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: isPanel ? '100%' : 'auto' }}>
      <Button
        variant="contained"
        disableElevation
        disabled={isDraft && isApproving}
        onClick={run[step]}
        startIcon={<FuseSvgIcon size={16}>{STEP_UI[step].icon}</FuseSvgIcon>}
        sx={{
          flex: isPanel ? 1 : 'none',
          minWidth: isPanel ? 0 : 176,
          height: isPanel ? 40 : 34,
          px: 2,
          borderRadius: '6px',
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.8rem',
          whiteSpace: 'nowrap',
          boxShadow: 'none',
        }}
      >
        {STEP_UI[step].label}
      </Button>
      <Tooltip title="Más acciones">
        <IconButton
          aria-label={`Más acciones de ${order.code}`}
          aria-haspopup="menu"
          aria-expanded={menuAnchor !== null}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={{ width: isPanel ? 40 : 34, height: isPanel ? 40 : 34, borderRadius: '6px', border: 1, borderColor: 'divider', color: 'text.secondary', bgcolor: menuAnchor ? 'action.selected' : 'transparent' }}
        >
          <FuseSvgIcon size={18}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={menuAnchor}
        open={menuAnchor !== null}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 250, borderRadius: '8px', mt: 0.5 } } }}
      >
        {workItems}
        {workItems.length > 0 && <Divider />}
        {!isPanel && item('Ver detalle de la orden', 'heroicons-outline:eye', () => handlers.onView(order))}
        {item(`Ver vientres (${order.female_caravan_ids.length})`, 'heroicons-outline:list-bullet', () => setFemalesOpen(true))}
        {!isDraft && step !== 'CLOSE' && <Divider />}
        {!isDraft && step !== 'CLOSE' && item('Cerrar orden', CLOSE_ICON, run.CLOSE, pending > 0 ? `faltan ${pending}` : undefined)}
        {isDraft && <Divider />}
        {isDraft && item('Rechazar orden', 'heroicons-outline:x-circle', () => handlers.onReject(order))}
      </Menu>
      {femalesOpen && <FemalesVerdictDialog open onClose={() => setFemalesOpen(false)} order={order} batchName={batchName} caravans={caravans} />}
      {ai.dialogs}
    </Box>
  );
}
