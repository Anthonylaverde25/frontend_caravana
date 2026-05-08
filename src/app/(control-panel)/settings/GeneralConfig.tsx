import { Container, Box, Paper, Typography, Grid, Stack, Chip, Button, CircularProgress, Divider } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import { useCompany } from '@/contexts/CompanyContext';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';

/**
 * GeneralConfig Component
 * Minimalist design with Company Info integrated into the ViewHeader.
 */
export default function GeneralConfig() {
  const navigate = useNavigate();
  const { activeCompanyId, companies } = useCompany();
  const { data: breeds = [], isLoading: isLoadingBreeds } = useBreeds();

  const activeCompany = companies.find(c => c.id === activeCompanyId);

  const TEETH_OPTIONS = [
    { value: 0, label: '0 (Boca Vacía)', desc: 'Animal joven / Ternero' },
    { value: 2, label: '2 Dientes', desc: 'Categoría Invernada' },
    { value: 4, label: '4 Dientes', desc: 'Desarrollo intermedio' },
    { value: 6, label: '6 Dientes', desc: 'Pre-adultez' },
    { value: 8, label: '8 (Boca Llena)', desc: 'Animal adulto completo' },
  ];

  const CompanyHeaderInfo = (
    <Stack 
      direction="row" 
      spacing={2} 
      alignItems="center" 
      divider={<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto', borderColor: '#e2e8f0' }} />}
      sx={{ 
        bgcolor: '#f8fafc', 
        px: 2, 
        py: 1, 
        borderRadius: '8px', 
        border: '1px solid #e2e8f0' 
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>EMPRESA:</Typography>
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>
          {activeCompany?.name || 'Cargando...'}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>RENSPA:</Typography>
        <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>
          {activeCompany?.renspa || 'N/D'}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', xl: 'flex' } }}>
        <FuseSvgIcon size={14} className="text-slate-400">heroicons-outline:location-marker</FuseSvgIcon>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
          {activeCompany?.location || 'Sede Central'}
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 0,
        px: 0,
        bgcolor: '#ffffff',
        minHeight: '100vh'
      }}
    >
      {/* 1. ViewHeader con información integrada en 'actions' */}
      <ViewHeader
        title="Configuración General"
        subtitle="Parámetros globales y catálogos biológicos."
        actions={CompanyHeaderInfo}
        backUrl="/batches"
        backTitle="Volver"
      />

      {/* 2. Cuerpo de la página */}
      <Box component="main" sx={{ p: 2 }}>
        <Grid container spacing={4}>
          {/* Dentición */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FuseSvgIcon size={18} className="text-amber-600">heroicons-outline:identification</FuseSvgIcon>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Escala de Dentición
              </Typography>
            </Box>
            
            <Paper elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
              {TEETH_OPTIONS.map((option, index) => (
                <Box 
                  key={option.value}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.8,
                    px: 2.5,
                    bgcolor: index % 2 === 0 ? '#f8fafc' : '#ffffff',
                    borderBottom: index < TEETH_OPTIONS.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <Stack direction="row" spacing={2.5} alignItems="center">
                     <Typography variant="body2" sx={{ fontWeight: 900, color: '#b45309', minWidth: 24 }}>{option.value}D</Typography>
                     <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>{option.label}</Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>{option.desc}</Typography>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Catálogo de Razas */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <FuseSvgIcon size={18} className="text-emerald-600">heroicons-outline:tag</FuseSvgIcon>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Catálogo Genético
                </Typography>
                <Chip label={breeds.length} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800, color: 'text.secondary' }} />
              </Stack>
              
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/breeds')}
                sx={{ fontWeight: 800, textTransform: 'none', color: 'primary.main', fontSize: '0.8rem' }}
                endIcon={<FuseSvgIcon size={16}>heroicons-outline:chevron-right</FuseSvgIcon>}
              >
                Gestionar Catálogo
              </Button>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)'
              },
              gap: 2
            }}>
              {isLoadingBreeds ? (
                Array.from(new Array(8)).map((_, index) => (
                  <Box key={index} sx={{ height: 48, bgcolor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }} />
                ))
              ) : breeds.map((breed) => (
                <Paper
                  key={breed.id}
                  elevation={0}
                  sx={{
                    p: 1.8,
                    px: 2.5,
                    borderRadius: '10px',
                    border: '1px solid #f1f5f9',
                    bgcolor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.25s',
                    cursor: 'default',
                    '&:hover': {
                      borderColor: 'primary.200',
                      bgcolor: '#f0f7ff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                    {breed.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 800, fontSize: '0.7rem' }}>#{breed.id}</Typography>
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}