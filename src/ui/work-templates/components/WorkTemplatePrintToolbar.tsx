import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Stack,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TuneIcon from '@mui/icons-material/Tune';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';

interface WorkTemplatePrintToolbarProps {
  onOpenConfig: () => void;
  onTestAI: () => void;
  isTestingAI: boolean;
}

export const WorkTemplatePrintToolbar: React.FC<WorkTemplatePrintToolbarProps> = ({
  onOpenConfig,
  onTestAI,
  isTestingAI
}) => {
  const {
    code,
    template,
    order,
    isLoading,
    handlePrint,
    handleDownload,
    handleBack
  } = useWorkTemplatePrint();

  return (
    <AppBar
      sx={{
        position: 'relative',
        bgcolor: '#faf9f6',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
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
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Config Drawer Trigger Button (Available for templates with config like ING-01) */}
            {code === 'ING-01' && (
              <Button
                variant="outlined"
                startIcon={<TuneIcon sx={{ fontSize: '1.1rem !important', color: '#64748b' }} />}
                onClick={onOpenConfig}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  bgcolor: '#ffffff',
                  borderRadius: '6px',
                  height: '36px',
                  px: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    bgcolor: '#f8fafc',
                    color: '#0f172a'
                  }
                }}
              >
                Configurar Planilla
              </Button>
            )}

            {/* Botón Minimalista: Test IA (FastAPI) */}
            <Button
              variant="outlined"
              onClick={onTestAI}
              disabled={isTestingAI}
              startIcon={
                isTestingAI ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AutoAwesomeIcon sx={{ fontSize: '1.1rem !important', color: '#6366f1' }} />
                )
              }
              sx={{
                borderColor: '#e2e8f0',
                color: '#4f46e5',
                fontWeight: 600,
                fontSize: '0.8125rem',
                textTransform: 'none',
                bgcolor: '#ffffff',
                borderRadius: '6px',
                height: '36px',
                px: 2,
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#c7d2fe',
                  bgcolor: '#f5f3ff',
                  color: '#4338ca'
                }
              }}
            >
              Test IA
            </Button>

            {/* Botón Minimalista: Descargar PDF */}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon sx={{ fontSize: '1.1rem !important', color: '#64748b' }} />}
              onClick={handleDownload}
              sx={{
                borderColor: '#e2e8f0',
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.8125rem',
                textTransform: 'none',
                bgcolor: '#ffffff',
                borderRadius: '6px',
                height: '36px',
                px: 2,
                boxShadow: 'none',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  bgcolor: '#f8fafc',
                  color: '#0f172a'
                }
              }}
            >
              Descargar PDF
            </Button>

            {/* Botón Minimalista CTA: Imprimir Planilla */}
            <Button
              variant="contained"
              disableElevation
              startIcon={<PrintIcon sx={{ fontSize: '1.1rem !important' }} />}
              onClick={handlePrint}
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'none',
                borderRadius: '6px',
                height: '36px',
                px: 2.5,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#1e293b'
                }
              }}
            >
              Imprimir Planilla
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default WorkTemplatePrintToolbar;
