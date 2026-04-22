import { Box, Typography, TextField, Divider, Stack, Select, MenuItem, FormControl, Chip } from '@mui/material';
import { 
  DescriptionOutlined as NotesIcon, 
  FormatListNumberedOutlined as SectionIcon,
  InfoOutlined as InfoIcon,
  EventOutlined as EventIcon,
  Inventory2Outlined as BatchIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { DocumentContext } from './types';

interface AnalysisSidebarProps {
  suggestedWorkdayCode?: string;
  workdayType: string;
  setWorkdayType: (type: string) => void;
  context?: DocumentContext;
}

/**
 * AnalysisSidebar Component
 * Provides a minimal area for manual metadata input during OCR verification.
 */
const AnalysisSidebar = ({ suggestedWorkdayCode, workdayType, setWorkdayType, context }: AnalysisSidebarProps) => {
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        bgcolor: 'transparent', // Sin fondo ni sombras como se pidió
        px: 3,
        py: 1
      }}
    >
      <Stack spacing={4}>
        {/* Section Header */}
        <Box>
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.disabled', letterSpacing: 1 }}>
            Metadatos de Carga
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
            Información contextual para organizar este lote de registros.
          </Typography>
        </Box>

        {/* Document Context (from Azure) */}
        {context && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
              <BatchIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              Contexto del Documento
            </Typography>
            <Stack spacing={1}>
              <Chip
                variant="outlined"
                size="small"
                color={context.provider_id ? 'success' : 'default'}
                label={`CUIT: ${context.cuit || 'N/A'} ${context.provider_id ? '✓' : ''}`}
                sx={{ justifyContent: 'flex-start', fontSize: '0.7rem', height: 28 }}
              />
              <Chip
                variant="outlined"
                size="small"
                color={context.farm_id ? 'success' : 'default'}
                label={`RENSPA: ${context.renspa || 'N/A'} ${context.farm_id ? '✓' : ''}`}
                sx={{ justifyContent: 'flex-start', fontSize: '0.7rem', height: 28 }}
              />
              <Chip
                variant="outlined"
                size="small"
                color={context.batch_id ? 'success' : 'warning'}
                label={`Lote: ${context.lote || 'N/A'} ${context.batch_id ? '✓' : '(se creará)'}`}
                sx={{ justifyContent: 'flex-start', fontSize: '0.7rem', height: 28 }}
              />
            </Stack>
          </Box>
        )}

        <Divider />

        {/* Section Number Field */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <SectionIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            Jornada Sugerida
          </Typography>
          <TextField
            fullWidth
            value={suggestedWorkdayCode || 'Calculando...'}
            variant="outlined"
            size="small"
            InputProps={{
              readOnly: true,
              sx: { 
                borderRadius: 2, 
                bgcolor: (theme) => alpha(theme.palette.action.active, 0.05),
                color: 'text.secondary',
                fontWeight: 600
              }
            }}
          />
        </Box>
        
        {/* Workday Type Selector */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <EventIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            Tipo de Jornada
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={workdayType}
              onChange={(e) => setWorkdayType(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="entry">Entrada</MenuItem>
              <MenuItem value="update">Actualización (Revisión)</MenuItem>
              <MenuItem value="exit">Salida</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Annotations Field */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <NotesIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            Anotaciones
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Observaciones sobre la carga, estado de los animales o incidencias en el pesaje..."
            variant="outlined"
            size="small"
            InputProps={{
              sx: { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.action.active, 0.02) }
            }}
          />
        </Box>

        {/* Static Info Box */}
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 3, 
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
            border: '1px dashed',
            borderColor: (theme) => alpha(theme.palette.info.main, 0.2)
          }}
        >
          <Typography variant="caption" color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
            <InfoIcon sx={{ fontSize: 14 }} />
            Nota de Ayuda
          </Typography>
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary', lineHeight: 1.5 }}>
            Estos datos se asociarán a cada uno de los animales importados en este bloque para facilitar trazabilidad.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default AnalysisSidebar;
