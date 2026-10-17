import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Stack,
    IconButton,
    CircularProgress
} from '@mui/material';
import { useMemo, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BatchWeightChart } from './BatchWeightChart';
import { useBatchWeightHistory } from '@/features/batches/hooks/useBatchWeightHistory';
import BatchWeightLogTable from './details/BatchWeightLogTable';
import BatchDetailsToolbar from './details/BatchDetailsToolbar';
import BatchQuickEntryDialog from './details/BatchQuickEntryDialog';
import BatchQuickTransferDialog from './details/BatchQuickTransferDialog';
import BatchGraphTesterPanel from './details/BatchGraphTesterPanel';
import BatchServiceHistory from './details/BatchServiceHistory';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatchServiceOrders } from '@/features/gestation/hooks/useServiceOrders';
import ServiceOrderDetailDrawer from '@/ui/gestation/components/service-order-drawer/ServiceOrderDetailDrawer';

interface BatchDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    batch: any;
    onStartService?: (batch: any) => void;
}

/**
 * BatchDetailsDialog
 * Orchestrates batch growth curves, weight history logs, quick ingress/egress
 * actions, and the interactive graph tester panel.
 */
export function BatchDetailsDialog({ open, onClose, batch, onStartService }: BatchDetailsDialogProps) {
    const { activeCompanyId } = useCompany();
    const { data: history = [], isLoading } = useBatchWeightHistory(batch?.id);
    const { data: allCaravans = [] } = useCaravans(open ? activeCompanyId : null, 'own');

    const [quickEntryOpen, setQuickEntryOpen] = useState(false);
    const [quickTransferOpen, setQuickTransferOpen] = useState(false);
    const [testerOpen, setTesterOpen] = useState(false);

    // A service is an order over this batch: its history and the running one live on the batch.
    const isCria = (batch?.activity_code ?? '').toUpperCase() === 'CRIA';
    const { data: serviceOrders = [], isLoading: isLoadingServices } = useBatchServiceOrders(open && isCria ? batch?.id : null);
    const [openServiceOrderId, setOpenServiceOrderId] = useState<number | null>(null);
    const openServiceOrder = useMemo(
        () => serviceOrders.find((o) => o.id === openServiceOrderId) ?? null,
        [serviceOrders, openServiceOrderId]
    );

    const batchCaravans = useMemo(
        () => (batch?.id ? allCaravans.filter((c: any) => c.batch_id === batch.id) : []),
        [allCaravans, batch?.id]
    );

    if (!batch) return null;

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '12px' }
                }}
            >
                <DialogTitle
                    sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'background.paper',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '8px', color: 'white', display: 'flex' }}>
                            <FuseSvgIcon size={24}>heroicons-outline:chart-bar</FuseSvgIcon>
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                Detalles del Lote: {batch.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Historial de Pesos, Dinámica de Composición y Curvas
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        {/* Action toolbar with metrics & modal triggers */}
                        <BatchDetailsToolbar
                            batch={batch}
                            onOpenEntry={() => setQuickEntryOpen(true)}
                            onOpenTransfer={() => setQuickTransferOpen(true)}
                            testerOpen={testerOpen}
                            onToggleTester={() => setTesterOpen((prev) => !prev)}
                            onStartService={onStartService ? () => onStartService(batch) : undefined}
                            onOpenActiveService={
                                batch.active_service_order ? () => setOpenServiceOrderId(batch.active_service_order.id) : undefined
                            }
                        />

                        {/* Interactive Graph Tester & Simulator */}
                        <BatchGraphTesterPanel
                            open={testerOpen}
                            onClose={() => setTesterOpen(false)}
                            batch={batch}
                            batchCaravans={batchCaravans}
                        />

                        {/* Growth curve & mass conservation section */}
                        <Box
                            sx={{
                                p: 2.5,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: '8px',
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>heroicons-outline:presentation-chart-line</FuseSvgIcon>
                                Curva de Crecimiento & Conservación de Masa
                            </Typography>

                            {isLoading ? (
                                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={32} />
                                </Box>
                            ) : (
                                <BatchWeightChart data={history} />
                            )}
                        </Box>

                        {/* Weight & Movement Log Table */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>heroicons-outline:list-bullet</FuseSvgIcon>
                                Registro de Pesajes y Movimientos
                            </Typography>

                            <BatchWeightLogTable history={history} />
                        </Box>

                        {isCria && (
                            <BatchServiceHistory
                                orders={serviceOrders}
                                isLoading={isLoadingServices}
                                onOpenOrder={(order) => setOpenServiceOrderId(order.id)}
                            />
                        )}
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Quick entry dialog with custom date picker */}
            <BatchQuickEntryDialog
                open={quickEntryOpen}
                onClose={() => setQuickEntryOpen(false)}
                batch={batch}
            />

            <ServiceOrderDetailDrawer
                open={openServiceOrder !== null}
                onClose={() => setOpenServiceOrderId(null)}
                order={openServiceOrder}
                caravans={allCaravans}
            />

            {/* Quick transfer / egress dialog with custom movement date */}
            <BatchQuickTransferDialog
                open={quickTransferOpen}
                onClose={() => setQuickTransferOpen(false)}
                batch={batch}
            />
        </>
    );
}
export default BatchDetailsDialog;
