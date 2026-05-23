import { useMemo } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import SireRotationManager from '../components/SireRotationManager';

/**
 * BullRotationView View Component
 * Renders the operational process of Sire Assignment & Rotation Manager.
 */
function BullRotationView() {
  const navigate = useNavigate();
  const { activeCompanyId } = useCompany();

  // Fetch caravans from active company
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);

  // Filter only pregnant caravans (active_gestation is not null)
  const gestatingCaravans = useMemo(() => {
    return caravans.filter(c => c.active_gestation !== null);
  }, [caravans]);

  // Dynamically extract batches from gestating caravans
  const batches = useMemo<string[]>(() => {
    const set = new Set<string>(gestatingCaravans.map(c => String(c.batch_name || 'Sin Lote')));
    return Array.from(set).sort();
  }, [gestatingCaravans]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando configuración de toros...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Asignación y Rotación de Toros"
      subtitle="Planificación y monitoreo reproductivo de monta natural, servicio controlado o inseminación artificial por lote."
      actions={
        <Button
          variant="text"
          startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>}
          onClick={() => navigate('/gestation')}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Volver al Panel
        </Button>
      }
    >
      <SireRotationManager caravans={caravans} batches={batches} />
    </ViewLayout>
  );
}

export default BullRotationView;
