import React from 'react';
import { Box, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface ServiceOrderActionToolbarProps {
  order: ServiceOrder | null;
  onClose: () => void;
  onPrintSheet?: (order: ServiceOrder) => void;
  onNavigateToServiceOrders?: () => void;
}

export const ServiceOrderActionToolbar: React.FC<ServiceOrderActionToolbarProps> = ({
  order,
  onClose,
  onPrintSheet,
  onNavigateToServiceOrders,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.default,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
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
          variant="contained"
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
          variant="contained"
          color="primary"
          onClick={onClose}
          fullWidth
          sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700 }}
        >
          Cerrar Detalle
        </Button>
      )}
    </Box>
  );
};

export default ServiceOrderActionToolbar;
