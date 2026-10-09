import React from 'react';
import { Box, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { computeServiceOrderTemporalStatus } from '@/ui/gestation/utils/serviceOrderTemporalStatus';

interface ServiceOrderActionToolbarProps {
  order: ServiceOrder | null;
  onClose: () => void;
  onPrintSheet?: (order: ServiceOrder) => void;
  onNavigateToServiceOrders?: () => void;
  onOpenCloseServiceDialog?: () => void;
}

export const ServiceOrderActionToolbar: React.FC<ServiceOrderActionToolbarProps> = ({
  order,
  onClose,
  onPrintSheet,
  onNavigateToServiceOrders,
  onOpenCloseServiceDialog,
}) => {
  const temporal = computeServiceOrderTemporalStatus(order);
  const isOrderActive = order?.status === 'APPROVED';

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
      {/* Primary Action Button: Finalizar Servicio y Retirar Toros */}
      {isOrderActive && onOpenCloseServiceDialog && (
        <Button
          variant="contained"
          onClick={onOpenCloseServiceDialog}
          fullWidth
          startIcon={<FuseSvgIcon size={18}>lucide:flag</FuseSvgIcon>}
          sx={{
            borderRadius: '6px',
            textTransform: 'none',
            fontWeight: 800,
            py: 1,
            bgcolor: temporal.isOverdue ? '#dc2626' : temporal.isClosingSoon ? '#ea580c' : '#0a6ed1',
            '&:hover': {
              bgcolor: temporal.isOverdue ? '#b91c1c' : temporal.isClosingSoon ? '#c2410c' : '#0854a0',
            },
            boxShadow: 2,
          }}
        >
          {temporal.isOverdue
            ? 'Finalizar Servicio & Retirar Toros (Vencido)'
            : temporal.isClosingSoon
            ? `Finalizar Servicio & Retirar Toros (Faltan ${temporal.daysRemaining}d)`
            : 'Finalizar Servicio & Retirar Toros'}
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
