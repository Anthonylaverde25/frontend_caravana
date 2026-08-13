import { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import {
  PedigreeRecord,
} from '@/core/caravans/domain/services/pedigreeAnalysis';
import { usePedigreeData } from '../components/pedigree/usePedigreeData';
import PedigreeFlowViewer from '../components/pedigree/PedigreeFlowViewer';
import MatingAdvisorDialog from '../components/pedigree/MatingAdvisorDialog';

export default function PedigreeGraphView() {
  const { caravans, isLoading, pedigreeRecords } = usePedigreeData();

  // Mating advisor modal state
  const [matingAdvisorOpen, setMatingAdvisorOpen] = useState(false);
  const [advisorInitialDamId, setAdvisorInitialDamId] = useState<number | null>(null);
  const [advisorInitialSireId, setAdvisorInitialSireId] = useState<number | null>(null);

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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando árbol genealógico...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Grafo Genealógico Completo"
      subtitle="Exploración visual interactiva del árbol genealógico completo del rodeo."
      backUrl="/gestation/pedigree"
      backTitle="Volver a Tabla de Pedigree"
    >
      <PedigreeFlowViewer
        caravans={caravans}
        pedigreeRecords={pedigreeRecords}
        initialRootId={null}
        onOpenMatingAdvisor={handleOpenMatingAdvisor}
      />

      {/* Mating Advisor Modal */}
      <MatingAdvisorDialog
        open={matingAdvisorOpen}
        onClose={() => setMatingAdvisorOpen(false)}
        caravans={caravans}
        initialDamId={advisorInitialDamId}
        initialSireId={advisorInitialSireId}
      />
    </ViewLayout>
  );
}