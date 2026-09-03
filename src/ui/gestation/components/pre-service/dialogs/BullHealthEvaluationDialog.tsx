import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { BullHealthEvaluation, Pathogen } from '@/core/pre-service/domain/BullHealthEvaluation';
import { useSaveBullHealthEvaluation } from '@/features/gestation/hooks/usePreServiceBulls';
import { BullPhysicalExamSection } from './BullPhysicalExamSection';
import { BullDiagnosisSection } from './BullDiagnosisSection';

interface BullHealthEvaluationDialogProps {
  open: boolean;
  onClose: () => void;
  bull: BullHealthEvaluation | null;
  pathogens: Pathogen[];
}

export function BullHealthEvaluationDialog({
  open,
  onClose,
  bull,
  pathogens,
}: BullHealthEvaluationDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const saveMutation = useSaveBullHealthEvaluation();

  // Form states
  const [scrotalCircumference, setScrotalCircumference] = useState('');
  const [bodyConditionScore, setBodyConditionScore] = useState('');
  const [libido, setLibido] = useState('MEDIA');
  const [aplomoNotes, setAplomoNotes] = useState('');
  const [observations, setObservations] = useState('');

  // Diagnosis states
  const [includeDiagnosis, setIncludeDiagnosis] = useState(false);
  const [selectedPathogenId, setSelectedPathogenId] = useState('');
  const [diagnosisStatus, setDiagnosisStatus] = useState('IN_TREATMENT');
  const [treatmentNotes, setTreatmentNotes] = useState('');

  useEffect(() => {
    if (bull) {
      setScrotalCircumference(bull.scrotal_circumference_cm ? String(bull.scrotal_circumference_cm) : '');
      setBodyConditionScore(bull.body_condition_score ? String(bull.body_condition_score) : '');
      setLibido(bull.libido || 'MEDIA');
      setAplomoNotes(bull.aplomo_notes || '');
      setObservations(bull.observations || '');
      setIncludeDiagnosis(false);
      setSelectedPathogenId('');
      setDiagnosisStatus('IN_TREATMENT');
      setTreatmentNotes('');
    }
  }, [bull, open]);

  const handleSave = async () => {
    if (!bull) return;

    try {
      await saveMutation.mutateAsync({
        caravan_id: bull.caravan_id,
        last_evaluation_date: new Date().toISOString().split('T')[0],
        scrotal_circumference_cm: scrotalCircumference ? parseFloat(scrotalCircumference) : null,
        body_condition_score: bodyConditionScore ? parseFloat(bodyConditionScore) : null,
        libido,
        aplomo_notes: aplomoNotes || null,
        observations: observations || null,
        diagnosis:
          includeDiagnosis && selectedPathogenId
            ? {
                pathogen_id: parseInt(selectedPathogenId, 10),
                diagnosis_date: new Date().toISOString().split('T')[0],
                status: diagnosisStatus,
                treatment_notes: treatmentNotes || null,
              }
            : null,
      });

      enqueueSnackbar(`Revisación del toro ${bull.caravan_number} guardada exitosamente.`, {
        variant: 'success',
      });
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al guardar la evaluación andrológica.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '8px',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              display: 'flex',
            }}
          >
            <FuseSvgIcon size={22}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Revisación Andrológica en Manga {bull ? `• Toro ${bull.caravan_number}` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Determinación de aptitud reproductiva según Carrillo (Manejo de un Rodeo de Cría)
            </Typography>
          </Box>
        </Box>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <BullPhysicalExamSection
          scrotalCircumference={scrotalCircumference}
          onScrotalCircumferenceChange={setScrotalCircumference}
          bodyConditionScore={bodyConditionScore}
          onBodyConditionScoreChange={setBodyConditionScore}
          libido={libido}
          onLibidoChange={setLibido}
          aplomoNotes={aplomoNotes}
          onAplomoNotesChange={setAplomoNotes}
          observations={observations}
          onObservationsChange={setObservations}
        />

        <BullDiagnosisSection
          includeDiagnosis={includeDiagnosis}
          onToggleDiagnosis={setIncludeDiagnosis}
          selectedPathogenId={selectedPathogenId}
          onPathogenChange={setSelectedPathogenId}
          diagnosisStatus={diagnosisStatus}
          onDiagnosisStatusChange={setDiagnosisStatus}
          treatmentNotes={treatmentNotes}
          onTreatmentNotesChange={setTreatmentNotes}
          pathogens={pathogens}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        <Button onClick={onClose} disabled={saveMutation.isPending} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            px: 3,
          }}
          startIcon={saveMutation.isPending ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {saveMutation.isPending ? 'Guardando...' : 'Guardar y Determinar Aptitud'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
