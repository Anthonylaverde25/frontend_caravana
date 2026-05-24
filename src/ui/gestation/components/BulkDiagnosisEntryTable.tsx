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
  Typography,
  Divider
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { useMemo, useEffect } from 'react';
import { z } from 'zod';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useCompany } from '@/contexts/CompanyContext';
import { useBulkRegisterGestationDiagnosis } from '@/features/gestation/hooks/useServiceOrders';

const diagnosisRowSchema = z.object({
  caravan_id: z.number(),
  is_pregnant: z.boolean(),
  gestation_stage: z.enum(['head', 'body', 'tail']).nullable().optional(),
  gestation_months: z.number({ invalid_type_error: 'Debe ser número' }).min(0.5).max(9.5).nullable().optional(),
  confirmed_sire_id: z.union([z.string(), z.number()]).nullable().optional(),
  diagnosis_date: z.string().min(1, 'Requerido')
});

const bulkDiagnosisSchema = z.object({
  diagnoses: z.array(diagnosisRowSchema)
});

type BulkDiagnosisFormValues = z.infer<typeof bulkDiagnosisSchema>;

const PREGNANCY_OPTIONS = [
  { value: true, label: 'Preñada 🟢' },
  { value: false, label: 'Vacía 🔴' },
];

const STAGE_OPTIONS = [
  { value: 'head', label: 'Cabeza (> 2 meses)' },
  { value: 'body', label: 'Cuerpo (1-2 meses)' },
  { value: 'tail', label: 'Cola (< 1 mes)' },
];

interface BulkDiagnosisEntryTableProps {
  order: ServiceOrder;
}

/**
 * BulkDiagnosisEntryTable Component
 * Spreadsheet-style editable grid for bulk pregnancy diagnosis (tacto).
 */
function BulkDiagnosisEntryTable({ order }: BulkDiagnosisEntryTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);
  const { mutateAsync: bulkRegisterDiagnosis, isPending: isSaving } = useBulkRegisterGestationDiagnosis();

  // Filter females belonging to this service order
  const females = useMemo(() => {
    return caravans.filter(c => order.female_caravan_ids.includes(c.id));
  }, [caravans, order.female_caravan_ids]);

  // Filter bulls belonging to this service order
  const orderBulls = useMemo(() => {
    return caravans.filter(c => order.male_caravan_ids.includes(c.id));
  }, [caravans, order.male_caravan_ids]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    register,
    reset,
    setValue
  } = useForm<BulkDiagnosisFormValues>({
    resolver: zodResolver(bulkDiagnosisSchema),
    defaultValues: {
      diagnoses: []
    }
  });

  const { fields, remove } = useFieldArray({
    control,
    name: 'diagnoses'
  });

  const watchedDiagnoses = watch('diagnoses') || [];

  // Reset/populate form when females load
  useEffect(() => {
    if (females.length > 0 && watchedDiagnoses.length === 0) {
      reset({
        diagnoses: females.map(female => {
          const hasActive = female.active_gestation !== null;
          const stage = (hasActive ? female.active_gestation.gestation_stage : 'head') as 'head' | 'body' | 'tail';
          const months = hasActive ? female.active_gestation.gestation_months : 3;
          const date = hasActive && female.active_gestation.start_date 
            ? female.active_gestation.start_date 
            : new Date().toISOString().split('T')[0];
          
          let sireId: string | number = '';
          if (hasActive && female.active_gestation.sires && female.active_gestation.sires.length > 0) {
            const confirmed = female.active_gestation.sires.find((s: any) => s.is_confirmed);
            if (confirmed) {
              sireId = confirmed.id;
            } else if (female.active_gestation.sires.length === 1) {
              sireId = female.active_gestation.sires[0].id;
            }
          } else {
            sireId = order.male_caravan_ids.length === 1 ? order.male_caravan_ids[0] : '';
          }

          return {
            caravan_id: female.id,
            is_pregnant: hasActive,
            gestation_stage: stage,
            gestation_months: months,
            confirmed_sire_id: sireId,
            diagnosis_date: date
          };
        })
      });
    }
  }, [females, reset, watchedDiagnoses.length, order.male_caravan_ids]);

  const onSubmit = async (data: BulkDiagnosisFormValues) => {
    if (data.diagnoses.length === 0) {
      enqueueSnackbar('Debe diagnosticar al menos un animal', { variant: 'warning' });
      return;
    }

    try {
      const payload = data.diagnoses.map(item => ({
        caravan_id: item.caravan_id,
        service_order_id: order.id,
        is_pregnant: item.is_pregnant,
        gestation_stage: item.is_pregnant ? item.gestation_stage : null,
        gestation_months: item.is_pregnant ? item.gestation_months : null,
        confirmed_sire_id: item.is_pregnant && item.confirmed_sire_id !== '' ? Number(item.confirmed_sire_id) : null,
        diagnosis_date: item.diagnosis_date
      }));

      await bulkRegisterDiagnosis(payload);
      enqueueSnackbar(`${data.diagnoses.length} diagnósticos guardados con éxito`, { variant: 'success' });
      navigate('/gestation/tacto');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al guardar el registro de diagnósticos', { variant: 'error' });
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

  if (isLoadingCaravans) return null;

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
                  <TableCell colSpan={3} align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.secondary, fontWeight: 800, borderBottom: '2px solid', borderColor: theme.palette.divider, py: 1 }}>
                    DATOS DE LA HEMBRA EN SERVICIO
                  </TableCell>
                  <TableCell colSpan={4} align="center" sx={{ ...cellStyle, bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main, fontWeight: 800, borderBottom: '2px solid', borderColor: theme.palette.primary.main, py: 1 }}>
                    DIAGNÓSTICO GESTACIONAL (TACTO / ECOGRAFÍA)
                  </TableCell>
                  <TableCell colSpan={1} sx={{ ...cellStyle, bgcolor: headerBg, borderRight: 0, borderBottom: '2px solid', borderColor: theme.palette.divider }} />
                </TableRow>
                <TableRow>
                  <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.secondary, fontWeight: 700, width: 40 }}>#</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 160, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Identificación / Caravana</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 120, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Categoría</TableCell>
                  
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 150, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Diagnóstico (Tacto)</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 180, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Estadio Estimado</TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 100, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Meses Preñez</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 180, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Toro Confirmado</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 140, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Fecha Diagnóstico</TableCell>
                  <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, width: 50, borderRight: 0 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => {
                  const isPregnant = watchedDiagnoses[index]?.is_pregnant ?? true;

                  return (
                    <TableRow key={field.id} sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}>
                      {/* 1. Index */}
                      <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.disabled, fontSize: '0.75rem' }}>
                        {index + 1}
                      </TableCell>

                      {/* 2. Caravan Identifier */}
                      <TableCell sx={cellStyle}>
                        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', minHeight: '40px' }}>
                          <input type="hidden" {...register(`diagnoses.${index}.caravan_id` as const)} />
                          {(() => {
                            const femaleId = watchedDiagnoses[index]?.caravan_id || field.caravan_id;
                            const cow = caravans.find(c => c.id === femaleId);
                            return (
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#0a6ed1' }}>
                                {cow ? cow.identification : '-'}
                              </Typography>
                            );
                          })()}
                        </Box>
                      </TableCell>

                      {/* 3. Category */}
                      <TableCell sx={cellStyle}>
                        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', minHeight: '40px' }}>
                          {(() => {
                            const femaleId = watchedDiagnoses[index]?.caravan_id || field.caravan_id;
                            const cow = caravans.find(c => c.id === femaleId);
                            return (
                              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                {cow?.category || 'Vientre'}
                              </Typography>
                            );
                          })()}
                        </Box>
                      </TableCell>

                      {/* 4. Pregnancy Diagnosis Selection */}
                      <TableCell sx={cellStyle}>
                        <Controller
                          control={control}
                          name={`diagnoses.${index}.is_pregnant` as const}
                          render={({ field: controllerField }) => (
                            <TextField
                              select
                              fullWidth
                              variant="outlined"
                              sx={inputSx}
                              value={controllerField.value}
                              onChange={(e) => {
                                const val = e.target.value === 'true';
                                controllerField.onChange(val);
                                // If they mark empty, nullify stage/months/sire
                                if (!val) {
                                  setValue(`diagnoses.${index}.gestation_stage`, null);
                                  setValue(`diagnoses.${index}.gestation_months`, null);
                                  setValue(`diagnoses.${index}.confirmed_sire_id`, '');
                                } else {
                                  setValue(`diagnoses.${index}.gestation_stage`, 'head');
                                  setValue(`diagnoses.${index}.gestation_months`, 3);
                                }
                              }}
                            >
                              {PREGNANCY_OPTIONS.map((option) => (
                                <MenuItem key={String(option.value)} value={String(option.value)}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      </TableCell>

                      {/* 5. Gestation Stage Selection */}
                      <TableCell sx={cellStyle}>
                        <Controller
                          control={control}
                          name={`diagnoses.${index}.gestation_stage` as const}
                          render={({ field: controllerField }) => (
                            <TextField
                              select
                              fullWidth
                              variant="outlined"
                              sx={inputSx}
                              disabled={!isPregnant}
                              value={controllerField.value ?? ''}
                              onChange={(e) => {
                                const stage = e.target.value;
                                controllerField.onChange(stage);
                                // Auto set default months
                                if (stage === 'head') setValue(`diagnoses.${index}.gestation_months`, 3);
                                else if (stage === 'body') setValue(`diagnoses.${index}.gestation_months`, 2);
                                else if (stage === 'tail') setValue(`diagnoses.${index}.gestation_months`, 1);
                              }}
                            >
                              <MenuItem value=""><em>-- N/A --</em></MenuItem>
                              {STAGE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      </TableCell>

                      {/* 6. Gestation Months Input */}
                      <TableCell sx={cellStyle}>
                        <Controller
                          control={control}
                          name={`diagnoses.${index}.gestation_months` as const}
                          render={({ field: controllerField }) => (
                            <TextField
                              fullWidth
                              variant="outlined"
                              type="number"
                              placeholder="Meses"
                              disabled={!isPregnant}
                              error={!!errors.diagnoses?.[index]?.gestation_months}
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

                      {/* 7. Confirmed Sire Selection */}
                      <TableCell sx={cellStyle}>
                        <Controller
                          control={control}
                          name={`diagnoses.${index}.confirmed_sire_id` as const}
                          render={({ field: controllerField }) => (
                            <TextField
                              select
                              fullWidth
                              variant="outlined"
                              sx={inputSx}
                              disabled={!isPregnant}
                              value={controllerField.value ?? ''}
                              onChange={controllerField.onChange}
                            >
                              <MenuItem value=""><em>-- Colectivo / Indeterminado --</em></MenuItem>
                              {orderBulls.map((bull) => (
                                <MenuItem key={bull.id} value={bull.id}>
                                  {bull.identification}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      </TableCell>

                      {/* 8. Diagnosis Date Input */}
                      <TableCell sx={cellStyle}>
                        <TextField
                          {...register(`diagnoses.${index}.diagnosis_date` as const)}
                          fullWidth
                          variant="outlined"
                          type="date"
                          error={!!errors.diagnoses?.[index]?.diagnosis_date}
                          sx={inputSx}
                        />
                      </TableCell>

                      {/* 9. Actions Column */}
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
                  );
                })}
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
                onClick={() => navigate('/gestation/tacto')}
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
                {isSaving ? 'Guardando...' : 'Guardar Diagnósticos'}
              </Button>
            </Stack>
          </Container>
        </Box>
      </form>
    </Box>
  );
}

export default BulkDiagnosisEntryTable;
