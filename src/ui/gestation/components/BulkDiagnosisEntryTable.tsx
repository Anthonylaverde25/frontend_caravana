import { useState, useMemo, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Stack,
  Paper,
  Container,
  Typography,
  TextField,
  MenuItem,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useCompany } from '@/contexts/CompanyContext';
import { useBulkRegisterGestationDiagnosis } from '@/features/gestation/hooks/useServiceOrders';

const diagnosisRowSchema = z.object({
  caravan_id: z.number(),
  is_pregnant: z.boolean(),
  gestation_stage: z.enum(['head', 'body', 'tail']).nullable().optional(),
  gestation_months: z.number({ invalid_type_error: 'Debe ser número' }).min(0.5).max(9.5).nullable().optional(),
  confirmed_sire_id: z.union([z.string(), z.number()]).nullable().optional(),
  diagnosis_date: z.string().min(1, 'Requerido'),
  empty_destination_batch_id: z.union([z.string(), z.number()]).nullable().optional()
});

const bulkDiagnosisSchema = z.object({
  diagnoses: z.array(diagnosisRowSchema)
});

type BulkDiagnosisFormValues = z.infer<typeof bulkDiagnosisSchema>;

import BulkDiagnosisRow from './bulk-diagnosis/BulkDiagnosisRow';

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
  const { data: dbBatches = [] } = useBatches();
  const { data: orderBatch } = useBatch(order?.batch_id);
  const { mutateAsync: bulkRegisterDiagnosis, isPending: isSaving } = useBulkRegisterGestationDiagnosis();

  const [globalEmptyBatchId, setGlobalEmptyBatchId] = useState<string | number>('');

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

  const pregnantCount = useMemo(() => watchedDiagnoses.filter(d => d.is_pregnant).length, [watchedDiagnoses]);
  const emptyCount = useMemo(() => watchedDiagnoses.filter(d => !d.is_pregnant).length, [watchedDiagnoses]);

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
            if (order.service_type === 'single') {
              sireId = order.male_caravan_ids[0] || '';
            } else if (order.service_type === 'multi' && order.is_controlled_service && order.female_sire_assignments) {
              const assignment = order.female_sire_assignments.find(
                a => a.female_caravan_id === female.id
              );
              sireId = assignment ? assignment.assigned_male_caravan_id : '';
            }
          }

          return {
            caravan_id: female.id,
            is_pregnant: hasActive,
            gestation_stage: stage,
            gestation_months: months,
            confirmed_sire_id: sireId,
            diagnosis_date: date,
            empty_destination_batch_id: ''
          };
        })
      });
    }
  }, [females, reset, watchedDiagnoses.length, order.male_caravan_ids]);

  const applyGlobalEmptyBatch = () => {
    if (emptyCount === 0) {
      enqueueSnackbar('No hay vacas diagnosticadas como vacías actualmente', { variant: 'warning' });
      return;
    }

    watchedDiagnoses.forEach((d, idx) => {
      if (!d.is_pregnant) {
        setValue(`diagnoses.${idx}.empty_destination_batch_id`, globalEmptyBatchId === '' ? '' : Number(globalEmptyBatchId));
      }
    });

    enqueueSnackbar(`Lote de destino asignado a las ${emptyCount} vacas vacías`, { variant: 'info' });
  };

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
        diagnosis_date: item.diagnosis_date,
        empty_destination_batch_id: !item.is_pregnant && item.empty_destination_batch_id && item.empty_destination_batch_id !== ''
          ? Number(item.empty_destination_batch_id)
          : null
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

  const cellStyle = {
    p: 0,
    borderRight: 1,
    borderBottom: 1,
    borderColor: theme.palette.divider,
    '&:last-child': { borderRight: 0 }
  };

  if (isLoadingCaravans) return null;

  return (
    <Box sx={{ width: '100%', mb: 10 }}>
      {/* Quick Bulk Toolbar for Empty Cows */}
      {emptyCount > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2,
            border: 1,
            borderColor: theme.palette.warning.main,
            borderRadius: '8px',
            bgcolor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <FuseSvgIcon size={20} sx={{ color: 'warning.main' }}>heroicons-outline:arrows-right-left</FuseSvgIcon>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Reubicación masiva de vacías ({emptyCount}):
            </Typography>
            <TextField
              select
              size="small"
              value={globalEmptyBatchId}
              onChange={(e) => setGlobalEmptyBatchId(e.target.value)}
              sx={{ minWidth: 280, bgcolor: 'background.paper', borderRadius: '4px' }}
            >
              <MenuItem value="">
                <em>-- Mantener en lote actual {orderBatch ? `(${orderBatch.name})` : ''} --</em>
              </MenuItem>
              {dbBatches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  Mover a: {b.name} ({b.activity_name || b.farm_name || 'Lote'})
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              size="small"
              color="warning"
              onClick={applyGlobalEmptyBatch}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Aplicar a todas las vacías
            </Button>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {pregnantCount} Preñadas 🟢 | {emptyCount} Vacías 🔴
          </Typography>
        </Paper>
      )}

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
                    DIAGNÓSTICO GESTACIONAL &amp; REUBICACIÓN
                  </TableCell>
                  <TableCell colSpan={1} sx={{ ...cellStyle, bgcolor: headerBg, borderRight: 0, borderBottom: '2px solid', borderColor: theme.palette.divider }} />
                </TableRow>
                <TableRow>
                  <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.secondary, fontWeight: 700, width: 40 }}>#</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 160, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Identificación / Caravana</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 120, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Categoría</TableCell>
                  
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 150, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Diagnóstico (Tacto)</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 170, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Estadio Estimado</TableCell>
                  <TableCell align="right" sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 90, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Meses</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 220, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Toro / Lote Destino (Vacía)</TableCell>
                  <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 140, fontWeight: 700, px: 2, py: 1.5, color: theme.palette.text.primary }}>Fecha Diagnóstico</TableCell>
                  <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, width: 50, borderRight: 0 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <BulkDiagnosisRow
                    key={field.id}
                    index={index}
                    fieldId={field.id}
                    control={control}
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    watchedRow={watchedDiagnoses[index]}
                    caravans={caravans}
                    orderBulls={orderBulls}
                    order={order}
                    batches={dbBatches}
                    currentBatchName={orderBatch?.name}
                    onRemove={() => remove(index)}
                    fieldsLength={fields.length}
                    zebraBg={zebraBg}
                    headerBg={headerBg}
                  />
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
