import { useState } from 'react';
import { Box, MenuItem, CircularProgress, Typography, Button, Menu, alpha } from '@mui/material';
import { useCompany } from '@/contexts/CompanyContext';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const CompanySelector = () => {
  const { activeCompanyId, setActiveCompanyId, companies, loading, error } = useCompany();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (id: number) => {
    setActiveCompanyId(id);
    handleClose();
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
        <Typography color="error" variant="caption">Error cargando empresas</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {loading ? (
        <CircularProgress size={16} sx={{ mx: 2 }} />
      ) : companies.length > 0 ? (
        <>
          <Button
            id="company-selector-button"
            aria-controls={open ? 'company-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            startIcon={
              <FuseSvgIcon size={20} color="action">
                heroicons-outline:office-building
              </FuseSvgIcon>
            }
            endIcon={
              <FuseSvgIcon size={16} className="transition-transform duration-200" sx={{ transform: open ? 'rotate(180deg)' : 'none' }}>
                heroicons-mini:chevron-down
              </FuseSvgIcon>
            }
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 13,
              py: 1,
              px: 1.5,
              borderRadius: '8px',
              color: 'text.primary',
              backgroundColor: (theme) => open ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            {activeCompany?.name || 'Seleccionar Empresa'}
          </Button>
          <Menu
            id="company-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'company-selector-button',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                Mis Empresas
              </Typography>
            </Box>
            {companies.map((company) => (
              <MenuItem 
                key={company.id} 
                onClick={() => handleSelect(company.id)}
                selected={company.id === activeCompanyId}
                sx={{
                  py: 1.5,
                  px: 2,
                  mx: 1,
                  borderRadius: '8px',
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    fontWeight: 700,
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body2" sx={{ fontWeight: company.id === activeCompanyId ? 700 : 500 }}>
                    {company.name}
                  </Typography>
                  {company.renspa && (
                    <Typography variant="caption" color="text.secondary">
                      {company.renspa}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>Sin empresas</Typography>
      )}
    </Box>
  );
};

export default CompanySelector;
