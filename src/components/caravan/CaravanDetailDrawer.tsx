import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  Stack, 
  Divider, 
  Paper, 
  Chip, 
  alpha, 
  useTheme 
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

type CaravanDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  caravanIdentification: string | null;
};

// Mock data for movements (Timeline)
const MOCK_MOVEMENTS = [
  { id: 4, type: 'TRANSFER', movementDate: '08 May, 2026', renspa: '12.001.0.00123/01', observations: 'Movimiento a Lote de Engorde A1' },
  { id: 3, type: 'ENTRY', movementDate: '15 Mar, 2026', renspa: '12.001.0.00123/01', observations: 'Ingreso desde Feria Local' },
  { id: 2, type: 'TRANSFER', movementDate: '20 Jan, 2026', renspa: '05.123.0.00999/00', observations: 'Traslado por vacunación' },
  { id: 1, type: 'ORIGIN', movementDate: '10 Jan, 2026', renspa: '05.123.0.00999/00', observations: 'Registro inicial de animal' },
];

const TYPE_CONFIG = {
  ORIGIN: { color: '#757575', icon: 'heroicons-outline:home', label: 'ORIGEN' },
  ENTRY: { color: '#2E7D32', icon: 'heroicons-outline:arrow-down-circle', label: 'ENTRADA' },
  TRANSFER: { color: '#0D47A1', icon: 'heroicons-outline:arrows-right-left', label: 'TRANSFERENCIA' },
  EXIT: { color: '#ED6C02', icon: 'heroicons-outline:arrow-up-circle', label: 'SALIDA' }
};

function CaravanDetailDrawer({ open, onClose, caravanIdentification }: CaravanDetailDrawerProps) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { 
          width: { xs: '100%', sm: 480 }, 
          borderRadius: 0, // Sacamos el redondeado para un look más industrial
          border: 'none',
          boxShadow: (theme) => theme.shadows[10]
        }
      }}
    >
      <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header Section with subtle background */}
        <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.04), borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
                TRAZABILIDAD E HISTORIAL
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#0D47A1' }}>
                #{caravanIdentification}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <FuseSvgIcon size={20}>heroicons-outline:x</FuseSvgIcon>
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          {/* Technical Data Grid - Spreadsheet style */}
          <Box 
            sx={{ 
              mb: 4, 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 1.5, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase' }}>CATEGORÍA</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Novillo</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase' }}>RAZA</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Angus</Typography>
            </Box>
            <Box sx={{ p: 1.5, borderRight: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase' }}>PESO ACTUAL</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>420 kg</Typography>
            </Box>
            <Box sx={{ p: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase' }}>ESTADO</Typography>
              <Box sx={{ mt: 0.2 }}>
                <Chip label="EN POSESIÓN" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, borderRadius: '4px' }} />
              </Box>
            </Box>
          </Box>

          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>
            CRONOLOGÍA DE MOVIMIENTOS
          </Typography>

          {/* Spreadsheet-Style Timeline */}
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '4px', overflow: 'hidden' }}>
            {MOCK_MOVEMENTS.map((movement, index) => {
              const config = TYPE_CONFIG[movement.type];
              return (
                <Box 
                  key={movement.id} 
                  sx={{ 
                    display: 'flex', 
                    borderBottom: index !== MOCK_MOVEMENTS.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) }
                  }}
                >
                  {/* Event Indicator Bar */}
                  <Box sx={{ width: 4, bgcolor: config.color }} />
                  
                  <Box sx={{ p: 2, flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FuseSvgIcon size={16} sx={{ color: config.color }}>{config.icon}</FuseSvgIcon>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: config.color, fontSize: '0.7rem' }}>
                          {config.label}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                        {movement.movementDate}
                      </Typography>
                    </Stack>
                    
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', mb: 1 }}>
                      {movement.observations}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FuseSvgIcon size={12} color="disabled">heroicons-outline:map-pin</FuseSvgIcon>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', fontWeight: 600 }}>
                        {movement.renspa}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

export default CaravanDetailDrawer;
