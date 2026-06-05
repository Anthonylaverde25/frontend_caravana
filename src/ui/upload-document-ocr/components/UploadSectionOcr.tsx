import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  LinearProgress,
  Avatar,
  Chip,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Info as InfoIcon,
  HelpOutline as HelpIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import axiosInstance from '@/utils/axios';
import { useGoogleDrive } from 'src/app/(control-panel)/livestock/hooks/useGoogleDrive';
import { MOCK_AZURE_RESPONSE } from './upload-section-ocr/MockAzureData';
import { REALISTIC_CARAVAN_MOCK, UPDATE_CARAVANS_MOCK } from './upload-section-ocr/RealisticMockData';

// Atomized Components & Types
import { UploadResponse, UploadStatus } from './upload-section-ocr/types';
import IntegrationCards from './upload-section-ocr/IntegrationCards';
import AnalysisSidebar from '@/components/caravan/upload-section/AnalysisSidebar';
import ResultsPanel from '@/components/caravan/upload-section/ResultsPanel';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/tiff', 'application/pdf'];
const ACCEPTED_EXTENSIONS = '.pdf,.png,.jpg,.jpeg,.tiff';

const DropZone = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragOver' && prop !== 'status',
})<{ isDragOver?: boolean; status?: UploadStatus }>(({ theme, isDragOver, status }) => ({
  height: '100%',
  minHeight: status === 'success' ? 450 : 400,
  padding: theme.spacing(status === 'success' ? 4 : 8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  position: 'relative',
  border: status === 'success' ? '1px solid #dadce0' : '2px dashed',
  borderColor: isDragOver ? theme.palette.primary.main : status === 'error' ? theme.palette.error.light : status === 'success' ? '#dadce0' : theme.palette.divider,
  backgroundColor: isDragOver ? alpha(theme.palette.primary.main, 0.02) : theme.palette.background.paper,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: status === 'idle' || status === 'error' ? 'pointer' : 'default',
  borderRadius: 24,
  boxShadow: 'none',
  '&:hover': {
    borderColor: status === 'idle' || status === 'error' ? theme.palette.primary.main : undefined,
    boxShadow: status === 'idle' || status === 'error' ? '0 1px 3px 0 rgba(60,64,67,.30), 0 4px 8px 3px rgba(60,64,67,.15)' : 'none',
  },
  transform: isDragOver ? 'scale(1.02)' : 'none',
}));

/**
 * UploadSection Component
 * Orchestrates the file upload process and AI analysis results.
 */
const UploadSection = () => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [ocrProvider, setOcrProvider] = useState<'azure' | 'google'>('azure');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workdayType, setWorkdayType] = useState('entry');
  const [emptyDestinationBatchId, setEmptyDestinationBatchId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { openPicker, disconnect, isConnected, isDriveLoading, driveError } = useGoogleDrive((file) => {
    handleFile(file);
  });

  const resetState = () => {
    setStatus('idle');
    setSelectedFile(null);
    setProgress(0);
    setResult(null);
    setErrorMessage('');
    setIsModalOpen(false);
    setWorkdayType('entry');
    setEmptyDestinationBatchId(null);
  };

  const handleMockTest = () => {
    resetState();
    setStatus('success');
    setResult({
      status: 'success',
      suggested_workday_code: 'JORN-20260604-001',
      context: {
        cuit: '30-98765432-1',
        renspa: '01.234.5.67890/12',
        lote: 'Lote Recría A',
        establecimiento: 'Estancia El Roble',
        fecha: '04/06/2026',
        provider_id: 1,
        farm_id: 1,
        batch_id: 1,
        service_order_code: null,
        service_order_id: null
      },
      identified_template: {
        code: 'ING-01',
        title: 'Ingreso de Compra Directa',
        category: 'ENTRY',
        description: 'Registro básico de ingreso con datos de proveedor y pesaje inicial.',
        schema_definition: [
          { name: 'caravana', label: 'Caravana', type: 'string', required: true },
          { name: 'category', label: 'Categoría', type: 'string', required: true },
          { name: 'weight', label: 'Peso Inicial (kg)', type: 'number', required: true },
          { name: 'observations', label: 'Observaciones', type: 'text', required: false }
        ]
      }
    } as any);
    setSelectedFile({ name: 'mock_azure_test_data.json', size: 0 } as File);
  };

  const handleRealisticMockTest = () => {
    resetState();
    setStatus('success');
    setResult({
      status: 'success',
      suggested_workday_code: 'JORN-20260604-002',
      context: {
        cuit: '30-12345678-9',
        renspa: '12.345.6.78910/11',
        lote: 'Lote 5',
        establecimiento: 'Estancia La Primavera',
        fecha: '04/06/2026',
        provider_id: 1,
        farm_id: 2,
        batch_id: 3,
        service_order_code: 'SO-20260604-095258-7392',
        service_order_id: 2
      },
      identified_template: {
        code: 'REP-01',
        title: 'Planilla de Tacto y Ecografía',
        category: 'REPRODUCTIVE',
        description: 'Registro de diagnóstico de gestación, tacto rectal y ecografía.',
        schema_definition: [
          { name: 'caravana', label: 'Caravana', type: 'string', required: true },
          { name: 'category', label: 'Categoría', type: 'string', required: true },
          { name: 'diagnosis', label: 'Diagnóstico', type: 'select', required: true, options: [{ value: 'PREGNANT', label: 'Preñada' }, { value: 'EMPTY', label: 'Vacía' }] },
          { name: 'gestational_stage', label: 'Estadio Estimado', type: 'select', required: false, options: [{ value: 'CABEZA', label: 'Cabeza' }, { value: 'CUERPO', label: 'Cuerpo' }, { value: 'COLA', label: 'Cola' }] },
          { name: 'observations', label: 'Observaciones', type: 'text', required: false }
        ]
      },
      data: [
        {
          table_id: 0,
          row_count: 5,
          column_count: 5,
          headers: ["caravana", "categoria", "diagnostico", "estadio_estimado", "observaciones"],
          field_mapping: {
            "caravana": "identification",
            "categoria": "category",
            "diagnostico": "diagnostico",
            "estadio_estimado": "gestational_stage",
            "observaciones": "observations"
          },
          rows: [],
          mapped_rows: [
            {
              identification: { value: "1001", confidence: 1 },
              category: { value: "vaca", confidence: 1 },
              diagnostico: { value: "Vacía :selected:", confidence: 1 },
              is_empty: { value: true, confidence: 1 }
            },
            {
              identification: { value: "1002", confidence: 1 },
              category: { value: "vaca", confidence: 1 },
              diagnostico: { value: "Preñada :selected:", confidence: 1 },
              is_empty: { value: false, confidence: 1 }
            }
          ]
        }
      ]
    } as any);
    setSelectedFile({ name: 'realistic_caravans.json', size: 0 } as File);
  };

  const handleUpdateMockTest = () => {
    resetState();
    setStatus('success');
    setResult({
      status: 'success',
      suggested_workday_code: 'JORN-20260604-003',
      context: {
        cuit: '30-11111111-1',
        renspa: '99.999.9.99999/99',
        lote: 'Lote Terminación B',
        establecimiento: 'Estancia Los Pinos',
        fecha: '04/06/2026',
        provider_id: 2,
        farm_id: 3,
        batch_id: 4,
        service_order_code: null,
        service_order_id: null
      },
      identified_template: {
        code: 'OP-01',
        title: 'Control Mensual de Lotes',
        category: 'WEIGHT',
        description: 'Planilla para el pesaje de rutina mensual de tropas en recría.',
        schema_definition: [
          { name: 'caravana', label: 'Caravana', type: 'string', required: true },
          { name: 'weight', label: 'Peso de Control (kg)', type: 'number', required: true },
          { name: 'observations', label: 'Observaciones', type: 'text', required: false }
        ]
      }
    } as any);
    setSelectedFile({ name: 'update_weights_mock.json', size: 0 } as File);
  };

  const handleFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.tiff')) {
      setErrorMessage(`Unsupported file type. Use PDF, PNG, JPG, or TIFF.`);
      setStatus('error');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File exceeds the maximum size of 20MB.');
      setStatus('error');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    uploadFile(file);
  }, [ocrProvider]);

  const uploadFile = async (file: File) => {
    setStatus('uploading');
    setProgress(0);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('provider', ocrProvider);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + Math.random() * 8));
    }, 1500);

    try {
      const response = await axiosInstance.post('/work-templates/identify', formData, {
        timeout: 120000, // Azure OCR polling can take up to 30+ seconds
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      clearInterval(progressInterval);
      setProgress(100);
      setResult(response.data);
      setStatus('success');
    } catch (err: any) {
      clearInterval(progressInterval);
      setErrorMessage(err.response?.data?.error || err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* ─── Success Mode: Analysis View (Sidebar + Table) ─── */}
      {status === 'success' && result ? (
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: '1600px', 
            mx: 'auto', 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 2
          }}
        >
          {/* Metadata Sidebar (25%) */}
          <Box 
            sx={{ 
              flex: '1 1 25%', 
              borderRight: { lg: '1px solid' }, 
              borderColor: { lg: 'divider' },
              mb: { xs: 4, lg: 0 },
              order: { xs: 2, lg: 1 }
            }}
          >
            <AnalysisSidebar 
              suggestedWorkdayCode={result.suggested_workday_code} 
              workdayType={workdayType}
              setWorkdayType={setWorkdayType}
              context={result.context}
              templateCode={result.identified_template?.code}
              emptyDestinationBatchId={emptyDestinationBatchId}
              setEmptyDestinationBatchId={setEmptyDestinationBatchId}
            />
          </Box>

          {/* Main Table Area (75%) */}
          <Box sx={{ flex: '1 1 75%', minWidth: 0, order: { xs: 1, lg: 2 } }}>
            <ResultsPanel 
              data={result.data} 
              context={result.context}
              ocrProvider={ocrProvider} 
              workdayType={workdayType}
              suggestedWorkdayCode={result.suggested_workday_code}
              onReset={resetState} 
              emptyDestinationBatchId={emptyDestinationBatchId}
              identifiedTemplate={result.identified_template}
            />
          </Box>
        </Box>
      ) : (
        /* ─── Idle/Uploading/Error Mode: Two Column Layout ─── */
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 4, 
            width: '100%', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          {/* Column 1: DropZone Area */}
          <Box 
            sx={{ 
              width: '100%',
              flex: {
                xs: '1 1 100%',
                lg: '1 1 calc(72% - 16px)'
              },
              maxWidth: {
                lg: '72%'
              }
            }}
          >
            <DropZone
              elevation={0}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); }}
              onClick={status === 'idle' || status === 'error' ? () => fileInputRef.current?.click() : undefined}
              isDragOver={isDragOver}
              status={status}
            >
              <input ref={fileInputRef} type="file" accept={ACCEPTED_EXTENSIONS} onChange={(e) => { if (e.target.files?.length) handleFile(e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />

              {/* Provider Selector */}
              {(status === 'idle' || status === 'error') && (
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, zIndex: 2 }} onClick={(e) => e.stopPropagation()}>
                  <Chip label="Azure" size="small" onClick={() => setOcrProvider('azure')} color={ocrProvider === 'azure' ? 'primary' : 'default'} sx={{ fontSize: '0.65rem' }} />
                </Box>
              )}

              {/* Content based on status */}
              {(status === 'idle' || status === 'error') && !isDragOver && (
                <>
                  <Avatar sx={{ bgcolor: alpha('#1a73e8', 0.08), color: 'primary.main', width: 80, height: 80, mb: 3 }}><InsertDriveFileIcon sx={{ fontSize: 40 }} /></Avatar>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 500 }}>Select a spreadsheet</Typography>
                  <Button variant="contained" disableElevation onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} sx={{ py: 1.5, px: 5 }}>Browse Files</Button>

                  {import.meta.env.DEV && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                      <Button variant="outlined" color="secondary" onClick={(e) => { e.stopPropagation(); handleMockTest(); }} sx={{ textTransform: 'none' }} startIcon={<InfoIcon />}>
                        Load Mock OCR Data (Test)
                      </Button>
                      <Button variant="outlined" color="primary" onClick={(e) => { e.stopPropagation(); handleRealisticMockTest(); }} sx={{ textTransform: 'none' }} startIcon={<CheckCircleIcon />}>
                        Load Realistic Caravan Data
                      </Button>
                      <Button variant="outlined" color="warning" onClick={(e) => { e.stopPropagation(); handleUpdateMockTest(); }} sx={{ textTransform: 'none' }} startIcon={<CloudUploadIcon />}>
                        Load Update (Exit Weights)
                      </Button>
                    </Box>
                  )}
                </>
              )}

              {isDragOver && (
                <>
                  <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 96, height: 96, mb: 3 }}><CloudUploadIcon sx={{ fontSize: 48 }} /></Avatar>
                  <Typography variant="h4" color="primary.main" fontWeight={500}>Ready to drop</Typography>
                </>
              )}

              {status === 'uploading' && (
                <>
                  <CircularProgress variant="determinate" value={progress} size={80} sx={{ mb: 4 }} />
                  <Typography variant="h5">Analyzing document...</Typography>
                  <Box sx={{ mt: 3, width: '100%', maxWidth: 250 }}><LinearProgress variant="determinate" value={progress} /></Box>
                </>
              )}

              {status === 'error' && (
                <>
                  <Avatar sx={{ bgcolor: alpha('#d32f2f', 0.1), color: 'error.main', width: 80, height: 80, mb: 3 }}><ErrorIcon sx={{ fontSize: 48 }} /></Avatar>
                  <Typography variant="body1" color="error" sx={{ mb: 4 }}>{errorMessage || driveError}</Typography>
                  <Button variant="contained" color="error" onClick={() => resetState()}>Try Again</Button>
                </>
              )}
            </DropZone>
          </Box>

          {/* Column 2: Integrations */}
          <Box 
            sx={{ 
              width: '100%', 
              flex: { 
                xs: '1 1 100%', 
                lg: '1 1 calc(28% - 16px)' 
              }, 
              maxWidth: { 
                lg: '28%' 
              } 
            }}
          >
            <IntegrationCards isConnected={isConnected} isDriveLoading={isDriveLoading} openPicker={openPicker} disconnect={disconnect} />
          </Box>
        </Box>
      )}

      {/* ─── Template Identification Dialog ─── */}
      <Dialog
        open={isModalOpen}
        onClose={resetState}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {result?.identified_template ? (
              <Avatar sx={{ bgcolor: '#e6f4ea', color: '#137333', width: 44, height: 44 }}>
                <CheckCircleIcon sx={{ fontSize: 26 }} />
              </Avatar>
            ) : (
              <Avatar sx={{ bgcolor: '#fce8e6', color: '#c5221f', width: 44, height: 44 }}>
                <CancelIcon sx={{ fontSize: 26 }} />
              </Avatar>
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {result?.identified_template 
                  ? 'Planilla Identificada con Éxito' 
                  : 'Plantilla No Reconocida'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Análisis de estructura documental mediante Jhoangel AI (Azure OCR)
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {result?.identified_template ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Template basic info */}
              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f8f9fa', borderRadius: '12px', border: '1px solid #dadce0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#000' }}>
                      {result.identified_template.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                      Categoría: {result.identified_template.category}
                    </Typography>
                  </Box>
                  <Chip 
                    label={result.identified_template.code} 
                    color="primary" 
                    sx={{ fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.5px' }} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {result.identified_template.description || 'Sin descripción disponible.'}
                </Typography>
              </Paper>

              {/* Schema display */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Esquema de Datos de la Plantilla
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', border: '1px solid #dadce0' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f1f3f4' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, py: 1.2 }}>Campo</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.2 }}>Identificador</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.2 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.2 }}>Requerido</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.2 }}>Opciones / Detalles</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        const schema = result.identified_template.schema_definition;
                        const fields = Array.isArray(schema) 
                          ? schema 
                          : (() => {
                              try {
                                return typeof schema === 'string' ? JSON.parse(schema) : [];
                              } catch (e) {
                                return [];
                              }
                            })();
                        
                        if (!fields.length) {
                          return (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                                No se encontraron campos definidos en el esquema.
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return fields.map((field: any) => (
                          <TableRow key={field.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 700, py: 1 }}>{field.label || field.name}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', py: 1 }}>{field.name}</TableCell>
                            <TableCell sx={{ textTransform: 'capitalize', py: 1 }}>{field.type}</TableCell>
                            <TableCell sx={{ py: 1 }}>
                              <Chip 
                                label={field.required ? 'Sí' : 'No'} 
                                size="small" 
                                color={field.required ? 'error' : 'default'} 
                                variant={field.required ? 'filled' : 'outlined'}
                                sx={{ fontSize: '0.65rem', height: 16 }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1 }}>
                              {field.type === 'select' && Array.isArray(field.options) ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {field.options.map((opt: any) => (
                                    <Chip 
                                      key={opt.value} 
                                      label={opt.label || opt.value} 
                                      size="small" 
                                      sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#e8f0fe', color: '#1a73e8' }} 
                                    />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">—</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Context Metadata */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Metadatos y Contexto Detectados
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>ESTABLECIMIENTO</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {result.context?.renspa ? `RENSPA: ${result.context.renspa}` : 'No detectado'}
                    </Typography>
                    {result.context?.farm_id && (
                      <Chip label={`Establecimiento ID: ${result.context.farm_id}`} size="small" color="success" variant="outlined" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }} />
                    )}
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>PROVEEDOR / CUIT</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {result.context?.cuit ? `CUIT: ${result.context.cuit}` : 'No detectado'}
                    </Typography>
                    {result.context?.provider_id && (
                      <Chip label={`Proveedor ID: ${result.context.provider_id}`} size="small" color="success" variant="outlined" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }} />
                    )}
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>LOTE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {result.context?.lote ? `Lote: ${result.context.lote}` : 'No detectado'}
                    </Typography>
                    {result.context?.batch_id && (
                      <Chip label={`Lote ID: ${result.context.batch_id}`} size="small" color="success" variant="outlined" sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }} />
                    )}
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>CÓDIGO DE JORNADA SUGERIDO</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {result.suggested_workday_code || '—'}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
              <HelpIcon sx={{ fontSize: 60, color: 'warning.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                No se pudo identificar el código de plantilla
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
                Asegúrate de que la planilla cargada sea un documento oficial de Jhoangel AI que contenga el cuadro de <b>TEMPLATE CODE</b> con un código válido (por ejemplo, <b>REP-01</b>) en la parte superior derecha de la cabecera.
              </Typography>

              {/* Show context if detected anyway */}
              {result?.context && (Object.values(result.context).some(v => v !== null)) && (
                <Box sx={{ mt: 2, width: '100%', textAlign: 'left' }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Metadatos de Contexto Detectados
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    {result.context.cuit && <Typography variant="caption" sx={{ display: 'block' }}><b>CUIT:</b> {result.context.cuit}</Typography>}
                    {result.context.renspa && <Typography variant="caption" sx={{ display: 'block' }}><b>RENSPA:</b> {result.context.renspa}</Typography>}
                    {result.context.lote && <Typography variant="caption" sx={{ display: 'block' }}><b>Lote:</b> {result.context.lote}</Typography>}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={resetState} 
            variant="contained" 
            color={result?.identified_template ? 'success' : 'primary'}
            sx={{ px: 4, py: 1, fontWeight: 800, borderRadius: '8px' }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadSection;
