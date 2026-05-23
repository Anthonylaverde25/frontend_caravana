import { useFieldArray, useForm, Controller } from 'react-hook-form';
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
  useTheme,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { useMemo, useEffect } from 'react';
import { z } from 'zod';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import { useBulkRegisterBirth } from '@/features/caravans/hooks/useBulkRegisterBirth';
import { RegisterBirthDTO } from '@/core/caravans/domain/entities/Caravan';
import { Divider } from '@mui/material';

const getStageLabel = (stage?: string) => {
  switch (stage) {
    case 'head': return 'Cabeza';
    case 'body': return 'Cuerpo';
    case 'tail': return 'Cola';
    default: return '-';
  }
};

const birthRowSchema = z.object({
  mother_id: z.union([z.string(), z.number()]).refine(val => val !== '' && val !== undefined, {
    message: 'Debe seleccionar una madre'
  }),
  calf_identification: z.string().min(1, 'Requerido'),
  calf_sex: z.enum(['M', 'H']),
  calf_weight: z.number({ invalid_type_error: 'Debe ser número' }).positive('Debe ser > 0').optional().nullable(),
  calf_breed_id: z.union([z.string(), z.number()]).optional().nullable(),
  birth_date: z.string().min(1, 'Requerido'),
  calf_teeth: z.union([z.string(), z.number()]).optional().nullable(),
  father_id: z.union([z.string(), z.number()]).optional().nullable()
});

const bulkBirthSchema = z.object({
  births: z.array(birthRowSchema)
});

type BulkBirthFormValues = z.infer<typeof bulkBirthSchema>;

const SEX_OPTIONS = [
  { value: 'M', label: 'Macho' },
  { value: 'H', label: 'Hembra' },
];

/**
 * BulkBirthEntryTable Component
 * Spreadsheet-style editable grid for bulk birth registrations.
 */
function BulkBirthEntryTable({ batch }: { batch: Batch }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);
  const { data: breeds = [], isLoading: isLoadingBreeds } = useBreeds();
  const { mutateAsync: bulkRegisterBirth, isPending: isSaving } = useBulkRegisterBirth();

  // Filter pregnant caravans belonging to this batch
  const pregnantCaravans = useMemo(() => {
    return caravans.filter(c => c.batch_id === batch.id && c.active_gestation !== null);
  }, [caravans, batch.id]);

  // Filter male caravans
  const maleCaravans = useMemo(() => {
    return caravans.filter(c => c.sex === 'M');
  }, [caravans]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    register,
    reset
  } = useForm<BulkBirthFormValues>({
    resolver: zodResolver(bulkBirthSchema),
    defaultValues: {
      births: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'births'
  });

  const watchedBirths = watch('births') || [];

  // Reset/populate form when pregnantCaravans load
  useEffect(() => {
    if (pregnantCaravans.length > 0 && watchedBirths.length === 0) {
      reset({
        births: pregnantCaravans.map(mother => {
          let suggestedFatherId: string | number = '';
          const activeGestation = mother.active_gestation;
          if (activeGestation && activeGestation.sires && activeGestation.sires.length > 0) {
            const confirmed = activeGestation.sires.find(s => s.is_confirmed);
            if (confirmed) {
              suggestedFatherId = confirmed.id;
            } else if (activeGestation.sires.length === 1) {
              suggestedFatherId = activeGestation.sires[0].id;
            }
          }

          return {
            mother_id: mother.id,
            calf_identification: '',
            calf_sex: 'M',
            calf_weight: null,
            calf_breed_id: '',
            birth_date: new Date().toISOString().split('T')[0],
            calf_teeth: 0,
            father_id: suggestedFatherId
          };
        })
      });
    }
  }, [pregnantCaravans, reset, watchedBirths.length]);

  const onSubmit = async (data: BulkBirthFormValues) => {
    if (data.births.length === 0) {
      enqueueSnackbar('Debe registrar al menos un parto', { variant: 'warning' });
      return;
    }

    try {
      const payload: RegisterBirthDTO[] = data.births.map(birth => {
        const motherId = Number(birth.mother_id);
        const motherCaravan = caravans.find(c => c.id === motherId);

        return {
          calf_identification: birth.calf_identification,
          calf_sex: birth.calf_sex,
          calf_category: birth.calf_sex === 'M' ? 'ternero' : 'ternera',
          calf_teeth: birth.calf_teeth !== null && birth.calf_teeth !== undefined && birth.calf_teeth !== '' ? Number(birth.calf_teeth) : 0,
          calf_weight: birth.calf_weight || null,
          calf_breed_id: birth.calf_breed_id ? Number(birth.calf_breed_id) : null,
          birth_date: birth.birth_date,
          batch_id: batch.id,
          mother_id: motherId,
          father_id: birth.father_id !== '' && birth.father_id !== undefined && birth.father_id !== null ? Number(birth.father_id) : null,
          gestation_id: motherCaravan?.active_gestation?.id || null
        };
      });

      await bulkRegisterBirth(payload);
      enqueueSnackbar(`${data.births.length} partos registrados con éxito`, { variant: 'success' });
      navigate('/gestation/list');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al guardar el registro de partos', { variant: 'error' });
    }
  };


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

  if (isLoadingCaravans || isLoadingBreeds) return null;

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
                  <TableCell colSpan={2} align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.secondary, fontWeight: 800, borderBottom: '2px solid', borderColor: theme.palette.divider, py: 1 }}>
                    DATOS DE LA MADRE (GESTANTE)
                  </TableCell>
                  <TableCell colSpan={7} align="center" sx={{ ...cellStyle, bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main, fontWeight: 800, borderBottom: '2px solid', borderColor: theme.palette.primary.main, py: 1 }}>
                    DATOS DEL TERNERO (A REGISTRAR)
                  </TableCell>
                  <TableCell colSpan={1} sx={{ ...cellStyle, bgcolor: headerBg, borderRight: 0, borderBottom: '2px solid', borderColor: theme.palette.divider }} />
                </TableRow>
                <TableRow>
                  <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.secondary, fontWeight: 700, width: 40 }}>#</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 200, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Madre (Gestante)</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 160, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Caravana del Ternero</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 100, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Sexo del Ternero</TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 100, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Peso al Nacer (kg)</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 160, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Raza del Ternero</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 100, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Dientes</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 180, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Padre (Sire)</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 140, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Fecha Nacimiento</TableCell>
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
                      <Box sx={{ px: 2, py: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '40px' }}>
                        <input type="hidden" {...register(`births.${index}.mother_id` as const)} />
                        {(() => {
                          const motherId = watchedBirths[index]?.mother_id || field.mother_id;
                          const mother = caravans.find(c => c.id === Number(motherId));
                          return (
                            <>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: 'primary.main' }}>
                                {mother ? mother.identification : '-'}
                              </Typography>
                              {mother?.active_gestation?.gestation_stage && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                  ({mother.category || 'Vientre'}) - Est: {getStageLabel(mother.active_gestation.gestation_stage)}
                                </Typography>
                              )}
                            </>
                          );
                        })()}
                      </Box>
                    </TableCell>
 
                    <TableCell sx={cellStyle}>
                      <TextField
                        {...register(`births.${index}.calf_identification` as const)}
                        fullWidth
                        variant="outlined"
                        placeholder="ID Ternero"
                        error={!!errors.births?.[index]?.calf_identification}
                        sx={inputSx}
                      />
                    </TableCell>
 
                    <TableCell sx={cellStyle}>
                      <Controller
                        control={control}
                        name={`births.${index}.calf_sex` as const}
                        render={({ field: controllerField }) => (
                          <TextField
                            select
                            fullWidth
                            variant="outlined"
                            sx={inputSx}
                            {...controllerField}
                          >
                            {SEX_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </TableCell>
 
                    <TableCell sx={cellStyle}>
                      <Controller
                        control={control}
                        name={`births.${index}.calf_weight` as const}
                        render={({ field: controllerField }) => (
                          <TextField
                            fullWidth
                            variant="outlined"
                            type="number"
                            placeholder="0.00"
                            error={!!errors.births?.[index]?.calf_weight}
                            sx={{ ...inputSx, '& input': { textAlign: 'right' } }}
                            value={controllerField.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : parseFloat(e.target.value);
                              controllerField.onChange(val);
                            }}
                          />
                        )}
                      />
                    </TableCell>
 
                    <TableCell sx={cellStyle}>
                      <Controller
                        control={control}
                        name={`births.${index}.calf_breed_id` as const}
                        render={({ field: controllerField }) => (
                          <TextField
                            select
                            fullWidth
                            variant="outlined"
                            sx={inputSx}
                            {...controllerField}
                          >
                            <MenuItem value=""><em>-- Seleccionar Raza --</em></MenuItem>
                            {breeds.map((breed) => (
                              <MenuItem key={breed.id} value={breed.id}>{breed.name}</MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </TableCell>
 
                    <TableCell sx={cellStyle}>
                      <Controller
                        control={control}
                        name={`births.${index}.calf_teeth` as const}
                        render={({ field: controllerField }) => (
                          <TextField
                            fullWidth
                            variant="outlined"
                            type="number"
                            placeholder="0"
                            error={!!errors.births?.[index]?.calf_teeth}
                            sx={{ ...inputSx, '& input': { textAlign: 'right' } }}
                            value={controllerField.value ?? ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                              controllerField.onChange(val);
                            }}
                          />
                        )}
                      />
                    </TableCell>

                    <TableCell sx={cellStyle}>
                      <Controller
                        control={control}
                        name={`births.${index}.father_id` as const}
                        render={({ field: controllerField }) => (
                          <TextField
                            select
                            fullWidth
                            variant="outlined"
                            sx={inputSx}
                            {...controllerField}
                          >
                            <MenuItem value=""><em>-- Desconocido / Sin esp. --</em></MenuItem>
                            {(() => {
                              const motherId = watchedBirths[index]?.mother_id || field.mother_id;
                              const mother = caravans.find(c => c.id === Number(motherId));
                              const gestationSires = mother?.active_gestation?.sires || [];
                              
                              return (
                                <>
                                  {gestationSires.map(s => (
                                    <MenuItem key={`sug-${s.id}`} value={s.id}>
                                      ⭐ Sugerido: {s.identification}
                                    </MenuItem>
                                  ))}
                                  {gestationSires.length > 0 && <Divider />}
                                  {maleCaravans.map((male) => {
                                    if (gestationSires.some(gs => gs.id === male.id)) return null;
                                    return (
                                      <MenuItem key={male.id} value={male.id}>
                                        {male.identification}
                                      </MenuItem>
                                    );
                                  })}
                                </>
                              );
                            })()}
                          </TextField>
                        )}
                      />
                    </TableCell>
 
                    <TableCell sx={cellStyle}>
                      <TextField
                        {...register(`births.${index}.birth_date` as const)}
                        fullWidth
                        variant="outlined"
                        type="date"
                        error={!!errors.births?.[index]?.birth_date}
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

        </Paper>

        {/* Sticky Footer */}
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
                onClick={() => navigate('/gestation/list')}
                sx={{ textTransform: 'none', fontWeight: 600, px: 4, color: theme.palette.text.secondary }}
              >
                Descartar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSaving}
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
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Stack>
          </Container>
        </Box>
      </form>
    </Box>
  );
}

export default BulkBirthEntryTable;
