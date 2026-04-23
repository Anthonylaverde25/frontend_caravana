import { Container, Box, Button, Stack, Paper } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState } from 'react';
import { BatchesTable } from '../components/BatchesTable';
import CreateBatchDialog from '../components/CreateBatchDialog';

/**
 * BatchesView Component
 * Main page for managing batches (Lotes).
 */
function BatchesView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Container
      maxWidth="xl"
      sx={{
        // py: { xs: 2, md: 4 },
        // px: { xs: 2, md: 6 },
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <ViewHeader
        title="Gestión de Lotes (Batches)"
        subtitle="Control centralizado de agrupaciones de ganado por establecimiento."
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="text"
              startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-down-tray</FuseSvgIcon>}
              sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
              onClick={() => setIsDialogOpen(true)}
              sx={{
                bgcolor: 'primary.main',
                borderRadius: '6px',
                px: 3,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Nuevo Lote
            </Button>
          </Stack>
        }
      />

      <Box component="main" sx={{ mt: 2 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <BatchesTable />
        </Paper>
      </Box>

      <CreateBatchDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Container>
  );
}

export default BatchesView;
