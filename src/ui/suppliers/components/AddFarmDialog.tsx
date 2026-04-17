import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  Box 
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { farmSchema, FarmFormValues } from './SupplierSchema';

interface AddFarmDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (farm: FarmFormValues) => void;
}

/**
 * AddFarmDialog Component
 * Secondary modal to capture farm details with validation.
 */
function AddFarmDialog({ open, onClose, onAdd }: AddFarmDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      country: 'Argentina'
    }
  });

  const onSubmit = (data: FarmFormValues) => {
    onAdd(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '8px' } }}
    >
      <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #e5e5e5' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Nuevo Establecimiento
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              {...register('name')}
              label="Nombre del Establecimiento"
              fullWidth
              variant="filled"
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ bgcolor: '#f7f7f7' }}
            />
            <TextField
              {...register('renspa')}
              label="RENSPA"
              fullWidth
              variant="filled"
              error={!!errors.renspa}
              helperText={errors.renspa?.message}
              placeholder="XX.XXX.X.XXXXX/XX"
              sx={{ bgcolor: '#f7f7f7' }}
            />
            <div className="flex gap-16">
              <TextField
                {...register('city')}
                label="Ciudad"
                fullWidth
                variant="filled"
                error={!!errors.city}
                helperText={errors.city?.message}
                sx={{ bgcolor: '#f7f7f7' }}
              />
              <TextField
                {...register('province')}
                label="Provincia"
                fullWidth
                variant="filled"
                sx={{ bgcolor: '#f7f7f7' }}
              />
            </div>
            <div className="flex gap-16">
              <TextField
                {...register('country')}
                label="País"
                fullWidth
                variant="filled"
                error={!!errors.country}
                sx={{ bgcolor: '#f7f7f7' }}
              />
              <TextField
                {...register('zip')}
                label="CP"
                fullWidth
                variant="filled"
                sx={{ bgcolor: '#f7f7f7' }}
              />
            </div>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={handleClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            sx={{
              bgcolor: '#0a6ed1',
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#0854a1' }
            }}
          >
            Añadir
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddFarmDialog;
