import { Box, Paper, Typography, Grid } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BullHealthEvaluation } from '@/core/pre-service/domain/BullHealthEvaluation';

interface PreServiceKpiCardsProps {
  bulls: BullHealthEvaluation[];
}

export function PreServiceKpiCards({ bulls }: PreServiceKpiCardsProps) {
  const total = bulls.length;
  const apt = bulls.filter((b) => b.status === 'APT').length;
  const inTreatment = bulls.filter((b) => b.status === 'IN_TREATMENT').length;
  const unfit = bulls.filter((b) => b.status === 'UNFIT').length;
  const pending = bulls.filter((b) => b.status === 'PENDING_EVALUATION').length;

  const aptPercentage = total > 0 ? Math.round((apt / total) * 100) : 0;

  const cards = [
    {
      title: 'Plantel de Toros',
      value: total,
      subtitle: `${aptPercentage}% Aptitud General`,
      icon: 'heroicons-outline:user-group',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.08)',
    },
    {
      title: 'Aptos para Servicio',
      value: apt,
      subtitle: 'Habilitados para Entore',
      icon: 'heroicons-outline:check-circle',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
    },
    {
      title: 'En Tratamiento',
      value: inTreatment,
      subtitle: 'Bloqueados transitoriamente',
      icon: 'heroicons-outline:exclamation-circle',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.08)',
    },
    {
      title: 'Rechazo / Descarte',
      value: unfit,
      subtitle: 'No aptos reproductivos',
      icon: 'heroicons-outline:x-circle',
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.08)',
    },
    {
      title: 'Pendientes Examen',
      value: pending,
      subtitle: 'Sin revisación en manga',
      icon: 'heroicons-outline:clock',
      color: '#6B7280',
      bgColor: 'rgba(107, 114, 128, 0.08)',
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={card.title}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              bgcolor: 'background.paper',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                {card.title}
              </Typography>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: '6px',
                  bgcolor: card.bgColor,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FuseSvgIcon size={20}>{card.icon}</FuseSvgIcon>
              </Box>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1, mb: 0.5 }}>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {card.subtitle}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
