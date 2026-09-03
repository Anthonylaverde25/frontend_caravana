import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';

interface ServiceOrderZootechnicalBalanceProps {
  femaleCount: number;
  maleCount: number;
  ratio: number;
}

export const ServiceOrderZootechnicalBalance: React.FC<ServiceOrderZootechnicalBalanceProps> = ({
  femaleCount,
  maleCount,
  ratio,
}) => {
  const isRatioOptimal = ratio >= 2.0 && ratio <= 4.0;

  return (
    <>
      <Box
        sx={{
          mb: 1.5,
          pl: 1,
          borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}
        >
          Balance Zootécnico &amp; Torada
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 1.75,
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
            ♀ Vientres
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: '#db2777' }}>
            {femaleCount}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 1.75,
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
            ♂ Toros
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: '#2563eb' }}>
            {maleCount}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 1.75,
            borderRadius: '8px',
            textAlign: 'center',
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
            Ratio Torada
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mt: 0.5,
              color: isRatioOptimal ? 'success.main' : ratio > 0 ? 'warning.main' : 'text.primary',
            }}
          >
            {ratio}%
          </Typography>
        </Paper>
      </Stack>
    </>
  );
};

export default ServiceOrderZootechnicalBalance;
