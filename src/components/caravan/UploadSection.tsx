import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
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
  Tooltip,
  Divider,
  IconButton
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import axiosInstance from '@/lib/axiosInstance';
import { useGoogleDrive } from 'src/app/(control-panel)/livestock/hooks/useGoogleDrive';
import { MOCK_AZURE_RESPONSE } from './upload-section/MockAzureData';

// Atomized Components & Types
import { UploadResponse, UploadStatus } from './upload-section/types';
import ResultsPanel from './upload-section/ResultsPanel';
import IntegrationCards from './upload-section/IntegrationCards';

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
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [ocrProvider, setOcrProvider] = useState<'azure' | 'google'>('azure');
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
  };

  const handleMockTest = () => {
    resetState();
    setStatus('success');
    setResult(MOCK_AZURE_RESPONSE as any);
    setSelectedFile({ name: 'mock_azure_test_data.json', size: 0 } as File);
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
    formData.append('target_model', 'caravans');
    formData.append('provider', ocrProvider);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + Math.random() * 8));
    }, 1500);

    try {
      const response = await axiosInstance.post('/test/azure-layout', formData);
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

      {/* ─── Success Mode: Full Width DataTable ─── */}
      {status === 'success' && result ? (
        <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto' }}>
          <ResultsPanel 
            data={result.data} 
            ocrProvider={ocrProvider} 
            onReset={resetState} 
          />
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

              {/* Provider Selector & Mock Button */}
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
                    <Button variant="outlined" color="secondary" onClick={(e) => { e.stopPropagation(); handleMockTest(); }} sx={{ mt: 2, textTransform: 'none' }} startIcon={<InfoIcon />}>
                      Load Mock OCR Data (Test)
                    </Button>
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
    </Box>
  );
};

export default UploadSection;
