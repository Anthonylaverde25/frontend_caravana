import { 
  Box, 
  Typography, 
  CircularProgress
} from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useCreateFarm } from '@/features/suppliers/hooks/useCreateFarm';
import AddFarmDialog from '../components/AddFarmDialog';
import { FarmFormValues } from '../components/SupplierSchema';

import { SupplierMasterSidebar } from './details/SupplierMasterSidebar';
import { SupplierObjectHeader } from './details/SupplierObjectHeader';
import { SupplierFarmsContent } from './details/SupplierFarmsContent';

/**
 * SuppliersExampleView Component
 * Implements a Master-Detail layout strictly following SAP Fiori Horizon guidelines.
 * Orchestrates sub-components for a clean and maintainable architecture.
 */
function SuppliersExampleView() {
  const { data: suppliers = [], isLoading, isError } = useSuppliers();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAddFarmOpen, setIsAddFarmOpen] = useState(false);
  
  const { mutate: createFarm } = useCreateFarm();
  const { enqueueSnackbar } = useSnackbar();

  // Auto-select first supplier when data loads
  useEffect(() => {
    if (suppliers.length > 0 && selectedId === null) {
      setSelectedId(suppliers[0].id);
    }
  }, [suppliers, selectedId]);

  // Find selected supplier object
  const selectedSupplier = useMemo(() => 
    suppliers.find(s => s.id === selectedId),
    [suppliers, selectedId]
  );

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextView: 'cards' | 'table',
  ) => {
    if (nextView !== null) {
      setViewMode(nextView);
    }
  };

  const handleAddFarm = (farm: FarmFormValues) => {
    if (!selectedId) return;

    const farmData = {
      name: farm.name,
      renspa: farm.renspa,
      location: `${farm.city}, ${farm.province}, ${farm.country}`,
      provider_id: selectedId
    };

    createFarm(farmData, {
      onSuccess: () => {
        enqueueSnackbar('Establecimiento añadido correctamente', { variant: 'success' });
        setIsAddFarmOpen(false);
      },
      onError: (error: any) => {
        const msg = error.response?.data?.message || 'Error al añadir el establecimiento';
        enqueueSnackbar(msg, { variant: 'error' });
      }
    });
  };

  if (isLoading && suppliers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: (theme) => theme.palette.mode === 'light' ? '#f2f2f2' : 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: (theme) => theme.palette.mode === 'light' ? '#f2f2f2' : 'background.default' }}>
        <Typography color="error">Error loading suppliers. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      width: '100%', 
      minHeight: '100vh', 
      bgcolor: (theme) => theme.palette.mode === 'light' ? '#f2f2f2' : 'background.default', 
      color: 'text.primary' 
    }}>
      
      {/* Master Sidebar */}
      <SupplierMasterSidebar 
        suppliers={suppliers}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreateNew={() => console.log('Crear nuevo proveedor')}
      />

      {/* Detail Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        {selectedSupplier ? (
          <>
            {/* Object Header */}
            <SupplierObjectHeader 
              supplier={selectedSupplier}
              onEdit={() => console.log('Editar proveedor')}
            />

            {/* Farms Content */}
            <SupplierFarmsContent 
              farms={selectedSupplier.farms || []}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              onAddNewFarm={() => setIsAddFarmOpen(true)}
            />
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
            <FuseSvgIcon size={64} sx={{ color: 'action.disabled' }}>heroicons-outline:user-group</FuseSvgIcon>
            <Typography variant="h6" color="text.secondary">Selecciona un proveedor para ver detalles</Typography>
          </Box>
        )}
      </Box>

      {/* Shared Modals */}
      <AddFarmDialog
        open={isAddFarmOpen}
        onClose={() => setIsAddFarmOpen(false)}
        onAdd={handleAddFarm}
      />
    </Box>
  );
}

export default SuppliersExampleView;
