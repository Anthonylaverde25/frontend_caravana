import { Box, Paper, Typography, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CompanyActivitiesConfigCard from '@/ui/activities/components/CompanyActivitiesConfigCard';

export default function ActivitiesWorkflowSection() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Intro Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FuseSvgIcon size={24} sx={{ color: 'primary.main' }}>
            heroicons-outline:arrows-right-left
          </FuseSvgIcon>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Flujo Productivo & Actividades
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Configuración de etapas del rodeo (Cría, Recría, Invernada, Cabaña, Feedlot) y reglas de transición.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Main Activities Configuration */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <CompanyActivitiesConfigCard />
      </Paper>
    </Box>
  );
}
