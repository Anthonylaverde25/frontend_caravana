import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Stack,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BullHealthEvaluation, VeterinaryDiagnosis } from '@/core/pre-service/domain/BullHealthEvaluation';

interface BullDiagnosesDialogProps {
  open: boolean;
  onClose: () => void;
  bull: BullHealthEvaluation | null;
  onResolveDiagnosis: (diag: VeterinaryDiagnosis) => void;
}

export const BullDiagnosesDialog: React.FC<BullDiagnosesDialogProps> = ({
  open,
  onClose,
  bull,
  onResolveDiagnosis,
}) => {
  if (!bull) return null;

  const diagnoses = bull.active_diagnoses || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
              bgcolor: diagnoses.some((d) => d.pathogen_is_disqualifying)
                ? 'error.light'
                : 'warning.light',
              color: diagnoses.some((d) => d.pathogen_is_disqualifying)
                ? 'error.contrastText'
                : 'warning.contrastText',
              display: 'flex',
            }}
          >
            <FuseSvgIcon size={22}>heroicons-outline:heart</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Diagnósticos Sanitarios • Toro {bull.caravan_number}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Historial de afecciones clínicas activas y patologías detectadas
            </Typography>
          </Box>
        </Box>

        <IconButton aria-label="close" onClick={onClose} sx={{ color: 'grey.500' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {diagnoses.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <FuseSvgIcon size={40} color="action">
              heroicons-outline:check-circle
            </FuseSvgIcon>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
              Sin afecciones sanitarias activas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              El reproductor se encuentra libre de patologías infectocontagiosas o clínicas vigentes.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {diagnoses.map((diag) => (
              <Paper
                key={diag.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  borderColor: diag.pathogen_is_disqualifying ? '#fca5a5' : '#fde68a',
                  bgcolor: diag.pathogen_is_disqualifying ? '#fef2f2' : '#fffbeb',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                        {diag.pathogen_name || diag.pathogen_code}
                      </Typography>
                      {diag.pathogen_is_disqualifying ? (
                        <Chip
                          size="small"
                          color="error"
                          label="Descarte Obligatorio"
                          sx={{ fontSize: '0.65rem', fontWeight: 800, height: 20 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          color="warning"
                          label="En Tratamiento / Reevaluable"
                          sx={{ fontSize: '0.65rem', fontWeight: 800, height: 20 }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
                      Fecha de Diagnóstico: {diag.diagnosis_date || 'Sin registrar'}
                    </Typography>
                  </Box>

                  {!diag.pathogen_is_disqualifying && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => {
                        onClose();
                        onResolveDiagnosis(diag);
                      }}
                      startIcon={<FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', fontSize: '0.75rem' }}
                    >
                      Dar Alta Médica
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 1, borderColor: diag.pathogen_is_disqualifying ? '#fecaca' : '#fef08a' }} />

                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem', fontStyle: diag.treatment_notes ? 'normal' : 'italic' }}>
                  {diag.treatment_notes ? `Notas Clínicas: ${diag.treatment_notes}` : 'Sin notas clínicas registradas.'}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
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
        <Button onClick={onClose} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', bgcolor: '#0f172a' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BullDiagnosesDialog;
