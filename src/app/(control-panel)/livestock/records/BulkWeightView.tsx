import { useParams, useNavigate } from 'react-router';
import { Box, CircularProgress, Typography, Container, Button } from '@mui/material';
import { BulkWeightEntryTable } from 'src/components/caravan/BulkWeightEntryTable';
import { useBulkRecordWeights } from '@/features/caravans/hooks/useBulkRecordWeights';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useCompany } from '@/contexts/CompanyContext';
import { useMemo } from 'react';

/**
 * BulkWeightView
 * Dedicated route view for recording weights for all animals in a batch.
 */
function BulkWeightView() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);
  const { mutateAsync: bulkRecordWeights, isPending: isSaving } = useBulkRecordWeights();

  // Filter caravans by batch ID
  // In a real scenario, we might want a dedicated API call: /batches/:id/caravans
  const batchCaravans = useMemo(() => {
    return caravans.filter(c => c.batch_id === Number(batchId));
  }, [caravans, batchId]);

  const batchName = batchCaravans.length > 0 ? batchCaravans[0].batch_name || 'Lote' : 'Cargando...';

  const handleSave = async (data: any[]) => {
    try {
      await bulkRecordWeights(data);
      navigate('/caravans');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <CircularProgress size={48} />
        <Typography sx={{ mt: 2, fontWeight: 600, color: 'text.secondary' }}>Cargando datos del lote...</Typography>
      </Box>
    );
  }

  if (batchCaravans.length === 0 && !isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Lote no encontrado</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>No se encontraron animales asignados a este lote o el lote no existe.</Typography>
        <Button variant="contained" onClick={() => navigate('/caravans')}>Volver al Inventario</Button>
      </Container>
    );
  }

  return (
    <BulkWeightEntryTable
      batchName={batchName}
      caravans={batchCaravans as any}
      onSave={handleSave}
      onCancel={() => navigate('/caravans')}
    />
  );
}

export default BulkWeightView;
