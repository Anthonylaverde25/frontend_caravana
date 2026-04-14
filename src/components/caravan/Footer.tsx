import { Box, Typography, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        width: '100%', 
        bgcolor: 'background.paper', 
        borderTop: 1, 
        borderColor: 'divider', 
        height: 32, 
        px: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: '#4caf50', 
              mr: 1,
              boxShadow: `0 0 0 2px ${alpha('#4caf50', 0.2)}`
            }} 
          />
          <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 500, color: 'text.secondary' }}>
            System Ready
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 500, color: 'text.secondary' }}>
          Last Sync: 10:42 AM
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 500, color: 'text.secondary' }}>
          Fiori Enterprise v4.2.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
