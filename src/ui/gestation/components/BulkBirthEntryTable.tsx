import { useFieldArray, useForm } from 'react-hook-form';
import { useState } from 'react';
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
  Alert,
  useTheme
} from '@mui/material';
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
import BulkBirthRow from './bulk-birth/BulkBirthRow';

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



/**
 * BulkBirthEntryTable Component
 * Spreadsheet-style editable grid for bulk birth registrations.
 */
function BulkBirthEntryTable({ batch }: { batch: Batch }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [deferSire, setDeferSire] = useState(false);

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

  const buildPayload = (data: BulkBirthFormValues, forceDeferSire: boolean): RegisterBirthDTO[] =>
    data.births.map(birth => {
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
        // If deferred mode is active, always send null regardless of what was selected
        father_id: forceDeferSire
          ? null
          : (birth.father_id !== '' && birth.father_id !== undefined && birth.father_id !== null ? Number(birth.father_id) : null),
        gestation_id: motherCaravan?.active_gestation?.id || null
      };
    });

  const onSubmit = async (data: BulkBirthFormValues) => {
    if (data.births.length === 0) {
      enqueueSnackbar('Debe registrar al menos un parto', { variant: 'warning' });
      return;
    }
    try {
      const payload = buildPayload(data, false);
      await bulkRegisterBirth(payload);
      enqueueSnackbar(`${data.births.length} partos registrados con éxito`, { variant: 'success' });
      navigate('/gestation/list');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al guardar el registro de partos', { variant: 'error' });
    }
  };

  const onSubmitDeferred = async (data: BulkBirthFormValues) => {
    if (data.births.length === 0) {
      enqueueSnackbar('Debe registrar al menos un parto', { variant: 'warning' });
      return;
    }
    try {
      const payload = buildPayload(data, true);
      await bulkRegisterBirth(payload);
      enqueueSnackbar(
        `${data.births.length} partos guardados. Asigná los padres desde el Dashboard.`,
        { variant: 'info', autoHideDuration: 6000 }
      );
      navigate('/gestation/list');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al guardar el registro de partos', { variant: 'error' });
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

  if (isLoadingCaravans || isLoadingBreeds) return null;

  return (
    <Box sx={{ width: '100%', mb: 10 }}>
      {deferSire && (
        <Alert
          severity="info"
          sx={{ mb: 2, borderRadius: '6px', fontWeight: 500 }}
          onClose={() => setDeferSire(false)}
        >
          <strong>Modo diferido activo.</strong> Los partos se guardarán sin asignar padre. Podrás completar la paternidad desde el{' '}
          <strong>Dashboard → Sires Pendientes</strong> cuando tengas el resultado del laboratorio o confirmes los rasgos fenotípicos.
        </Alert>
      )}
      <form onSubmit={handleSubmit(deferSire ? onSubmitDeferred : onSubmit)}>
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
                   <BulkBirthRow
                     key={field.id}
                     index={index}
                     fieldId={field.id}
                     control={control}
                     register={register}
                     errors={errors}
                     watchedRow={watchedBirths[index]}
                     caravans={caravans}
                     breeds={breeds}
                     maleCaravans={maleCaravans}
                     onRemove={() => remove(index)}
                     fieldsLength={fields.length}
                     isDark={isDark}
                     zebraBg={zebraBg}
                     headerBg={headerBg}
                     deferSire={deferSire}
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
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              {/* Left: deferred mode hint */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => setDeferSire(v => !v)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    borderRadius: '4px',
                    borderColor: deferSire ? 'warning.main' : 'divider',
                    color: deferSire ? 'warning.main' : 'text.secondary',
                    bgcolor: deferSire
                      ? (isDark ? 'rgba(255,167,38,0.08)' : 'rgba(255,167,38,0.06)')
                      : 'transparent',
                  }}
                  startIcon={
                    <Box component="span" sx={{ fontSize: '1rem' }}>⏳</Box>
                  }
                >
                  {deferSire ? 'Modo Diferido Activo' : 'Posponer Sires'}
                </Button>
              </Stack>

              {/* Right: actions */}
              <Stack direction="row" spacing={2}>
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
                  color={deferSire ? 'warning' : 'primary'}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    px: 6,
                    borderRadius: '4px',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' }
                  }}
                >
                  {isSaving
                    ? 'Guardando...'
                    : deferSire
                      ? 'Guardar sin Sire'
                      : 'Guardar Cambios'
                  }
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </form>
    </Box>
  );
}

export default BulkBirthEntryTable;
