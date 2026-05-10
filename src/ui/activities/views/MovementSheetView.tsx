import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Stack, IconButton, Select, MenuItem, FormControl, InputLabel, useTheme, Container, Card, CardContent, Divider } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { useParams, useNavigate } from "react-router";
import { useActivities } from "@/features/activities/hooks/useActivities";
import { useCompany } from "@/contexts/CompanyContext";
import ViewHeader from "@/components/ViewHeader";

export default function MovementSheetView() {
    const { stageId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const { activeCompanyId } = useCompany();
    const { data: activities, isLoading } = useActivities(activeCompanyId);
    
    const printRef = useRef<HTMLDivElement>(null);
    const [targetStageId, setTargetStageId] = useState<number | ''>('');
    const [rowCount, setRowCount] = useState(20);

    const stage = activities?.find(a => a.id === Number(stageId));
    const allStages = activities?.filter(a => a.isEnabled) || [];
    const targetStage = allStages.find(s => s.id === targetStageId);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Planilla_Movimiento_${stage?.name || 'Etapa'}`,
    });

    if (isLoading) return <Typography sx={{ p: 4 }}>Cargando datos...</Typography>;
    if (!stage) return <Typography sx={{ p: 4 }}>Etapa no encontrada.</Typography>;

    return (
        <Container
            maxWidth="xl"
            sx={{
                bgcolor: '#f8f9fa',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                pb: 4
            }}
        >
            <ViewHeader
                title="Generador de Planillas de Movimiento"
                subtitle="Configura y genera documentos profesionales para el control de cambios de actividad."
                icon="heroicons-outline:document-text"
                actions={
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/activities')}
                        startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>}
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 700, 
                            borderRadius: '8px',
                            bgcolor: 'white',
                            borderColor: '#d8dde6',
                            color: '#32363a',
                            '&:hover': { bgcolor: '#f2f5f9', borderColor: '#0a6ed1' }
                        }}
                    >
                        Volver a Actividades
                    </Button>
                }
            />

            <Box sx={{ 
                width: '100%', 
                mt: 2, 
                bgcolor: '#f2f5f9', 
                p: { xs: 2, md: 3 }, 
                borderRadius: '12px', 
                border: '1px solid #d8dde6',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
                alignItems: 'flex-start'
            }}>
                {/* Aside - Configuración (No se imprime) */}
                <Box 
                    component="aside"
                    className="no-print"
                    sx={{ 
                        width: { xs: '100%', md: 320, lg: 360 }, 
                        flexShrink: 0,
                        position: { md: 'sticky' },
                        top: { md: 24 },
                        '@media print': { display: 'none' }
                    }}
                >
                    <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid #d8dde6', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', bgcolor: '#ffffff' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#32363a', fontSize: '1.1rem', mb: 1 }}>
                                Configuración
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6a6d70', mb: 3, fontWeight: 500 }}>
                                Define el origen y destino para personalizar la planilla impresa.
                            </Typography>

                            <Divider sx={{ mb: 3, borderColor: '#d8dde6' }} />
                            
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', mb: 1, display: 'block', textTransform: 'uppercase' }}>
                                        ETAPA ORIGEN (ACTUAL)
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, color: '#32363a', fontSize: '1rem', pl: 1, borderLeft: `4px solid ${stage.color || '#999'}` }}>
                                        {stage.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', pl: 1.5 }}>{stage.code}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', mb: 1, display: 'block', textTransform: 'uppercase' }}>
                                        ETAPA DESTINO (MOVIMIENTO)
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={targetStageId}
                                            onChange={(e) => setTargetStageId(e.target.value as number)}
                                            displayEmpty
                                            sx={{ 
                                                fontWeight: 700, 
                                                bgcolor: 'white', 
                                                borderRadius: '6px',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d8dde6' }
                                            }}
                                        >
                                            <MenuItem value="" disabled>Seleccione Destino...</MenuItem>
                                            {allStages.filter(s => s.id !== stage.id).map((s) => (
                                                <MenuItem key={s.id} value={s.id} sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{s.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box>
                                    <FormControl fullWidth size="small">
                                        <InputLabel sx={{ fontSize: '0.85rem' }}>Filas Extra</InputLabel>
                                        <Select
                                            value={rowCount}
                                            label="Filas Extra"
                                            onChange={(e) => setRowCount(e.target.value as number)}
                                            sx={{ 
                                                height: 40, 
                                                bgcolor: '#f7f7f7',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d8dde6' }
                                            }}
                                        >
                                            {[5, 10, 15, 20, 30].map(val => (
                                                <MenuItem key={val} value={val} sx={{ fontWeight: 500 }}>{val} Filas</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 3, borderColor: '#d8dde6' }} />

                            <Button 
                                onClick={() => handlePrint()} 
                                variant="contained" 
                                fullWidth
                                disabled={!targetStageId}
                                startIcon={<FuseSvgIcon size={20}>heroicons-outline:printer</FuseSvgIcon>}
                                sx={{ 
                                    py: 1.5, 
                                    fontWeight: 800, 
                                    borderRadius: '8px', 
                                    boxShadow: 'none',
                                    bgcolor: '#0a6ed1',
                                    '&:hover': { bgcolor: '#0854a1' }
                                }}
                            >
                                Imprimir Planilla
                            </Button>
                        </CardContent>
                    </Card>
                </Box>

                {/* Main Content - Preview Area */}
                <Box sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    bgcolor: '#edf2f6', 
                    borderRadius: '12px', 
                    border: '1px solid #d8dde6', 
                    p: { xs: 2, md: 4 }, 
                    minHeight: '80vh',
                    backgroundImage: 'radial-gradient(#d8dde6 0.5px, transparent 0.5px)',
                    backgroundSize: '20px 20px',
                }}>
                    <Paper 
                        ref={printRef}
                        elevation={0}
                        sx={{ 
                            bgcolor: 'white', 
                            width: '100%',
                            maxWidth: '210mm',
                            minHeight: '297mm',
                            p: { xs: 2, md: 4 },
                            color: 'black',
                            borderRadius: '4px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                            border: '1px solid #d8dde6',
                            '@media print': {
                                margin: 0,
                                boxShadow: 'none',
                                border: 'none',
                                p: '10mm',
                            }
                        }}
                    >
                        {/* Header Hoja de Cálculo - Structured Style like Generator */}
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1.2px', textTransform: 'uppercase' }}>
                                    Planilla de Movimiento
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, mt: -0.5 }}>
                                    Sustentabilidad Ganadera • Procesamiento Inteligente Jhoangel AI
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.7rem' }}>
                                    CONTROL DE ACTIVIDAD OFICIAL
                                </Typography>
                            </Box>
                        </Box>

                        {/* Structured Header Table */}
                        <Box sx={{ 
                            display: 'table', 
                            width: '100%', 
                            borderCollapse: 'collapse', 
                            mb: 4,
                            border: '2px solid #000'
                        }}>
                            <Box sx={{ display: 'table-row' }}>
                                <Box sx={{ display: 'table-cell', border: '1px solid #000', bgcolor: '#f0f0f0', p: 0.5, width: '35%' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.65rem' }}>
                                        EMPRESA / ESTABLECIMIENTO
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'table-cell', border: '1px solid #000', bgcolor: '#f0f0f0', p: 0.5, width: '20%' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.65rem' }}>
                                        ORIGEN
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'table-cell', border: '1px solid #000', bgcolor: '#f0f0f0', p: 0.5, width: '20%' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.65rem' }}>
                                        DESTINO
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'table-cell', border: '1px solid #000', bgcolor: '#f0f0f0', p: 0.5, width: '25%' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.65rem' }}>
                                        FECHA Y HORA
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'table-row', height: 40 }}>
                                <Box sx={{ display: 'table-cell', border: '1px solid #000', px: 1.5, verticalAlign: 'middle' }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#000' }}>
                                        EMPRESA SELECCIONADA
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'table-cell', border: '1px solid #000', px: 1.5, verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000' }}>
                                        {stage.name.toUpperCase()}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'table-cell', border: '1px solid #000', px: 1.5, verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000' }}>
                                        {targetStage?.name.toUpperCase() || '-'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'table-cell', border: '1px solid #000', px: 1.5, verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#000' }}>
                                        {format(new Date(), 'dd/MM/yyyy HH:mm')}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Table Spreadsheet Style */}
                        <TableContainer component={Box}>
                            <Table size="small" sx={{ 
                                '& .MuiTableCell-root': { 
                                    border: '1px solid black',
                                    color: 'black',
                                    fontSize: '0.8rem',
                                    p: 1
                                } 
                            }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                                        <TableCell align="center" sx={{ fontWeight: 900, width: '5%' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 900, width: '35%' }}>LOTE / DETALLE</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 900, width: '15%' }}>CABEZAS</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 900, width: '15%' }}>PESO PROM.</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 900, width: '30%' }}>OBSERVACIONES</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stage.batches.map((batch: any, index: number) => (
                                        <TableRow key={batch.id}>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>{index + 1}</TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 900, fontSize: '0.85rem' }}>{batch.name.toUpperCase()}</Typography>
                                                <Typography sx={{ fontSize: '0.65rem', color: '#666' }}>{batch.farmName}</Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 900, fontSize: '1rem' }}>
                                                {batch.count}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>
                                                {batch.weight?.replace(' avg', '') || '-'}
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    ))}
                                    {Array.from({ length: rowCount }).map((_, i) => (
                                        <TableRow key={`empty-print-${i}`} sx={{ height: 35 }}>
                                            <TableCell align="center" sx={{ color: '#ccc' }}>{stage.batches.length + i + 1}</TableCell>
                                            <TableCell />
                                            <TableCell />
                                            <TableCell />
                                            <TableCell />
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Footer con Firmas */}
                        <Box sx={{ mt: 10, display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ width: '45%', borderTop: '2px solid black', pt: 1, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 900 }}>FIRMA RESPONSABLE CARGA</Typography>
                            </Box>
                            <Box sx={{ width: '45%', borderTop: '2px solid black', pt: 1, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 900 }}>CONTROL ADMINISTRATIVO</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 6, pt: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.6rem' }}>
                                ID Documento: {Math.random().toString(36).substr(2, 9).toUpperCase()} • Sincronizado con Jhoangel AI
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#aaa', fontWeight: 600, fontSize: '0.6rem' }}>
                                REGISTRO DE MOVIMIENTO GANADERO
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
}
