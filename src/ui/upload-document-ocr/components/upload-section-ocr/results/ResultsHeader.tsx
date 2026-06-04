import { Box, Typography, Avatar, Chip, Button, alpha } from '@mui/material';
import { 
  TableChart as TableChartIcon, 
  CloudUpload as CloudUploadIcon, 
  EventNote as EventIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { ImportResult } from '../types';

interface ResultsHeaderProps {
  animalCount: number;
  ocrProvider: 'azure' | 'google';
  suggestedWorkdayCode?: string;
  importStatus: 'idle' | 'importing' | 'done' | 'error';
  importResult: ImportResult | null;
  onReset: () => void;
  onImport: () => void;
}

export const ResultsHeader = ({
  animalCount,
  ocrProvider,
  suggestedWorkdayCode,
  importStatus,
  importResult,
  onReset,
  onImport
}: ResultsHeaderProps) => {
  return (
    <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ 
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), 
          color: 'primary.main', 
          width: 32, 
          height: 32 
        }}>
          <TableChartIcon sx={{ fontSize: 18 }} />
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Resultados del Análisis</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">{animalCount} animales detectados</Typography>
            <Chip 
              label={ocrProvider === 'azure' ? 'Azure Engine' : 'Google AI Engine'} 
              size="small" 
              sx={{ height: 16, fontSize: '0.6rem', bgcolor: (theme) => alpha(ocrProvider === 'azure' ? '#0078d4' : '#4285f4', 0.1), color: ocrProvider === 'azure' ? '#0078d4' : '#4285f4', borderColor: 'transparent' }} 
            />
            {suggestedWorkdayCode && (
              <Chip 
                icon={<EventIcon sx={{ fontSize: '12px !important' }} />}
                label={`Jornada: ${suggestedWorkdayCode}`} 
                size="small" 
                sx={{ 
                  height: 16, 
                  fontSize: '0.6rem', 
                  fontWeight: 700,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08), 
                  color: 'primary.main', 
                  borderColor: 'transparent',
                  '& .MuiChip-icon': { color: 'inherit' }
                }} 
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {importStatus === 'done' && importResult && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
            <CheckCircleIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" fontWeight="bold">{importResult.imported} importados</Typography>
          </Box>
        )}

        <Button
          variant="outlined"
          onClick={onReset}
          size="small"
          sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
          startIcon={<CloudUploadIcon />}
        >
          Nuevo Documento
        </Button>

        <Button
          variant="contained"
          disableElevation
          onClick={onImport}
          disabled={importStatus === 'importing' || importStatus === 'done'}
          size="small"
          sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 700, fontSize: '0.75rem' }}
          startIcon={importStatus === 'importing' ? <CircularProgress size={16} color="inherit" /> : <StorageIcon />}
        >
          {importStatus === 'importing' ? 'Importando...' : importStatus === 'done' ? 'Importado ✓' : 'Confirmar Importación'}
        </Button>
      </Box>
    </Box>
  );
};

// Necesario importar CircularProgress ya que se usa en el botón
import { CircularProgress } from '@mui/material';
