import { useMemo, useState } from 'react';
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useServiceOrders, useRegisterGestationDiagnosis } from '@/features/gestation/hooks/useServiceOrders';
import DataTable from 'src/components/data-table/DataTable';
import { MRT_ColumnDef } from 'material-react-table';
import { toast } from 'sonner';
import GestationTactoSheetDialog from '../components/GestationTactoSheetDialog';

// Helper to get Spanish labels for gestation stages
const getStageLabel = (stage?: string) => {
  switch (stage) {
    case 'head': return 'Cabeza';
    case 'body': return 'Cuerpo';
    case 'tail': return 'Cola';
    default: return '-';
  }
};

interface DiagnosisModalState {
  open: boolean;
  caravanId: number;
  caravanIdent: string;
  category: string;
  serviceOrderId: number;
  maleCaravanIds: number[];
}

function GestationTactoView() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeCompanyId } = useCompany();

  // 1. Fetch data from hooks
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);
  const { data: orders = [], isLoading: isLoadingOrders } = useServiceOrders();
  const { data: dbBatches = [], isLoading: isLoadingBatches } = useBatches();
  
  const registerDiagnosisMutation = useRegisterGestationDiagnosis();

  // 2. Local UI States
  const [tactoSheetOpen, setTactoSheetOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState<any | null>(null);

  const [diagnosisModal, setDiagnosisModal] = useState<DiagnosisModalState>({
    open: false,
    caravanId: 0,
    caravanIdent: '',
    category: '',
    serviceOrderId: 0,
    maleCaravanIds: []
  });

  const [isPregnant, setIsPregnant] = useState<boolean>(true);
  const [diagnosisDate, setDiagnosisDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [gestationStage, setGestationStage] = useState<string>('head');
  const [gestationMonths, setGestationMonths] = useState<number>(3);
  const [confirmedSireId, setConfirmedSireId] = useState<number | 'none'>('none');

  // Mappings
  const batchMap = useMemo(() => new Map(dbBatches.map(b => [b.id, b.name])), [dbBatches]);
  const caravanMap = useMemo(() => new Map(caravans.map(c => [c.id, c])), [caravans]);

  const getBatchName = (batchId: number) => batchMap.get(batchId) || `Lote #${batchId}`;
  
  // Filter active service orders (in progress or draft)
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'DRAFT');
  }, [orders]);

  // Handle dialog opening
  const handleOpenDiagnosis = (caravanId: number, serviceOrderId: number, maleCaravanIds: number[]) => {
    const caravan = caravanMap.get(caravanId);
    setDiagnosisModal({
      open: true,
      caravanId,
      caravanIdent: caravan?.identification || `#${caravanId}`,
      category: caravan?.category || 'N/A',
      serviceOrderId,
      maleCaravanIds
    });
    
    // Reset inputs
    setIsPregnant(true);
    setDiagnosisDate(new Date().toISOString().split('T')[0]);
    setGestationStage('head');
    setGestationMonths(3);
    
    // Auto-select sire if there is only one bull in the service order
    if (maleCaravanIds.length === 1) {
      setConfirmedSireId(maleCaravanIds[0]);
    } else {
      setConfirmedSireId('none');
    }
  };

  const handleCloseDiagnosis = () => {
    setDiagnosisModal({
      open: false,
      caravanId: 0,
      caravanIdent: '',
      category: '',
      serviceOrderId: 0,
      maleCaravanIds: []
    });
  };

  // Submit diagnosis request
  const handleSubmitDiagnosis = async () => {
    try {
      await registerDiagnosisMutation.mutateAsync({
        caravanId: diagnosisModal.caravanId,
        serviceOrderId: diagnosisModal.serviceOrderId,
        isPregnant,
        gestationStage: isPregnant ? gestationStage : null,
        gestationMonths: isPregnant ? gestationMonths : null,
        confirmedSireId: isPregnant && confirmedSireId !== 'none' ? confirmedSireId : null,
        diagnosisDate
      });

      toast.success('Diagnóstico registrado exitosamente');
      handleCloseDiagnosis();
    } catch (e: any) {
      toast.error(`Error al registrar diagnóstico: ${e.response?.data?.message || e.message}`);
    }
  };

  // Common table styles
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

  // Columns for the Order Rows (Master Level)
  const orderColumns = useMemo<MRT_ColumnDef<any>[]>(() => [
    {
      accessorKey: 'code',
      header: 'Orden / Rotación',
      size: 250,
      Cell: ({ cell, row }: any) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar 
            sx={{ 
              bgcolor: row.original.status === 'IN_PROGRESS' ? 'success.main' : 'grey.500', 
              width: 36, 
              height: 36, 
              fontSize: '0.875rem', 
              fontWeight: 800,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {row.original.status === 'IN_PROGRESS' ? 'EP' : 'BR'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              {cell.getValue() as string}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Lote: {getBatchName(row.original.batch_id)}
            </Typography>
          </Box>
        </Stack>
      )
    },
    {
      header: 'Toros Asignados',
      size: 150,
      accessorFn: (row) => row.male_caravan_ids.length,
      Cell: ({ cell, row }: any) => {
        const count = cell.getValue() as number;
        return (
          <Chip 
            label={`${count} ${count === 1 ? 'Toro' : 'Toros'}`} 
            size="small" 
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
        );
      }
    },
    {
      header: 'Vientres en Servicio',
      size: 150,
      accessorFn: (row) => row.female_caravan_ids.length,
      Cell: ({ cell }: any) => (
        <Chip 
          label={`${cell.getValue() as number} Vientres`} 
          size="small" 
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
        />
      )
    },
    {
      accessorKey: 'status',
      header: 'Estado Orden',
      size: 150,
      Cell: ({ cell }: any) => {
        const status = cell.getValue() as string;
        const isProgress = status === 'IN_PROGRESS';
        return (
          <Chip
            label={isProgress ? 'En Servicio' : 'Borrador'}
            size="small"
            color={isProgress ? 'success' : 'default'}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
          />
        );
      }
    }
  ], [dbBatches]);

  // Columns for the Caravans list (Detail Level)
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
      size: 150,
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {(cell.getValue() as string) || '-'}
        </Typography>
      ),
    },
    {
      id: 'gestation_status',
      header: 'Estado Diagnóstico',
      size: 180,
      accessorFn: (row) => row.active_gestation,
      Cell: ({ cell, row }) => {
        const activeGest = cell.getValue() as any;
        const isPregnant = activeGest !== null && activeGest !== undefined;
        
        return (
          <Chip
            label={isPregnant ? `Preñada (${getStageLabel(activeGest.gestation_stage)})` : 'Sin Preñez Activa'}
            size="small"
            color={isPregnant ? 'success' : 'default'}
            variant="outlined"
            sx={{
              fontWeight: 700,
              height: 20,
              fontSize: '0.68rem',
              bgcolor: isPregnant ? 'rgba(46, 125, 50, 0.08)' : 'transparent'
            }}
          />
        );
      }
    },
    {
      id: 'confirmed_sire',
      header: 'Toro Confirmado',
      size: 200,
      accessorFn: (row) => {
        const activeGest = row.active_gestation;
        if (!activeGest || !activeGest.sires) return '-';
        const confirmed = activeGest.sires.find((s: any) => s.is_confirmed);
        return confirmed ? confirmed.sire_identification || `#${confirmed.sire_id}` : 'Colectivo / Indeterminado';
      },
      Cell: ({ cell, row }) => {
        const activeGest = row.original.active_gestation;
        if (!activeGest) return <Typography variant="caption" color="text.disabled">-</Typography>;
        return (
          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {cell.getValue() as string}
          </Typography>
        );
      }
    }
  ], []);

  if (isLoadingCaravans || isLoadingOrders || isLoadingBatches) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando listado de tactos y órdenes...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Tacto y Diagnósticos de Preñez"
      subtitle="Supervise e ingrese los resultados gestacionales de los vientres agrupados por Orden de Servicio o Rotación."
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
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Órdenes de Servicio Reproductivo en Ejecución
          </Typography>
        </Stack>

        {/* Master-Detail DataTable for Orders */}
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
          {activeOrders.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <FuseSvgIcon size={48} className="text-disabled mb-2">heroicons-outline:document-text</FuseSvgIcon>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                No hay órdenes de servicio activas.
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                Crea o ejecuta una orden de monta en la sección de "Rotación de Toros" para poder diagnosticar vientres.
              </Typography>
            </Box>
          ) : (
            <DataTable
              columns={orderColumns}
              data={activeOrders}
              enableExpanding={true}
              enableTopToolbar={false}
              enableBottomToolbar={true}
              enableRowActions={false}
              enableRowSelection={false}
              initialState={{
                density: 'compact',
                expanded: true,
                pagination: { pageSize: 10, pageIndex: 0 }
              }}
              renderDetailPanel={({ row }) => {
                const order = row.original;
                // Map female ids to caravan entities
                const femalesList = order.female_caravan_ids
                  .map((id: number) => caravanMap.get(id))
                  .filter(Boolean);

                return (
                  <Box
                    sx={{
                      display: 'grid',
                      width: '100%',
                      px: 2,
                      py: 3,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.01),
                      borderTop: '1px solid',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        Detalle de Vientres en Servicio ({femalesList.length})
                      </Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
                          onClick={() => {
                            setPrintOrder(order);
                            setTactoSheetOpen(true);
                          }}
                          sx={{ textTransform: 'none', py: 0.5, px: 1.5, fontSize: '0.75rem', borderRadius: '4px', color: '#fff', fontWeight: 700 }}
                        >
                          Planilla de Tacto
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus-circle</FuseSvgIcon>}
                          onClick={() => navigate(`/gestation/service-orders/${order.id}/bulk-tacto`)}
                          sx={{ textTransform: 'none', py: 0.5, px: 1.5, fontSize: '0.75rem', borderRadius: '4px', color: '#fff', fontWeight: 700 }}
                        >
                          Carga en Lote
                        </Button>
                      </Stack>
                    </Box>

                    <DataTable
                      columns={caravanColumns}
                      data={femalesList}
                      enableTopToolbar={false}
                      enableBottomToolbar={false}
                      enableRowActions={true}
                      enableRowSelection={false}
                      positionActionsColumn="last"
                      renderRowActions={({ row: caravanRow }) => {
                        const caravan = caravanRow.original;
                        const isPregnant = caravan.active_gestation !== null;
                        
                        return (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<FuseSvgIcon size={14}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
                              onClick={() => handleOpenDiagnosis(caravan.id, order.id, order.male_caravan_ids)}
                              sx={{
                                textTransform: 'none',
                                py: 0.2,
                                px: 1,
                                fontSize: '0.7rem',
                                fontWeight: 700
                              }}
                            >
                              {isPregnant ? 'Re-diagnosticar' : 'Confirmar Preñez'}
                            </Button>
                          </Box>
                        );
                      }}
                      initialState={{
                        density: 'compact'
                      }}
                      {...spreadsheetProps}
                    />
                  </Box>
                );
              }}
              {...spreadsheetProps}
            />
          )}
        </Paper>
      </Stack>

      {/* DIAGNOSIS DIALOG */}
      <Dialog 
        open={diagnosisModal.open} 
        onClose={handleCloseDiagnosis}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Diagnóstico de Preñez: Caravana {diagnosisModal.caravanIdent}
          </Typography>
          <IconButton onClick={handleCloseDiagnosis} size="small">
            <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            {/* Pregnancy Switch / Toggle */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontSize: '0.8rem', fontWeight: 700, mb: 1 }}>Resultado del Tacto / Ecografía</FormLabel>
              <RadioGroup
                row
                value={isPregnant ? 'pregnant' : 'empty'}
                onChange={(e) => setIsPregnant(e.target.value === 'pregnant')}
              >
                <FormControlLabel value="pregnant" control={<Radio size="small" />} label="Preñada" />
                <FormControlLabel value="empty" control={<Radio size="small" />} label="Vacía" />
              </RadioGroup>
            </FormControl>

            {/* Diagnosis Date */}
            <TextField
              required
              label="Fecha del Diagnóstico"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={diagnosisDate}
              onChange={(e) => setDiagnosisDate(e.target.value)}
            />

            {isPregnant && (
              <>
                {/* Gestation Stage */}
                <FormControl fullWidth size="small">
                  <InputLabel id="stage-select-label">Estadio Estimado (Parición)</InputLabel>
                  <Select
                    labelId="stage-select-label"
                    value={gestationStage}
                    label="Estadio Estimado (Parición)"
                    onChange={(e) => {
                      const stage = e.target.value;
                      setGestationStage(stage);
                      // Auto-set default months
                      if (stage === 'head') setGestationMonths(3);
                      else if (stage === 'body') setGestationMonths(2);
                      else if (stage === 'tail') setGestationMonths(1);
                    }}
                  >
                    <MenuItem value="head">Cabeza (Más de 2 meses)</MenuItem>
                    <MenuItem value="body">Cuerpo (Entre 1 y 2 meses)</MenuItem>
                    <MenuItem value="tail">Cola (Menos de 1 mes)</MenuItem>
                  </Select>
                </FormControl>

                {/* Gestation Months */}
                <TextField
                  type="number"
                  label="Meses de Preñez Estimados"
                  size="small"
                  inputProps={{ min: 0.5, max: 9.5, step: 0.5 }}
                  value={gestationMonths}
                  onChange={(e) => setGestationMonths(Number(e.target.value))}
                />

                {/* Sire Confirmation */}
                <FormControl fullWidth size="small">
                  <InputLabel id="sire-select-label">Toro Confirmado (Padre)</InputLabel>
                  <Select
                    labelId="sire-select-label"
                    value={confirmedSireId}
                    label="Toro Confirmado (Padre)"
                    onChange={(e) => setConfirmedSireId(e.target.value as number | 'none')}
                  >
                    <MenuItem value="none"><em>-- Colectivo / Indeterminado --</em></MenuItem>
                    {diagnosisModal.maleCaravanIds.map(id => {
                      const bull = caravanMap.get(id);
                      return (
                        <MenuItem key={id} value={id}>
                          {bull?.identification || `Toro #${id}`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDiagnosis} 
            variant="text" 
            size="small" 
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitDiagnosis} 
            color={isPregnant ? 'success' : 'primary'} 
            variant="contained" 
            size="small" 
            disabled={registerDiagnosisMutation.isPending}
            sx={{ textTransform: 'none', color: '#fff', px: 3 }}
          >
            {registerDiagnosisMutation.isPending ? 'Guardando...' : 'Guardar Diagnóstico'}
          </Button>
        </DialogActions>
      </Dialog>

      <GestationTactoSheetDialog
        open={tactoSheetOpen}
        onClose={() => {
          setTactoSheetOpen(false);
          setPrintOrder(null);
        }}
        order={printOrder}
        caravans={caravans}
      />
    </ViewLayout>
  );
}

export default GestationTactoView;
