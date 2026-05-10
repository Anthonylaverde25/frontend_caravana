import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    Box, 
    Typography, 
    Stack, 
    IconButton, 
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BatchWeightChart } from './BatchWeightChart';
import { useBatchWeightHistory } from '@/features/batches/hooks/useBatchWeightHistory';

interface BatchDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    batch: any;
}

export function BatchDetailsDialog({ open, onClose, batch }: BatchDetailsDialogProps) {
    const { data: history = [], isLoading } = useBatchWeightHistory(batch?.id);

    if (!batch) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: '12px' }
            }}
        >
            <DialogTitle sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8f9fa' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '8px', color: 'white', display: 'flex' }}>
                        <FuseSvgIcon size={24}>heroicons-outline:chart-bar</FuseSvgIcon>
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                            Detalles del Lote: {batch.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Historial de Pesos y Evolución
                        </Typography>
                    </Box>
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Stack spacing={4}>
                    {/* Weight Evolution Section */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>heroicons-outline:presentation-chart-line</FuseSvgIcon>
                            Curva de Crecimiento
                        </Typography>
                        
                        {isLoading ? (
                            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress size={32} />
                            </Box>
                        ) : (
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', bgcolor: '#fcfcfc' }}>
                                <BatchWeightChart data={history} />
                            </Paper>
                        )}
                    </Box>

                    {/* Weight Log Table */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>heroicons-outline:list-bullet</FuseSvgIcon>
                            Registro de Pesajes
                        </Typography>
                        
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Etapa</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Tipo</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Peso (kg)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {history.length > 0 ? (
                                        history.map((record) => (
                                            <TableRow key={record.id} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>
                                                    {record.weighing_date}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                    {record.activity_name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={record.type} 
                                                        size="small" 
                                                        color={record.type === 'TRANSFER' ? 'primary' : 'default'}
                                                        variant="soft"
                                                        sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                                    {record.weight} kg
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                                                No hay registros de peso disponibles.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
