import { useMemo, useState } from 'react';
import GestationBirthSheetDialog from '../components/GestationBirthSheetDialog';
import {
  Paper,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  Button,
  CircularProgress,
  Avatar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import DataTable from 'src/components/data-table/DataTable';
import { MRT_ColumnDef } from 'material-react-table';
import GestationKpiCards from '../components/GestationKpiCards';

// Helper to compute remaining days of pregnancy
const getDaysLeft = (dueDateStr?: string | null) => {
  if (!dueDateStr) return 0;
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Helper to resolve risk based on category and days left
const getRiskDetails = (category: string | null, daysLeft: number) => {
  const catNormalized = (category || '').toLowerCase();
  if (catNormalized.includes('vaquillona') || catNormalized.includes('vaquilla')) {
    if (daysLeft <= 45) {
      return { risk: 'High', label: 'Alto (1er Parto Temprano)' };
    }
    return { risk: 'Medium', label: 'Medio (Vaquillona)' };
  }
  if (daysLeft <= 30) {
    return { risk: 'Medium', label: 'Medio (Parto Próximo)' };
  }
  return { risk: 'Low', label: 'Bajo' };
};

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
 * GestationListView Component
 * Renders the list of batches and their pregnant caravans using an expanded Master-Detail DataTable.
 */
function GestationListView() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeCompanyId } = useCompany();

  // Fetch caravans from active company
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId);

  // States for printable gestation sheet dialog
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<{ id: number; name: string; caravans: any[] } | null>(null);

  // Filter only pregnant caravans
  const gestatingCaravans = useMemo(() => {
    return caravans.filter(c => c.active_gestation !== null);
  }, [caravans]);

  // Group pregnant caravans by batch for the Master Table
  const groupedBatches = useMemo(() => {
    const batchesMap: Record<string, { id: string | number; name: string; caravans: typeof caravans }> = {};
    
    gestatingCaravans.forEach(caravan => {
      const batchName = caravan.batch_name || 'SIN LOTE ASIGNADO';
      if (!batchesMap[batchName]) {
        batchesMap[batchName] = {
          id: caravan.batch_id || batchName,
          name: batchName,
          caravans: []
        };
      }
      batchesMap[batchName].caravans.push(caravan);
    });
    
    return Object.values(batchesMap);
  }, [gestatingCaravans]);



  // Common spreadsheet properties for Material React Table
  const spreadsheetProps = useMemo(() => ({
    enableColumnBorders: true,
    enableRowBorders: true,
    muiTableProps: {
      sx: {
        border: '1px solid',
        borderColor: 'divider',
      },
    },
    muiTableHeadCellProps: {
      sx: {
        borderRight: '1px solid',
        borderBottom: '2px solid',
        borderColor: 'divider',
        backgroundColor: 'action.hover',
        fontWeight: 800,
        fontSize: '0.75rem',
        p: '6px 8px',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        borderRight: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        fontSize: '0.75rem',
        p: '6px 8px',
      },
    },
  }), []);

  // Columns for the Batch Rows (Master Level)
  const batchColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Lote / Grupo',
      size: 300,
      Cell: ({ cell, row }: any) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar 
            sx={{ 
              bgcolor: (theme) => theme.palette.primary.main, 
              width: 36, 
              height: 36, 
              fontSize: '0.875rem', 
              fontWeight: 800,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {(cell.getValue() as string).substring(0, 2).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              {cell.getValue() as string}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {row.original.caravans.length} Vientres gestantes
            </Typography>
          </Box>
        </Stack>
      )
    },
    {
      header: 'Categoría Predominante',
      size: 200,
      accessorFn: (row: any) => row.caravans[0]?.category || '-',
      Cell: ({ cell }: any) => (
        <Chip 
          label={cell.getValue() || '-'} 
          size="small" 
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}
        />
      )
    }
  ], []);

  // Columns for the Caravans (Detail Level)
  const caravanColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    {
      accessorKey: 'identification',
      header: 'Caravana',
      size: 150,
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0a6ed1', fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {cell.getValue() as string}
        </Typography>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      size: 140,
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {(cell.getValue() as string) || '-'}
        </Typography>
      ),
    },
    {
      id: 'gestation_stage',
      header: 'Estadio Preñez',
      size: 140,
      accessorFn: (row) => row.active_gestation?.gestation_stage,
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'center' },
      Cell: ({ cell }) => {
        const stage = cell.getValue() as string;
        if (!stage) return '-';
        return (
          <Chip
            label={getStageLabel(stage)}
            size="small"
            sx={{
              fontWeight: 700,
              height: 18,
              fontSize: '0.65rem',
              bgcolor:
                stage === 'head'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : stage === 'body'
                  ? 'rgba(245, 158, 11, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              color:
                stage === 'head'
                  ? '#10b981'
                  : stage === 'body'
                  ? '#f59e0b'
                  : '#ef4444',
              border: 1,
              borderColor:
                stage === 'head'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : stage === 'body'
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)'
            }}
          />
        );
      },
    },
    {
      id: 'estimated_due_date',
      header: 'Parto Estimado (FPP)',
      size: 150,
      accessorFn: (row) => row.active_gestation?.estimated_due_date,
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'center' },
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem' }}>
          {(cell.getValue() as string) || '-'}
        </Typography>
      ),
    },
    {
      id: 'days_left',
      header: 'Restante',
      size: 100,
      accessorFn: (row) => getDaysLeft(row.active_gestation?.estimated_due_date),
      muiTableHeadCellProps: { align: 'right' },
      muiTableBodyCellProps: { align: 'right' },
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
          {cell.getValue() as number} d
        </Typography>
      ),
    },
    {
      id: 'risk',
      header: 'Riesgo',
      size: 140,
      accessorFn: (row) => {
        const daysLeft = getDaysLeft(row.active_gestation?.estimated_due_date);
        return getRiskDetails(row.category, daysLeft).label;
      },
      Cell: ({ row }) => {
        const daysLeft = getDaysLeft(row.original.active_gestation?.estimated_due_date);
        const riskInfo = getRiskDetails(row.original.category, daysLeft);
        return (
          <Chip
            label={riskInfo.label}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 700,
              height: 18,
              fontSize: '0.65rem',
              color: riskInfo.risk === 'High' ? 'error.main' : riskInfo.risk === 'Medium' ? 'warning.main' : 'success.main',
              borderColor: riskInfo.risk === 'High' ? 'error.light' : riskInfo.risk === 'Medium' ? 'warning.light' : 'success.light',
              bgcolor: riskInfo.risk === 'High' ? 'rgba(239, 68, 68, 0.05)' : riskInfo.risk === 'Medium' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '2px'
            }}
          />
        );
      },
    },
  ], []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando listado gestacional...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Monitoreo Gestacional por Lotes"
      subtitle="Listado completo y detallado de vientres en proceso de gestación activo organizados por lote."
      actions={
        <Button
          variant="text"
          startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>}
          onClick={() => navigate('/gestation')}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Volver al Dashboard
        </Button>
      }
    >
      <GestationKpiCards caravans={caravans} />
      <Stack spacing={3}>


        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Listado de Animales Agrupados por Lote
          </Typography>
        </Stack>

        {/* Detailed Worklist Table using Master-Detail DataTable */}
        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: '4px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <DataTable
            columns={batchColumns}
            data={groupedBatches}
            enableExpanding={true}
            enableTopToolbar={false}
            enableBottomToolbar={true}
            enableRowActions={false}
            enableRowSelection={false}
            initialState={{
              density: 'compact',
              expanded: true,
              pagination: { pageSize: 15, pageIndex: 0 }
            }}
            renderDetailPanel={({ row }) => (
              <Box
                sx={{
                  display: 'grid',
                  width: '100%',
                  px: 1,
                  py: 3,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                  borderTop: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                    Detalle de Vientres en Lote: {row.original.name} ({row.original.caravans.length})
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
                      onClick={() => {
                        setSelectedBatch({
                          id: Number(row.original.id),
                          name: row.original.name,
                          caravans: row.original.caravans
                        });
                        setSheetOpen(true);
                      }}
                      sx={{ textTransform: 'none', py: 0.5, px: 1.5, fontSize: '0.75rem', borderRadius: '4px', color: '#fff', fontWeight: 700 }}
                    >
                      Planilla de Parición
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus-circle</FuseSvgIcon>}
                      onClick={() => navigate(`/gestation/batches/${row.original.id}/bulk-birth`)}
                      sx={{ textTransform: 'none', py: 0.5, px: 1.5, fontSize: '0.75rem', borderRadius: '4px', color: '#fff', fontWeight: 700 }}
                    >
                      Registrar Partos
                    </Button>
                  </Stack>
                </Box>

                <DataTable
                  columns={caravanColumns}
                  data={row.original.caravans}
                  enableTopToolbar={false}
                  enableBottomToolbar={false}
                  enableRowActions={true}
                  enableRowSelection={false}
                  renderRowActions={({ row: caravanRow }) => (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Ver Ficha / Editar">
                        <IconButton size="small" color="primary" sx={{ p: 0.25 }}>
                          <FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  initialState={{
                    density: 'compact'
                  }}
                  {...spreadsheetProps}
                />
              </Box>
            )}
            {...spreadsheetProps}
          />
        </Paper>
      </Stack>

      <GestationBirthSheetDialog
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelectedBatch(null);
        }}
        batchId={selectedBatch?.id}
        caravans={selectedBatch?.caravans || []}
      />
    </ViewLayout>
  );
}

export default GestationListView;
