import {
  Stack,
  Paper,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Farm } from '@/core/suppliers/domain/entities/Farm';

interface FarmsCardsViewProps {
  farms: Farm[];
}

export const FarmsCardsView = ({ farms }: FarmsCardsViewProps) => {
  const theme = useTheme();

  if (farms.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: '12px',
          border: 1,
          borderStyle: 'dashed',
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Typography color="text.secondary">No hay establecimientos asociados.</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 3 }}>
      {farms.map((farm) => (
        <Paper
          key={farm.id}
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main',
              boxShadow: `0 8px 24px ${alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.08)}`,
              transform: 'translateY(-2px)'
            }
          }}
        >
          {/* Cabecera de la Tarjeta */}
          <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar sx={{
                bgcolor: alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.1),
                color: theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main',
                borderRadius: '8px',
                width: 44,
                height: 44
              }}>
                <FuseSvgIcon size={24}>heroicons-outline:home-modern</FuseSvgIcon>
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 850, color: 'text.primary', lineHeight: 1.2, mb: 0.5 }}>
                  {farm.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                   <FuseSvgIcon size={14} sx={{ color: 'text.disabled' }}>heroicons-solid:map-pin</FuseSvgIcon>
                   <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                     {farm.location || 'Sin ubicación'}
                   </Typography>
                </Box>
              </Box>
            </Box>
            <Chip
              label={farm.is_active ? "Activo" : "Inactivo"}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 800,
                bgcolor: alpha(farm.is_active ? theme.palette.success.main : theme.palette.error.main, 0.1),
                color: farm.is_active ? theme.palette.success.main : theme.palette.error.main,
                borderRadius: '6px'
              }}
            />
          </Box>

          {/* Sección de Lotes (Batches) - Estilo Fiori */}
          <Box sx={{ px: 2.5, py: 1.5, flexGrow: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 800, mb: 1, display: 'block', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Lotes Asociados
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
              {farm.batches && farm.batches.length > 0 ? (
                farm.batches.slice(0, 3).map((batch) => (
                  <Chip
                    key={batch.id}
                    label={batch.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderColor: alpha(theme.palette.text.primary, 0.1),
                      bgcolor: alpha(theme.palette.text.primary, 0.02),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: 'primary.main' }
                    }}
                  />
                ))
              ) : (
                <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  Sin lotes registrados
                </Typography>
              )}
              {farm.batches && farm.batches.length > 3 && (
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, mt: 0.5 }}>
                  +{farm.batches.length - 3} más
                </Typography>
              )}
            </Stack>
          </Box>

          <Divider sx={{ mx: 2, opacity: 0.5 }} />

          {/* Footer de la Tarjeta */}
          <Box sx={{ p: 2, px: 2.5, bgcolor: alpha(theme.palette.text.primary, 0.015), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={3}>
               <Box>
                 <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>RENSPA</Typography>
                 <Typography variant="body2" sx={{ fontWeight: 750, color: 'text.primary', fontSize: '0.85rem' }}>{farm.renspa || 'N/A'}</Typography>
               </Box>
               <Box>
                 <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, display: 'block', fontSize: '0.65rem' }}>CARAVANAS</Typography>
                 <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main', fontSize: '0.85rem' }}>
                   {farm.caravans_count || 0}
                 </Typography>
               </Box>
            </Stack>
            
            <Tooltip title="Ver detalles del establecimiento">
              <IconButton 
                size="small" 
                sx={{ 
                  bgcolor: 'background.paper', 
                  border: 1, 
                  borderColor: 'divider',
                  '&:hover': { bgcolor: theme.palette.primary.main, color: '#fff', borderColor: theme.palette.primary.main } 
                }}
              >
                <FuseSvgIcon size={18}>heroicons-solid:arrow-right</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
