import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CompanyActivitiesConfigCard from '../components/CompanyActivitiesConfigCard';

interface ManageCompanyActivitiesDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageCompanyActivitiesDialog({
  open,
  onClose,
}: ManageCompanyActivitiesDialogProps) {
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
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:arrows-right-left</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
              Flujo Productivo & Actividades
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Habilita etapas, define la etapa inicial y el destino final de la empresa activa.
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
        <CompanyActivitiesConfigCard onSuccess={onClose} isModal />
      </DialogContent>
    </Dialog>
  );
}
