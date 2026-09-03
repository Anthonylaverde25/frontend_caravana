import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

interface ServiceOrderObservationsProps {
  observations?: string | null;
}

export const ServiceOrderObservations: React.FC<ServiceOrderObservationsProps> = ({
  observations,
}) => {
  if (!observations) return null;

  return (
    <>
      <Divider sx={{ my: 2.5 }} />
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
          Observaciones y Notas
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '8px',
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
          {observations}
        </Typography>
      </Paper>
    </>
  );
};

export default ServiceOrderObservations;
