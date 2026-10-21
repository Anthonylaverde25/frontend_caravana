import { Box, Paper, Typography, Grid, Stack, Divider, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import CompanyCuitInfo from '../../CompanyCuitInfo';

export default function CompanyGeneralSection() {
  const { activeCompanyId, companies } = useCompany();
  const activeCompany = companies.find((c) => c.id === activeCompanyId);

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
            heroicons-outline:building-office-2
          </FuseSvgIcon>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
              {activeCompany?.name || 'Empresa Ganadera'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Identificación fiscal, operativa y sanitaria del establecimiento
            </Typography>
          </Box>
        </Stack>

        <Chip
          label="Empresa Activa"
          color="success"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24 }}
        />
      </Paper>

      {/* Main Attributes Grid */}
      <Grid container spacing={2}>
        {/* Razón Social */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Nombre de Fantasía / Razón Social
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mt: 0.5 }}>
              {activeCompany?.name || 'Sin especificar'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.75 }}>
              Identificador legal en comprobantes fiscales y remitos zootécnicos.
            </Typography>
          </Paper>
        </Grid>

        {/* RENSPA */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Registro Nacional Sanitario (RENSPA)
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5, fontFamily: 'monospace' }}>
              {activeCompany?.renspa || 'No declarado'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.75 }}>
              Código unívoco emitido por SENASA para el movimiento y trazabilidad de tropas.
            </Typography>
          </Paper>
        </Grid>

        {/* CUIT & Comprobantes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Identificación Tributaria (CUIT)
            </Typography>
            <Box sx={{ mt: 1 }}>
              <CompanyCuitInfo company={activeCompany} />
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.75 }}>
              Receptor fiscal de facturas y vinculación con AFIP/ARCA.
            </Typography>
          </Paper>
        </Grid>

        {/* Sede / Domicilio */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              height: '100%',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ubicación / Sede Operativa
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <FuseSvgIcon size={16} sx={{ color: '#94a3b8' }}>heroicons-outline:map-pin</FuseSvgIcon>
              <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b' }}>
                {activeCompany?.location || 'Sede Central'}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.75 }}>
              Jurisdicción base y radicación de establecimientos y campos productivos.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
