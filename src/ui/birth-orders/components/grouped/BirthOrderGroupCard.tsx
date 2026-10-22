import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BirthOrderAnimal, BirthOrderWithRoll } from '@/features/birth-orders/types';
import TransferOrderStatusChip, { TransferOrderKindChip } from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import { birthLineUrgency } from '../detail/BirthOrderRollTable';
import { periodOf, sheetUrl } from '../birthOrderFormat';
import BirthOrderBatchSection from './BirthOrderBatchSection';
import { useGroupedOrderStyles } from './useGroupedOrderStyles';

interface BirthOrderGroupCardProps {
  order: BirthOrderWithRoll;
  onOpen: (order: BirthOrderWithRoll) => void;
  onIssue: (order: BirthOrderWithRoll) => void;
}

interface BatchGroup {
  key: string;
  name: string;
  animals: BirthOrderAnimal[];
}

/** The lines of an order by the batch the female came from; inside, the overdue and pending first. */
const groupByBatch = (animals: BirthOrderAnimal[]): BatchGroup[] => {
  const groups = new Map<string, BatchGroup>();

  animals.forEach((animal) => {
    const key = animal.source_batch_id != null ? `b${animal.source_batch_id}` : 'none';

    if (!groups.has(key)) groups.set(key, { key, name: animal.source_batch_name ?? 'Sin lote', animals: [] });

    groups.get(key)!.animals.push(animal);
  });

  return [...groups.values()].map((group) => ({
    ...group,
    animals: [...group.animals].sort(
      (a, b) =>
        birthLineUrgency(b.status) - birthLineUrgency(a.status) ||
        (a.estimated_due_date ?? '9999').localeCompare(b.estimated_due_date ?? '9999') ||
        (a.identification ?? '').localeCompare(b.identification ?? '')
    )
  }));
};

/** One birth order as the provider card of "Asignar a lote propio": its band, then one block per batch. */
export const BirthOrderGroupCard: React.FC<BirthOrderGroupCardProps> = ({ order, onOpen, onIssue }) => {
  const navigate = useNavigate();
  const { isDark, active, divider } = useGroupedOrderStyles();
  const groups = useMemo(() => groupByBatch(order.animals), [order.animals]);
  const iconSx = { border: '1px solid', borderColor: alpha(active, 0.35), borderRadius: '6px', p: 0.5, bgcolor: 'background.paper' };

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: divider, borderRadius: '8px', overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        onClick={() => onOpen(order)}
        sx={{
          px: 2.5,
          py: 1.5,
          cursor: 'pointer',
          borderBottom: '2px solid',
          borderColor: isDark ? alpha(active, 0.55) : alpha(active, 0.35),
          backgroundColor: isDark ? alpha(active, 0.16) : alpha('#0a6ed1', 0.07)
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: active,
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            <FuseSvgIcon size={18}>heroicons-outline:clipboard-document-list</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2, fontFamily: 'monospace' }}>
              {order.code}
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'text.secondary', fontWeight: 500 }}>
              {groups.length} {groups.length === 1 ? 'lote' : 'lotes'} &bull; {periodOf(order)} &bull; {order.responsable ?? 'Sin responsable'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <TransferOrderStatusChip status={order.status} />
          {order.kind === 'REGISTERED' && <TransferOrderKindChip />}
          {order.overdue_head_count > 0 && (
            <Chip
              size="small"
              color="warning"
              icon={<FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>}
              label={`${order.overdue_head_count} parto(s) vencido(s)`}
              sx={{ fontWeight: 700, height: 22, '& .MuiChip-label': { px: 0.75 } }}
            />
          )}
          {order.is_editable && (
            <Tooltip title="Emitir orden">
              <IconButton
                size="small"
                aria-label={`Emitir la orden ${order.code}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onIssue(order);
                }}
                sx={iconSx}
              >
                <FuseSvgIcon size={15}>heroicons-outline:paper-airplane</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
          {order.kind !== 'REGISTERED' && (
            <Tooltip title="Planilla PAR-01">
              <IconButton
                size="small"
                aria-label={`Abrir la planilla de la orden ${order.code}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(sheetUrl(order.id));
                }}
                sx={iconSx}
              >
                <FuseSvgIcon size={15}>heroicons-outline:document-text</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
          <Chip
            size="small"
            variant="outlined"
            label={`${order.resolved_head_count} / ${order.head_count} vientres`}
            sx={{ fontWeight: 700, color: active, borderColor: alpha(active, 0.4), bgcolor: 'background.paper' }}
          />
        </Stack>
      </Stack>

      <Stack spacing={0}>
        {groups.map((group) => (
          <BirthOrderBatchSection key={group.key} name={group.name} animals={group.animals} onOpen={() => onOpen(order)} />
        ))}
      </Stack>
    </Paper>
  );
};

export default BirthOrderGroupCard;
