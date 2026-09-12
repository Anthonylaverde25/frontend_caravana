import React, { useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { usePathogens, usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';
import {
  useCreateDiagnosticProtocol,
  useVeterinarians,
} from '@/features/gestation/hooks/useVeterinaryProtocols';
import {
  LabSampleStatus,
  ProtocolSampleLineInput,
  SampleType,
} from '@/core/veterinary/domain/VeterinaryTypes';
import { Step1ProtocolHeader } from './diagnostic-protocol/Step1ProtocolHeader';
import { Step2ResultsGrid } from './diagnostic-protocol/Step2ResultsGrid';
import { Step3ProtocolSummary } from './diagnostic-protocol/Step3ProtocolSummary';
import { ProtocolWizardFooter } from './diagnostic-protocol/ProtocolWizardFooter';
import { QuickCreateVeterinarianDialog } from './QuickCreateVeterinarianDialog';
import { apiErrorMessage } from '@/core/veterinary/domain/apiErrorMessage';

interface RegisterDiagnosticProtocolDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STEPS = ['Encabezado y evidencia', 'Grilla de torada', 'Confirmación'];

const SAMPLE_TYPE_LABELS: Record<SampleType, string> = {
  PREPUCE_SCRAPE: 'Raspaje prepucial',
  BLOOD_SEROLOGY: 'Serología sanguínea',
  SEMEN_CULTURE: 'Cultivo de semen',
  TUBERCULIN_TEST: 'Prueba de tuberculina',
};

const today = () => new Date().toISOString().split('T')[0];

/**
 * Use Case 2 — Assisted digitisation of external evidence.
 *
 * Thin orchestrator: it owns the form state and the mutation, and delegates every screen to a
 * dedicated step component (AGENT.md 3.A / 3.B).
 */
export const RegisterDiagnosticProtocolDialog: React.FC<RegisterDiagnosticProtocolDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const { data: bulls = [] } = usePreServiceBulls();
  const { data: pathogens = [] } = usePathogens();
  const { data: veterinarians = [] } = useVeterinarians();
  const createProtocol = useCreateDiagnosticProtocol();

  const [activeStep, setActiveStep] = useState(0);

  // Step 1 — the document
  const [protocolNumber, setProtocolNumber] = useState('');
  const [sampleDate, setSampleDate] = useState(today());
  const [resultDate, setResultDate] = useState(today());
  const [veterinarianId, setVeterinarianId] = useState<number | ''>('');
  const [observations, setObservations] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  // Step 2 — the troop grid
  const [search, setSearch] = useState('');
  const [sampleType, setSampleType] = useState<SampleType>('PREPUCE_SCRAPE');
  const [sampleRound, setSampleRound] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [results, setResults] = useState<Record<string, LabSampleStatus>>({});
  const [tubeNumbers, setTubeNumbers] = useState<Record<number, string>>({});

  const [quickVetOpen, setQuickVetOpen] = useState(false);

  /** Only venereal agents belong in a preputial scrape grid. */
  const gridPathogens = useMemo(
    () =>
      pathogens
        .filter((pathogen) => (sampleType === 'PREPUCE_SCRAPE' ? pathogen.category === 'VENEREAL' : true))
        .map((pathogen) => ({
          id: pathogen.id,
          code: pathogen.code,
          name: pathogen.name.split('(')[0].trim(),
          is_disqualifying: pathogen.is_disqualifying,
        })),
    [pathogens, sampleType]
  );

  const gridBulls = useMemo(
    () =>
      bulls.map((bull) => ({
        id: bull.caravan_id,
        identification: bull.caravan_number,
        status: bull.status,
      })),
    [bulls]
  );

  const samples: ProtocolSampleLineInput[] = useMemo(() => {
    const lines: ProtocolSampleLineInput[] = [];

    selectedIds.forEach((caravanId) => {
      gridPathogens.forEach((pathogen) => {
        lines.push({
          caravan_id: caravanId,
          pathogen_id: pathogen.id,
          sample_type: sampleType,
          sample_round: sampleRound,
          status: results[`${caravanId}:${pathogen.id}`] ?? 'NEGATIVE_CLEARED',
          tube_number: tubeNumbers[caravanId] || null,
        });
      });
    });

    return lines;
  }, [selectedIds, gridPathogens, sampleType, sampleRound, results, tubeNumbers]);

  const positiveBullsCount = useMemo(
    () =>
      selectedIds.filter((caravanId) =>
        gridPathogens.some((pathogen) => results[`${caravanId}:${pathogen.id}`] === 'POSITIVE_DETECTED')
      ).length,
    [selectedIds, gridPathogens, results]
  );

  const resetForm = () => {
    setActiveStep(0);
    setProtocolNumber('');
    setSampleDate(today());
    setResultDate(today());
    setVeterinarianId('');
    setObservations('');
    setAttachments([]);
    setSearch('');
    setSampleType('PREPUCE_SCRAPE');
    setSampleRound(1);
    setSelectedIds([]);
    setResults({});
    setTubeNumbers({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleToggleSelected = (caravanId: number) => {
    setSelectedIds((prev) =>
      prev.includes(caravanId) ? prev.filter((id) => id !== caravanId) : [...prev, caravanId]
    );
  };

  const handleSelectAll = (visibleIds: number[]) => {
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds]))
    );
  };

  const handleResultChange = (caravanId: number, pathogenId: number, status: LabSampleStatus) => {
    setResults((prev) => ({ ...prev, [`${caravanId}:${pathogenId}`]: status }));
  };

  /** The preset marks the whole troop; the operator then flips only the exceptions. */
  const handleApplyPreset = (status: LabSampleStatus, visibleIds: number[]) => {
    const targets = visibleIds.filter((id) => selectedIds.includes(id));

    setResults((prev) => {
      const next = { ...prev };
      targets.forEach((caravanId) => {
        gridPathogens.forEach((pathogen) => {
          next[`${caravanId}:${pathogen.id}`] = status;
        });
      });
      return next;
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!protocolNumber.trim()) {
        enqueueSnackbar('Ingrese el número de protocolo del informe.', { variant: 'warning' });
        return;
      }
      if (attachments.length === 0) {
        enqueueSnackbar('La digitalización de evidencia externa exige adjuntar el informe.', { variant: 'warning' });
        return;
      }
      if (new Date(resultDate) < new Date(sampleDate)) {
        enqueueSnackbar('La fecha de resultado no puede ser anterior a la toma de muestra.', { variant: 'warning' });
        return;
      }
    }

    if (activeStep === 1 && selectedIds.length === 0) {
      enqueueSnackbar('Seleccione al menos un reproductor de la torada.', { variant: 'warning' });
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      await createProtocol.mutateAsync({
        protocol_number: protocolNumber.trim(),
        veterinarian_id: veterinarianId === '' ? null : Number(veterinarianId),
        sample_date: sampleDate,
        result_date: resultDate,
        source_channel: 'OWNER_DIGITIZED',
        observations: observations.trim() || null,
        samples,
        attachments,
      });

      enqueueSnackbar('Protocolo digitalizado y aptitudes recalculadas.', { variant: 'success' });
      handleClose();
      onSuccess?.();
    } catch (error: unknown) {
      enqueueSnackbar(apiErrorMessage(error, 'No se pudo registrar el protocolo.'), { variant: 'error' });
    }
  };

  const veterinarianLabel =
    veterinarians.find((vet) => vet.id === Number(veterinarianId))?.name ?? 'Sin asignar';

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
      >
        <Box
          sx={{
            p: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            Digitalizar Protocolo Diagnóstico
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: 'primary.main' }}>
            <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pt: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: 'background.paper', minHeight: 440 }}>
          {activeStep === 0 && (
            <Step1ProtocolHeader
              protocolNumber={protocolNumber}
              setProtocolNumber={setProtocolNumber}
              sampleDate={sampleDate}
              setSampleDate={setSampleDate}
              resultDate={resultDate}
              setResultDate={setResultDate}
              veterinarianId={veterinarianId}
              setVeterinarianId={setVeterinarianId}
              observations={observations}
              setObservations={setObservations}
              attachments={attachments}
              setAttachments={setAttachments}
              veterinarians={veterinarians}
              onQuickCreateVeterinarian={() => setQuickVetOpen(true)}
            />
          )}

          {activeStep === 1 && (
            <Step2ResultsGrid
              bulls={gridBulls}
              pathogens={gridPathogens}
              search={search}
              onSearchChange={setSearch}
              sampleType={sampleType}
              onSampleTypeChange={setSampleType}
              sampleRound={sampleRound}
              onSampleRoundChange={setSampleRound}
              selectedIds={selectedIds}
              onToggleSelected={handleToggleSelected}
              onSelectAll={handleSelectAll}
              results={results}
              onResultChange={handleResultChange}
              onApplyPreset={handleApplyPreset}
              tubeNumbers={tubeNumbers}
              onTubeNumberChange={(caravanId, value) =>
                setTubeNumbers((prev) => ({ ...prev, [caravanId]: value }))
              }
            />
          )}

          {activeStep === 2 && (
            <Step3ProtocolSummary
              protocolNumber={protocolNumber}
              veterinarianLabel={veterinarianLabel}
              sampleDate={sampleDate}
              resultDate={resultDate}
              sampleTypeLabel={SAMPLE_TYPE_LABELS[sampleType]}
              sampleRound={sampleRound}
              selectedBullsCount={selectedIds.length}
              determinationsCount={samples.length}
              positiveBullsCount={positiveBullsCount}
              attachmentsCount={attachments.length}
            />
          )}
        </DialogContent>

        <ProtocolWizardFooter
          isFirstStep={activeStep === 0}
          isLastStep={activeStep === STEPS.length - 1}
          isSubmitting={createProtocol.isPending}
          onBack={activeStep === 0 ? handleClose : () => setActiveStep((prev) => prev - 1)}
          onNext={handleNext}
          onSubmit={handleSubmit}
        />
      </Dialog>

      <QuickCreateVeterinarianDialog
        open={quickVetOpen}
        onClose={() => setQuickVetOpen(false)}
        onCreated={(vet) => setVeterinarianId(vet.id)}
      />

    </>
  );
};

export default RegisterDiagnosticProtocolDialog;
