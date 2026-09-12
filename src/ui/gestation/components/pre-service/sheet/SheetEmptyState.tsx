import React from 'react';
import { Button, Paper, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface Props {
  onGoToListing: () => void;
}

/**
 * What the sheet shows instead of loading the whole troop.
 *
 * Defaulting to "everything" is how an act ends up certifying animals that never went through
 * the chute, so an empty selection is a dead end by design, not a convenience.
 */
export const SheetEmptyState: React.FC<Props> = ({ onGoToListing }) => (
  <Paper
    elevation={0}
    sx={{
      p: 5,
      textAlign: 'center',
      border: 1,
      borderColor: 'divider',
      borderRadius: '8px',
      bgcolor: 'background.paper',
    }}
  >
    <FuseSvgIcon size={40} color="disabled">
      heroicons-outline:cursor-arrow-rays
    </FuseSvgIcon>
    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mt: 1.5 }}>
      Elegí primero qué toros pasan por la manga
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
      El acta que emite esta planilla certifica animales concretos, así que la selección es
      deliberada: marcá las caravanas en el listado y volvé.
    </Typography>
    <Button
      variant="contained"
      onClick={onGoToListing}
      sx={{ fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none' }}
    >
      Ir al listado de toros
    </Button>
  </Paper>
);
