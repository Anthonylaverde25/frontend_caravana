import React from 'react';
import { Button, Chip, InputAdornment, Paper, Stack, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import TransferOrdersStatusFilter, { TransferOrderStatusFilterValue } from '@/ui/transfer-orders/components/TransferOrdersStatusFilter';
import { useGroupedOrderStyles } from './grouped/useGroupedOrderStyles';

export type BirthOrdersViewMode = 'grouped' | 'flat';

interface BirthOrdersToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  status: TransferOrderStatusFilterValue;
  onStatus: (value: TransferOrderStatusFilterValue) => void;
  counts: Record<TransferOrderStatusFilterValue, number>;
  overdueOnly: boolean;
  onToggleOverdue: () => void;
  withOverdue: number;
  viewMode: BirthOrdersViewMode;
  onToggleView: () => void;
}

/** Search, filters and the grouped / flat switch, in the filter bar of "Asignar a lote propio". */
export const BirthOrdersToolbar: React.FC<BirthOrdersToolbarProps> = ({
  search,
  onSearch,
  status,
  onStatus,
  counts,
  overdueOnly,
  onToggleOverdue,
  withOverdue,
  viewMode,
  onToggleView
}) => {
  const { toolbarSx } = useGroupedOrderStyles();

  return (
    <Paper elevation={0} sx={toolbarSx}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={1.5}>
        <TextField
          size="small"
          hiddenLabel
          placeholder="Buscar por código, lote o responsable..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: { md: 380 }, '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.85rem' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={18} color="action">
                  heroicons-outline:magnifying-glass
                </FuseSvgIcon>
              </InputAdornment>
            )
          }}
        />

        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
          <Chip
            clickable
            color="warning"
            variant={overdueOnly ? 'filled' : 'outlined'}
            onClick={onToggleOverdue}
            icon={<FuseSvgIcon size={16}>heroicons-outline:exclamation-triangle</FuseSvgIcon>}
            label={`Con partos vencidos (${withOverdue})`}
            sx={{ height: 30, fontWeight: 700 }}
          />
          <TransferOrdersStatusFilter value={status} onChange={onStatus} counts={counts} />
          <Tooltip title={viewMode === 'grouped' ? 'Cambiar a vista de tabla plana' : 'Cambiar a organización jerárquica (Orden → Lotes)'}>
            <Button
              variant="outlined"
              size="small"
              onClick={onToggleView}
              startIcon={
                <FuseSvgIcon size={16}>{viewMode === 'flat' ? 'heroicons-outline:clipboard-document-list' : 'heroicons-outline:table-cells'}</FuseSvgIcon>
              }
              sx={{ whiteSpace: 'nowrap', px: 2, height: 30, textTransform: 'none', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              {viewMode === 'flat' ? 'Orden → Lotes' : 'Tabla plana'}
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default BirthOrdersToolbar;
