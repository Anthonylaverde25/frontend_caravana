import { Container, Box, Paper, TextField, Button, Stack, Typography } from '@mui/material';
import ViewHeader from 'src/components/ViewHeader';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { useState } from 'react';

/**
 * CreateSupplierView Component
 * Dedicated page for registering new providers with associated farm data.
 * Styled following SAP Fiori design principles.
 */
function CreateSupplierView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    navigate('/suppliers');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement actual save logic using application layer
    console.log('Guardando proveedor y granja...');
    setTimeout(() => {
      setLoading(false);
      navigate('/suppliers');
    }, 1000);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 6 },
        bgcolor: '#f2f2f2', // Fondo general gris muy claro tipo SAP Fiori
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <ViewHeader
        title="Crear Nuevo Proveedor"
        subtitle="Siga los estándares corporativos para el registro de nuevos orígenes y establecimientos."
        actions={
          <Button
            variant="text"
            onClick={handleCancel}
            startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>}
            sx={{ color: '#0a6ed1', fontWeight: 600, textTransform: 'none' }}
          >
            Volver al Listado
          </Button>
        }
      />

      <Box component="main" sx={{ mt: 2, pb: 12 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: '8px',
            border: '1px solid #d8dde6',
            bgcolor: '#ffffff'
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={5}>

              {/* Sección: Identificación Legal */}
              <Stack spacing={3}>
                <Typography variant="overline" sx={{ color: '#6a6d70', fontWeight: 700, letterSpacing: '1px', borderLeft: '3px solid #0a6ed1', pl: 1.5 }}>
                  Identificación Legal y Fiscal
                </Typography>

                <div className="flex flex-col md:flex-row gap-24">
                  <TextField
                    label="Nombre / Razón Social"
                    variant="filled"
                    required
                    fullWidth
                    name="name"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                  <TextField
                    label="Nombre Comercial"
                    variant="filled"
                    fullWidth
                    name="commercial_name"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-24">
                  <TextField
                    label="CUIT / Identificación Fiscal"
                    variant="filled"
                    required
                    fullWidth
                    name="cuit"
                    placeholder="XX-XXXXXXXX-X"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                  <TextField
                    label="Categoría IVA"
                    variant="filled"
                    fullWidth
                    name="iva_category"
                    placeholder="Ej: Responsable Inscripto"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                </div>
              </Stack>

              <Separator />

              {/* Sección: Comunicación y Contacto */}
              <Stack spacing={3}>
                <Typography variant="overline" sx={{ color: '#6a6d70', fontWeight: 700, letterSpacing: '1px', borderLeft: '3px solid #0a6ed1', pl: 1.5 }}>
                  Comunicación y Contacto
                </Typography>

                <div className="flex flex-col md:flex-row gap-24">
                  <TextField
                    label="Email de Contacto"
                    variant="filled"
                    type="email"
                    fullWidth
                    name="email"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                  <TextField
                    label="Teléfono / WhatsApp"
                    variant="filled"
                    fullWidth
                    name="phone"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                </div>

                <TextField
                  label="Dirección Administrativa"
                  variant="filled"
                  multiline
                  rows={2}
                  fullWidth
                  name="location"
                  sx={{ bgcolor: '#f7f7f7' }}
                />
              </Stack>

              <Separator />

              {/* Sección: Establecimiento Asociado */}
              <Stack spacing={3}>
                <Typography variant="overline" sx={{ color: '#6a6d70', fontWeight: 700, letterSpacing: '1px', borderLeft: '3px solid #0a6ed1', pl: 1.5 }}>
                  Información del Establecimiento / Granja
                </Typography>

                <TextField
                  label="Nombre de la Granja Principal"
                  variant="filled"
                  required
                  fullWidth
                  name="farm_name"
                  placeholder="Ej: La Esperanza"
                  sx={{ bgcolor: '#f7f7f7' }}
                />

                <div className="flex flex-col md:flex-row gap-24">
                  <TextField
                    label="País"
                    variant="filled"
                    fullWidth
                    name="farm_country"
                    defaultValue="Argentina"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                  <TextField
                    label="Provincia / Estado"
                    variant="filled"
                    fullWidth
                    name="farm_province"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-24">
                  <TextField
                    label="Ciudad"
                    variant="filled"
                    fullWidth
                    name="farm_city"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                  <TextField
                    label="Código Postal"
                    variant="filled"
                    fullWidth
                    name="farm_zip"
                    sx={{ bgcolor: '#f7f7f7' }}
                  />
                </div>
              </Stack>

            </Stack>

            {/* Toolbar de Acciones Estilo Fiori (Sticky at bottom) */}
            <Box 
              sx={{ 
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: '#eff4f9',
                p: 2,
                px: { xs: 4, md: 8 },
                borderTop: '1px solid #d8dde6',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                zIndex: 1000
              }}
            >
              <Button
                color="inherit"
                onClick={handleCancel}
                sx={{ fontWeight: 600, textTransform: 'none', color: '#0a6ed1' }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#0a6ed1',
                  color: '#ffffff',
                  px: 6,
                  py: 1.2,
                  fontWeight: 800,
                  borderRadius: '6px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#0854a1', boxShadow: 'none' }
                }}
              >
                {loading ? 'Procesando...' : 'Crear Proveedor'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

/**
 * Simple separator for form sections.
 */
function Separator() {
  return <Box sx={{ borderBottom: '1px solid', borderColor: '#e5e5e5', width: '100%', opacity: 0.5 }} />;
}

export default CreateSupplierView;
