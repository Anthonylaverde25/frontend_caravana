import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

interface ServiceOrderFemaleChipsProps {
  femaleCaravans: Caravan[];
}

export const ServiceOrderFemaleChips: React.FC<ServiceOrderFemaleChipsProps> = ({
  femaleCaravans,
}) => {
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
          Vientres Hembras (♀) ({femaleCaravans.length})
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 3,
          borderRadius: '8px',
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        {femaleCaravans.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
            No hay vientres en este lote.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxHeight: 180, overflowY: 'auto', p: 0.5 }}>
            {femaleCaravans.slice(0, 40).map((female) => (
              <Chip
                key={female.id}
                label={`#${female.identification}`}
                size="small"
                variant="outlined"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  borderRadius: '4px',
                }}
              />
            ))}
            {femaleCaravans.length > 40 && (
              <Chip
                label={`+${femaleCaravans.length - 40} vientres más...`}
                size="small"
                variant="filled"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  borderRadius: '4px',
                }}
              />
            )}
          </Box>
        )}
      </Paper>
    </>
  );
};

export default ServiceOrderFemaleChips;
