import { useState } from 'react';
import { Box, Button, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { getServiceOrderPhase } from '../../utils/serviceOrderPhase';
import { computeServiceOrderTemporalStatus } from '../../utils/serviceOrderTemporalStatus';
import { pendingToClose } from '../tacto-start/tactoStart';

interface WorkCardActionsProps {
  order: ServiceOrder;
  onPrintSheet: (order: ServiceOrder) => void;
  onBulkEntry: (orderId: number) => void;
  onCloseOrder: (order: ServiceOrder) => void;
  /** "Retirar torada": only while the bulls are in the batch. */
  onWithdrawBulls: (order: ServiceOrder) => void;
  onView: (order: ServiceOrder) => void;
  onViewFemales: () => void;
  /** "card": footer of a tray card; "row": last cell of the tray table, the withdrawal slot kept so icons line up. */
  variant?: 'card' | 'row';
}

const iconButtonSx = { width: 36, height: 36, borderRadius: '6px', color: 'text.secondary' } as const;
const rowIconButtonSx = { ...iconButtonSx, width: 34, height: 34 } as const;
const menuTextProps = { primaryTypographyProps: { fontSize: '0.82rem' } } as const;

const TACTO_ICON = 'heroicons-outline:clipboard-document-check';
const CLOSE_ICON = 'heroicons-outline:lock-closed';

/**
 * Actions of an order in the tray: ONE primary button by phase ("Cerrar orden" once every female
 * has her verdict, otherwise "Cargar tacto"), the bull withdrawal and the sheet as icons, the rest
 * in the ⋮ menu.
 */
export default function WorkCardActions({
  order,
  onPrintSheet,
  onBulkEntry,
  onCloseOrder,
  onWithdrawBulls,
  onView,
  onViewFemales,
  variant = 'card',
}: WorkCardActionsProps) {
  const isRow = variant === 'row';
  const iconSx = isRow ? rowIconButtonSx : iconButtonSx;
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const readyToClose = getServiceOrderPhase(order).phase === 'READY_TO_CLOSE';
  const pending = pendingToClose(order);
  const temporal = computeServiceOrderTemporalStatus(order);
  const withdrawAlert = temporal.isOverdue ? 'error' : temporal.isClosingSoon ? 'warning' : null;

  const close = () => onCloseOrder(order);
  const tacto = () => onBulkEntry(order.id);
  const fromMenu = (action: () => void) => () => {
    setMenuAnchor(null);
    action();
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={isRow ? 0.25 : 0.5}
      sx={isRow ? { justifyContent: 'flex-end' } : { px: 1.5, pl: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider' }}
    >
      <Button
        // In the table only the closing stays filled, so a column of rows does not turn solid blue.
        variant={isRow && !readyToClose ? 'outlined' : 'contained'}
        disableElevation
        onClick={readyToClose ? close : tacto}
        startIcon={<FuseSvgIcon size={isRow ? 15 : 16}>{readyToClose ? CLOSE_ICON : TACTO_ICON}</FuseSvgIcon>}
        sx={{
          height: isRow ? 32 : 36,
          px: isRow ? 1.5 : 2,
          mr: isRow ? 0.5 : 0,
          borderRadius: '6px',
          textTransform: 'none',
          fontWeight: 700,
          fontSize: isRow ? '0.75rem' : '0.8rem',
          whiteSpace: 'nowrap',
          boxShadow: 'none',
        }}
      >
        {readyToClose ? 'Cerrar orden' : 'Cargar tacto'}
      </Button>
      {!isRow && <Box sx={{ flexGrow: 1 }} />}

      {isRow && order.status !== 'APPROVED' && <Box sx={{ width: 34, height: 34, flexShrink: 0 }} />}
      {order.status === 'APPROVED' && (
        <Tooltip title={withdrawAlert ? `Retirar torada · ${temporal.shortLabel}` : 'Retirar torada'}>
          <IconButton
            aria-label="Retirar torada"
            onClick={() => onWithdrawBulls(order)}
            sx={{ ...iconSx, position: 'relative', color: withdrawAlert ? `${withdrawAlert}.main` : 'text.secondary' }}
          >
            <FuseSvgIcon size={18}>lucide:flag</FuseSvgIcon>
            {withdrawAlert && (
              <Box
                sx={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', bgcolor: `${withdrawAlert}.main`, boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}` }}
              />
            )}
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Planilla REP-01">
        <IconButton aria-label="Imprimir planilla REP-01" onClick={() => onPrintSheet(order)} sx={iconSx}>
          <FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>
        </IconButton>
      </Tooltip>
      <Tooltip title="Más acciones">
        <IconButton
          aria-label="Más acciones"
          aria-haspopup="menu"
          aria-expanded={menuAnchor !== null}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          sx={{ ...iconSx, bgcolor: menuAnchor ? 'action.selected' : 'transparent' }}
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
        slotProps={{ paper: { sx: { width: 240, borderRadius: '10px', mt: 0.5 } } }}
      >
        <MenuItem onClick={fromMenu(() => onView(order))}>
          <ListItemIcon>
            <FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText {...menuTextProps}>Ver detalle de la orden</ListItemText>
        </MenuItem>
        <MenuItem onClick={fromMenu(onViewFemales)}>
          <ListItemIcon>
            <FuseSvgIcon size={16}>heroicons-outline:list-bullet</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText {...menuTextProps}>Ver vientres ({order.female_caravan_ids.length})</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={fromMenu(readyToClose ? tacto : close)}>
          <ListItemIcon>
            <FuseSvgIcon size={16}>{readyToClose ? TACTO_ICON : CLOSE_ICON}</FuseSvgIcon>
          </ListItemIcon>
          <ListItemText {...menuTextProps}>{readyToClose ? 'Cargar tacto' : 'Cerrar orden'}</ListItemText>
          {!readyToClose && pending > 0 && (
            <Typography variant="caption" color="text.disabled">
              faltan {pending}
            </Typography>
          )}
        </MenuItem>
      </Menu>
    </Stack>
  );
}
