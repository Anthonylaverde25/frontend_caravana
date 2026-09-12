import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Stack, CircularProgress, Alert, Box } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import { PreServiceSummaryCards } from '../components/pre-service/PreServiceSummaryCards';
import { PreServiceFilterBar, PreServiceFilterStatus, PreServiceLabFilter } from '../components/pre-service/PreServiceFilterBar';
import { PreServiceSelectionBanner } from '../components/pre-service/PreServiceSelectionBanner';
import { PreServiceBullTable } from '../components/pre-service/PreServiceBullTable';
import { ResolveDiagnosisDialog } from '../components/pre-service/dialogs/ResolveDiagnosisDialog';
import { LabResultsEntryDialog } from '../components/pre-service/dialogs/LabResultsEntryDialog';
import { BullDiagnosesDialog } from '../components/pre-service/dialogs/BullDiagnosesDialog';
import { BullEvaluationSheetStage } from '../components/pre-service/sheet/BullEvaluationSheetStage';
import { PreServiceActionsBar } from '../components/pre-service/PreServiceActionsBar';
import { usePreServiceFiltering } from '@/features/gestation/hooks/usePreServiceFiltering';
import { usePreServiceBulls, usePathogens } from '@/features/gestation/hooks/usePreServiceBulls';
import { BullHealthEvaluation, VeterinaryDiagnosis } from '@/core/pre-service/domain/BullHealthEvaluation';

/**
 * Pre-service in two stages over a single route.
 *
 *   ?stage=list  (default)      triage: KPIs, filters and the selectable bull table
 *   ?stage=sheet&ids=1,2,3      the chute sheet for exactly those caravans
 *
 * The selection lives in the URL rather than in `location.state` on purpose: the sheet emits an
 * act with legal weight, and state-based navigation silently loses the selection on a refresh —
 * which used to turn "these three bulls" into "the whole troop" without anyone noticing.
 */
export const PreServiceView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: bulls = [], isLoading, error } = usePreServiceBulls();
  const { data: pathogens = [] } = usePathogens();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PreServiceFilterStatus>('ALL');
  const [labFilter, setLabFilter] = useState<PreServiceLabFilter>('ALL');

  // Multi-selection state
  const [selectedBullIds, setSelectedBullIds] = useState<Set<number>>(new Set());

  const stage = searchParams.get('stage') === 'sheet' ? 'sheet' : 'list';

  const idsFromUrl = useMemo(() => {
    const raw = searchParams.get('ids');

    if (!raw) return [] as number[];

    return raw
      .split(',')
      .map((id) => parseInt(id, 10))
      .filter((id) => !Number.isNaN(id));
  }, [searchParams]);

  // Deep link or refresh: rehydrate the selection so "Cambiar selección" lands on the same marks.
  useEffect(() => {
    if (idsFromUrl.length > 0) {
      setSelectedBullIds((prev) => (prev.size === 0 ? new Set(idsFromUrl) : prev));
    }
  }, [idsFromUrl]);

  // Resolve diagnosis dialog state
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<VeterinaryDiagnosis | null>(null);

  // Lab results entry dialog state
  const [isLabResultsOpen, setIsLabResultsOpen] = useState(false);

  // Bull diagnoses view modal state
  const [selectedBullForDiagnoses, setSelectedBullForDiagnoses] = useState<BullHealthEvaluation | null>(null);

  const { counts, filteredBulls } = usePreServiceFiltering({
    bulls,
    searchQuery,
    statusFilter,
    labFilter,
  });

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

  // Move to stage 2 carrying the selection in the URL.
  const handleOpenSheet = (caravanIds?: number[]) => {
    const ids = caravanIds ?? Array.from(selectedBullIds);

    if (ids.length === 0) return;

    setSearchParams({ stage: 'sheet', ids: ids.join(',') });
  };

  const handleBackToListing = () => setSearchParams({});

  const handleOpenResolve = (diag: VeterinaryDiagnosis) => {
    setSelectedDiagnosis(diag);
    setResolveDialogOpen(true);
  };

  if (stage === 'sheet') {
    return <BullEvaluationSheetStage selectedIds={idsFromUrl} onExit={handleBackToListing} />;
  }

  return (
    <ViewLayout
      title="Pre-Servicio & Sanidad Reproductiva de Toros"
      subtitle="Evaluación andrológica en manga, biometría (CE/CC), aplomos y control sanitario de toros previo al entore"
      actions={
        <PreServiceActionsBar
          selectedCount={selectedBullIds.size}
          onPrintTemplate={() => navigate('/work-templates/TOR-01')}
          onOpenLabResults={() => setIsLabResultsOpen(true)}
          onOpenSheet={() => handleOpenSheet()}
        />
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
