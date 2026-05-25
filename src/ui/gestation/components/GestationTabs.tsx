import { Tabs, Tab, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/**
 * GestationTabs Component
 * Unified sub-navigation bar for all gestation-related routes.
 */
function GestationTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/gestation/tacto')) return 2;
    if (path.includes('/gestation/list')) return 3;
    if (path.includes('/gestation/service-orders')) return 1;
    // Exactly matches the main /gestation dashboard
    return 0;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate('/gestation');
    else if (newValue === 1) navigate('/gestation/service-orders');
    else if (newValue === 2) navigate('/gestation/tacto');
    else if (newValue === 3) navigate('/gestation/list');
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        mb: 4, 
        p: 0.75, 
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
      }} 
      className="no-print"
    >
      <Tabs
        value={getActiveTab()}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        TabIndicatorProps={{
          style: {
            display: 'none'
          }
        }}
        sx={{
          minHeight: 40,
          '& .MuiTabs-flexContainer': {
            gap: 1,
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.85rem',
            minHeight: 40,
            py: 1,
            px: 2.5,
            borderRadius: '8px',
            color: 'text.secondary',
            transition: 'all 0.2s ease-in-out',
            gap: 1,
            '&:hover': {
              color: 'text.primary',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-selected': {
              color: 'primary.main',
              bgcolor: 'background.paper',
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
                : '0 4px 12px rgba(0, 0, 0, 0.06)',
              border: '1px solid',
              borderColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            }
          }
        }}
      >
        <Tab
          icon={<FuseSvgIcon size={18}>heroicons-outline:chart-bar</FuseSvgIcon>}
          iconPosition="start"
          label="Dashboard"
        />
        <Tab
          icon={<FuseSvgIcon size={18}>heroicons-outline:queue-list</FuseSvgIcon>}
          iconPosition="start"
          label="Órdenes de Servicio"
        />
        <Tab
          icon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
          iconPosition="start"
          label="Tactos y Ecografías"
        />
        <Tab
          icon={<FuseSvgIcon size={18}>heroicons-outline:heart</FuseSvgIcon>}
          iconPosition="start"
          label="Monitoreo Gestacional"
        />
      </Tabs>
    </Box>
  );
}

export default GestationTabs;
