import { Container, Box, Button, Stack, Paper, Typography, Divider } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useParams, useNavigate } from 'react-router';
import { useServiceOrders } from '@/features/gestation/hooks/useServiceOrders';
import { useBatch } from '@/features/batches/hooks/useBatch';
import BulkDiagnosisEntryTable from '../components/BulkDiagnosisEntryTable';

/**
 * BulkDiagnosisEntryView Component
 * Renders the bulk pregnancy diagnosis entry view with service order and batch context.
 */
function BulkDiagnosisEntryView() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: orders = [], isLoading: isLoadingOrders } = useServiceOrders();

  const order = orders.find(o => o.id === Number(orderId));
  const { data: batch, isLoading: isLoadingBatch } = useBatch(order?.batch_id);

  const handleBack = () => {
    navigate('/gestation/tacto');
  };

  if (isLoadingOrders || isLoadingBatch) {
    return null;
  }

  if (!order || !batch) {
    return (
      <Container maxWidth="xl" sx={{ mt: 5 }}>
        <Typography variant="h6" color="error">Orden de servicio no encontrada</Typography>
        <Button onClick={handleBack} variant="contained" color="primary" sx={{ mt: 2 }}>
          Volver a Tacto y Diagnósticos
        </Button>
      </Container>
    );
  }

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
        title="Diagnóstico Gestacional Masivo (Tacto)"
        actions={
          <Button
            variant="text"
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>}
            onClick={handleBack}
            sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}
          >
            Volver a Tacto y Diagnósticos
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
                {batch.farm_name || 'Sin Establecimiento'}
              </Typography>
            </Box>
          </Stack>

          <Divider orientation="vertical" flexItem sx={{ height: 32, my: 'auto' }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <FuseSvgIcon size={20} sx={{ color: 'primary.main' }}>heroicons-outline:queue-list</FuseSvgIcon>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', lineHeight: 1 }}>
                Orden de Servicio / Rotación
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {order.code} ({batch.name})
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <BulkDiagnosisEntryTable order={order} />
      </Box>
    </Container>
  );
}

export default BulkDiagnosisEntryView;
