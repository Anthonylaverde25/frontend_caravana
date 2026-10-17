import React from 'react';
import { Box, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { diagnosisTrayPath } from '../tacto-start/tactoStart';
import { getServiceOrderPhase } from '../../utils/serviceOrderPhase';

interface ServiceOrderActionToolbarProps {
  order: ServiceOrder | null;
  onClose: () => void;
  onPrintSheet?: (order: ServiceOrder) => void;
  onNavigateToServiceOrders?: () => void;
  /** Opened from the diagnosis tray: the order is worked on its card, no link back. */
  inTray?: boolean;
}

/**
 * Actions of the order detail. An open order is worked in one place only, the diagnosis tray
 * (rounds, bull withdrawal, closing): here it is a single link to it.
 */
export const ServiceOrderActionToolbar: React.FC<ServiceOrderActionToolbarProps> = ({
  order,
  onClose,
  onPrintSheet,
  onNavigateToServiceOrders,
  inTray = false,
}) => {
  const navigate = useNavigate();
  const phase = order ? getServiceOrderPhase(order) : null;

  return (
    <Box
      sx={{
        p: 2,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {order && phase?.isOpen && !inTray && (
        <Button
          variant="contained"
          onClick={() => navigate(diagnosisTrayPath(order.id))}
          fullWidth
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
          sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 800, py: 1, boxShadow: 2 }}
        >
          {`Trabajar en bandeja de tacto · ${phase.label}`}
        </Button>
      )}

      {/* Secondary Actions Row */}
      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'space-between' }}>
        {onNavigateToServiceOrders && (
          <Button
            variant="outlined"
            onClick={onNavigateToServiceOrders}
            fullWidth
            sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600 }}
            startIcon={<FuseSvgIcon size={16}>lucide:external-link</FuseSvgIcon>}
          >
            Ver en Órdenes
          </Button>
        )}

        {onPrintSheet && order ? (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => onPrintSheet(order)}
            fullWidth
            sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700 }}
            startIcon={<FuseSvgIcon size={18}>lucide:printer</FuseSvgIcon>}
          >
            Imprimir Hoja
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600 }}
          >
            Cerrar Detalle
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ServiceOrderActionToolbar;
