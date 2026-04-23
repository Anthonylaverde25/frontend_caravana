import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
  MenuItem,
  Box,
  Stack,
  Paper,
  Container,
  useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { caravanSchema, CaravanFormValues } from './CaravanSchema';
import { useBreeds } from '../hooks/useBreeds';
import { z } from 'zod';

const bulkSchema = z.object({
  caravans: z.array(caravanSchema)
});

type BulkFormValues = z.infer<typeof bulkSchema>;

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

interface BulkCaravanEntryTableProps {
  batchId: number;
}

/**
 * BulkCaravanEntryTable Component
 * Spreadsheet-style editable grid compatible with Light and Dark modes.
 */
function BulkCaravanEntryTable({ batchId }: BulkCaravanEntryTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { data: breeds = [], isLoading: isLoadingBreeds } = useBreeds();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<BulkFormValues>({
    resolver: zodResolver(bulkSchema),
    defaultValues: {
      caravans: Array(3).fill({
        identification: '',
        category: 'novillo',
        sex: 'M',
        breed_id: undefined,
        teeth: 0,
        entry_weight: undefined,
        entry_date: new Date().toISOString().split('T')[0]
      })
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'caravans'
  });

  const onSubmit = (data: BulkFormValues) => {
    console.log('Enviando carga masiva:', { batchId, data });
    enqueueSnackbar(`${data.caravans.length} registros listos para procesar`, { variant: 'success' });
  };

  const addRow = () => {
    const watchedValues = watch(`caravans.${fields.length - 1}`);
    append({
      identification: '',
      category: watchedValues?.category || 'novillo',
      sex: watchedValues?.sex || 'M',
      breed_id: watchedValues?.breed_id,
      teeth: watchedValues?.teeth || 0,
      entry_weight: undefined,
      entry_date: watchedValues?.entry_date || new Date().toISOString().split('T')[0]
    });
  };

  // Theme-aware styles
  const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';
  const focusBorder = theme.palette.primary.main;
  
  const cellStyle = {
    p: 0,
    borderRight: 1,
    borderBottom: 1,
    borderColor: theme.palette.divider,
    '&:last-child': { borderRight: 0 }
  };

  const inputSx = {
    '& .MuiInputBase-root': {
      borderRadius: 0,
      fontSize: '0.875rem',
      backgroundColor: 'transparent',
      height: '40px',
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `inset 0 0 0 2px ${focusBorder}`,
        zIndex: 1
      },
      '&.Mui-error': {
        boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}`,
      }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    },
    '& input': {
      padding: '8px 12px'
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 10 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '4px',
            border: 1,
            borderColor: theme.palette.divider,
            overflow: 'hidden',
            bgcolor: theme.palette.background.paper
          }}
        >
          <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
            <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.secondary, fontWeight: 700, width: 40 }}>#</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 150, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Caravana</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 140, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Categoría</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 100, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Sexo</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 160, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Raza</TableCell>
                  <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 100, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Dientes</TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 100, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Peso (kg)</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 140, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Fecha Ent.</TableCell>
                  <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, width: 50, borderRight: 0 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id} sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}>
                    <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.disabled, fontSize: '0.75rem' }}>
                      {index + 1}
                    </TableCell>
                    
                    <TableCell sx={cellStyle}>
                      <TextField
                        {...register(`caravans.${index}.identification` as const)}
                        fullWidth
                        variant="outlined"
                        placeholder="Identificación"
                        error={!!errors.caravans?.[index]?.identification}
                        sx={inputSx}
                      />
                    </TableCell>

                    <TableCell sx={cellStyle}>
                      <TextField
                        select
                        {...register(`caravans.${index}.category` as const)}
                        fullWidth
                        variant="outlined"
                        defaultValue={field.category}
                        sx={inputSx}
                      >
                        {CATEGORIES.map((option) => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell sx={cellStyle}>
                      <TextField
                        select
                        {...register(`caravans.${index}.sex` as const)}
                        fullWidth
                        variant="outlined"
                        defaultValue={field.sex}
                        sx={inputSx}
                      >
                        {SEX_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell sx={cellStyle}>
                      <TextField
                        select
                        {...register(`caravans.${index}.breed_id` as const, { valueAsNumber: true })}
                        fullWidth
                        variant="outlined"
                        defaultValue={field.breed_id || ""}
                        sx={inputSx}
                      >
                        <MenuItem value=""><em>-- Seleccionar --</em></MenuItem>
                        {breeds.map((breed) => (
                          <MenuItem key={breed.id} value={breed.id}>{breed.name}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell sx={cellStyle}>
                      <TextField
                        select
                        {...register(`caravans.${index}.teeth` as const, { valueAsNumber: true })}
                        fullWidth
                        variant="outlined"
                        defaultValue={field.teeth}
                        sx={{ ...inputSx, '& input': { textAlign: 'center' } }}
                      >
                        {TEETH_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell sx={cellStyle}>
                      <TextField
                        {...register(`caravans.${index}.entry_weight` as const, { valueAsNumber: true })}
                        fullWidth
                        variant="outlined"
                        type="number"
                        placeholder="0.00"
                        error={!!errors.caravans?.[index]?.entry_weight}
                        sx={{ ...inputSx, '& input': { textAlign: 'right' } }}
                      />
                    </TableCell>

                    <TableCell sx={cellStyle}>
                      <TextField
                        {...register(`caravans.${index}.entry_date` as const)}
                        fullWidth
                        variant="outlined"
                        type="date"
                        sx={inputSx}
                      />
                    </TableCell>

                    <TableCell align="center" sx={{ ...cellStyle, borderRight: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        sx={{ color: theme.palette.text.disabled, '&:hover': { color: theme.palette.error.main } }}
                      >
                        <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 1.5, bgcolor: headerBg, borderTop: 1, borderColor: theme.palette.divider }}>
            <Button
              variant="text"
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
              onClick={addRow}
              sx={{ fontWeight: 600, textTransform: 'none', color: theme.palette.text.secondary, '&:hover': { color: theme.palette.primary.main } }}
            >
              Añadir nueva fila
            </Button>
          </Box>
        </Paper>

        {/* Theme-aware Sticky Footer */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderTop: 1,
            borderColor: theme.palette.divider,
            boxShadow: isDark ? '0 -4px 20px rgba(0,0,0,0.5)' : '0 -4px 20px rgba(0,0,0,0.1)',
            zIndex: 1000,
            py: 2
          }}
        >
          <Container maxWidth="xl">
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="text"
                onClick={() => navigate(-1)}
                sx={{ textTransform: 'none', fontWeight: 600, px: 4, color: theme.palette.text.secondary }}
              >
                Descartar
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  px: 6,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderRadius: '4px',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: theme.palette.primary.dark, boxShadow: 'none' }
                }}
              >
                Guardar Cambios
              </Button>
            </Stack>
          </Container>
        </Box>
      </form>
    </Box>
  );
}

export default BulkCaravanEntryTable;
