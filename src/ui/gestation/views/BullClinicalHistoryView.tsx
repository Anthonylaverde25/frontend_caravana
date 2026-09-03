import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Stack,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useBullClinicalHistory } from '@/features/gestation/hooks/useBullClinicalHistory';
import {
  BullClinicalHistoryHeader,
  BullCeEvolutionCard,
  BullClinicalTimeline,
  BullEvaluationsHistoryTable,
  BullLabSamplesHistoryTable,
  BullDiagnosesHistoryTable,
} from '../components/pre-service/clinical-history';

export const BullClinicalHistoryView: React.FC = () => {
  const { caravanId } = useParams<{ caravanId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [currentTab, setCurrentTab] = useState(0);

  const { data, isLoading, error, refetch } = useBullClinicalHistory(
    caravanId ? Number(caravanId) : null
  );

  const handleEvaluateInManga = () => {
    navigate('/gestation/pre-service/evaluate');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <ViewLayout
        title="Historia Clínica Veterinaria"
        subtitle="Cargando expediente clínico del reproductor..."
        showBackButton
        backUrl="/gestation/pre-service"
        backTitle="Volver a Pre-Servicio"
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress />
        </Box>
      </ViewLayout>
    );
  }

  if (error || !data) {
    return (
      <ViewLayout
        title="Historia Clínica Veterinaria"
        subtitle="Error al cargar la información del reproductor"
        showBackButton
        backUrl="/gestation/pre-service"
        backTitle="Volver a Pre-Servicio"
      >
        <Alert
          severity="error"
          sx={{ borderRadius: '8px' }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        >
          No fue posible recuperar la historia clínica del animal seleccionado.
        </Alert>
      </ViewLayout>
    );
  }

  const { caravan, computed_status, metrics, evaluations, lab_samples, diagnoses, timeline } = data;

  return (
    <ViewLayout
      title={`Historia Clínica: ${caravan.identification}`}
      subtitle="Expediente Zootécnico, Andrológico & Sanitario Longitudinal • Criterio Carrillo (1988)"
      showBackButton
      backUrl="/gestation/pre-service"
      backTitle="Volver a Pre-Servicio"
      actions={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
            onClick={handlePrint}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
              color: 'text.primary',
            }}
          >
            Imprimir Expediente
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:pencil-square</FuseSvgIcon>}
            onClick={handleEvaluateInManga}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              bgcolor: '#0a6ed1',
              '&:hover': { bgcolor: '#0854a0' },
            }}
          >
            Evaluar en Manga
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        {/* 1. Header Summary Card */}
        <BullClinicalHistoryHeader
          caravan={caravan}
          computedStatus={computed_status}
          onEvaluateInManga={handleEvaluateInManga}
        />

        {/* 2. Ce Evolution and Clinical KPI Cards */}
        <BullCeEvolutionCard metrics={metrics} />

        {/* 3. Section Navigation Tabs */}
        <Box
          sx={{
            borderBottom: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                minHeight: 44,
              },
            }}
          >
            <Tab
              icon={<FuseSvgIcon size={18}>heroicons-outline:clock</FuseSvgIcon>}
              iconPosition="start"
              label={`Línea de Tiempo (${timeline.length})`}
            />
            <Tab
              icon={<FuseSvgIcon size={18}>heroicons-outline:queue-list</FuseSvgIcon>}
              iconPosition="start"
              label={`Exámenes Físicos & CE (${evaluations.length})`}
            />
            <Tab
              icon={<FuseSvgIcon size={18}>heroicons-outline:beaker</FuseSvgIcon>}
              iconPosition="start"
              label={`Muestreos de Laboratorio (${lab_samples.length})`}
            />
            <Tab
              icon={<FuseSvgIcon size={18}>heroicons-outline:shield-exclamation</FuseSvgIcon>}
              iconPosition="start"
              label={`Diagnósticos & Tratamientos (${diagnoses.length})`}
            />
          </Tabs>
        </Box>

        {/* 4. Tab Content Panels */}
        {currentTab === 0 && <BullClinicalTimeline timeline={timeline} />}
        {currentTab === 1 && <BullEvaluationsHistoryTable evaluations={evaluations} />}
        {currentTab === 2 && <BullLabSamplesHistoryTable samples={lab_samples} />}
        {currentTab === 3 && <BullDiagnosesHistoryTable diagnoses={diagnoses} />}
      </Stack>
    </ViewLayout>
  );
};

export default BullClinicalHistoryView;
