import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Avatar, 
  IconButton, 
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';

interface SupplierMasterSidebarProps {
  suppliers: Supplier[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreateNew: () => void;
}

export const SupplierMasterSidebar = ({ 
  suppliers, 
  selectedId, 
  onSelect, 
  onCreateNew 
}: SupplierMasterSidebarProps) => {
  return (
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
        
        {/* Search Box */}
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
                onClick={() => onSelect(supplier.id)}
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
          onClick={onCreateNew}
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
  );
};
