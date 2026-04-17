import { Container, Box, Button, Stack, Paper } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { SuppliersTable } from '@/ui/suppliers/components/SuppliersTable';
import CreateSupplierDialog from '@/ui/suppliers/components/CreateSupplierDialog';

/**
 * SuppliersView
 * Standardized header with Providers management and dual add actions.
 */
function SuppliersView() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProviderPage = () => {
    navigate('/suppliers/create');
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <Container
      // maxWidth="xl"
      maxWidth={false} // Cambiar a false para usar todo el ancho disponible

      sx={{
        // py: { xs: 2, md: 4 },
        // px: { xs: 2, md: 6 },
        py: 0, // Elimina padding superior e inferior
        px: 0, // Elimina padding lateral
        bgcolor: '#f2f2f2',
        minHeight: '100vh'
      }}
    >
      <ViewHeader
        title="Gestión de Proveedores"
        subtitle="Administra la base de datos de proveedores, información de contacto y orígenes de compra."
        actions={
          <Stack direction="row" spacing={2}>
            <Button
              variant="text"
              color="primary"
              startIcon={<FuseSvgIcon size={20}>heroicons-outline:bolt</FuseSvgIcon>}
              onClick={handleOpenDialog}
              sx={{ fontWeight: 600, textTransform: 'none', color: '#0a6ed1' }}
            >
              Alta Rápida
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>}
              onClick={handleAddProviderPage}
              sx={{
                bgcolor: '#0a6ed1',
                borderRadius: '6px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0854a1', boxShadow: 'none' }
              }}
            >
              Agregar Proveedor
            </Button>
          </Stack>
        }
      />

      <Box component="main" sx={{ mt: 2 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: '1px solid #d8dde6',
            overflow: 'hidden',
            bgcolor: '#ffffff'
          }}
        >
          <SuppliersTable />
        </Paper>
      </Box>

      {/* Dialog para Alta Rápida */}
      <CreateSupplierDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={() => {
          // Aquí se podría disparar un refresh de la tabla si fuera necesario
          console.log('Proveedor creado con éxito');
        }}
      />
    </Container>
  );
}

export default SuppliersView;