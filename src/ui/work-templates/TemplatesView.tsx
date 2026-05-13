import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { Button, Paper, Typography, Box, Stack, Chip, IconButton, Tooltip, Divider } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router';
import { useState } from 'react';

/**
 * Mock data for templates
 */
const mockTemplates = [
    {
        id: '1',
        title: 'Control de Pesaje Grupal',
        description: 'Planilla estandarizada para el seguimiento de biomasa por lote. Incluye campos de caravana, peso y dentición.',
        category: 'Ganadería',
        lastModified: '10 Mayo, 2024',
        status: 'active',
        icon: 'heroicons-outline:chart-bar',
        color: '#3b82f6',
    },
    {
        id: '2',
        title: 'Registro de Sanidad',
        description: 'Control de vacunación, tratamientos y protocolos sanitarios. Registro de fármacos y dosis aplicadas.',
        category: 'Sanidad',
        lastModified: '12 Mayo, 2024',
        status: 'active',
        icon: 'heroicons-outline:shield-check',
        color: '#10b981',
    },
    {
        id: '3',
        title: 'Movimiento de Hacienda',
        description: 'Registro de traslados entre establecimientos o potreros. Guías de transporte y documentos legales.',
        category: 'Operaciones',
        lastModified: 'Hoy, 09:45',
        status: 'draft',
        icon: 'heroicons-outline:truck',
        color: '#f59e0b',
    },
    {
        id: '4',
        title: 'Inventario de Insumos',
        description: 'Control de stock de alimentos, suplementos y herramientas. Registro de ingresos y egresos de almacén.',
        category: 'Logística',
        lastModified: '11 Mayo, 2024',
        status: 'active',
        icon: 'heroicons-outline:clipboard-list',
        color: '#8b5cf6',
    },
];

/**
 * Styled Root component for TemplatesView
 */
const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider,
        '& > .container': {
            maxWidth: 'none !important',
            width: '100% !important',
            padding: '0 !important',
            margin: '0 !important',
        },
    },
    '& .FusePageSimple-content': {
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        padding: 0,
        backgroundColor: theme.palette.background.default,
        '& > .container': {
            maxWidth: 'none !important',
            width: '100% !important',
            padding: '24px !important',
            margin: '0 !important',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
        },
    },
}));

/**
 * TemplatesView Component
 * Main view for managing work templates using a List layout with Multi-select Chips.
 */
function TemplatesView() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Dynamically extract categories (excluding 'Todas' for multi-select logic)
    const categories = [...new Set(mockTemplates.map((t) => t.category))];

    // Toggle category selection
    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
        );
    };

    // Clear all filters
    const clearFilters = () => setSelectedCategories([]);

    // Filter templates based on selected categories
    const filteredTemplates =
        selectedCategories.length === 0
            ? mockTemplates
            : mockTemplates.filter((t) => selectedCategories.includes(t.category));

    return (
        <Root
            header={
                <ViewHeader
                    title="Gestión de Plantillas"
                    subtitle="Administración y diseño de formatos de trabajo estandarizados"
                    className="p-3"
                    actions={
                        <Stack
                            direction="row"
                            spacing={1.5}
                        >
                            <Button
                                variant="outlined"
                                color="primary"
                                component={Link}
                                to="/work-templates/import"
                                startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-up-tray</FuseSvgIcon>}
                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                            >
                                Importar
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                component={Link}
                                to="/work-templates/create"
                                startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 3 }}
                            >
                                Nueva Plantilla
                            </Button>
                        </Stack>
                    }
                />
            }
            content={
                <Box className="w-full h-full p-24">
                    {/* Multi-select Chips Filter System */}
                    <Box className="mb-3">
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Typography
                                variant="subtitle2"
                                className="font-bold text-slate-500  uppercase tracking-wider text-11"
                            >
                                Filtrar por área:
                            </Typography>

                            <Chip
                                label="Todas"
                                onClick={clearFilters}
                                variant={selectedCategories.length === 0 ? 'filled' : 'outlined'}
                                color={selectedCategories.length === 0 ? 'primary' : 'default'}
                                sx={{
                                    fontWeight: 700,
                                    px: 1,
                                    borderRadius: '8px',
                                    height: 32,
                                }}
                            />

                            {categories.map((category) => {
                                const isSelected = selectedCategories.includes(category);
                                return (
                                    <Chip
                                        key={category}
                                        label={category}
                                        onClick={() => toggleCategory(category)}
                                        variant={isSelected ? 'filled' : 'outlined'}
                                        color={isSelected ? 'primary' : 'default'}
                                        onDelete={isSelected ? () => toggleCategory(category) : undefined}
                                        deleteIcon={
                                            <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                                        }
                                        sx={{
                                            fontWeight: 600,
                                            px: 0.5,
                                            borderRadius: '8px',
                                            height: 32,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: isSelected ? 'primary.dark' : 'grey.100',
                                            },
                                        }}
                                    />
                                );
                            })}

                            {selectedCategories.length > 0 && (
                                <Button
                                    size="small"
                                    onClick={clearFilters}
                                    sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                                >
                                    Limpiar filtros
                                </Button>
                            )}
                        </Stack>
                    </Box>

                    {/* Templates List */}
                    <Stack spacing={2}>
                        {filteredTemplates.length > 0 ? (
                            filteredTemplates.map((template) => (
                                <Paper
                                    key={template.id}
                                    className="group transition-all duration-200 ease-in-out hover:shadow-md cursor-pointer"
                                    elevation={0}
                                    sx={{
                                        borderRadius: '12px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        p: 2,
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            bgcolor: 'grey.50',
                                        },
                                    }}
                                >
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                                        spacing={3}
                                    >
                                        {/* Visual Icon */}
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: `${template.color}15`,
                                                color: template.color,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <FuseSvgIcon size={32}>{template.icon}</FuseSvgIcon>
                                        </Box>

                                        {/* Info Section */}
                                        <Box sx={{ flex: 1 }}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                spacing={1.5}
                                            >
                                                <Typography className="text-16 font-bold tracking-tight text-slate-800">
                                                    {template.title}
                                                </Typography>
                                                <Chip
                                                    label={template.category}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                                                />
                                            </Stack>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                className="mt-4 leading-relaxed line-clamp-1"
                                                sx={{ maxWidth: '800px' }}
                                            >
                                                {template.description}
                                            </Typography>
                                        </Box>

                                        {/* Meta Section */}
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={4}
                                            sx={{ px: { sm: 2 } }}
                                        >
                                            <Box className="text-right hidden md:block">
                                                <Typography
                                                    variant="caption"
                                                    color="text.disabled"
                                                    className="block font-medium uppercase"
                                                >
                                                    Última Modif.
                                                </Typography>
                                                <Typography className="text-13 font-semibold text-slate-600">
                                                    {template.lastModified}
                                                </Typography>
                                            </Box>

                                            <Chip
                                                label={template.status === 'active' ? 'ACTIVO' : 'BORRADOR'}
                                                sx={{
                                                    height: 24,
                                                    fontSize: 10,
                                                    fontWeight: 800,
                                                    bgcolor: template.status === 'active' ? '#ecfdf5' : '#fef3c7',
                                                    color: template.status === 'active' ? '#065f46' : '#92400e',
                                                    border: '1px solid',
                                                    borderColor: template.status === 'active' ? '#10b98130' : '#f59e0b30',
                                                    minWidth: 85,
                                                }}
                                            />
                                        </Stack>

                                        <Divider
                                            orientation="vertical"
                                            flexItem
                                            sx={{ display: { xs: 'none', sm: 'block' } }}
                                        />

                                        {/* Actions Section */}
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                        >
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    className="text-slate-400 hover:text-primary"
                                                >
                                                    <FuseSvgIcon size={20}>heroicons-outline:pencil</FuseSvgIcon>
                                                </IconButton>
                                            </Tooltip>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                sx={{
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    borderRadius: '8px',
                                                    px: 3,
                                                    bgcolor: 'primary.main',
                                                    boxShadow: 'none',
                                                    '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
                                                }}
                                            >
                                                Usar
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))
                        ) : (
                            <Paper className="p-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-16">
                                <Typography color="text.secondary">No hay plantillas que coincidan con los filtros seleccionados.</Typography>
                                <Button onClick={clearFilters} className="mt-8 font-bold">Ver todas las plantillas</Button>
                            </Paper>
                        )}

                        {/* Add New Placeholder Row */}
                        <Box
                            component={Link}
                            to="/work-templates/create"
                            className="flex items-center justify-center p-16 border-2 border-dashed border-slate-200 rounded-12 hover:bg-slate-50 hover:border-primary/40 transition-colors group"
                            sx={{ mt: 2, cursor: 'pointer', textDecoration: 'none' }}
                        >
                            <FuseSvgIcon
                                size={20}
                                className="text-slate-400 group-hover:text-primary mr-8"
                            >
                                heroicons-outline:plus
                            </FuseSvgIcon>
                            <Typography className="font-bold text-slate-500 group-hover:text-primary text-14">
                                Crear Nueva Plantilla
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            }
        />
    );
}

export default TemplatesView;
