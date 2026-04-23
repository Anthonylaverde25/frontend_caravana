import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  IconButton, 
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Supplier } from '@/core/suppliers/domain/entities/Supplier';

interface SupplierObjectHeaderProps {
  supplier: Supplier;
  onEdit?: () => void;
  onImport?: () => void;
  onStatusChange?: (active: boolean) => void;
}

export const SupplierObjectHeader = ({ 
  supplier, 
  onEdit, 
  onImport, 
  onStatusChange 
}: SupplierObjectHeaderProps) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', py: 3, px: 6, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {supplier.name}
          </Typography>
          <Box 
            title={supplier.is_active ? "Activo" : "Inactivo"}
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: supplier.is_active ? 'success.main' : 'error.main',
              mt: 0.5
            }} 
          />
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button 
            size="small"
            variant="contained"
            onClick={onEdit}
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
            <MenuItem onClick={() => { onImport?.(); handleCloseMenu(); }} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <FuseSvgIcon size={20} color="action">heroicons-outline:cloud-arrow-down</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText primary="Importar Info" primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: '0.875rem' } }} />
            </MenuItem>
            
            <Divider sx={{ my: 0.5, opacity: 0.6 }} />
            
            <MenuItem 
              onClick={() => { onStatusChange?.(!supplier.is_active); handleCloseMenu(); }} 
              sx={{ py: 1.5, color: supplier.is_active ? 'error.main' : 'success.main' }}
            >
              <ListItemIcon>
                <FuseSvgIcon size={20} sx={{ color: 'inherit' }}>
                  {supplier.is_active ? 'heroicons-outline:no-symbol' : 'heroicons-outline:check-circle'}
                </FuseSvgIcon>
              </ListItemIcon>
              <ListItemText 
                primary={supplier.is_active ? 'Deshabilitar' : 'Habilitar'} 
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
            {supplier.cuit}
          </Typography>
        </Box>
        {supplier.location && (
          <>
            <Typography variant="caption" sx={{ color: 'divider' }}>•</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {supplier.location}
            </Typography>
          </>
        )}
        {supplier.email && (
          <>
            <Typography variant="caption" sx={{ color: 'divider' }}>•</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {supplier.email}
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
};
