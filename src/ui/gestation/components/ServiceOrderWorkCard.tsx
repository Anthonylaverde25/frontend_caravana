import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Stack,
  Chip,
  Button,
  IconButton,
  Collapse,
  LinearProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { alpha } from '@mui/material/styles';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface ServiceOrderWorkCardProps {
  order: ServiceOrder;
  caravans: any[];
  batchName: string;
  onOpenDiagnosis: (caravanId: number, serviceOrderId: number, maleCaravanIds: number[]) => void;
  onPrintSheet: (order: ServiceOrder) => void;
  onBulkEntry: (orderId: number) => void;
}

// Helper to get Spanish labels for gestation stages
const getStageLabel = (stage?: string) => {
  switch (stage) {
    case 'head': return 'Cabeza';
    case 'body': return 'Cuerpo';
    case 'tail': return 'Cola';
    default: return '-';
  }
};

/**
 * ServiceOrderWorkCard Component
 * Displays a service order as a premium visual card with diagnosis progress and animal list.
 */
function ServiceOrderWorkCard({
  order,
  caravans,
  batchName,
  onOpenDiagnosis,
  onPrintSheet,
  onBulkEntry
}: ServiceOrderWorkCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [expanded, setExpanded] = useState(false);

  // Map female caravan ids to full caravan details
  const femaleCaravans = useMemo(() => {
    return order.female_caravan_ids
      .map((id) => caravans.find((c) => c.id === id))
      .filter(Boolean);
  }, [order.female_caravan_ids, caravans]);

  // Calculate pregnancy rate
  const pregnantCount = useMemo(() => {
    return femaleCaravans.filter(c => c.active_gestation !== null).length;
  }, [femaleCaravans]);

  const totalFemales = order.female_caravan_ids.length;
  const pregnancyRate = totalFemales > 0 ? Math.round((pregnantCount / totalFemales) * 100) : 0;

  // Status Chip Config
  const statusConfig = useMemo(() => {
    const isProgress = order.status === 'IN_PROGRESS';
    return {
      label: isProgress ? 'En Servicio' : 'Borrador',
      color: isProgress ? ('success' as const) : ('default' as const),
      bg: isProgress ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.text.primary, 0.04)
    };
  }, [order.status, theme]);

  return (
    <Card
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: '8px',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)',
          borderColor: theme.palette.primary.light
        }
      }}
    >
      <CardContent sx={{ p: 3, pb: 2 }}>
        {/* Card Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main', lineHeight: 1.1 }}>
              {order.code}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Lote: {batchName}
            </Typography>
          </Box>
          <Chip
            label={statusConfig.label}
            size="small"
            color={statusConfig.color}
            variant="outlined"
            sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: statusConfig.bg }}
          />
        </Stack>

        {/* Card Details */}
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Fecha Planificada:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.planned_start_date}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Animales Asignados:</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`${order.male_caravan_ids.length} Toros`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
              <Chip label={`${totalFemales} Vientres`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Pregnancy Progress Bar */}
        <Box sx={{ mb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tasa de Preñez Confirmada
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>
              {pregnantCount} / {totalFemales} ({pregnancyRate}%)
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={pregnancyRate}
            color="success"
            sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          />
        </Box>
      </CardContent>

      {/* Card Actions */}
      <CardActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
            onClick={() => onPrintSheet(order)}
            sx={{ textTransform: 'none', fontWeight: 700, height: 32, fontSize: '0.75rem' }}
          >
            Planilla
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus-circle</FuseSvgIcon>}
            onClick={() => onBulkEntry(order.id)}
            sx={{ textTransform: 'none', fontWeight: 800, height: 32, fontSize: '0.75rem', color: '#fff' }}
          >
            Carga en Lote
          </Button>
        </Stack>

        <Button
          size="small"
          variant="text"
          color="inherit"
          endIcon={
            <FuseSvgIcon size={16}>
              {expanded ? 'heroicons-outline:chevron-up' : 'heroicons-outline:chevron-down'}
            </FuseSvgIcon>
          }
          onClick={() => setExpanded(!expanded)}
          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary' }}
        >
          {expanded ? 'Ocultar vientres' : `Ver vientres (${femaleCaravans.length})`}
        </Button>
      </CardActions>

      {/* Collapsable Females Table */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <TableContainer sx={{ maxHeight: 220, bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.01)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.68rem', fontWeight: 800, py: 1 }}>Caravana</TableCell>
                <TableCell sx={{ fontSize: '0.68rem', fontWeight: 800, py: 1 }}>Categoría</TableCell>
                <TableCell sx={{ fontSize: '0.68rem', fontWeight: 800, py: 1 }}>Estado Tacto</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.68rem', fontWeight: 800, py: 1, pr: 2 }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {femaleCaravans.map((cow: any) => {
                const isPregnant = cow.active_gestation !== null;
                return (
                  <TableRow key={cow.id} hover>
                    <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, py: 1, fontFamily: 'monospace', color: '#0a6ed1' }}>
                      {cow.identification}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', py: 1 }}>
                      {cow.category || 'Vientre'}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip
                        label={isPregnant ? `Preñada (${getStageLabel(cow.active_gestation.gestation_stage)})` : 'Vacía / Sin Tacto'}
                        size="small"
                        color={isPregnant ? 'success' : 'default'}
                        variant="outlined"
                        sx={{
                          height: 18,
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          bgcolor: isPregnant ? alpha(theme.palette.success.main, 0.05) : 'transparent'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.5, pr: 1.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onOpenDiagnosis(cow.id, order.id, order.male_caravan_ids)}
                        sx={{
                          textTransform: 'none',
                          py: 0.1,
                          px: 1,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          minWidth: 'auto',
                          borderRadius: '4px'
                        }}
                      >
                        {isPregnant ? 'Re-diagnosticar' : 'Diagnóstico'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {femaleCaravans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ fontStyle: 'italic', py: 2 }}>
                    Sin vientres asignados en esta orden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Card>
  );
}

export default ServiceOrderWorkCard;
