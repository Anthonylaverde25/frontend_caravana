import { Box, Paper, Typography, Stack, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import { BreedsTable } from '@/ui/breeds/components/BreedsTable';

export default function BreedsCatalogSection() {
  const { data: breeds = [] } = useBreeds();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header Info */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FuseSvgIcon size={24} sx={{ color: 'primary.main' }}>
            heroicons-outline:tag
          </FuseSvgIcon>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Catálogo Genético & Razas
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Catálogo de razas y biotipos bovinos para asignación en caravanas, tropas y órdenes de ingreso.
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={`${breeds.length} Razas Registradas`}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            fontSize: '0.72rem',
            height: 24,
            color: '#334155',
            borderColor: '#cbd5e1',
          }}
        />
      </Paper>

      {/* Embedded Breeds Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          bgcolor: '#ffffff',
        }}
      >
        <BreedsTable />
      </Paper>
    </Box>
  );
}
