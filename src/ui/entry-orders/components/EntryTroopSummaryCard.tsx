import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export interface TroopSummaryItem {
  label: string;
  value: React.ReactNode;
}

interface EntryTroopSummaryCardProps {
  title: string;
  subtitle?: string;
  items: TroopSummaryItem[];
  onEdit?: () => void;
}

/**
 * The troop already declared, read-only. A step that only adds the DTE never shows the troop as
 * a form again: if something is wrong, "Editar" goes back to where it was declared.
 */
export const EntryTroopSummaryCard: React.FC<EntryTroopSummaryCardProps> = ({ title, subtitle, items, onEdit }) => (
  <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', p: 2 }}>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {onEdit && (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onEdit}
          startIcon={<FuseSvgIcon size={15}>heroicons-outline:pencil-square</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
        >
          Editar
        </Button>
      )}
    </Stack>
    <Box
      sx={{
        mt: 1.5,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        columnGap: 2,
        rowGap: 1.25
      }}
    >
      {items.map((item) => (
        <Box key={item.label} sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
            {item.label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {item.value ?? '—'}
          </Typography>
        </Box>
      ))}
    </Box>
  </Paper>
);

export default EntryTroopSummaryCard;
