import React, { useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Divider
} from '@mui/material';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface TemplateHeaderProps {
  selectedProviderId: number | undefined;
  selectedFarmId: number | undefined;
  onProviderChange: (id: number | undefined, cuit: string) => void;
  onFarmChange: (id: number | undefined, name: string) => void;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  selectedProviderId,
  selectedFarmId,
  onProviderChange,
  onFarmChange
}) => {
  const { data: providers = [], isLoading: isLoadingProviders } = useSuppliers();
  const { data: allFarms = [], isLoading: isLoadingFarms } = useFarms();

  // Filter farms by selected provider
  const filteredFarms = useMemo(() => {
    if (!selectedProviderId) return [];
    return allFarms.filter((f) => f.provider_id === selectedProviderId);
  }, [allFarms, selectedProviderId]);

  // Handle provider change
  const handleProviderChange = (providerId: number) => {
    const provider = providers.find(p => p.id === providerId);
    onProviderChange(providerId, provider?.cuit || '');
    onFarmChange(undefined, ''); // Reset farm selection
  };

  // Handle farm change
  const handleFarmChange = (farmId: number) => {
    const farm = allFarms.find(f => f.id === farmId);
    onFarmChange(farmId, farm?.name || '');
  };

  return (
    <Card 
      variant="outlined" 
      className="no-print"
      sx={{ 
        mb: 3, 
        borderRadius: '8px',
        bgcolor: '#ffffff',
        border: '1px solid #d8dde6',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}
    >
      <CardContent sx={{ p: '20px 24px' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
          <Box 
            sx={{ 
              p: 1.2, 
              borderRadius: '6px', 
              bgcolor: '#0a6ed1', 
              color: '#ffffff',
              display: 'flex',
              boxShadow: '0 2px 4px rgba(10, 110, 209, 0.2)'
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:home-modern</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#32363a', fontSize: '1rem' }}>
              Contexto de la Planilla
            </Typography>
            <Typography variant="caption" sx={{ color: '#6a6d70', fontWeight: 500 }}>
              Seleccione el origen y destino para pre-cargar los datos del encabezado
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '100%', md: '1fr 1fr' }, 
          gap: 4 
        }}>
          <TextField
            select
            fullWidth
            label="Proveedor Principal"
            variant="filled"
            size="small"
            value={selectedProviderId || ''}
            onChange={(e) => handleProviderChange(Number(e.target.value))}
            sx={{ 
              '& .MuiFilledInput-root': { 
                bgcolor: '#f7f7f7',
                borderRadius: '4px',
                '&:hover': { bgcolor: '#efefef' }
              } 
            }}
          >
            {providers.map((provider) => (
              <MenuItem key={provider.id} value={provider.id}>
                {provider.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Establecimiento / Granja"
            variant="filled"
            size="small"
            value={selectedFarmId || ''}
            onChange={(e) => handleFarmChange(Number(e.target.value))}
            disabled={!selectedProviderId}
            sx={{ 
              '& .MuiFilledInput-root': { 
                bgcolor: '#f7f7f7',
                borderRadius: '4px',
                '&:hover': { bgcolor: '#efefef' }
              },
              opacity: !selectedProviderId ? 0.6 : 1 
            }}
          >
            {filteredFarms.map((farm) => (
              <MenuItem key={farm.id} value={farm.id}>
                {farm.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TemplateHeader;
