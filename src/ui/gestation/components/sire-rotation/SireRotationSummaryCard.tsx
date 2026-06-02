import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface Caravan {
  id: number;
  identification: string;
  sex: string;
  category?: string;
  active_gestation?: any;
  batch_id?: number | null;
  breed?: string;
  current_weight?: number;
}

interface SireRotationSummaryCardProps {
  activeBatchName: string | null;
  orderCode: string;
  startDate: string;
  serviceType: 'single' | 'rotation' | 'multi';
  isControlledService: boolean;
  selectedSireIds: number[];
  selectedCowCount: number;
  observations: string;
  availableBulls: Caravan[];
  femaleSireAssignments: Map<number, number>;
  selectedFemaleIds: number[];
  borderStyle: string;
}

function SireRotationSummaryCard({
  activeBatchName,
  orderCode,
  startDate,
  serviceType,
  isControlledService,
  selectedSireIds,
  selectedCowCount,
  observations,
  availableBulls,
  femaleSireAssignments,
  selectedFemaleIds,
  borderStyle
}: SireRotationSummaryCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 0, 
        border: borderStyle,
        boxShadow: 'none',
        overflow: 'hidden',
        background: isDark ? '#1e293b' : '#ffffff'
      }}
    >
      {/* Summary Header (SAP Fiori solid blue header) */}
      <Box 
        sx={{ 
          p: 2.5, 
          color: '#ffffff',
          background: isDark ? '#1e3a8a' : '#0f5b94',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderRadius: 0
        }}
      >
        <FuseSvgIcon size={20}>heroicons-outline:document-plus</FuseSvgIcon>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.2px' }}>
            Orden en Construcción
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.72rem', display: 'block', mt: 0.25 }}>
            Resumen operativo y métricas
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3.5}>
          
          {/* METADATA LIST */}
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Lote de Trabajo:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>
                {activeBatchName || <span style={{ color: theme.palette.text.disabled, fontStyle: 'italic', fontWeight: 500 }}>Sin Lote</span>}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Código de Orden:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {orderCode || <span style={{ color: theme.palette.text.disabled, fontStyle: 'italic', fontWeight: 500 }}>No especificado</span>}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Fecha de Inicio:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {startDate}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Modalidad:
              </Typography>
              <Chip
                label={
                  serviceType === 'single'
                    ? 'Toro Único'
                    : serviceType === 'rotation'
                    ? 'Rotativo Colectivo'
                    : isControlledService
                    ? 'Multi-Toro (Controlado)'
                    : 'Multi-Toro (Colectivo)'
                }
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.68rem', borderRadius: 0 }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Toros Asignados:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {selectedSireIds.length === 1 ? '1 toro' : `${selectedSireIds.length} toros`}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Vientres Seleccionados:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {selectedCowCount === 1 ? '1 vientre' : `${selectedCowCount} vientres`}
              </Typography>
            </Box>

            {serviceType === 'multi' && isControlledService && selectedSireIds.length > 0 && (
              <Box sx={{ p: 1.5, mt: 1, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa', border: borderStyle }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem' }}>
                  Distribución de Toros
                </Typography>
                <Stack spacing={0.75}>
                  {selectedSireIds.map(id => {
                    const bull = availableBulls.find(b => b.id === id);
                    const count = Array.from(femaleSireAssignments.entries())
                      .filter(([femId, sireId]) => selectedFemaleIds.includes(femId) && sireId === id)
                      .length;
                    return (
                      <Box key={id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.72rem' }}>
                          {bull?.identification || `#${id}`}:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>
                          {count === 1 ? '1 vientre' : `${count} vientres`}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Stack>

          {observations.trim() && (
            <>
              <Divider />
              <Box sx={{ p: 1.5, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa', border: borderStyle }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem' }}>
                  Observaciones
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', fontStyle: 'italic', maxHeight: 80, overflowY: 'auto' }}>
                  "{observations}"
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default SireRotationSummaryCard;
