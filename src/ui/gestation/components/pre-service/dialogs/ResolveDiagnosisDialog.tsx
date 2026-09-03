import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { VeterinaryDiagnosis } from '@/core/pre-service/domain/BullHealthEvaluation';
import { useResolveDiagnosis } from '@/features/gestation/hooks/usePreServiceBulls';

interface ResolveDiagnosisDialogProps {
  open: boolean;
  onClose: () => void;
  diagnosis: VeterinaryDiagnosis | null;
}

export function ResolveDiagnosisDialog({ open, onClose, diagnosis }: ResolveDiagnosisDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const resolveMutation = useResolveDiagnosis();

  const [resolutionDate, setResolutionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleConfirm = async () => {
    if (!diagnosis) return;

    try {
      await resolveMutation.mutateAsync({
        diagnosisId: diagnosis.id,
        input: {
          resolution_date: resolutionDate,
          notes: notes || null,
        },
      });

      enqueueSnackbar('Alta médica registrada con éxito. El reproductor ha recuperado su aptitud.', {
        variant: 'success',
      });
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al registrar el alta médica.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

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
              bgcolor: 'success.light',
              color: 'success.contrastText',
              display: 'flex',
            }}
          >
            <FuseSvgIcon size={22}>heroicons-outline:check-badge</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Alta Médica & Habilitación
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Finalización de tratamiento clínico
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
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: '8px', fontSize: '0.85rem' }}>
          Está por otorgar el alta médica para el cuadro:{' '}
          <strong>{diagnosis?.pathogen_name || diagnosis?.pathogen_code}</strong>. Al confirmar, el sistema
          recalculará automáticamente la aptitud del reproductor para su habilitación en servicio.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="Fecha de Alta Médica"
            variant="filled"
            value={resolutionDate}
            onChange={(e) => setResolutionDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiFilledInput-root': {
                borderRadius: '8px',
                bgcolor: 'action.hover',
              },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones del Alta / Inspección Clínica Final"
            variant="filled"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detallar evolución satisfactoria, cicatrización, examen físico post-tratamiento..."
            sx={{
              '& .MuiFilledInput-root': {
                borderRadius: '8px',
                bgcolor: 'action.hover',
              },
            }}
          />
        </Box>
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
        <Button onClick={onClose} disabled={resolveMutation.isPending} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleConfirm}
          disabled={resolveMutation.isPending}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            px: 3,
          }}
          startIcon={resolveMutation.isPending ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {resolveMutation.isPending ? 'Confirmando...' : 'Confirmar Alta Médica'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
