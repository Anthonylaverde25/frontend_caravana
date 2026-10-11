import React from 'react';
import { useNavigate } from 'react-router';
import { Box, Link, Tooltip, Typography } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';

interface BatchHeadCountProps {
  batch: Batch;
  /** "cabezas" after the number, as the cards say it. */
  withUnit?: boolean;
}

/**
 * The head of a batch: its caravans plus the head of a purchase already received there and still
 * waiting for their caravan ("por identificar"). Underneath, what its open purchases still bring
 * (in transit), each order a link to it.
 */
export const BatchHeadCount: React.FC<BatchHeadCountProps> = ({ batch, withUnit = false }) => {
  const navigate = useNavigate();
  const pending = batch.pending_identification_count;
  const orders = batch.incoming_entry_orders;
  const inTransit = orders.reduce((total, o) => total + (o.single_destination ? o.in_transit_count : 0), 0);
  const sharedTransit = orders.some((o) => !o.single_destination && o.in_transit_count > 0);
  const detail = orders
    .map((o) => `${o.code} (${o.rules.join(', ') || 'sin regla'}): ${o.pending_count} por identificar`)
    .join(' · ');

  return (
    <Box>
      <span>{`${batch.head_count}${withUnit ? ' cabezas' : ''}`}</span>
      {(pending > 0 || inTransit > 0 || sharedTransit) && (
        <Tooltip title={detail || ''}>
          <Typography
            variant="caption"
            component="div"
            sx={{ color: 'warning.dark', fontWeight: 600, lineHeight: 1.3 }}
          >
            {[
              pending > 0 ? `${pending} por identificar` : null,
              inTransit > 0 ? `+${inTransit} en tránsito` : sharedTransit ? 'más en tránsito' : null
            ]
              .filter(Boolean)
              .join(' · ')}
            {orders.length > 0 && ' · '}
            {orders.map((o, index) => (
              <React.Fragment key={o.id}>
                {index > 0 && ', '}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    navigate(`/entry-orders?orderId=${o.id}`);
                  }}
                  sx={{ fontSize: 'inherit', fontWeight: 700, verticalAlign: 'baseline' }}
                >
                  {o.code}
                </Link>
              </React.Fragment>
            ))}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};

export default BatchHeadCount;
