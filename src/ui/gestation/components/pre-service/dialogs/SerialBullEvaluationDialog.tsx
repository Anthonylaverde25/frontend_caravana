import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  LinearProgress,
  Chip,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { BullHealthEvaluation, Pathogen } from '@/core/pre-service/domain/BullHealthEvaluation';
import { useSaveBullHealthEvaluation } from '@/features/gestation/hooks/usePreServiceBulls';
import { BullPhysicalExamSection } from './BullPhysicalExamSection';
import { BullDiagnosisSection } from './BullDiagnosisSection';

interface SerialBullEvaluationDialogProps {
  open: boolean;
  onClose: () => void;
  bulls: BullHealthEvaluation[];
  pathogens: Pathogen[];
  initialIndex?: number;
}

export const SerialBullEvaluationDialog: React.FC<SerialBullEvaluationDialogProps> = ({
  open,
  onClose,
  bulls,
  pathogens,
  initialIndex = 0,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const saveMutation = useSaveBullHealthEvaluation();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [completedBullIds, setCompletedBullIds] = useState<Set<number>>(new Set());

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

  const currentBull = bulls[currentIndex] || null;
  const totalBulls = bulls.length;
  const isLastBull = currentIndex === totalBulls - 1;
  const isSingleBull = totalBulls <= 1;

  const primaryColor = isDark ? '#60a5fa' : '#0a6ed1';
  const successColor = isDark ? '#34d399' : '#107e3e';
  const errorColor = isDark ? '#f87171' : '#dc2626';
  const warningColor = isDark ? '#fb923c' : '#e6600d';

  // Reset index and form when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, totalBulls - 1)));
      setCompletedBullIds(new Set());
    }
  }, [open, initialIndex, totalBulls]);

  // Load current bull data into form
  useEffect(() => {
    if (currentBull) {
      setScrotalCircumference(
        currentBull.scrotal_circumference_cm ? String(currentBull.scrotal_circumference_cm) : ''
      );
      setBodyConditionScore(
        currentBull.body_condition_score ? String(currentBull.body_condition_score) : ''
      );
      setLibido(currentBull.libido || 'MEDIA');
      setAplomoNotes(currentBull.aplomo_notes || '');
      setObservations(currentBull.observations || '');
      setIncludeDiagnosis(false);
      setSelectedPathogenId('');
      setDiagnosisStatus('IN_TREATMENT');
      setTreatmentNotes('');
    }
  }, [currentBull]);

  // Live zootechnical aptitude calculation
  const liveAptitude = useMemo(() => {
    const ce = parseFloat(scrotalCircumference);
    const cc = parseFloat(bodyConditionScore);
    const pathogen = pathogens.find((p) => String(p.id) === selectedPathogenId);

    if (pathogen?.is_disqualifying) {
      return {
        status: 'UNFIT',
        label: 'RECHAZO / DESCARTE (UNFIT)',
        reason: `Patógeno descalificante: ${pathogen.name}. Causa rechazo automático.`,
        color: errorColor,
      };
    }

    if (!isNaN(ce) && ce < 28) {
      return {
        status: 'UNFIT',
        label: 'RECHAZO / DESCARTE (UNFIT)',
        reason: `Circunferencia Escrotal insuficiente (${ce} cm < 28 cm umbral mínimo Carrillo).`,
        color: errorColor,
      };
    }

    if (!isNaN(cc) && cc < 2.0) {
      return {
        status: 'UNFIT',
        label: 'RECHAZO / DESCARTE (UNFIT)',
        reason: `Condición Corporal deficiente (${cc} < 2.0 escala 1-5).`,
        color: errorColor,
      };
    }

    if (includeDiagnosis && selectedPathogenId) {
      return {
        status: 'IN_TREATMENT',
        label: 'EN TRATAMIENTO CLÍNICO',
        reason: 'Bloqueado temporalmente hasta resolución veterinaria / alta médica.',
        color: warningColor,
      };
    }

    return {
      status: 'APT',
      label: 'APTO PARA SERVICIO (APT)',
      reason: 'Parámetros biométricos y andrológicos óptimos para entore.',
      color: successColor,
    };
  }, [scrotalCircumference, bodyConditionScore, includeDiagnosis, selectedPathogenId, pathogens, errorColor, warningColor, successColor]);

  const handleSaveEvaluation = async (advance: boolean) => {
    if (!currentBull) return;

    try {
      await saveMutation.mutateAsync({
        caravan_id: currentBull.caravan_id,
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

      setCompletedBullIds((prev) => new Set([...prev, currentBull.caravan_id]));

      enqueueSnackbar(`Revisación del toro ${currentBull.caravan_number} guardada exitosamente.`, {
        variant: 'success',
      });

      if (advance && !isLastBull) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al guardar la evaluación andrológica.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const handleSkip = () => {
    if (!isLastBull) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!currentBull) return null;

  const progressPercent = totalBulls > 0 ? Math.round(((currentIndex + 1) / totalBulls) * 100) : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: 1,
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Canonical Dialog Header (matching CreateBatchDialog) */}
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: '6px',
              bgcolor: alpha(primaryColor, 0.12),
              color: primaryColor,
              display: 'flex',
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:clipboard-document-check</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
              {isSingleBull
                ? `Revisación Andrológica en Manga • Toro ${currentBull.caravan_number}`
                : `Evaluación Andrológica Serial en Manga (${currentIndex + 1} de ${totalBulls})`}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Criterio Carrillo (1988) • Manejo de un Rodeo de Cría
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Stack spacing={2.5}>
          {/* Queue Stepper for Multi-Bull Evaluation */}
          {!isSingleBull && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                  Cola de Manga: Toro {currentIndex + 1} de {totalBulls} ({currentBull.caravan_number})
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: primaryColor, fontSize: '0.72rem' }}>
                  {progressPercent}% evaluado
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  mb: 1.5,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: primaryColor,
                    borderRadius: 2,
                  },
                }}
              />

              {/* Quick Jump Chips */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': { height: 4 },
                }}
              >
                {bulls.map((b, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isCompleted = completedBullIds.has(b.caravan_id);

                  return (
                    <Chip
                      key={b.caravan_id}
                      clickable
                      onClick={() => setCurrentIndex(idx)}
                      size="small"
                      label={`${idx + 1}. ${b.caravan_number}`}
                      icon={
                        isCompleted ? (
                          <FuseSvgIcon size={14} color="success">heroicons-outline:check</FuseSvgIcon>
                        ) : isCurrent ? (
                          <FuseSvgIcon size={14}>heroicons-outline:play</FuseSvgIcon>
                        ) : undefined
                      }
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: isCurrent ? 700 : 500,
                        height: 26,
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: isCurrent ? primaryColor : 'divider',
                        bgcolor: isCurrent ? alpha(primaryColor, 0.15) : isCompleted ? alpha(successColor, 0.1) : 'transparent',
                        color: isCurrent ? primaryColor : isCompleted ? successColor : 'text.secondary',
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Instant Aptitude Determination Banner */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: alpha(liveAptitude.color, 0.4),
              bgcolor: alpha(liveAptitude.color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: liveAptitude.color,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                {liveAptitude.status === 'APT' ? '✓' : liveAptitude.status === 'UNFIT' ? '✕' : '!'}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: liveAptitude.color, fontSize: '0.85rem' }}>
                  {liveAptitude.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {liveAptitude.reason}
                </Typography>
              </Box>
            </Box>

            <Chip
              size="small"
              label={`Caravana: ${currentBull.caravan_number}`}
              sx={{ fontWeight: 700, fontSize: '0.72rem' }}
            />
          </Box>

          {/* Section 1: Physical Exam with 1-Click Presets */}
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

          {/* Section 2: Clinical Diagnostics with 1-Click Toggle */}
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
        </Stack>
      </DialogContent>

      {/* Canonical Dialog Actions Footer */}
      <DialogActions
        sx={{
          p: 2,
          px: 3,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            variant="text"
            size="small"
            onClick={onClose}
            sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.82rem' }}
          >
            Cancelar
          </Button>

          {!isSingleBull && currentIndex > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={handlePrevious}
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:chevron-left</FuseSvgIcon>}
              sx={{ textTransform: 'none', borderRadius: '6px', fontSize: '0.82rem' }}
            >
              Anterior
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {!isSingleBull && !isLastBull && (
            <Button
              variant="text"
              size="small"
              onClick={handleSkip}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.82rem' }}
            >
              Omitir Toro
            </Button>
          )}

          {!isLastBull && !isSingleBull ? (
            <Button
              variant="contained"
              onClick={() => handleSaveEvaluation(true)}
              disabled={saveMutation.isPending}
              endIcon={
                saveMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <FuseSvgIcon size={18}>heroicons-outline:arrow-right</FuseSvgIcon>
                )
              }
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '6px',
                px: 2.5,
                bgcolor: primaryColor,
                '&:hover': { bgcolor: isDark ? '#3b82f6' : '#0854a0' },
              }}
            >
              Guardar y Siguiente Toro ({currentIndex + 2}/{totalBulls})
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleSaveEvaluation(false)}
              disabled={saveMutation.isPending}
              startIcon={
                saveMutation.isPending ? (
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
              {isSingleBull ? 'Guardar Revisación' : 'Guardar y Finalizar'}
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default SerialBullEvaluationDialog;
