import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Stack, Button, CircularProgress, Alert, Box } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { PreServiceSummaryCards } from '../components/pre-service/PreServiceSummaryCards';
import { PreServiceFilterBar, PreServiceFilterStatus, PreServiceLabFilter } from '../components/pre-service/PreServiceFilterBar';
import { PreServiceSelectionBanner } from '../components/pre-service/PreServiceSelectionBanner';
import { PreServiceBullTable } from '../components/pre-service/PreServiceBullTable';
import { ResolveDiagnosisDialog } from '../components/pre-service/dialogs/ResolveDiagnosisDialog';
import { LabResultsEntryDialog } from '../components/pre-service/dialogs/LabResultsEntryDialog';
import { BullDiagnosesDialog } from '../components/pre-service/dialogs/BullDiagnosesDialog';
import { usePreServiceBulls, usePathogens } from '@/features/gestation/hooks/usePreServiceBulls';
import { BullHealthEvaluation, VeterinaryDiagnosis } from '@/core/pre-service/domain/BullHealthEvaluation';

export const PreServiceView: React.FC = () => {
  const navigate = useNavigate();
  const { data: bulls = [], isLoading, error } = usePreServiceBulls();
  const { data: pathogens = [] } = usePathogens();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PreServiceFilterStatus>('ALL');
  const [labFilter, setLabFilter] = useState<PreServiceLabFilter>('ALL');

  // Multi-selection state
  const [selectedBullIds, setSelectedBullIds] = useState<Set<number>>(new Set());

  // Resolve diagnosis dialog state
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<VeterinaryDiagnosis | null>(null);

  // Lab results entry dialog state
  const [isLabResultsOpen, setIsLabResultsOpen] = useState(false);

  // Bull diagnoses view modal state
  const [selectedBullForDiagnoses, setSelectedBullForDiagnoses] = useState<BullHealthEvaluation | null>(null);

  // Live filter counts
  const counts = useMemo(() => {
    let apt = 0;
    let inTreatment = 0;
    let unfit = 0;
    let pending = 0;

    let pendingScrape = 0;
    let pendingSerology = 0;
    let pendingAnyLab = 0;
    let clearedLab = 0;

    bulls.forEach((b) => {
      if (b.status === 'APT') apt++;
      else if (b.status === 'IN_TREATMENT') inTreatment++;
      else if (b.status === 'UNFIT') unfit++;
      else pending++;

      const hasPendingScrape = b.lab_samples?.some(
        (s) => s.sample_type === 'PREPUCE_SCRAPE' && s.status === 'PENDING_RESULTS'
      );
      const hasPendingSerology = b.lab_samples?.some(
        (s) => s.sample_type === 'BLOOD_SEROLOGY' && s.status === 'PENDING_RESULTS'
      );

      if (hasPendingScrape) pendingScrape++;
      if (hasPendingSerology) pendingSerology++;
      if (hasPendingScrape || hasPendingSerology) pendingAnyLab++;

      const hasSamples = (b.lab_samples?.length ?? 0) > 0;
      const allCleared = hasSamples && b.lab_samples?.every((s) => s.status === 'NEGATIVE_CLEARED');
      if (allCleared) clearedLab++;
    });

    return {
      total: bulls.length,
      apt,
      inTreatment,
      unfit,
      pending,
      pendingScrape,
      pendingSerology,
      pendingAnyLab,
      clearedLab,
    };
  }, [bulls]);

  // Filtered list
  const filteredBulls = useMemo(() => {
    return bulls.filter((bull) => {
      // 1. Search Query by caravan tag or notes
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTag = bull.caravan_number.toLowerCase().includes(query);
        const matchesAplomos = bull.aplomo_notes?.toLowerCase().includes(query) ?? false;
        const matchesObs = bull.observations?.toLowerCase().includes(query) ?? false;
        if (!matchesTag && !matchesAplomos && !matchesObs) return false;
      }

      // 2. Status filter
      if (statusFilter !== 'ALL' && bull.status !== statusFilter) {
        return false;
      }

      // 3. Lab sampling filter
      if (labFilter === 'PENDING_SCRAPE') {
        const has = bull.lab_samples?.some(
          (s) => s.sample_type === 'PREPUCE_SCRAPE' && s.status === 'PENDING_RESULTS'
        );
        if (!has) return false;
      } else if (labFilter === 'PENDING_SEROLOGY') {
        const has = bull.lab_samples?.some(
          (s) => s.sample_type === 'BLOOD_SEROLOGY' && s.status === 'PENDING_RESULTS'
        );
        if (!has) return false;
      } else if (labFilter === 'PENDING_ANY') {
        const has = bull.lab_samples?.some((s) => s.status === 'PENDING_RESULTS');
        if (!has) return false;
      } else if (labFilter === 'CLEARED') {
        const hasSamples = (bull.lab_samples?.length ?? 0) > 0;
        const allCleared = hasSamples && bull.lab_samples?.every((s) => s.status === 'NEGATIVE_CLEARED');
        if (!allCleared) return false;
      }

      return true;
    });
  }, [bulls, searchQuery, statusFilter, labFilter]);

  // Selection handlers
  const handleToggleSelect = (caravanId: number) => {
    setSelectedBullIds((prev) => {
      const next = new Set(prev);
      if (next.has(caravanId)) {
        next.delete(caravanId);
      } else {
        next.add(caravanId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = (currentPageIds: number[]) => {
    setSelectedBullIds((prev) => {
      const next = new Set(prev);
      const allSelected = currentPageIds.every((id) => next.has(id));
      if (allSelected) {
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedBullIds(new Set());
  };

  // Navigate to dedicated spreadsheet view
  const handleOpenSheet = (caravanIds?: number[]) => {
    const ids = caravanIds || (selectedBullIds.size > 0 ? Array.from(selectedBullIds) : undefined);
    navigate('/gestation/pre-service/evaluate', {
      state: { selectedBullIds: ids },
    });
  };

  const handleOpenResolve = (diag: VeterinaryDiagnosis) => {
    setSelectedDiagnosis(diag);
    setResolveDialogOpen(true);
  };

  return (
    <ViewLayout
      title="Pre-Servicio & Sanidad Reproductiva de Toros"
      subtitle="Evaluación andrológica en manga, biometría (CE/CC), aplomos y control sanitario de toros previo al entore"
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => navigate('/work-templates/TOR-01')}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
            }}
          >
            Imprimir Hoja TOR-01
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => setIsLabResultsOpen(true)}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-check</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
            }}
          >
            Cargar Resultados Lab
          </Button>

          <Button
            variant="contained"
            onClick={() => handleOpenSheet()}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:table-cells</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2.5,
              bgcolor: '#0a6ed1',
              '&:hover': { bgcolor: '#0854a0' },
            }}
          >
            {selectedBullIds.size > 0
              ? `Abrir Planilla de Manga (${selectedBullIds.size})`
              : 'Abrir Planilla de Manga'}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        {/* Global KPI Summary Cards */}
        <PreServiceSummaryCards bulls={bulls} />

        {/* Loading / Error States */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: '8px' }}>
            Ocurrió un error al cargar la información de sanidad de toros. Por favor, reintente.
          </Alert>
        )}

        {!isLoading && !error && (
          <Stack spacing={2}>
            {/* Search, Status and Laboratory Filters */}
            <PreServiceFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              labFilter={labFilter}
              onLabFilterChange={setLabFilter}
              totalCount={counts.total}
              aptCount={counts.apt}
              inTreatmentCount={counts.inTreatment}
              unfitCount={counts.unfit}
              pendingCount={counts.pending}
              pendingScrapeCount={counts.pendingScrape}
              pendingSerologyCount={counts.pendingSerology}
              pendingAnyLabCount={counts.pendingAnyLab}
              clearedLabCount={counts.clearedLab}
            />

            {/* Floating Selection Banner */}
            <PreServiceSelectionBanner
              selectedCount={selectedBullIds.size}
              onStartSerialEvaluation={() => handleOpenSheet()}
              onClearSelection={handleClearSelection}
            />

            {/* Tabular Bulls DataTable */}
            <PreServiceBullTable
              bulls={filteredBulls}
              selectedBullIds={selectedBullIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onEvaluate={(bull) => handleOpenSheet([bull.caravan_id])}
              onResolveDiagnosis={handleOpenResolve}
              onViewDiagnoses={(bull) => setSelectedBullForDiagnoses(bull)}
            />
          </Stack>
        )}
      </Stack>

      {/* Bull Active Diagnoses Inspection Dialog */}
      <BullDiagnosesDialog
        open={Boolean(selectedBullForDiagnoses)}
        onClose={() => setSelectedBullForDiagnoses(null)}
        bull={selectedBullForDiagnoses}
        onResolveDiagnosis={handleOpenResolve}
      />

      {/* Discharge / Resolve Diagnosis Dialog */}
      <ResolveDiagnosisDialog
        open={resolveDialogOpen}
        onClose={() => {
          setResolveDialogOpen(false);
          setSelectedDiagnosis(null);
        }}
        diagnosis={selectedDiagnosis}
      />

      {/* Deferred Lab Results Protocol Ingestion Dialog */}
      <LabResultsEntryDialog
        open={isLabResultsOpen}
        onClose={() => setIsLabResultsOpen(false)}
        bulls={bulls}
        pathogens={pathogens}
      />
    </ViewLayout>
  );
};

export default PreServiceView;
