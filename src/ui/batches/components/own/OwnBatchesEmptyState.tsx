import React from 'react';
import { Box, Paper, Stack, Typography, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface OwnBatchesEmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onCreateBatch?: () => void;
}

export const OwnBatchesEmptyState: React.FC<OwnBatchesEmptyStateProps> = ({
  hasActiveFilters,
  onResetFilters,
  onCreateBatch,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        py: 8,
        borderRadius: '8px',
        border: '1px dashed',
        borderColor: 'divider',
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={2.5} alignItems="center" justifyContent="center">
        <Box
          sx={{
            p: 2,
            bgcolor: 'action.hover',
            color: 'text.secondary',
            borderRadius: '50%',
            display: 'flex',
          }}
        >
          <FuseSvgIcon size={40}>
            {hasActiveFilters ? 'heroicons-outline:funnel' : 'heroicons-outline:rectangle-stack'}
          </FuseSvgIcon>
        </Box>

        <Stack spacing={0.5} maxWidth={440}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem' }}>
            {hasActiveFilters
              ? 'Sin resultados para los filtros seleccionados'
              : 'No hay lotes propios registrados'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
            {hasActiveFilters
              ? 'No se encontraron lotes que coincidan con la combinación actual de búsqueda, actividades o tipos.'
              : 'Empiece creando el primer lote propio de su establecimiento para clasificar y gestionar sus tropas de ganado.'}
          </Typography>
        </Stack>

        {hasActiveFilters ? (
          <Button
            variant="contained"
            size="small"
            onClick={onResetFilters}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>}
            sx={{
              mt: 1,
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
            }}
          >
            Limpiar filtros y ver todos
          </Button>
        ) : onCreateBatch ? (
          <Button
            variant="contained"
            size="small"
            onClick={onCreateBatch}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus-circle</FuseSvgIcon>}
            sx={{
              mt: 1,
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
            }}
          >
            Crear Primer Lote
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
};
