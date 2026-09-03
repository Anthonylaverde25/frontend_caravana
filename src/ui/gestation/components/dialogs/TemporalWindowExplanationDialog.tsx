import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ConceptualDifferenceCard } from './temporal-window/ConceptualDifferenceCard';
import { AnnualCyclePhysiologyCard } from './temporal-window/AnnualCyclePhysiologyCard';
import { ForageAndTropasCard } from './temporal-window/ForageAndTropasCard';
import { PostServiceManagementCard } from './temporal-window/PostServiceManagementCard';
import { BibliographicCitationCard } from './temporal-window/BibliographicCitationCard';

interface TemporalWindowExplanationDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * TemporalWindowExplanationDialog (Orchestrator Container)
 *
 * Composes specialized modular cards explaining why a Breeding Batch has a 60-90 days window.
 */
export const TemporalWindowExplanationDialog: React.FC<TemporalWindowExplanationDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
      {/* Canonical Dialog Header */}
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
              width: 36,
              height: 36,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isDark ? 'rgba(59, 130, 246, 0.16)' : '#eff6ff',
              color: isDark ? '#60a5fa' : '#2563eb',
            }}
          >
            <FuseSvgIcon size={22}>heroicons-outline:academic-cap</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
              Ventana Temporal del Lote de Servicio
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Fundamentación Zootécnica &amp; Modelo de Dominio Ganadero
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      {/* Dialog Content delegating to specialized presentational cards */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper' }}>
        <Stack spacing={2.5}>
          <ConceptualDifferenceCard />
          <AnnualCyclePhysiologyCard />
          <ForageAndTropasCard />
          <PostServiceManagementCard />
          <BibliographicCitationCard />
        </Stack>
      </DialogContent>

      {/* Action Footer */}
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Button variant="contained" color="primary" onClick={onClose} sx={{ px: 3, borderRadius: '6px', fontWeight: 600 }}>
          Entendido
        </Button>
      </Box>
    </Dialog>
  );
};

export default TemporalWindowExplanationDialog;
