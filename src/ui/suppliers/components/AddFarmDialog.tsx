import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Stack, 
  Typography, 
  Box,
  IconButton
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
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
 * Styled adhering to canonical design tokens.
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
      name: '',
      renspa: '',
      city: '',
      province: '',
      country: 'Argentina',
      zip: ''
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
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
          bgcolor: 'background.paper'
        }
      }}
    >
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          Nuevo Establecimiento
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Stack spacing={2.5}>
            <TextField
              {...register('name')}
              label="Nombre del Establecimiento"
              fullWidth
              variant="filled"
              required
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ bgcolor: 'action.hover' }}
            />
            <TextField
              {...register('renspa')}
              label="RENSPA"
              fullWidth
              variant="filled"
              required
              error={!!errors.renspa}
              helperText={errors.renspa?.message}
              placeholder="XX.XXX.X.XXXXX/XX"
              sx={{ bgcolor: 'action.hover' }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                {...register('city')}
                label="Ciudad"
                fullWidth
                variant="filled"
                required
                error={!!errors.city}
                helperText={errors.city?.message}
                sx={{ bgcolor: 'action.hover' }}
              />
              <TextField
                {...register('province')}
                label="Provincia"
                fullWidth
                variant="filled"
                sx={{ bgcolor: 'action.hover' }}
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                {...register('country')}
                label="País"
                fullWidth
                variant="filled"
                required
                error={!!errors.country}
                sx={{ bgcolor: 'action.hover' }}
              />
              <TextField
                {...register('zip')}
                label="Código Postal"
                fullWidth
                variant="filled"
                sx={{ bgcolor: 'action.hover' }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            px: 3,
            bgcolor: 'background.default',
            borderTop: 1,
            borderColor: 'divider',
            gap: 1.5
          }}
        >
          <Button
            onClick={handleClose}
            variant="text"
            sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            type="submit"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'primary.dark' }
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
