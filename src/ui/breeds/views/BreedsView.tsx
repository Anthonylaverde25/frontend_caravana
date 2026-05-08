import { Container, Box, Paper, Typography } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';

import { BreedsTable } from '../components/BreedsTable';

/**
 * BreedsView Component
 * Management of animal breeds.
 */
function BreedsView() {
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
        title="Gestión de Razas"
        subtitle="Administra las razas de animales disponibles en el sistema."
      />

      <Box component="main" sx={{ mt: 2, p: 2 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: '1px solid #d8dde6',
            overflow: 'hidden',
            bgcolor: '#ffffff'
          }}
        >
          <BreedsTable />
        </Paper>
      </Box>
    </Container>
  );
}

export default BreedsView;
