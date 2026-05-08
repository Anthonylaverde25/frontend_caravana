import { Container, Box, Paper, Typography } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';

/**
 * FarmsView Component
 * Management of farms/establishments.
 */
function FarmsView() {
  return (
    <Container
      maxWidth={false}
      sx={{
        py: 0,
        px: 0,
        bgcolor: '#f2f2f2',
        minHeight: '100vh'
      }}
    >
      <ViewHeader
        title="Gestión de Establecimientos"
        subtitle="Administra las sedes, campos y sus correspondientes RENSPAs."
      />

      <Box component="main" sx={{ mt: 2, p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '8px',
            border: '1px solid #d8dde6',
            bgcolor: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Lista de Establecimientos (Próximamente)
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default FarmsView;
