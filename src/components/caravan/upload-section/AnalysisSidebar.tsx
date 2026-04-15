import { Box, Typography, TextField, Divider, Stack } from '@mui/material';
import { 
  DescriptionOutlined as NotesIcon, 
  FormatListNumberedOutlined as SectionIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

/**
 * AnalysisSidebar Component
 * Provides a minimal area for manual metadata input during OCR verification.
 */
const AnalysisSidebar = () => {
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

        {/* Section Number Field */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <SectionIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            Número de Sección
          </Typography>
          <TextField
            fullWidth
            placeholder="Ej: Lote A-12"
            variant="outlined"
            size="small"
            InputProps={{
              sx: { borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.action.active, 0.02) }
            }}
          />
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
