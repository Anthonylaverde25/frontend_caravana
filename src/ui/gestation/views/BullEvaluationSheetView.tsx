import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Box,
  Stack,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import ViewLayout from 'src/components/ViewLayout';
import { usePreServiceBulls, useSaveBullHealthEvaluation } from '@/features/gestation/hooks/usePreServiceBulls';
import { BullEvaluationSheetTable } from '../components/pre-service/sheet/BullEvaluationSheetTable';
import { BullEvaluationRowData } from '../components/pre-service/sheet/BullEvaluationSheetRow';

export const BullEvaluationSheetView: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: bulls = [], isLoading: isLoadingBulls } = usePreServiceBulls();
  const saveMutation = useSaveBullHealthEvaluation();

  const [isSaving, setIsSaving] = useState(false);
  const [rows, setRows] = useState<BullEvaluationRowData[]>([]);

  const selectedIds: number[] = useMemo(() => {
    if (location.state?.selectedBullIds && Array.isArray(location.state.selectedBullIds)) {
      return location.state.selectedBullIds;
    }
    const params = new URLSearchParams(location.search);
    const idsParam = params.get('ids');
    if (idsParam) {
      return idsParam.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
    }
    return [];
  }, [location.state, location.search]);

  // Initialize sheet rows from fetched bulls
  useEffect(() => {
    if (bulls.length > 0 && rows.length === 0) {
      const targetBulls =
        selectedIds.length > 0
          ? bulls.filter((b) => selectedIds.includes(b.caravan_id))
          : bulls;

      const initialRows: BullEvaluationRowData[] = targetBulls.map((b, idx) => {
        const hasPendingScrape = b.lab_samples?.some(
          (s) => s.sample_type === 'PREPUCE_SCRAPE' && s.status === 'PENDING_RESULTS'
        );
        const hasPendingBlood = b.lab_samples?.some(
          (s) => s.sample_type === 'BLOOD_SEROLOGY' && s.status === 'PENDING_RESULTS'
        );

        return {
          caravan_id: b.caravan_id,
          caravan_number: b.caravan_number,
          initial_status: b.status,
          scrotal_circumference: b.scrotal_circumference_cm ? String(b.scrotal_circumference_cm) : '',
          body_condition_score: b.body_condition_score ? String(b.body_condition_score) : '3.5',
          libido: b.libido || 'MEDIA',
          aplomo_notes: b.aplomo_notes || 'Aplomos correctos, sin afecciones.',
          prepuce_scrape: hasPendingScrape ?? false,
          prepuce_scrape_tube: `R-01-${String(idx + 1).padStart(2, '0')}`,
          blood_serology: hasPendingBlood ?? false,
          blood_serology_tube: `S-01-${String(idx + 1).padStart(2, '0')}`,
          observations: b.observations || '',
        };
      });

      setRows(initialRows);
    }
  }, [bulls, selectedIds, rows.length]);

  // Handle row cell modification
  const handleChangeRow = (caravanId: number, field: keyof BullEvaluationRowData, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.caravan_id === caravanId ? { ...r, [field]: value } : r))
    );
  };

  // Handle removing a bull from this sheet session
  const handleRemoveRow = (caravanId: number) => {
    setRows((prev) => prev.filter((r) => r.caravan_id !== caravanId));
  };

  // Batch update all rows
  const handleApplyBatchValue = (field: keyof BullEvaluationRowData, value: any) => {
    setRows((prev) => prev.map((r) => ({ ...r, [field]: value })));
    enqueueSnackbar(`Valor aplicado a todos los ${rows.length} toros de la planilla.`, {
      variant: 'info',
    });
  };

  // Save all modified evaluations in batch
  const handleSaveAll = async () => {
    if (rows.length === 0) return;

    setIsSaving(true);
    let successCount = 0;

    try {
      for (const row of rows) {
        await saveMutation.mutateAsync({
          caravan_id: row.caravan_id,
          last_evaluation_date: new Date().toISOString().split('T')[0],
          scrotal_circumference_cm: row.scrotal_circumference ? parseFloat(row.scrotal_circumference) : null,
          body_condition_score: row.body_condition_score ? parseFloat(row.body_condition_score) : null,
          libido: row.libido,
          aplomo_notes: row.aplomo_notes || null,
          observations: row.observations || null,
          prepuce_scrape: row.prepuce_scrape,
          prepuce_scrape_tube: row.prepuce_scrape ? row.prepuce_scrape_tube : null,
          blood_serology: row.blood_serology,
          blood_serology_tube: row.blood_serology ? row.blood_serology_tube : null,
          sample_round: 1,
        });
        successCount++;
      }

      enqueueSnackbar(`Planilla de manga guardada exitosamente (${successCount} toros evaluados y muestreados).`, {
        variant: 'success',
      });
      navigate('/gestation/pre-service');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al guardar la planilla de evaluaciones.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingBulls) {
    return (
      <ViewLayout
        title="Planilla de Evaluación Andrológica en Manga"
        backUrl="/gestation/pre-service"
        backTitle="Volver a Pre-Servicio"
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </ViewLayout>
    );
  }

  const primaryColor = isDark ? '#60a5fa' : '#0a6ed1';
  const successColor = isDark ? '#34d399' : '#107e3e';

  return (
    <ViewLayout
      title="Planilla de Evaluación Andrológica en Manga"
      subtitle="Carga masiva tipo hoja de cálculo para biometría testicular, condición corporal y muestreo biológico en corral"
      backUrl="/gestation/pre-service"
      backTitle="Volver a Pre-Servicio"
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => navigate('/work-templates/TOR-01')}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
            sx={{
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
            }}
          >
            Imprimir Hoja A4 (TOR-01)
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/gestation/pre-service')}
            disabled={isSaving}
            sx={{
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleSaveAll}
            disabled={isSaving || rows.length === 0}
            startIcon={
              isSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
              )
            }
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2.5,
              bgcolor: successColor,
              '&:hover': { bgcolor: isDark ? '#10b981' : '#0c6230' },
            }}
          >
            {isSaving ? 'Guardando...' : `Guardar Planilla (${rows.length} Toros)`}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        {/* Context Summary Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 1.75,
            px: 2.5,
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            borderRadius: '8px',
            bgcolor: isDark ? '#1e293b' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: alpha(primaryColor, 0.12),
                color: primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FuseSvgIcon size={20}>heroicons-outline:table-cells</FuseSvgIcon>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                Planilla de Manga Activa (TOR-01)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {rows.length} {rows.length === 1 ? 'toro cargado' : 'toros cargados'} para biometría, raspajes ETS y serología
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Toros en Planilla
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
                {rows.length}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto' }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Muestras Raspaje
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#b45309', lineHeight: 1.2 }}>
                {rows.filter((r) => r.prepuce_scrape).length} tubos
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ height: 28, my: 'auto' }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                Muestras Serología
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e40af', lineHeight: 1.2 }}>
                {rows.filter((r) => r.blood_serology).length} tubos
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Editable Spreadsheet Table */}
        <BullEvaluationSheetTable
          rows={rows}
          onChangeRow={handleChangeRow}
          onRemoveRow={handleRemoveRow}
          onApplyBatchValue={handleApplyBatchValue}
        />
      </Stack>
    </ViewLayout>
  );
};

export default BullEvaluationSheetView;
