import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Paper, 
  Avatar, 
  IconButton, 
  Chip, 
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState, useEffect, useMemo } from 'react';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';
import { Farm } from '@/core/suppliers/domain/entities/Farm';
import DataTable from '@/components/data-table/DataTable';
import { type MRT_ColumnDef } from 'material-react-table';

/**
 * SuppliersExampleView Component
 * Implements a Master-Detail layout strictly following SAP Fiori Horizon guidelines.
 * Now integrated with real data from useSuppliers hook.
 */
function SuppliersExampleView() {
  const { data: suppliers = [], isLoading, isError } = useSuppliers();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // View mode for farms (Cards or Table)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextView: 'cards' | 'table',
  ) => {
    if (nextView !== null) {
      setViewMode(nextView);
    }
  };

  // Overflow menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  // Columns definition for Farm Table
  const farmColumns = useMemo<MRT_ColumnDef<Farm>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Establecimiento',
        Cell: ({ cell }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: '4px', width: 32, height: 32 }}>
               <FuseSvgIcon size={18}>heroicons-outline:home-modern</FuseSvgIcon>
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{cell.getValue<string>()}</Typography>
          </Box>
        )
      },
      {
        accessorKey: 'renspa',
        header: 'RENSPA',
        Cell: ({ cell }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{cell.getValue<string>() || 'N/A'}</Typography>
      },
      {
        accessorKey: 'location',
        header: 'Ubicación',
        Cell: ({ cell }) => <Typography variant="body2" color="text.secondary">{cell.getValue<string>() || '-'}</Typography>
      },
      {
        accessorKey: 'caravans_count',
        header: 'Caravanas',
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main' }}>
            {cell.getValue<number>() || 0}
          </Typography>
        )
      },
      {
        accessorKey: 'is_active',
        header: 'Estado',
        Cell: ({ cell }) => (
          <Chip 
            label={cell.getValue<boolean>() ? 'Activo' : 'Inactivo'} 
            size="small"
            sx={{ 
              height: 20, 
              fontSize: '0.75rem', 
              fontWeight: 700,
              bgcolor: (theme) => alpha(cell.getValue<boolean>() ? theme.palette.success.main : theme.palette.error.main, 0.1),
              color: (theme) => cell.getValue<boolean>() ? theme.palette.success.main : theme.palette.error.main
            }}
          />
        )
      }
    ],
    []
  );

  // Auto-select first supplier when data loads
  useEffect(() => {
    if (suppliers.length > 0 && selectedId === null) {
      setSelectedId(suppliers[0].id);
    }
  }, [suppliers, selectedId]);

  // Find selected supplier object
  const selectedSupplier = useMemo(() => 
    suppliers.find(s => s.id === selectedId),
    [suppliers, selectedId]
  );

  if (isLoading && suppliers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f6f7' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f6f7' }}>
        <Typography color="error">Error loading suppliers. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      width: '100%', 
      minHeight: '100vh', 
      bgcolor: (theme) => theme.palette.mode === 'light' ? '#f2f2f2' : 'background.default', 
      color: 'text.primary' 
    }}>
      
      {/* --- MASTER LIST (Sidebar) --- */}
      <Box 
        sx={{ 
          width: 350, 
          minWidth: 350,
          borderRight: 1, 
          borderColor: 'divider', 
          bgcolor: 'background.paper', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10
        }}
      >
        {/* Header Directorio */}
        <Box sx={{ p: 3, pt: 6, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 750 }}>
              Proveedores
            </Typography>
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: (theme) => alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.1), 
                color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main',
                '&:hover': { 
                  bgcolor: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 
                  color: '#ffffff' 
                }
              }}
            >
              <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
            </IconButton>
          </Stack>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
              borderRadius: '8px',
              px: 1.5,
              py: 1,
              border: 1,
              borderColor: 'divider',
              transition: 'border-color 0.2s',
              '&:focus-within': { borderColor: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main' }
            }}
          >
            <FuseSvgIcon size={18} sx={{ color: 'text.secondary' }}>heroicons-outline:magnifying-glass</FuseSvgIcon>
            <Box
              component="input"
              placeholder="Search by name, cuit or city..."
              sx={{
                border: 'none',
                bgcolor: 'transparent',
                outline: 'none',
                width: '100%',
                ml: 1.5,
                fontSize: '0.875rem',
                color: 'text.primary',
                '&::placeholder': { color: 'text.disabled' }
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mx: 2, opacity: 0.5 }} />
        
        <List sx={{ flexGrow: 1, px: 0, py: 1, overflowY: 'auto' }}>
          {suppliers.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No hay proveedores registrados.</Typography>
            </Box>
          ) : (
            suppliers.map((supplier) => (
              <ListItem key={supplier.id} disablePadding>
                <ListItemButton 
                  selected={supplier.id === selectedId}
                  onClick={() => setSelectedId(supplier.id)}
                  sx={{
                    py: 2,
                    px: 3,
                    borderLeft: '4px solid transparent',
                    transition: 'all 0.1s',
                    '&.Mui-selected': {
                      bgcolor: (theme) => alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.08),
                      borderLeft: (theme) => `4px solid ${theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main}`,
                      '&:hover': { bgcolor: (theme) => alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.12) },
                      '& .status-dot': { borderColor: (theme) => alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.5) }
                    },
                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04) }
                  }}
                >
                  <Box sx={{ position: 'relative', mr: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 42, 
                        height: 42, 
                        fontSize: '0.875rem', 
                        fontWeight: 800,
                        bgcolor: supplier.id === selectedId 
                          ? (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main' 
                          : 'action.selected',
                        color: supplier.id === selectedId ? '#ffffff' : 'text.secondary'
                      }}
                    >
                      {supplier.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </Avatar>
                    {supplier.is_active && (
                      <Box 
                        className="status-dot"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 12,
                          height: 12,
                          bgcolor: 'success.main',
                          borderRadius: '50%',
                          border: 2,
                          borderColor: 'background.paper'
                        }}
                      />
                    )}
                  </Box>
                  <ListItemText 
                    primary={supplier.commercial_name || supplier.name} 
                    secondary={supplier.location || "Partner Activo"}
                    primaryTypographyProps={{ 
                      sx: { 
                        fontSize: '0.925rem', 
                        fontWeight: supplier.id === selectedId ? 800 : 600,
                        color: 'text.primary'
                      } 
                    }} 
                    secondaryTypographyProps={{
                      sx: { fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              py: 1.5,
              boxShadow: 'none',
              '&:hover': { 
                bgcolor: (theme) => theme.palette.mode === 'light' ? '#0854a1' : 'primary.dark', 
                boxShadow: 'none' 
              }
            }}
          >
            Crear Nuevo Proveedor
          </Button>
        </Box>
      </Box>

      {/* --- DETAIL AREA (Object Page) --- */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {selectedSupplier ? (
          <>
            {/* Minimalist Header with Actions */}
            <Box sx={{ bgcolor: 'background.paper', py: 3, px: 6, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {selectedSupplier.name}
                  </Typography>
                  <Box 
                    title={selectedSupplier.is_active ? "Activo" : "Inactivo"}
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: selectedSupplier.is_active ? 'success.main' : 'error.main',
                      mt: 0.5
                    }} 
                  />
                </Box>
                
                <Stack direction="row" spacing={1}>
                  <Button 
                    size="small"
                    variant="contained"
                    startIcon={<FuseSvgIcon size={18}>heroicons-outline:pencil-square</FuseSvgIcon>}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 700, 
                      borderRadius: '6px', 
                      boxShadow: 'none',
                      bgcolor: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main',
                      color: '#ffffff',
                      '&:hover': { bgcolor: (theme) => theme.palette.mode === 'light' ? '#0854a1' : 'primary.dark', boxShadow: 'none' }
                    }}
                  >
                    Editar
                  </Button>
                  
                  <IconButton 
                    size="small" 
                    onClick={handleOpenMenu}
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: '6px',
                      color: 'text.secondary',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <FuseSvgIcon size={20}>heroicons-outline:ellipsis-horizontal</FuseSvgIcon>
                  </IconButton>

                  <Menu
                    anchorEl={menuAnchorEl}
                    open={isMenuOpen}
                    onClose={handleCloseMenu}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      elevation: 8,
                      sx: { 
                        minWidth: 180, 
                        mt: 1, 
                        borderRadius: '8px', 
                        border: 1, 
                        borderColor: 'divider' 
                      }
                    }}
                  >
                    <MenuItem onClick={handleCloseMenu} sx={{ py: 1.5 }}>
                      <ListItemIcon>
                        <FuseSvgIcon size={20} color="action">heroicons-outline:cloud-arrow-down</FuseSvgIcon>
                      </ListItemIcon>
                      <ListItemText primary="Importar Info" primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: '0.875rem' } }} />
                    </MenuItem>
                    
                    <Divider sx={{ my: 0.5, opacity: 0.6 }} />
                    
                    <MenuItem onClick={handleCloseMenu} sx={{ py: 1.5, color: selectedSupplier.is_active ? 'error.main' : 'success.main' }}>
                      <ListItemIcon>
                        <FuseSvgIcon size={20} sx={{ color: 'inherit' }}>
                          {selectedSupplier.is_active ? 'heroicons-outline:no-symbol' : 'heroicons-outline:check-circle'}
                        </FuseSvgIcon>
                      </ListItemIcon>
                      <ListItemText 
                        primary={selectedSupplier.is_active ? 'Deshabilitar' : 'Habilitar'} 
                        primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: '0.875rem' } }} 
                      />
                    </MenuItem>
                  </Menu>
                </Stack>
              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800 }}>CUIT</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {selectedSupplier.cuit}
                  </Typography>
                </Box>
                {selectedSupplier.location && (
                  <>
                    <Typography variant="caption" sx={{ color: 'divider' }}>•</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {selectedSupplier.location}
                    </Typography>
                  </>
                )}
                {selectedSupplier.email && (
                  <>
                    <Typography variant="caption" sx={{ color: 'divider' }}>•</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {selectedSupplier.email}
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>

            {/* Content Area */}
            <Box sx={{ 
              p: 6, 
              maxWidth: '1200px', 
              bgcolor: (theme) => theme.palette.mode === 'light' ? '#f2f2f2' : 'transparent',
              flexGrow: 1
            }}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1.1rem' }}>
                    Establecimientos Asociados ({selectedSupplier.farms?.length || 0})
                  </Typography>

                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    size="small"
                    sx={{ 
                      height: 32, 
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                      '& .MuiToggleButton-root': {
                        px: 1,
                        border: 'none',
                        '&.Mui-selected': {
                          bgcolor: (theme) => alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.1),
                          color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main',
                        }
                      }
                    }}
                  >
                    <ToggleButton value="cards">
                      <Tooltip title="Tarjetas">
                        <Box sx={{ display: 'flex' }}>
                          <FuseSvgIcon size={18}>heroicons-outline:squares-2x2</FuseSvgIcon>
                        </Box>
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="table">
                      <Tooltip title="Tabla">
                        <Box sx={{ display: 'flex' }}>
                          <FuseSvgIcon size={18}>heroicons-outline:table-cells</FuseSvgIcon>
                        </Box>
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Stack direction="row" spacing={1.5}>
                  <Button 
                    variant="contained"
                    size="small"
                    startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-small</FuseSvgIcon>}
                    sx={{ 
                      bgcolor: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main',
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '6px',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: (theme) => theme.palette.mode === 'light' ? '#0854a1' : 'primary.dark', boxShadow: 'none' }
                    }}
                  >
                    Nueva Finca
                  </Button>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />
                  <Button 
                    size="small" 
                    startIcon={<FuseSvgIcon size={18}>heroicons-outline:funnel</FuseSvgIcon>}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 700, 
                      color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main' 
                    }}
                  >
                    Filtrar
                  </Button>
                </Stack>
              </Box>

              {viewMode === 'cards' ? (
                <Stack spacing={2.5}>
                  {selectedSupplier.farms && selectedSupplier.farms.length > 0 ? (
                    selectedSupplier.farms.map((farm) => (
                      <Paper 
                        key={farm.id}
                        elevation={0}
                        sx={{ 
                          p: 3.5, 
                          borderRadius: '12px', 
                          border: 1, 
                          borderColor: 'divider', 
                          bgcolor: 'background.paper',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main,
                            boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.05)}`,
                            cursor: 'pointer'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Avatar sx={{ 
                            bgcolor: (theme) => alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.1), 
                            color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main', 
                            borderRadius: '8px', 
                            width: 48, 
                            height: 48 
                          }}>
                            <FuseSvgIcon size={24}>heroicons-outline:home-modern</FuseSvgIcon>
                          </Avatar>
                          <Box>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.75 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'text.primary', fontSize: '1.05rem' }}>
                                {farm.name}
                              </Typography>
                              {farm.is_active && (
                                <Chip 
                                  label="Activo" 
                                  size="small" 
                                  sx={{ 
                                    height: '22px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 750, 
                                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1), 
                                    color: 'success.main',
                                    borderRadius: '100px',
                                    px: 0.5
                                  }} 
                                />
                              )}
                            </Stack>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <FuseSvgIcon size={16} sx={{ color: 'text.disabled' }}>heroicons-solid:map-pin</FuseSvgIcon>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8rem' }}>
                                {farm.location || 'Sin ubicación'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.5px' }}>RENSPA</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>{farm.renspa || 'N/A'}</Typography>
                          </Box>
                          
                          <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 0.5, letterSpacing: '0.5px' }}>CARAVANAS</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main', fontSize: '0.95rem' }}>
                              {farm.caravans_count || 0}
                            </Typography>
                          </Box>

                          <IconButton size="small" sx={{ 
                            color: 'text.disabled', 
                            bgcolor: 'action.hover', 
                            '&:hover': { 
                              bgcolor: (theme) => alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.1), 
                              color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main' 
                            } 
                          }}>
                            <FuseSvgIcon size={20}>heroicons-solid:chevron-right</FuseSvgIcon>
                          </IconButton>
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '12px', border: 1, borderStyle: 'dashed', borderColor: 'divider', bgcolor: 'background.default' }}>
                      <Typography color="text.secondary">No hay establecimientos asociados.</Typography>
                    </Paper>
                  )}
                </Stack>
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    borderRadius: '12px', 
                    border: 1, 
                    borderColor: 'divider', 
                    overflow: 'hidden',
                    bgcolor: 'background.paper'
                  }}
                >
                  <DataTable 
                    columns={farmColumns} 
                    data={selectedSupplier.farms || []}
                    enableRowSelection={false}
                    enableRowActions={true}
                    renderRowActions={({ row }) => (
                      <IconButton 
                        size="small" 
                        sx={{ color: (theme: any) => theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main }}
                      >
                        <FuseSvgIcon size={20}>heroicons-solid:chevron-right</FuseSvgIcon>
                      </IconButton>
                    )}
                  />
                </Paper>
              )}

              <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Typography variant="caption" color="text.disabled">
                  Mostrando {selectedSupplier.farms?.length || 0} establecimientos.
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
            <FuseSvgIcon size={64} sx={{ color: 'action.disabled' }}>heroicons-outline:user-group</FuseSvgIcon>
            <Typography variant="h6" color="text.secondary">Selecciona un proveedor para ver detalles</Typography>
          </Box>
        )}

      </Box>
    </Box>
  );
}

export default SuppliersExampleView;
