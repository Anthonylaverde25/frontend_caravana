import React, { useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { WorkTemplatePrintProvider, useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import WorkTemplatePrintToolbar from '../components/WorkTemplatePrintToolbar';
import FastApiAiTestDialog from '../components/FastApiAiTestDialog';
import { TemplateING01, Ing01ConfigDrawer } from '../templates/ing01';
import { TemplateMON01, Mon01ConfigDrawer } from '../templates/mon01';
import { TemplateTOR01, Tor01ConfigDrawer } from '../templates/tor01';
import { TemplateREP01 } from '../templates/rep01';
import { TemplateREP02 } from '../templates/rep02';
import { TemplateGeneric } from '../templates/generic';

/**
 * WorkTemplatePrintContent Component
 * Renders the actual content of the printable work template view, using the context.
 */
const WorkTemplatePrintContent: React.FC = () => {
  const { code, template, order, isLoading, error, handleBack } = useWorkTemplatePrint();

  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);

  // FastAPI AI test integration
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTestAI = async () => {
    setIsTestingAI(true);
    try {
      const response = await axios.post('/api/fastapi/templates/process', {
        template_code: code || 'ING-01',
        service_order_id: order?.id || null
      });
      setAiResult(response.data);
      setIsDialogOpen(true);
    } catch (err: any) {
      console.error('FastAPI AI Service Error:', err);
      setAiResult({
        success: false,
        message: err?.response?.data?.detail || 'No se pudo conectar con el microservicio Jhoangel AI (FastAPI).'
      });
      setIsDialogOpen(true);
    } finally {
      setIsTestingAI(false);
    }
  };

  const renderTemplateComponent = () => {
    switch (code) {
      case 'TOR-01':
        return <TemplateTOR01 />;
      case 'MON-01':
      case 'SER-01':
        return <TemplateMON01 />;
      case 'REP-01':
        return <TemplateREP01 />;
      case 'REP-02':
        return <TemplateREP02 />;
      case 'ING-01':
        return <TemplateING01 />;
      default:
        return <TemplateGeneric />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error || !template) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" color="error">
          Error al cargar la plantilla de trabajo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error || 'No se encontró la plantilla solicitada.'}
        </Typography>
        <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#edf2f6' }}>
      {/* Top Navbar Toolbar Component */}
      <WorkTemplatePrintToolbar
        onOpenConfig={() => setIsConfigDrawerOpen(true)}
        onTestAI={handleTestAI}
        isTestingAI={isTestingAI}
      />

      {/* Main Clean Printable Canvas */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify: 'flex-start',
          p: { xs: 2, sm: 4 },
          overflowY: 'auto',
          bgcolor: '#edf2f6',
          width: '100%'
        }}
      >
        {renderTemplateComponent()}
      </Box>

      {/* FastAPI Jhoangel AI Test Result Modal Component */}
      <FastApiAiTestDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isTestingAI={isTestingAI}
        aiResult={aiResult}
      />

      {/* Render Template Specific Configuration Drawers */}
      {code === 'ING-01' && (
        <Ing01ConfigDrawer
          open={isConfigDrawerOpen}
          onClose={() => setIsConfigDrawerOpen(false)}
        />
      )}
      {(code === 'MON-01' || code === 'SER-01') && (
        <Mon01ConfigDrawer
          open={isConfigDrawerOpen}
          onClose={() => setIsConfigDrawerOpen(false)}
        />
      )}
      {code === 'TOR-01' && (
        <Tor01ConfigDrawer
          open={isConfigDrawerOpen}
          onClose={() => setIsConfigDrawerOpen(false)}
        />
      )}
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
