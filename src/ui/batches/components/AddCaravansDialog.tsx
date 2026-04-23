import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  IconButton,
  MenuItem,
  Grid,
  InputAdornment
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { caravanSchema, CaravanFormValues } from './CaravanSchema';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { useBreeds } from '../hooks/useBreeds';

interface AddCaravansDialogProps {
  open: boolean;
  onClose: () => void;
  batch: Batch | null;
}

const CATEGORIES = [
  { value: 'novillito', label: 'Novillito' },
  { value: 'novillo', label: 'Novillo' },
  { value: 'vaquillona', label: 'Vaquillona' },
  { value: 'vaca', label: 'Vaca' },
  { value: 'vaca_vacia', label: 'Vaca Vacía' },
  { value: 'ternero', label: 'Ternero' },
  { value: 'ternera', label: 'Ternera' },
  { value: 'toro', label: 'Toro' },
];

const SEX_OPTIONS = [
  { value: 'M', label: 'Macho' },
  { value: 'H', label: 'Hembra' },
];

const TEETH_OPTIONS = [
  { value: 0, label: '0 (Boca Vacía)' },
  { value: 2, label: '2 Dientes' },
  { value: 4, label: '4 Dientes' },
  { value: 6, label: '6 Dientes' },
  { value: 8, label: '8 (Boca Llena)' },
];

/**
 * AddCaravansDialog Component
 * Modal for manual registration of animals into a batch.
 */
function AddCaravansDialog({ open, onClose, batch }: AddCaravansDialogProps) {
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<CaravanFormValues>({
    resolver: zodResolver(caravanSchema),
    defaultValues: {
      identification: '',
      category: 'novillo',
      sex: 'M',
      breed_id: undefined,
      teeth: 0,
      entry_weight: undefined,
      exit_weight: undefined,
      entry_date: new Date().toISOString().split('T')[0]
    }
  });

  const selectedCategory = watch('category');
  const selectedSex = watch('sex');
  const { data: breeds = [], isLoading: isLoadingBreeds } = useBreeds();




  const onSubmit = (data: CaravanFormValues, keepOpen = false) => {
    // Backend implementation pending
    console.log('Guardando caravana:', { ...data, batch_id: batch?.id });

    enqueueSnackbar('Funcionalidad de guardado pendiente de backend', { variant: 'info' });

    if (keepOpen) {
      // Clear specific fields but keep others for faster entry
      const currentEntryDate = data.entry_date;
      const currentBreedId = data.breed_id;
      const currentCategory = data.category;
      const currentSex = data.sex;

      reset({
        identification: '',
        category: currentCategory,
        sex: currentSex,
        breed_id: currentBreedId,
        teeth: 0,
        entry_weight: undefined,
        exit_weight: undefined,
        entry_date: currentEntryDate
      });
    } else {
      onClose();
      reset();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!batch) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
        }
      }}
    >
      <Box
        sx={{
          p: 2.5,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>
            Añadir Caravanas
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Lote: <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>{batch.name}</Box> • Establecimiento: {batch.farm_name}
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={24}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
        <DialogContent sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Stack spacing={3}>
            {/* Fila 1: Identificación y Fecha */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <TextField
                {...register('identification')}
                label="Identificación / Caravana"
                variant="filled"
                fullWidth
                required
                autoFocus
                placeholder="Ej: AR-123456"
                error={!!errors.identification}
                helperText={errors.identification?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FuseSvgIcon size={20} sx={{ color: 'text.secondary' }}>heroicons-outline:tag</FuseSvgIcon>
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                  sx: { borderRadius: 1 }
                }}
              />
              <TextField
                {...register('entry_date')}
                label="Fecha de Entrada"
                type="date"
                variant="filled"
                fullWidth
                required
                error={!!errors.entry_date}
                helperText={errors.entry_date?.message}
                InputLabelProps={{ shrink: true }}
                InputProps={{ disableUnderline: true, sx: { borderRadius: 1 } }}
              />
            </Stack>

            {/* Fila 2: Categoría, Sexo y Dentición */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <TextField
                select
                label="Categoría"
                value={selectedCategory}
                onChange={(e) => setValue('category', e.target.value)}
                variant="filled"
                fullWidth
                required
                error={!!errors.category}
                helperText={errors.category?.message}
                InputProps={{ disableUnderline: true, sx: { borderRadius: 1 } }}
              >
                {CATEGORIES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Sexo"
                value={selectedSex}
                onChange={(e) => setValue('sex', e.target.value)}
                variant="filled"
                fullWidth
                required
                error={!!errors.sex}
                helperText={errors.sex?.message}
                InputProps={{ disableUnderline: true, sx: { borderRadius: 1 } }}
              >
                {SEX_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                {...register('teeth', { valueAsNumber: true })}
                label="Dientes / Dentición"
                variant="filled"
                fullWidth
                error={!!errors.teeth}
                helperText={errors.teeth?.message}
                defaultValue={0}
                InputProps={{ disableUnderline: true, sx: { borderRadius: 1 } }}
              >
                {TEETH_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* Fila 3: Raza y Pesos */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <TextField
                select
                {...register('breed_id', { valueAsNumber: true })}
                label="Raza"
                variant="filled"
                fullWidth
                sx={{ flex: { md: 2 } }}
                error={!!errors.breed_id}
                helperText={errors.breed_id?.message || (isLoadingBreeds ? 'Cargando razas...' : '')}
                defaultValue=""
                InputProps={{ disableUnderline: true, sx: { borderRadius: 1 } }}
              >
                {breeds.map((breed) => (
                  <MenuItem key={breed.id} value={breed.id}>
                    {breed.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                {...register('entry_weight', { valueAsNumber: true })}
                label="Peso Entrada"
                type="number"
                variant="filled"
                fullWidth
                sx={{ flex: { md: 1 } }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  disableUnderline: true,
                  sx: { borderRadius: 1 }
                }}
                error={!!errors.entry_weight}
                helperText={errors.entry_weight?.message}
              />

              <TextField
                {...register('exit_weight', { valueAsNumber: true })}
                label="Peso Salida"
                type="number"
                variant="filled"
                fullWidth
                sx={{ flex: { md: 1 } }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                  disableUnderline: true,
                  sx: { borderRadius: 1 }
                }}
                error={!!errors.exit_weight}
                helperText={errors.exit_weight?.message}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            px: 4,
            bgcolor: 'background.default',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Button
            onClick={handleClose}
            variant="text"
            sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}
          >
            Cancelar
          </Button>

          <Stack direction="row" spacing={1.5}>
            <Button
              onClick={handleSubmit((data) => onSubmit(data, true))}
              variant="outlined"
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              Guardar y añadir otra
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: 'primary.main',
                color: '#ffffff', // Aseguramos blanco siempre en el botón principal
                px: 4,
                fontWeight: 800,
                borderRadius: '6px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: 'primary.dark', boxShadow: '0 4px 12px rgba(10, 110, 209, 0.25)' }
              }}
            >
              Guardar
            </Button>
          </Stack>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddCaravansDialog;
