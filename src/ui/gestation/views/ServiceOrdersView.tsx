import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  Chip,
  Divider,
  Alert,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
  TextField,
  Menu,
  MenuItem
} from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import DataTable from '@/components/data-table/DataTable';
import { useCompany } from '@/contexts/CompanyContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import {
  useServiceOrders,
  useApproveServiceOrder,
  useCompleteServiceOrder,
  useUpdateServiceOrderStatus,
  ServiceOrder
} from '@/features/gestation/hooks/useServiceOrders';
import { toast } from 'sonner';
import ServiceOrderPrintSheetDialog from '../components/dialogs/ServiceOrderPrintSheetDialog';

/**
 * ServiceOrderStatus Chip Color configuration
 */
const getStatusConfig = (status: string) => {
  switch (status.toUpperCase()) {
    case 'DRAFT':
      return { label: 'Borrador', color: 'default' as const };
    case 'APPROVED':
      return { label: 'Aprobada', color: 'info' as const };
    case 'SUCCESS':
      return { label: 'Completada', color: 'success' as const };
    case 'REJECTED':
      return { label: 'Rechazada', color: 'error' as const };
    case 'CANCELLED':
      return { label: 'Cancelada', color: 'default' as const };
    default:
      return { label: status, color: 'default' as const };
  }
};

interface StatusSelectChipProps {
  order: ServiceOrder;
}

function StatusSelectChip({ order }: StatusSelectChipProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const updateStatusMutation = useUpdateServiceOrderStatus();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (status: string) => {
    handleClose();
    if (status === order.status) return;

    try {
      await updateStatusMutation.mutateAsync({ id: order.id, status });
      toast.success(`Estado actualizado a ${getStatusConfig(status).label}`);
    } catch (e: any) {
      toast.error(`Error al actualizar el estado: ${e.response?.data?.message || e.message}`);
    }
  };

  const statusConf = getStatusConfig(order.status);

  return (
    <>
      <Chip
        label={statusConf.label}
        size="small"
        color={statusConf.color}
        variant="outlined"
        onClick={handleClick}
        disabled={updateStatusMutation.isPending}
        icon={
          updateStatusMutation.isPending ? (
            <CircularProgress size={12} color="inherit" />
          ) : (
            <FuseSvgIcon size={12}>heroicons-outline:chevron-down</FuseSvgIcon>
          )
        }
        sx={{
          height: 24,
          fontSize: '0.68rem',
          fontWeight: 700,
          borderRadius: '4px',
          cursor: 'pointer',
          '& .MuiChip-icon': {
            order: 1,
            marginLeft: '4px',
            marginRight: '-4px',
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => handleStatusChange('DRAFT')}>Borrador</MenuItem>
        <MenuItem onClick={() => handleStatusChange('APPROVED')}>Aprobada</MenuItem>
        <MenuItem onClick={() => handleStatusChange('SUCCESS')}>Completada</MenuItem>
        <MenuItem onClick={() => handleStatusChange('REJECTED')}>Rechazada</MenuItem>
        <MenuItem onClick={() => handleStatusChange('CANCELLED')}>Cancelada</MenuItem>
      </Menu>
    </>
  );
}

function ServiceOrdersView() {
  const navigate = useNavigate();
  const { activeCompanyId } = useCompany();
  const theme = useTheme();

  // 1. Database data queries
  const { data: orders = [], isLoading: isLoadingOrders } = useServiceOrders();
  const { data: dbBatches = [], isLoading: isLoadingBatches } = useBatches();
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);

  // 2. Lifecycle Transition Mutations
  const approveMutation = useApproveServiceOrder();
  const completeMutation = useCompleteServiceOrder();

  // 3. UI Local States
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<ServiceOrder | null>(null);
  const [autoShareWhatsApp, setAutoShareWhatsApp] = useState<boolean>(false);
  
  // Rejection Dialog State
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; orderId: number | null; mode: 'review' | 'approve' }>({
    open: false,
    orderId: null,
    mode: 'review'
  });
  const [rejectReason, setRejectReason] = useState<string>('');

  // Completion Dialog State
  const [completeDialog, setCompleteDialog] = useState<{ open: boolean; orderId: number | null }>({
    open: false,
    orderId: null
  });
  const [completeNotes, setCompleteNotes] = useState<string>('');

  // 4. Batch & Caravan lookup mapping
  const batchMap = useMemo(() => new Map(dbBatches.map(b => [b.id, b.name])), [dbBatches]);
  const caravanMap = useMemo(() => new Map(caravans.map(c => [c.id, c.identification])), [caravans]);

  const getBatchName = (batchId: number) => batchMap.get(batchId) || `Lote #${batchId}`;
  const getCaravanIdent = (id: number) => caravanMap.get(id) || `#${id}`;


  // 5. Action handlers
  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id, approve: true });
      toast.success('Orden aprobada con éxito');
    } catch (e: any) {
      toast.error(`Error al aprobar la orden: ${e.response?.data?.message || e.message}`);
    }
  };

  const openRejectDialog = (id: number, mode: 'review' | 'approve') => {
    setRejectDialog({ open: true, orderId: id, mode });
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('Debe ingresar un motivo para el rechazo');
      return;
    }
    const { orderId } = rejectDialog;
    if (orderId === null) return;

    try {
      await approveMutation.mutateAsync({ id: orderId, approve: false, reason: rejectReason.trim() });
      toast.success('Orden rechazada exitosamente');
      setRejectDialog({ open: false, orderId: null, mode: 'approve' });
    } catch (e: any) {
      toast.error(`Error al rechazar la orden: ${e.response?.data?.message || e.message}`);
    }
  };

  const openCompleteDialog = (id: number) => {
    setCompleteDialog({ open: true, orderId: id });
    setCompleteNotes('');
  };

  const handleCompleteSubmit = async () => {
    const { orderId } = completeDialog;
    if (orderId === null) return;

    try {
      await completeMutation.mutateAsync({ id: orderId, observations: completeNotes.trim() || undefined });
      toast.success('Orden de servicio completada y cerrada exitosamente');
      setCompleteDialog({ open: false, orderId: null });
    } catch (e: any) {
      toast.error(`Error al completar la orden: ${e.response?.data?.message || e.message}`);
    }
  };

  const isTransitioning = 
    approveMutation.isPending || 
    completeMutation.isPending;

  // Datatable Columns Definition
  const columns = useMemo<MRT_ColumnDef<ServiceOrder>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Código',
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', fontSize: '0.8rem' }}
          >
            {row.original.code}
          </Typography>
        ),
      },
      {
        header: 'Lote de Trabajo',
        accessorFn: (row) => getBatchName(row.batch_id),
      },
      {
        header: 'Toros',
        accessorFn: (row) => row.male_caravan_ids.length,
        Cell: ({ row }) => (
          <Chip
            label={row.original.male_caravan_ids.length}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
          />
        ),
      },
      {
        header: 'Vientres',
        accessorFn: (row) => row.female_caravan_ids.length,
        Cell: ({ row }) => (
          <Chip
            label={row.original.female_caravan_ids.length}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
          />
        ),
      },
      {
        accessorKey: 'planned_start_date',
        header: 'Fecha Planificada',
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        Cell: ({ row }) => <StatusSelectChip order={row.original} />,
      },
    ],
    [dbBatches]
  );

  if (isLoadingOrders || isLoadingBatches || isLoadingCaravans) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
          Cargando listado de órdenes de servicio...
        </Typography>
      </Box>
    );
  }

  return (
    <ViewLayout
      title="Órdenes de Servicio Reproductivo"
      subtitle="Supervise, apruebe y controle la ejecución de los servicios y rotaciones planificados."
      actions={
        <Button
          variant="contained"
          color="primary"
          startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
          onClick={() => navigate('/gestation/bull-rotation?action=create')}
          sx={{
            bgcolor: 'primary.main',
            borderRadius: '6px',
            px: 3,
            fontWeight: 700,
            textTransform: 'none',
            color: '#fff'
          }}
        >
          Nueva Orden de Servicio
        </Button>
      }
    >
      <Box component="main" sx={{ w: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <DataTable
            columns={columns}
            data={orders}
            enableRowSelection={false}
            enableColumnOrdering={true}
            enableGlobalFilter={true}
            enableRowActions={true}
            positionActionsColumn="last"
            renderRowActions={({ row }) => {
              const order = row.original;
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Tooltip title="Ver Detalles">
                    <IconButton size="small" onClick={() => setSelectedOrder(order)} sx={{ color: 'primary.main' }}>
                      <FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Imprimir / PDF">
                    <IconButton size="small" onClick={() => setPrintOrder(order)} sx={{ color: 'secondary.main' }}>
                      <FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Enviar por WhatsApp">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setPrintOrder(order);
                        setAutoShareWhatsApp(true);
                      }}
                      sx={{ color: '#25D366' }}
                    >
                      <FuseSvgIcon size={18}>heroicons-outline:chat-bubble-left-right</FuseSvgIcon>
                    </IconButton>
                  </Tooltip>

                  {/* DRAFT -> Approve (Aprobar) */}
                  {order.status === 'DRAFT' && (
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        disabled={isTransitioning}
                        onClick={() => handleApprove(order.id)}
                        sx={{ textTransform: 'none', py: 0.2, px: 1, fontSize: '0.68rem', fontWeight: 700, color: '#fff' }}
                      >
                        Aprobar
                      </Button>
                      <Tooltip title="Rechazar">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={isTransitioning}
                          onClick={() => openRejectDialog(order.id, 'approve')}
                        >
                          <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                        </IconButton>
                      </Tooltip>
                    </>
                  )}

                  {/* APPROVED -> Complete (Completar) */}
                  {order.status === 'APPROVED' && (
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      disabled={isTransitioning}
                      onClick={() => openCompleteDialog(order.id)}
                      sx={{ textTransform: 'none', py: 0.2, px: 1, fontSize: '0.68rem', fontWeight: 700, color: '#fff' }}
                    >
                      Completar
                    </Button>
                  )}
                </Stack>
              );
            }}
            initialState={{
              density: 'compact',
              showGlobalFilter: true,
              pagination: { pageSize: 15, pageIndex: 0 },
            }}
            muiTableProps={{
              sx: {
                border: '1px solid',
                borderColor: 'divider',
              }
            }}
            muiTableHeadCellProps={{
              sx: {
                borderRight: '1px solid',
                borderBottom: '2px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                fontWeight: 800,
              }
            }}
            muiTableBodyCellProps={{
              sx: {
                borderRight: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }
            }}
          />
        </Paper>
      </Box>

      {/* DETAIL DIALOG */}
      <Dialog open={selectedOrder !== null} onClose={() => setSelectedOrder(null)} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Orden de Servicio: {selectedOrder.code}
              </Typography>
              <IconButton onClick={() => setSelectedOrder(null)} size="small">
                <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* 1. Overview data */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3,
                    bgcolor: 'action.hover',
                    p: 2,
                    borderRadius: '4px',
                    '& > *': { flex: 1 }
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">Lote</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{getBatchName(selectedOrder.batch_id)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Estado</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getStatusConfig(selectedOrder.status).label}
                        size="small"
                        color={getStatusConfig(selectedOrder.status).color}
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Fecha Planificada</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedOrder.planned_start_date}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Fecha Ejecución</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedOrder.actual_start_date || 'N/A'}</Typography>
                  </Box>
                </Box>

                {/* Rejection / Observations */}
                {selectedOrder.rejection_reason && (
                  <Alert severity="error">
                    <strong>Motivo del Rechazo:</strong> {selectedOrder.rejection_reason}
                  </Alert>
                )}
                {selectedOrder.observations && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Observaciones</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, border: 1, borderColor: 'divider', borderRadius: '4px', fontStyle: 'italic' }}>
                      {selectedOrder.observations}
                    </Typography>
                  </Box>
                )}

                {/* Animals details list */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                      Toros Asignados ({selectedOrder.male_caravan_ids.length})
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 150, overflowY: 'auto', bgcolor: 'background.paper' }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selectedOrder.male_caravan_ids.map(id => (
                          <Chip
                            key={id}
                            label={getCaravanIdent(id)}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                          />
                        ))}
                      </Stack>
                    </Paper>
                  </Box>

                  <Box sx={{ flex: 1.5 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                      Vientres Asignados ({selectedOrder.female_caravan_ids.length})
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 150, overflowY: 'auto', bgcolor: 'background.paper' }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selectedOrder.female_caravan_ids.map(id => (
                          <Chip
                            key={id}
                            label={getCaravanIdent(id)}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                          />
                        ))}
                      </Stack>
                    </Paper>
                  </Box>
                </Box>

                <Divider />

                {/* Audit state history */}
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                    Historial de Auditoría de Estados
                  </Typography>
                  <Stack spacing={1.5}>
                    {selectedOrder.history && selectedOrder.history.length > 0 ? (
                      selectedOrder.history.map((log) => (
                        <Box key={log.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px dashed', borderColor: 'divider', fontSize: '0.78rem' }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {log.from_status ? (
                              <Typography variant="caption" color="text.secondary">
                                {getStatusConfig(log.from_status).label}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">Creación</Typography>
                            )}
                            <FuseSvgIcon size={12} className="text-disabled">heroicons-outline:arrow-right</FuseSvgIcon>
                            <Chip
                              label={getStatusConfig(log.to_status).label}
                              size="small"
                              color={getStatusConfig(log.to_status).color}
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }}
                            />
                          </Stack>

                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              por Usuario #{log.action_user_id}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {new Date(log.created_at).toLocaleString('es-ES')}
                            </Typography>
                          </Stack>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Sin historial disponible.
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
                onClick={() => {
                  setPrintOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                sx={{ textTransform: 'none' }}
              >
                Ver Planilla / Imprimir
              </Button>
              <Button onClick={() => setSelectedOrder(null)} variant="outlined" size="small" sx={{ textTransform: 'none' }}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* REJECT DIALOG */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, orderId: null, mode: 'review' })}>
        <DialogTitle sx={{ fontWeight: 700 }}>Rechazar Orden de Servicio</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Por favor, ingrese el motivo del rechazo para informar al solicitante.
          </Typography>
          <TextField
            autoFocus
            required
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Motivo del Rechazo"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialog({ open: false, orderId: null, mode: 'review' })} variant="text" size="small" sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button onClick={handleRejectSubmit} color="error" variant="contained" size="small" disabled={!rejectReason.trim()} sx={{ textTransform: 'none', color: '#fff' }}>
            Rechazar Orden
          </Button>
        </DialogActions>
      </Dialog>

      {/* COMPLETE DIALOG */}
      <Dialog open={completeDialog.open} onClose={() => setCompleteDialog({ open: false, orderId: null })}>
        <DialogTitle sx={{ fontWeight: 700 }}>Completar y Cerrar Servicio</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingrese las observaciones finales o notas de cierre de la temporada de monta/servicio.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Notas Finales de Cierre"
            placeholder="Resultados generales, condiciones climáticas o del potrero..."
            value={completeNotes}
            onChange={(e) => setCompleteNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompleteDialog({ open: false, orderId: null })} variant="text" size="small" sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button onClick={handleCompleteSubmit} color="success" variant="contained" size="small" sx={{ textTransform: 'none', color: '#fff' }}>
            Completar Servicio
          </Button>
        </DialogActions>
      </Dialog>

      <ServiceOrderPrintSheetDialog
        open={printOrder !== null}
        onClose={() => {
          setPrintOrder(null);
          setAutoShareWhatsApp(false);
        }}
        order={printOrder}
        caravans={caravans}
        autoShare={autoShareWhatsApp}
      />
    </ViewLayout>
  );
}

export default ServiceOrdersView;
