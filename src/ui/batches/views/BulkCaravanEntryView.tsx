import { Container, Box, Button, Stack, Paper, Typography, Divider } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useParams, useNavigate } from 'react-router';
import { useBatches } from '@/features/batches/hooks/useBatches';
import BulkCaravanEntryTable from '@/ui/batches/components/BulkCaravanEntryTable';

/**
 * BulkCaravanEntryView Component
 * Bulk caravan entry view with batch context displayed above the data table.
 */
function BulkCaravanEntryView() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { data: batches = [] } = useBatches();
  
  const batch = batches.find(b => b.id === Number(batchId));

  const handleBack = () => {
    navigate(-1);
  };

  if (!batchId) return null;

  return (
    <Container
      maxWidth="xl"
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        pb: 10
      }}
    >
      <ViewHeader
        title="Ingreso Masivo de Caravanas"
        actions={
          <Button
            variant="text"
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>}
            onClick={handleBack}
            sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}
          >
            Volver a Lotes
          </Button>
        }
      />

      <Box component="main" sx={{ mt: 3 }}>
        {/* Context Bar - Batch & Farm Info */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: '8px',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <FuseSvgIcon size={20} sx={{ color: 'primary.main' }}>heroicons-outline:home-modern</FuseSvgIcon>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', lineHeight: 1 }}>
                Establecimiento
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {batch?.farm_name || '...'}
              </Typography>
            </Box>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ height: 32, my: 'auto' }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <FuseSvgIcon size={20} sx={{ color: 'primary.main' }}>heroicons-outline:queue-list</FuseSvgIcon>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', lineHeight: 1 }}>
                Lote Seleccionado
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {batch?.name || '...'}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <BulkCaravanEntryTable batchId={Number(batchId)} />
      </Box>
    </Container>
  );
}

export default BulkCaravanEntryView;
