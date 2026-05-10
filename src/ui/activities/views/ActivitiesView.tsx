import {
    Box,
    Typography,
    Stack,
    Button,
    IconButton,
    alpha,
    useTheme,
    Container,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider
} from "@mui/material";
import { useState } from "react";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { motion } from "framer-motion";
import ViewHeader from "@/components/ViewHeader";
import { useNavigate } from "react-router";

import { useCompany } from "@/contexts/CompanyContext";
import { useActivities } from "@/features/activities/hooks/useActivities";
import { useChangeBatchActivity } from "@/features/batches/hooks/useChangeBatchActivity";

const STAGE_UI_CONFIG = {
    'CRIA': { icon: 'heroicons-outline:home', color: '#4CAF50' },
    'RECRIA': { icon: 'heroicons-outline:trending-up', color: '#2196F3' },
    'INVERNADA': { icon: 'heroicons-outline:sun', color: '#FF9800' },
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function ActivitiesView() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { activeCompanyId } = useCompany();
    const { data: activities, isLoading } = useActivities(activeCompanyId);
    const { mutate: changeActivity } = useChangeBatchActivity();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [targetStage, setTargetStage] = useState<any>(null);
    const [weight, setWeight] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, batch: any, stage: any) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedBatch({ ...batch, currentStage: stage });
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleOpenMovementSheet = (stage: any) => {
        navigate(`/activities/sheet/${stage.id}`);
    };

    const handleChangeActivity = (stage: any) => {
        setTargetStage(stage);
        setIsDialogOpen(true);
        setWeight(selectedBatch?.weight?.replace(' avg', '') || '');
        handleCloseMenu();
    };

    const handleConfirmMove = () => {
        if (selectedBatch && targetStage) {
            changeActivity({
                id: selectedBatch.id,
                activityId: targetStage.id,
                weight: weight ? parseFloat(weight) : undefined
            });
            setIsDialogOpen(false);
            setSelectedBatch(null);
            setTargetStage(null);
            setWeight('');
        }
    };

    // Filter only enabled activities and sort by ID or predefined order
    const stages = activities?.filter(a => a.isEnabled).map(a => ({
        ...a,
        icon: STAGE_UI_CONFIG[a.code]?.icon || 'heroicons-outline:collection',
        color: STAGE_UI_CONFIG[a.code]?.color || '#999',
        tag: a.isFinal ? 'Etapa Final' : null
    })) || [];

    if (isLoading) {
        return <Typography sx={{ p: 4 }}>Cargando actividades...</Typography>;
    }

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
                title="Planilla de Producción"
                subtitle="Control de existencias y movimientos por etapa."
                icon="heroicons-outline:table-cells"
                actions={
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FuseSvgIcon size={18}>heroicons-outline:check-circle</FuseSvgIcon>}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '4px',
                                bgcolor: 'white',
                                borderColor: '#c6c6c6',
                                color: 'text.primary',
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                        >
                            Activar Actividades
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrows-right-left</FuseSvgIcon>}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '4px',
                                boxShadow: 'none',
                                '&:hover': { boxShadow: 'none' }
                            }}
                        >
                            Definir Flujo
                        </Button>
                    </Stack>
                }
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { lg: 'repeat(3, 1fr)', md: 'repeat(2, 1fr)', xs: '1fr' },
                    gap: 3,
                    mt: 3,
                    flexGrow: 1
                }}
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {stages.map((stage) => (
                    <Box
                        key={stage.id}
                        component={motion.div}
                        variants={itemVariants}
                        sx={{
                            bgcolor: 'white',
                            borderRadius: '4px',
                            border: '1px solid #c6c6c6',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            minHeight: 500,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                    >
                        {/* Header de la Hoja */}
                        <Box sx={{ p: 1.5, bgcolor: '#f3f3f3', borderBottom: '2px solid #c6c6c6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '4px',
                                        bgcolor: stage.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                    }}
                                >
                                    <FuseSvgIcon size={16}>{stage.icon}</FuseSvgIcon>
                                </Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {stage.name}
                                </Typography>
                                {stage.tag && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            bgcolor: stage.color,
                                            color: 'white',
                                            px: 1,
                                            py: 0.1,
                                            borderRadius: '2px',
                                            fontSize: '0.6rem',
                                            fontWeight: 900
                                        }}
                                    >
                                        {stage.tag.toUpperCase()}
                                    </Typography>
                                )}
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenMovementSheet(stage)}
                                    startIcon={<FuseSvgIcon size={14}>heroicons-outline:document-text</FuseSvgIcon>}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        borderRadius: '2px',
                                        py: 0.2,
                                        borderColor: '#c6c6c6',
                                        color: '#555',
                                        bgcolor: 'white',
                                        '&:hover': { bgcolor: '#f8f9fa', borderColor: stage.color }
                                    }}
                                >
                                    Planilla
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<FuseSvgIcon size={14}>heroicons-outline:plus</FuseSvgIcon>}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        borderRadius: '2px',
                                        py: 0.2,
                                        borderColor: '#c6c6c6',
                                        color: '#555',
                                        bgcolor: 'white',
                                        '&:hover': { bgcolor: '#f8f9fa', borderColor: stage.color }
                                    }}
                                >
                                    Cargar
                                </Button>
                            </Stack>
                        </Box>

                        {/* Content */}
                        <Box sx={{ flexGrow: 1, overflowX: 'auto' }}>
                            <Box sx={{ minWidth: 350 }}>
                                {/* Columns Header */}
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '1.5fr 1fr 0.8fr 0.4fr',
                                        bgcolor: '#f8f9fa',
                                        borderBottom: '1px solid #c6c6c6'
                                    }}
                                >
                                    {['LOTE / GRANJA', 'CABEZAS', 'PESO PROMEDIO', 'MOVER'].map((col) => (
                                        <Box
                                            key={col}
                                            sx={{
                                                p: 1,
                                                borderRight: '1px solid #e0e0e0',
                                                '&:last-child': { borderRight: 0 },
                                                display: 'flex',
                                                justifyContent: col === 'LOTE / GRANJA' ? 'flex-start' : 'center',
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#777', fontSize: '0.65rem' }}>
                                                {col}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Rows */}
                                {(stage.batches || []).map((batch) => (
                                    <Box
                                        key={batch.id}
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '1.5fr 1fr 0.8fr 0.4fr',
                                            borderBottom: '1px solid #e0e0e0',
                                            cursor: 'pointer',
                                            transition: 'background 0.1s',
                                            '&:hover': {
                                                bgcolor: alpha(stage.color, 0.05),
                                            }
                                        }}
                                    >
                                        <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#333', lineHeight: 1.2 }}>
                                                {batch.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#888' }}>
                                                {batch.farmName}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.85rem', color: stage.color }}>
                                                {batch.count}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem', color: '#555', bgcolor: '#f1f1f1', px: 0.8, py: 0.2, borderRadius: '2px' }}>
                                                {batch.weight?.replace(' avg', '') || '-'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleOpenMenu(e, batch, stage)}
                                                sx={{
                                                    p: 0.5,
                                                    color: '#bbb',
                                                    '&:hover': { color: stage.color, bgcolor: alpha(stage.color, 0.1) }
                                                }}
                                            >
                                                <FuseSvgIcon size={16}>heroicons-outline:arrows-right-left</FuseSvgIcon>
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}

                                {/* Empty Rows */}
                                {Array.from({ length: Math.max(0, 8 - (stage.batches || []).length) }).map((_, i) => (
                                    <Box
                                        key={`empty-${i}`}
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '1.5fr 1fr 0.8fr 0.4fr',
                                            borderBottom: '1px solid #f0f0f0',
                                            height: 40
                                        }}
                                    >
                                        <Box sx={{ borderRight: '1px solid #f0f0f0' }} />
                                        <Box sx={{ borderRight: '1px solid #f0f0f0' }} />
                                        <Box sx={{ borderRight: '1px solid #f0f0f0' }} />
                                        <Box />
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Footer */}
                        <Box
                            sx={{
                                p: 1,
                                bgcolor: '#f8f9fa',
                                borderTop: '1px solid #c6c6c6',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#555', fontSize: '0.65rem' }}>
                                TOTAL {stage.name.toUpperCase()}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: stage.color, fontSize: '0.75rem' }}>
                                {(stage.batches || []).reduce((acc, curr) => acc + curr.count, 0)} Cabezas
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                    sx: {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                        minWidth: 200,
                        borderRadius: '8px'
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#999', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        MOVER A ETAPA:
                    </Typography>
                </Box>
                {stages.map((stage) => (
                    <MenuItem
                        key={stage.id}
                        onClick={() => handleChangeActivity(stage)}
                        disabled={selectedBatch?.activityId === stage.id}
                        sx={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            py: 1.2,
                            px: 2,
                            gap: 1.5,
                            '&:hover': { bgcolor: alpha(stage.color, 0.05) }
                        }}
                    >
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: stage.color }} />
                        {stage.name}
                    </MenuItem>
                ))}
            </Menu>

            {/* Confirm Movement Dialog - Bulk Entry Style */}
            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '8px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                    }
                }}
            >
                <DialogTitle sx={{ p: 3, pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#333' }}>
                        Registrar Movimiento de Actividad
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        {/* Thinner Origin & Destination Display */}
                        <Box
                            sx={{
                                py: 1.5,
                                px: 1,
                                borderBottom: '1px solid #f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 3,
                                bgcolor: '#fcfcfc',
                                borderRadius: '8px'
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    borderRadius: '50%', 
                                    bgcolor: alpha(selectedBatch?.currentStage?.color || '#999', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: selectedBatch?.currentStage?.color || '#999'
                                }}>
                                    <FuseSvgIcon size={16}>{selectedBatch?.currentStage?.icon || 'heroicons-outline:home'}</FuseSvgIcon>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ display: 'block', color: '#999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                        Origen
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: selectedBatch?.currentStage?.color || '#333', fontSize: '0.85rem' }}>
                                        {selectedBatch?.currentStage?.name}
                                    </Typography>
                                </Box>
                            </Stack>

                            <FuseSvgIcon size={20} sx={{ color: '#ddd' }}>heroicons-outline:arrow-long-right</FuseSvgIcon>

                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    borderRadius: '50%', 
                                    bgcolor: alpha(targetStage?.color || '#0a6ed1', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: targetStage?.color || '#0a6ed1'
                                }}>
                                    <FuseSvgIcon size={16}>{targetStage?.icon || 'heroicons-outline:arrow-path'}</FuseSvgIcon>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ display: 'block', color: '#999', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                        Destino
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: targetStage?.color || '#0a6ed1', fontSize: '0.85rem' }}>
                                        {targetStage?.name}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        <Box>
                            <TextField
                                fullWidth
                                label="Peso del Lote / Promedio"
                                variant="filled"
                                placeholder="0.00"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                autoFocus
                                InputProps={{
                                    sx: { 
                                        fontWeight: 800,
                                        fontSize: '1.1rem',
                                        bgcolor: '#f5f7f9',
                                        '&:hover': { bgcolor: '#f0f2f5' },
                                        '&.Mui-focused': { bgcolor: '#f0f2f5' }
                                    },
                                    endAdornment: <Typography variant="caption" sx={{ fontWeight: 900, color: '#999', mt: 2 }}>KG</Typography>
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': { fontWeight: 700, color: '#999' },
                                    '& .MuiFilledInput-underline:before': { borderBottomColor: '#e0e0e0' }
                                }}
                            />
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#aaa', fontStyle: 'italic' }}>
                                * Este peso se registrará como el peso de salida oficial.
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
                    <Button
                        onClick={() => setIsDialogOpen(false)}
                        sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmMove}
                        variant="contained"
                        disableElevation
                        sx={{
                            fontWeight: 800,
                            textTransform: 'none',
                            px: 4,
                            borderRadius: '4px',
                            bgcolor: '#0a6ed1'
                        }}
                    >
                        Confirmar Movimiento
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}