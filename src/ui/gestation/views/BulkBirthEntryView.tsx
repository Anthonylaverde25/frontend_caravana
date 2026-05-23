import { Container, Box, Button, Stack, Paper, Typography, Divider } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useParams, useNavigate } from 'react-router';
import { useBatch } from '@/features/batches/hooks/useBatch';
import BulkBirthEntryTable from '@/ui/gestation/components/BulkBirthEntryTable';

/**
 * BulkBirthEntryView Component
 * Renders the bulk birth entry view with batch context displayed above the spreadsheet-style birth registration table.
 */
function BulkBirthEntryView() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { data: batch, isLoading } = useBatch(Number(batchId));

  const handleBack = () => {
    navigate('/gestation/list');
  };

  if (!batchId || isLoading || !batch) return null;

  const { name } = batch;

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
        title="Ingreso de Partos Masivo"
        actions={
          <Button
            variant="text"
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>}
            onClick={handleBack}
            sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}
          >
            Volver a Monitoreo
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
                {batch.getFarm().name}
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
                {name}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <BulkBirthEntryTable batch={batch} />
      </Box>
    </Container>
  );
}

export default BulkBirthEntryView;
