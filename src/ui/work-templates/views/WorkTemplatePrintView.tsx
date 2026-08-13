import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  CircularProgress,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { WorkTemplatePrintProvider, useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import TemplateREP01 from '../components/TemplateREP01';
import TemplateREP02 from '../components/TemplateREP02';

/**
 * WorkTemplatePrintContent Component
 * Renders the actual content of the printable work template view, using the context.
 */
const WorkTemplatePrintContent: React.FC = () => {
  const {
    code,
    template,
    order,
    isLoading,
    error,
    printAreaRef,
    handlePrint,
    handleDownload,
    handleBack
  } = useWorkTemplatePrint();

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2 }}>
        <Typography variant="h6" color="error">
          Error loading work template
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#edf2f6' }}>
      {/* Top Navbar */}
      <AppBar sx={{ position: 'relative', bgcolor: '#faf9f6', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            aria-label="back"
            sx={{ mr: 2, color: 'text.secondary' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1, fontWeight: 800, color: 'text.primary' }} variant="h6" component="div">
            {template?.title || 'Planilla de Campo'} {order?.code ? `- Orden: ${order.code}` : ''}
          </Typography>
          {!isLoading && template && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Descargar PDF
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ textTransform: 'none', fontWeight: 800, color: '#ffffff' }}
              >
                Imprimir Planilla
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Canvas View */}
      <Box sx={{
        flexGrow: 1,
        p: { xs: 2, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        overflowY: 'auto',
        backgroundImage: 'radial-gradient(#d8dde6 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Preparando vista previa de la planilla...
            </Typography>
          </Box>
        ) : (
          <>
            {code === 'REP-01' && <TemplateREP01 />}
            {code === 'REP-02' && <TemplateREP02 />}
          </>
        )}
      </Box>
    </Box>
  );
};

/**
 * WorkTemplatePrintView Component
 * Dedicated full-screen printable page for a Work Template by Code.
 * Enveloped in the WorkTemplatePrintProvider.
 */
const WorkTemplatePrintView: React.FC = () => {
  return (
    <WorkTemplatePrintProvider>
      <WorkTemplatePrintContent />
    </WorkTemplatePrintProvider>
  );
};

export default WorkTemplatePrintView;
