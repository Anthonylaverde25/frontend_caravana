import React from 'react';
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
  useTheme,
  CircularProgress,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCaravanDetail } from '@/features/caravans/hooks/useCaravanDetail';

type CaravanDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  caravanId?: number | null;
  caravanIdentification?: string | null;
};

export function CaravanDetailDrawer({
  open,
  onClose,
  caravanId,
  caravanIdentification,
}: CaravanDetailDrawerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: caravan, isLoading } = useCaravanDetail(open ? caravanId : null);

  const displayId = caravan?.identification || caravanIdentification || (caravanId ? `${caravanId}` : '-');

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          borderRadius: 0,
          border: 'none',
          boxShadow: (theme) => theme.shadows[10],
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header Section */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.04),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
                FICHA TÉCNICA INDIVIDUAL
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: 'monospace' }}>
                #{displayId}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
            </IconButton>
          </Stack>
        </Box>

        {/* Content Body */}
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, gap: 2 }}>
              <CircularProgress size={36} />
              <Typography variant="body2" color="text.secondary">
                Cargando información completa de la caravana...
              </Typography>
            </Box>
          ) : !caravan ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No se encontró información para esta caravana.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Technical Specifications Grid */}
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>
                  DATOS ZOOTÉCNICOS
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 1.5, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                      CATEGORÍA
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {caravan.category_name || caravan.category || '-'}
                    </Typography>
                    {caravan.subcategory_name && (
                      <Typography variant="caption" color="text.secondary">
                        {caravan.subcategory_name}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                      SEXO
                    </Typography>
                    <Box sx={{ mt: 0.3 }}>
                      <Chip
                        label={caravan.sex === 'M' ? 'Macho' : 'Hembra'}
                        size="small"
                        color={caravan.sex === 'M' ? 'info' : 'secondary'}
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ p: 1.5, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                      RAZA
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {caravan.breed || '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                      DENTICIÓN
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {caravan.teeth !== null ? `${caravan.teeth} dientes` : '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, borderRight: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                      PESO ACTUAL
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {caravan.current_weight ? `${caravan.current_weight} kg` : '-'}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                      PESO DE INGRESO
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {caravan.entry_weight ? `${caravan.entry_weight} kg` : '-'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Location & Batch */}
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>
                  UBICACIÓN & RODEADO
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Lote / Tropa:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{caravan.batch_name || 'Sin Asignar'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Establecimiento:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{caravan.farm_name || '-'}</Typography>
                    </Box>
                    {caravan.renspa && caravan.renspa !== 'NO_DEFINIDO' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">RENSPA:</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{caravan.renspa}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Box>

              {/* Reproduction Section (if Female) */}
              {caravan.sex === 'H' && (
                <Box>
                  <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>
                    ESTADO REPRODUCTIVO
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Diagnóstico:</Typography>
                        <Chip
                          label={
                            caravan.physiological_state?.is_pregnant || (caravan.female_details && !caravan.female_details.is_empty)
                              ? 'PREÑADA'
                              : 'VACÍA'
                          }
                          size="small"
                          color={
                            caravan.physiological_state?.is_pregnant || (caravan.female_details && !caravan.female_details.is_empty)
                              ? 'success'
                              : 'default'
                          }
                          sx={{ height: 22, fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      </Box>
                      {caravan.active_gestation && (
                        <>
                          <Divider />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">Meses de Gestación:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {caravan.active_gestation.gestation_months || 0} meses
                            </Typography>
                          </Box>
                          {caravan.active_gestation.estimated_due_date && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">Parto Estimado:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                {caravan.active_gestation.estimated_due_date}
                              </Typography>
                            </Box>
                          )}
                        </>
                      )}
                    </Stack>
                  </Paper>
                </Box>
              )}

              {/* Lineage Section */}
              {caravan.lineage && (
                <Box>
                  <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>
                    GENEALOGÍA & LINAJE
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Madre (Vientre):</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          {caravan.lineage.mother_identification || 'No registrada'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">Padre (Toro / Semen):</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                          {caravan.lineage.father_identification || 'No registrado'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

export default CaravanDetailDrawer;
