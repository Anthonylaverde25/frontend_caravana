import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';

export default function AnimalCategoriesSection() {
  const { data: categories = [], isLoading, isError } = useAnimalCategories();

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
            heroicons-outline:user-group
          </FuseSvgIcon>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Categorías Zootécnicas & Clasificación
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Clasificación etaria y reproductiva de la hacienda bovina, rangos de peso objetivo y subcategorías.
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={`${categories.length} Categorías Base`}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            fontSize: '0.72rem',
            height: 24,
            color: '#334155',
            borderColor: '#cbd5e1',
          }}
        />
      </Paper>

      {/* Categories Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : isError ? (
        <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="body2">Error al cargar categorías zootécnicas.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid key={category.id} size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {category.name}
                        </Typography>
                        <Box
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#64748b',
                            bgcolor: '#f1f5f9',
                            px: 0.75,
                            py: 0.15,
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {category.code}
                        </Box>
                      </Stack>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        Sexo: <strong>{category.sex === 'H' ? 'Hembra' : category.sex === 'M' ? 'Macho' : 'Ambos'}</strong>
                      </Typography>
                    </Box>

                    {category.is_reproductive ? (
                      <Chip
                        label="Reproductivo"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label="No Reproductivo"
                        size="small"
                        variant="outlined"
                        sx={{ height: 22, fontSize: '0.68rem', fontWeight: 500, borderColor: '#e2e8f0', color: '#64748b' }}
                      />
                    )}
                  </Stack>

                  {category.description && (
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', mb: 1.5 }}>
                      {category.description}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={2.5} sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
                        Edad
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                        {category.min_age_months} a {category.max_age_months ?? '∞'} m
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.7rem' }}>
                        Peso Referencia
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                        {category.min_weight_kg ?? 'N/D'} - {category.max_weight_kg ?? 'N/D'} kg
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Subcategories */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.75 }}>
                      Subcategorías:
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {category.subcategories.map((sub) => (
                        <Box
                          key={sub.id}
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            color: '#334155',
                            px: 1,
                            py: 0.25,
                          }}
                        >
                          {sub.name}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
