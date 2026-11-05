import React from 'react';
import { useNavigate } from 'react-router';
import { Alert, Link } from '@mui/material';
import type { ServiceOrderHold } from '@/features/birth-orders/hooks/useBirthOrders';

/** The females an open service order keeps out of the calving season, by order. */
export interface ServiceHeldOrder extends ServiceOrderHold {
  count: number;
}

/** Counts the given females by the service order that holds each one. */
export function countByServiceOrder(femaleIds: number[], held: Map<number, ServiceOrderHold>): ServiceHeldOrder[] {
  const orders = new Map<number, ServiceHeldOrder>();

  femaleIds.forEach((id) => {
    const hold = held.get(id);

    if (hold) orders.set(hold.orderId, { ...hold, count: (orders.get(hold.orderId)?.count ?? 0) + 1 });
  });

  return [...orders.values()];
}

/**
 * Why some pregnant females are not on the screen: first their service order closes, with its
 * diagnosis, then comes the calving season. Each order links to where it is closed.
 */
export const ServiceHeldNotice: React.FC<{ orders: ServiceHeldOrder[] }> = ({ orders }) => {
  const navigate = useNavigate();
  const count = orders.reduce((sum, order) => sum + order.count, 0);

  if (count === 0) return null;

  return (
    <Alert severity="warning" sx={{ fontSize: '0.8rem', py: 0.5, borderRadius: '6px' }}>
      {count === 1 ? '1 vientre preñado no entra' : `${count} vientres preñados no entran`} todavía:{' '}
      {orders.length === 1 ? 'su orden de servicio sigue abierta' : 'sus órdenes de servicio siguen abiertas'} (
      {orders.map((order, index) => (
        <React.Fragment key={order.orderId}>
          {index > 0 && ', '}
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={() => navigate(`/gestation/tacto?orderId=${order.orderId}`)}
            sx={{ fontSize: 'inherit', fontWeight: 700, verticalAlign: 'baseline' }}
          >
            {order.code}
          </Link>
        </React.Fragment>
      ))}
      ). {orders.length === 1 ? 'Cerrala' : 'Cerralas'} con su diagnóstico para seguir con la parición.
    </Alert>
  );
};

export default ServiceHeldNotice;
