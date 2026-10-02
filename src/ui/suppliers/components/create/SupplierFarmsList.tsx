import { Box, Typography, Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FarmCard from '../FarmCard';
import { FarmFormValues } from '../SupplierSchema';

interface SupplierFarmsListProps {
  farms: (FarmFormValues & { id?: string })[];
  onRemove: (index: number) => void;
  onOpenAddFarm: () => void;
  error?: string;
}

/**
 * SupplierFarmsList Component
 * Presentational component for displaying and managing associated farms.
 */
export default function SupplierFarmsList({
  farms,
  onRemove,
  onOpenAddFarm,
  error
}: SupplierFarmsListProps) {
  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '1px' }}
        >
          Establecimientos Asociados ({farms.length})
        </Typography>
        <Button
          size="small"
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>}
          onClick={onOpenAddFarm}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'primary.main' }}
        >
          Agregar Establecimiento
        </Button>
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
          {error}
        </Typography>
      )}

      {farms.length > 0 ? (
        <Stack spacing={1.5}>
          {farms.map((farm, index) => (
            <FarmCard
              key={farm.id || index}
              farm={farm}
              onRemove={() => onRemove(index)}
            />
          ))}
        </Stack>
      ) : (
        <Box
          sx={{
            p: 3,
            border: 1,
            borderColor: 'divider',
            borderStyle: 'dashed',
            borderRadius: '8px',
            textAlign: 'center',
            bgcolor: 'action.hover'
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No hay establecimientos asociados. Haz clic en "Agregar Establecimiento" para añadir uno.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
