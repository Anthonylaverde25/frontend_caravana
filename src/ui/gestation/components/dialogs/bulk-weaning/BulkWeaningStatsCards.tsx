import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface BulkWeaningStatsCardsProps {
  totalCount: number;
  maleCount: number;
  femaleCount: number;
}

export const BulkWeaningStatsCards: React.FC<BulkWeaningStatsCardsProps> = ({
  totalCount,
  maleCount,
  femaleCount,
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          textAlign: 'center',
          borderRadius: '8px',
          bgcolor: 'action.hover',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Total Crías a Destetar
        </Typography>
        <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
          {totalCount}
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          textAlign: 'center',
          borderRadius: '8px',
          bgcolor: 'action.hover',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Machos (Terneros)
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#2563eb', mt: 0.5 }}>
          {maleCount}
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          textAlign: 'center',
          borderRadius: '8px',
          bgcolor: 'action.hover',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Hembras (Terneras)
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#db2777', mt: 0.5 }}>
          {femaleCount}
        </Typography>
      </Paper>
    </Box>
  );
};

export default BulkWeaningStatsCards;
