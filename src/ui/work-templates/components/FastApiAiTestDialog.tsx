import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface FastApiAiTestDialogProps {
  open: boolean;
  onClose: () => void;
  isTestingAI: boolean;
  aiResult: any;
}

export const FastApiAiTestDialog: React.FC<FastApiAiTestDialogProps> = ({
  open,
  onClose,
  isTestingAI,
  aiResult
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" /> Test Microservicio Jhoangel AI (FastAPI)
      </DialogTitle>
      <DialogContent dividers>
        {isTestingAI ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 2 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary">
              Procesando plantilla con IA de Jhoangel...
            </Typography>
          </Box>
        ) : aiResult ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Alert
              severity={aiResult.template_match ? 'success' : 'warning'}
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            >
              {aiResult.template_match
                ? `Plantilla identificada con éxito y encontrada en la base de datos.`
                : aiResult.message || 'Código detectado pero no coincide con ninguna plantilla activa en la DB.'}
            </Alert>

            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Código Detectado:
                  </Typography>
                  <Chip
                    label={aiResult.detected_code || 'No detectado'}
                    color={aiResult.detected_code ? 'primary' : 'default'}
                    sx={{ fontWeight: 900, fontSize: '0.9rem' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Confianza de Detección:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {Math.round((aiResult.confidence || 0) * 100)}%
                  </Typography>
                </Box>

                {aiResult.template_match && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Título en DB:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {aiResult.template_match.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Categoría:
                      </Typography>
                      <Chip label={aiResult.template_match.category} size="small" variant="outlined" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                        Estado:
                      </Typography>
                      <Chip
                        label={aiResult.template_match.status}
                        size="small"
                        color={aiResult.template_match.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          sx={{
            bgcolor: '#0f172a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8125rem',
            textTransform: 'none',
            borderRadius: '6px',
            px: 3,
            py: 0.75,
            '&:hover': {
              bgcolor: '#1e293b'
            }
          }}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FastApiAiTestDialog;
