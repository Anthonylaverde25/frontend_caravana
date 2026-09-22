import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { CreateCaravanRequest } from '@/core/caravans/domain/entities/Caravan';

interface BatchQuickEntryDialogProps {
  open: boolean;
  onClose: () => void;
  batch: any;
}

const quickEntrySchema = z.object({
  mode: z.enum(['single', 'bulk']),
  identification: z.string().optional(),
  bulkIdentifications: z.string().optional(),
  entry_date: z.string().min(1, 'La fecha de ingreso es requerida'),
  entry_weight: z.coerce.number().positive('El peso debe ser mayor a 0').optional().nullable(),
  sex: z.enum(['M', 'H']),
  category: z.string().min(1, 'La categoría es requerida'),
  teeth: z.coerce.number().min(0).max(99).default(0),
}).refine(
  (data) => {
    if (data.mode === 'single') {
      return !!data.identification && data.identification.trim().length > 0;
    }
    return !!data.bulkIdentifications && data.bulkIdentifications.trim().length > 0;
  },
  {
    message: 'Debes indicar al menos una caravana',
    path: ['identification'],
  }
);

type QuickEntryFormValues = z.infer<typeof quickEntrySchema>;

const caravanRepository = new ApiCaravanRepository();

const CATEGORIES = [
  { value: 'novillito', label: 'Novillito' },
  { value: 'novillo', label: 'Novillo' },
  { value: 'vaquillona', label: 'Vaquillona' },
  { value: 'vaca', label: 'Vaca' },
  { value: 'ternero', label: 'Ternero' },
  { value: 'ternera', label: 'Ternera' },
  { value: 'toro', label: 'Toro' },
];

export default function BatchQuickEntryDialog({
  open,
  onClose,
  batch,
}: BatchQuickEntryDialogProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuickEntryFormValues>({
    resolver: zodResolver(quickEntrySchema),
    defaultValues: {
      mode: 'single',
      identification: '',
      bulkIdentifications: '',
      entry_date: new Date().toISOString().split('T')[0],
      entry_weight: 180,
      sex: 'M',
      category: 'novillito',
      teeth: 0,
    },
  });

  const mode = watch('mode');

  const { mutateAsync: saveCaravans, isPending } = useMutation({
    mutationFn: async (data: QuickEntryFormValues) => {
      const tags: string[] =
        data.mode === 'single'
          ? [data.identification!.trim()]
          : data
              .bulkIdentifications!.split(/[\n,;]+/)
              .map((t) => t.trim())
              .filter((t) => t.length > 0);

      if (tags.length === 0) {
        throw new Error('No se especificaron identificaciones válidas.');
      }

      const payloads: CreateCaravanRequest[] = tags.map((id) => ({
        identification: id,
        category: data.category,
        teeth: Number(data.teeth ?? 0),
        entry_weight: data.entry_weight != null ? Number(data.entry_weight) : null,
        sex: data.sex,
        batch_id: batch?.id,
        farm_id: batch?.farm_id ?? null,
        entry_date: data.entry_date,
        is_empty: data.sex === 'H' ? true : null,
      }));

      if (payloads.length === 1) {
        await caravanRepository.upsert(payloads[0]);
      } else {
        await caravanRepository.bulkUpsert(payloads);
      }

      return tags.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['batch-weight-history'] });
      queryClient.invalidateQueries({ queryKey: ['caravans'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });
      toast.success(
        count === 1
          ? 'Caravana ingresada correctamente al lote'
          : `Se ingresaron ${count} caravanas al lote exitosamente`
      );
      reset();
      onClose();
    },
    onError: (err: any) => {
      console.error('Error al ingresar caravanas:', err);
      toast.error(err.response?.data?.message || err.message || 'Error al registrar caravanas');
    },
  });

  const onSubmit = (values: QuickEntryFormValues) => {
    saveCaravans(values);
  };

  const filledInputStyle = {
    '& .MuiFilledInput-root': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
      borderRadius: '6px',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
      },
      '&.Mui-focused': {
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
        borderColor: 'primary.main',
      },
      '&:before, &:after': { display: 'none' },
    },
  };

  if (!batch) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
          bgcolor: 'background.paper',
        },
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
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Ingresar Animales al Lote
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Destino: <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>{batch.name}</Box>
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {/* Mode selection */}
            <FormControl component="fieldset">
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value="single"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Caravana Única</Typography>}
                    />
                    <FormControlLabel
                      value="bulk"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Múltiples Caravanas (Lote/Rango)</Typography>}
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>

            {/* Identification input */}
            {mode === 'single' ? (
              <Controller
                name="identification"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Identificación / Caravana"
                    variant="filled"
                    placeholder="Ej: TEST-101"
                    fullWidth
                    error={!!errors.identification}
                    helperText={errors.identification?.message}
                    sx={filledInputStyle}
                  />
                )}
              />
            ) : (
              <Controller
                name="bulkIdentifications"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Identificaciones (separadas por coma o salto de línea)"
                    variant="filled"
                    placeholder="Ej: TEST-01, TEST-02, TEST-03"
                    multiline
                    rows={3}
                    fullWidth
                    error={!!errors.identification}
                    helperText={errors.identification?.message || 'Ingresa varias caravanas para simular la entrada de un grupo'}
                    sx={filledInputStyle}
                  />
                )}
              />
            )}

            {/* Date and Weight row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Controller
                name="entry_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Fecha de Ingreso"
                    variant="filled"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.entry_date}
                    helperText={errors.entry_date?.message || 'Define cuándo ingresa al gráfico'}
                    sx={filledInputStyle}
                  />
                )}
              />

              <Controller
                name="entry_weight"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Peso de Ingreso (kg)"
                    variant="filled"
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    }}
                    error={!!errors.entry_weight}
                    helperText={errors.entry_weight?.message}
                    sx={filledInputStyle}
                  />
                )}
              />
            </Box>

            {/* Category and Sex row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Categoría"
                    variant="filled"
                    fullWidth
                    sx={filledInputStyle}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="sex"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Sexo"
                    variant="filled"
                    fullWidth
                    sx={filledInputStyle}
                  >
                    <MenuItem value="M">Macho</MenuItem>
                    <MenuItem value="H">Hembra</MenuItem>
                  </TextField>
                )}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            px: 3,
            bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc',
            borderTop: 1,
            borderColor: 'divider',
            gap: 1.5,
          }}
        >
          <Button onClick={onClose} variant="text" sx={{ fontWeight: 600, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            sx={{
              px: 3,
              fontWeight: 700,
              borderRadius: '6px',
              textTransform: 'none',
              boxShadow: 'none',
              bgcolor: '#16a34a',
              '&:hover': { bgcolor: '#15803d' },
            }}
          >
            {isPending ? 'Guardando...' : 'Confirmar Ingreso'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
