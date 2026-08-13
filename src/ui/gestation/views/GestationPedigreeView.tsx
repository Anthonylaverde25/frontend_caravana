import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useBulkTransferCaravans } from '@/features/caravans/hooks/useBulkTransferCaravans';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import {
  PedigreeRecord,
} from '@/core/caravans/domain/services/pedigreeAnalysis';
import { usePedigreeData } from '../components/pedigree/usePedigreeData';
import PedigreeSummaryCards from '../components/pedigree/PedigreeSummaryCards';
import PedigreeDataTable from '../components/pedigree/PedigreeDataTable';
import MatingAdvisorDialog from '../components/pedigree/MatingAdvisorDialog';
import CaravanRiskyCrossesDialog from '../components/pedigree/CaravanRiskyCrossesDialog';
import IsolateToReserveDialog from '../components/pedigree/IsolateToReserveDialog';
import OutcrossingRescueDialog from '../components/pedigree/OutcrossingRescueDialog';

export default function GestationPedigreeView() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { caravans, isLoading, pedigreeRecords, metrics, caravansMap } = usePedigreeData();
  const bulkTransferMutation = useBulkTransferCaravans();

  // Mating advisor modal state
  const [matingAdvisorOpen, setMatingAdvisorOpen] = useState(false);
  const [advisorInitialDamId, setAdvisorInitialDamId] = useState<number | null>(null);
  const [advisorInitialSireId, setAdvisorInitialSireId] = useState<number | null>(null);

  // Individual Caravan Risky Crosses modal state
  const [selectedRiskyCaravan, setSelectedRiskyCaravan] = useState<Caravan | null>(null);

  // Isolate to reserve batch modal state
  const [isolateDialogOpen, setIsolateDialogOpen] = useState(false);
  const [recordsToIsolate, setRecordsToIsolate] = useState<PedigreeRecord[]>([]);

  // Outcrossing rescue dialog state
  const [rescueDialogOpen, setRescueDialogOpen] = useState(false);
  const [femalesToRescue, setFemalesToRescue] = useState<PedigreeRecord[]>([]);

  const handleFocusInTree = (caravanId: number) => {
    navigate(`/gestation/pedigree/${caravanId}`);
  };

  const handleOpenGraphExplorer = () => {
    navigate('/gestation/pedigree/grafo');
  };

  const handleOpenMatingAdvisor = (record?: PedigreeRecord) => {
    if (record) {
      if (record.sex === 'H') {
        setAdvisorInitialDamId(record.id);
        setAdvisorInitialSireId(null);
      } else if (record.sex === 'M') {
        setAdvisorInitialSireId(record.id);
        setAdvisorInitialDamId(null);
      }
    } else {
      setAdvisorInitialDamId(null);
      setAdvisorInitialSireId(null);
    }
    setMatingAdvisorOpen(true);
  };

  const handleOpenMatingAdvisorPair = (damId?: number, sireId?: number) => {
    setAdvisorInitialDamId(damId || null);
    setAdvisorInitialSireId(sireId || null);
    setMatingAdvisorOpen(true);
  };

  const handleOpenRiskyCrossesForCaravan = (caravanId: number) => {
    const target = caravansMap.get(caravanId);
    if (target) {
      setSelectedRiskyCaravan(target);
    }
  };

  const handleOpenIsolateDialog = (records: PedigreeRecord[]) => {
    setRecordsToIsolate(records);
    setIsolateDialogOpen(true);
  };

  const handleOpenRescueDialog = (females: PedigreeRecord[]) => {
    setFemalesToRescue(females);
    setRescueDialogOpen(true);
  };

  const handleConfirmIsolate = async (reason: string) => {
    if (recordsToIsolate.length === 0) return;

    await bulkTransferMutation.mutateAsync({
      caravanIds: recordsToIsolate.map((r) => r.id),
      reason: reason || 'Apartado preventivo por consanguinidad / evaluación zootécnica desde Pedigree',
    });

    setIsolateDialogOpen(false);
    setRecordsToIsolate([]);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando datos genealógicos y pedigree...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Pedigree, Consanguinidad y Genealogía"
      subtitle="Control genealógico de rodeo, líneas paternas/maternas y evaluación de consanguinidad (Fx) para evitar depresión endogámica."
      actions={
        <>
          <Button
            variant="outlined"
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:share</FuseSvgIcon>}
            onClick={handleOpenGraphExplorer}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
            }}
          >
            Grafo Genealógico Completo
          </Button>
          <Button
            variant="contained"
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:sparkles</FuseSvgIcon>}
            onClick={() => handleOpenMatingAdvisor()}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2.5,
              bgcolor: '#0a6ed1',
              '&:hover': { bgcolor: '#0854a0' },
            }}
          >
            Simulador de Apareamiento
          </Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        {/* KPI summary cards */}
        <PedigreeSummaryCards metrics={metrics} isDark={isDark} />

        {/* Tabular Pedigree DataTable (primary content) */}
        <PedigreeDataTable
          records={pedigreeRecords}
          onFocusInTree={handleFocusInTree}
          onOpenMatingAdvisor={handleOpenMatingAdvisor}
          onOpenRiskyCrosses={handleOpenRiskyCrossesForCaravan}
          onOpenIsolateDialog={handleOpenIsolateDialog}
          onOpenRescueDialog={handleOpenRescueDialog}
        />
      </Stack>

      {/* Mating Advisor Modal */}
      <MatingAdvisorDialog
        open={matingAdvisorOpen}
        onClose={() => setMatingAdvisorOpen(false)}
        caravans={caravans}
        initialDamId={advisorInitialDamId}
        initialSireId={advisorInitialSireId}
      />

      {/* Single Caravan Risky Crosses Dialog */}
      <CaravanRiskyCrossesDialog
        open={Boolean(selectedRiskyCaravan)}
        onClose={() => setSelectedRiskyCaravan(null)}
        caravan={selectedRiskyCaravan}
        caravans={caravans}
        onOpenMatingAdvisor={handleOpenMatingAdvisorPair}
      />

      {/* Isolate to System Reserve Batch Dialog */}
      <IsolateToReserveDialog
        open={isolateDialogOpen}
        onClose={() => setIsolateDialogOpen(false)}
        selectedRecords={recordsToIsolate}
        onConfirm={handleConfirmIsolate}
        isSubmitting={bulkTransferMutation.isPending}
      />

      {/* Outcrossing Rescue Service Order Dialog */}
      <OutcrossingRescueDialog
        open={rescueDialogOpen}
        onClose={() => {
          setRescueDialogOpen(false);
          setFemalesToRescue([]);
        }}
        selectedFemaleRecords={femalesToRescue}
        allCaravans={caravans}
      />
    </ViewLayout>
  );
}
