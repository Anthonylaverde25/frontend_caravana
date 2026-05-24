import { Button } from '@mui/material';
import { useNavigate } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import SireRotationManager from '../components/SireRotationManager';

/**
 * BullRotationView View Component
 * Renders the operational process of Sire Assignment & Rotation Manager.
 */
function BullRotationView() {
  const navigate = useNavigate();

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
      <SireRotationManager />
    </ViewLayout>
  );
}

export default BullRotationView;
