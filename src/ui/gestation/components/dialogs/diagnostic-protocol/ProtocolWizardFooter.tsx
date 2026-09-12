import React from 'react';
import { Button, CircularProgress, DialogActions } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface ProtocolWizardFooterProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

/**
 * Action bar following the canonical CreateBatchDialog tokens (AGENT.md 4.3), extracted so the
 * wizard orchestrator stays about state and flow rather than layout.
 */
export const ProtocolWizardFooter: React.FC<ProtocolWizardFooterProps> = ({
  isFirstStep,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
}) => (
  <DialogActions
    sx={{
      p: 2,
      px: 3,
      bgcolor: 'background.default',
      borderTop: 1,
      borderColor: 'divider',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Button
      onClick={onBack}
      variant="text"
      sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
    >
      {isFirstStep ? 'Cancelar' : 'Atrás'}
    </Button>

    {!isLastStep ? (
      <Button
        onClick={onNext}
        variant="contained"
        endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>}
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          px: 3,
          fontWeight: 700,
          borderRadius: '6px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        Siguiente
      </Button>
    ) : (
      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        variant="contained"
        startIcon={
          isSubmitting ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
          )
        }
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          px: 3.5,
          fontWeight: 700,
          borderRadius: '6px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { bgcolor: 'primary.dark' },
        }}
      >
        Confirmar e ingerir
      </Button>
    )}
  </DialogActions>
);

export default ProtocolWizardFooter;
