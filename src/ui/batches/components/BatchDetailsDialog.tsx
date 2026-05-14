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
                    <Box className='p-2 border mt-4 mb-4'>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>heroicons-outline:presentation-chart-line</FuseSvgIcon>
                            Curva de Crecimiento
                        </Typography>

                        {isLoading ? (
                            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CircularProgress size={32} />
                            </Box>
                        ) : (
                            <BatchWeightChart data={history} />
                        )}
                    </Box>

                    {/* Weight Log Table */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>heroicons-outline:list-bullet</FuseSvgIcon>
                            Registro de Pesajes
                        </Typography>

                        <Box sx={{ border: '1px solid #c6c6c6', borderRadius: '4px', overflow: 'hidden' }}>
                            {/* Columns Header */}
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1.5fr 1fr 1fr 0.8fr',
                                    bgcolor: '#f3f3f3',
                                    borderBottom: '2px solid #c6c6c6'
                                }}
                            >
                                {['FECHA', 'ETAPA / ACTIVIDAD', 'TIPO', 'PESO KG', 'DIF. (+/-)'].map((col) => (
                                    <Box
                                        key={col}
                                        sx={{
                                            p: 1,
                                            borderRight: '1px solid #c6c6c6',
                                            '&:last-child': { borderRight: 0 },
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#444', fontSize: '0.65rem', letterSpacing: 0.5 }}>
                                            {col}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Rows */}
                            {history.length > 0 ? (
                                history.map((record, index) => {
                                    // Calculate difference with previous record
                                    const prevRecord = index < history.length - 1 ? history[index + 1] : null;
                                    const diff = prevRecord ? record.weight - prevRecord.weight : null;

                                    return (
                                        <Box
                                            key={record.id}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1.5fr 1fr 1fr 0.8fr',
                                                borderBottom: '1px solid #e0e0e0',
                                                '&:last-child': { borderBottom: 0 },
                                                bgcolor: diff === null ? '#e8f5e9' : 'transparent',
                                                '&:hover': { bgcolor: diff === null ? '#dcedc8' : '#f8f9fa' }
                                            }}
                                        >
                                            <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.75rem', color: diff === null ? '#2e7d32' : '#555' }}>
                                                    {record.weighing_date}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.7rem', color: '#333' }}>
                                                    {record.activity_name || '-'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', display: 'flex', justifyContent: 'center' }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontWeight: 900,
                                                        fontSize: '0.6rem',
                                                        px: 1,
                                                        py: 0.2,
                                                        borderRadius: '2px',
                                                        bgcolor: record.type === 'TRANSFER' ? '#e3f2fd' : '#f5f5f5',
                                                        color: record.type === 'TRANSFER' ? '#0d47a1' : '#616161',
                                                        border: '1px solid',
                                                        borderColor: record.type === 'TRANSFER' ? '#bbdefb' : '#e0e0e0'
                                                    }}
                                                >
                                                    {record.type}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                p: 1,
                                                borderRight: '1px solid #e0e0e0',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                bgcolor: 'transparent'
                                            }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 900,
                                                        fontSize: '0.8rem',
                                                        color: diff === null ? '#2e7d32' : 'primary.main'
                                                    }}
                                                >
                                                    {record.weight}
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                p: 1,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                {diff !== null ? (
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <FuseSvgIcon size={12} sx={{ color: diff >= 0 ? '#4caf50' : '#f44336' }}>
                                                            {diff >= 0 ? 'heroicons-outline:arrow-trending-up' : 'heroicons-outline:arrow-trending-down'}
                                                        </FuseSvgIcon>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                fontWeight: 800,
                                                                fontSize: '0.7rem',
                                                                color: diff >= 0 ? '#2e7d32' : '#d32f2f'
                                                            }}
                                                        >
                                                            {diff > 0 ? `+${diff}` : diff}
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 900, letterSpacing: 0.5 }}>BASE</Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                        No hay registros de peso disponibles.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
