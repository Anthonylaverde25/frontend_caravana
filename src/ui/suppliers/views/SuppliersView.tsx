import { Container, Box } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import { SuppliersTable } from '../components/SuppliersTable';

/**
 * SuppliersView
 * Standardized header with Providers management.
 */
function SuppliersView() {
  return (
    <Container
      maxWidth="xl"
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        px: { xs: 2, md: 6 }
      }}
    >
      <ViewHeader
        title="Gestión de Proveedores"
        subtitle="Administra la base de datos de proveedores, información de contacto y orígenes de compra."
      />

      <Box sx={{ mt: 1 }}>
        <SuppliersTable />
      </Box>
    </Container>
  );
}

export default SuppliersView;