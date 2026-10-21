import { Box, Paper, Typography, Stack, Switch, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';
import { PresetSelector } from '@/components/contrast/PresetSelector';

export default function AppearanceSection() {
  const { settings, toggleEnabled, applyPreset, resetToDefault } = useContrastTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header Info Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FuseSvgIcon size={24} sx={{ color: 'primary.main' }}>
            heroicons-outline:sun
          </FuseSvgIcon>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Visibilidad & Trabajo en Manga
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Paletas de alto contraste y modos visuales adaptados a la lectura bajo luz solar directa en corrales y campo.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="caption" sx={{ fontWeight: 600, color: settings.enabled ? 'primary.main' : '#64748b' }}>
            {settings.enabled ? 'Tema Personalizado' : 'Predeterminado'}
          </Typography>
          <Switch
            checked={settings.enabled}
            onChange={toggleEnabled}
            color="primary"
            size="small"
          />
        </Stack>
      </Paper>

      {/* Preset Selector Container */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Presets de Color & Contraste
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Selecciona una configuración predefinida según las condiciones de luminosidad de la jornada.
            </Typography>
          </Box>

          {settings.enabled && (
            <Button
              size="small"
              variant="outlined"
              onClick={resetToDefault}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.72rem', height: 28 }}
            >
              Restablecer
            </Button>
          )}
        </Stack>

        <PresetSelector
          currentPreset={settings.preset}
          enabled={settings.enabled}
          onSelect={(preset) => applyPreset(preset)}
        />
      </Paper>
    </Box>
  );
}
