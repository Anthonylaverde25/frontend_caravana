import { Card, CardContent, Typography, Box, Grid, Stack, LinearProgress, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';

interface GestationKpiCardsProps {
  caravans: any[];
}

/**
 * GestationKpiCards Component
 * Renders executive KPI summary cards for pregnancy and calving monitoring.
 */
function GestationKpiCards({ caravans }: GestationKpiCardsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Filter only pregnant caravans
  const pregnantCaravans = useMemo(() => {
    return caravans.filter(c => c.active_gestation !== null);
  }, [caravans]);

  // Helper to compute remaining days
  const getDaysLeft = (dueDateStr?: string | null) => {
    if (!dueDateStr) return 999;
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // 1. Total Gestating Count
  const totalGestating = pregnantCaravans.length;

  // 2. Calving imminent (<= 45 days left)
  const imminentCalvings = useMemo(() => {
    return pregnantCaravans.filter(c => {
      const days = getDaysLeft(c.active_gestation?.estimated_due_date);
      return days <= 45;
    }).length;
  }, [pregnantCaravans]);

  // 3. Stage Distribution (Cabeza / Cuerpo / Cola)
  const distribution = useMemo(() => {
    let head = 0;
    let body = 0;
    let tail = 0;

    pregnantCaravans.forEach(c => {
      const stage = c.active_gestation?.gestation_stage;
      if (stage === 'head') head++;
      else if (stage === 'body') body++;
      else if (stage === 'tail') tail++;
    });

    const total = head + body + tail || 1;
    return {
      head: Math.round((head / total) * 100),
      body: Math.round((body / total) * 100),
      tail: Math.round((tail / total) * 100),
    };
  }, [pregnantCaravans]);

  // 4. Critical High Risk Animals
  const highRiskCount = useMemo(() => {
    return pregnantCaravans.filter(c => {
      const days = getDaysLeft(c.active_gestation?.estimated_due_date);
      const cat = (c.category || '').toLowerCase();
      // High risk: Heifers (vaquillonas) close to calving (<= 45 days)
      return (cat.includes('vaquillona') || cat.includes('vaquilla')) && days <= 45;
    }).length;
  }, [pregnantCaravans]);

  const cards = [
    {
      title: 'Vientres Gestantes',
      value: totalGestating,
      subtitle: 'Total preñeces activas',
      icon: 'heroicons-outline:heart',
      color: theme.palette.primary.main,
      bg: alpha(theme.palette.primary.main, 0.08)
    },
    {
      title: 'Partos Próximos',
      value: imminentCalvings,
      subtitle: 'Parto estimado ≤ 45 días',
      icon: 'heroicons-outline:clock',
      color: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, 0.08)
    },
    {
      title: 'Alertas de Alto Riesgo',
      value: highRiskCount,
      subtitle: 'Vaquillonas próximas a parir',
      icon: 'heroicons-outline:exclamation-triangle',
      color: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, 0.08)
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }} className="no-print">
      {/* 3 Metrics Cards */}
      {cards.map((card, idx) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
          <Card
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: '8px',
              bgcolor: 'background.paper',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, fontWeight: 500 }}>
                    {card.subtitle}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color
                  }}
                >
                  <FuseSvgIcon size={24}>{card.icon}</FuseSvgIcon>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Distribution Card */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: '8px',
            bgcolor: 'background.paper',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', mb: 1.5 }}>
              Distribución de Parición (Estadios)
            </Typography>
            
            <Stack spacing={1}>
              {/* Head Progress Bar */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>Cabeza (&gt; 2m)</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: 'success.main' }}>{distribution.head}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={distribution.head}
                  color="success"
                  sx={{ height: 4, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />
              </Box>

              {/* Body Progress Bar */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>Cuerpo (1-2m)</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: 'warning.main' }}>{distribution.body}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={distribution.body}
                  color="warning"
                  sx={{ height: 4, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />
              </Box>

              {/* Tail Progress Bar */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>Cola (&lt; 1m)</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: 'error.main' }}>{distribution.tail}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={distribution.tail}
                  color="error"
                  sx={{ height: 4, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default GestationKpiCards;
