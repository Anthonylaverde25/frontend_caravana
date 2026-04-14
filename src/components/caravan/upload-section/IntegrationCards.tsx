import { 
  Box, 
  Typography, 
  Card, 
  CardActionArea,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Alert
} from '@mui/material';
import { 
  Link as LinkIcon,
  CloudSync as CloudSyncIcon,
  Info as InfoIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const IntegrationCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  border: '1px solid #dadce0',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#f8f9fa',
    borderColor: '#dadce0',
    boxShadow: '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)',
  },
}));

interface IntegrationCardsProps {
  isConnected: boolean;
  isDriveLoading: boolean;
  openPicker: () => void;
  disconnect: () => void;
}

/**
 * IntegrationCards Component
 * Handles the sidebar with external integration options (Drive, SharePoint, etc.)
 */
const IntegrationCards = ({ isConnected, isDriveLoading, openPicker, disconnect }: IntegrationCardsProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <IntegrationCard sx={{ position: 'relative', overflow: 'visible' }}>
        <CardActionArea 
          onClick={() => !isDriveLoading ? openPicker() : undefined}
          disabled={isDriveLoading}
          sx={{ 
            p: 3, 
            display: 'flex', 
            justifyContent: 'flex-start', 
            gap: 3,
            ...(isConnected && {
              bgcolor: alpha('#1a73e8', 0.03),
              '&:hover': { bgcolor: alpha('#1a73e8', 0.06) }
            })
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDepuxyOolNS-UbkNfx8KmzmxQbTeYnY3HtZXtjlXkAgXItjTw_YfJn_ivO5Ga5mN4w4nT8ioqPPhUNg1ZGQKPM0sfEO7TLpbN0f5nz4TexGKkfghSLrKME69amXG9ww4k9BzmRfFGqY6jZUJGdSvZTwPocyotouDyfX0cRk54Z_od5hhnSZEmOYEd9F5U4sL8rc-IcsIXnZvKR93h4IQoG597amfzdrtkcYQyWVBESTlfTvPVdoUgypHSJKYDLCU_tTm7JUDSzVB5r" 
              sx={{ width: 44, height: 44, borderRadius: 1 }} 
            />
            {isConnected && (
              <Avatar 
                sx={{ 
                  position: 'absolute', 
                  top: -6, 
                  right: -6, 
                  width: 20, 
                  height: 20, 
                  bgcolor: 'primary.main',
                  border: '2px solid white',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                <CheckIcon sx={{ fontSize: 13, color: 'white' }} />
              </Avatar>
            )}
          </Box>
          <Box sx={{ flexGrow: 1, pr: isConnected ? 4 : 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              Google Drive
              {isConnected && (
                <Chip 
                  label="Connected" 
                  size="small" 
                  color="primary" 
                  variant="filled"
                  sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800, borderRadius: 1 }}
                />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isConnected ? 'Session active' : 'Import from your workspace'}
            </Typography>
          </Box>
        </CardActionArea>
        {isConnected && (
          <Tooltip title="Disconnect account">
            <IconButton 
              size="small"
              onClick={(e) => { e.stopPropagation(); disconnect(); }}
              sx={{ 
                position: 'absolute', 
                right: 12, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'text.secondary',
                '&:hover': { color: 'error.main', bgcolor: alpha('#d32f2f', 0.05) },
                zIndex: 2,
                transition: 'all 0.2s'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            </IconButton>
          </Tooltip>
        )}
      </IntegrationCard>

      <IntegrationCard>
        <CardActionArea sx={{ p: 3, display: 'flex', justifyContent: 'flex-start', gap: 3 }}>
          <Avatar sx={{ bgcolor: alpha('#1a73e8', 0.05), color: '#1a73e8', width: 44, height: 44, borderRadius: 2 }}>
            <LinkIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1">Direct URL</Typography>
            <Typography variant="body2" color="text.secondary">Fetch from a public link</Typography>
          </Box>
        </CardActionArea>
      </IntegrationCard>

      <IntegrationCard>
        <CardActionArea sx={{ p: 3, display: 'flex', justifyContent: 'flex-start', gap: 3 }}>
          <Avatar sx={{ bgcolor: alpha('#1a73e8', 0.05), color: '#1a73e8', width: 44, height: 44, borderRadius: 2 }}>
            <CloudSyncIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1">SharePoint</Typography>
            <Typography variant="body2" color="text.secondary">Connect enterprise repo</Typography>
          </Box>
        </CardActionArea>
      </IntegrationCard>

      <Box>
        <Alert 
          severity="info" 
          icon={<InfoIcon fontSize="small" />}
          sx={{ 
            borderRadius: 4, 
            bgcolor: alpha('#1a73e8', 0.04), 
            border: '1px solid',
            borderColor: alpha('#1a73e8', 0.1),
            '& .MuiAlert-message': { fontSize: '0.8rem', color: 'text.secondary', py: 1 } 
          }}
        >
          Ensure all spreadsheets contain a header row.
        </Alert>
      </Box>
    </Box>
  );
};

export default IntegrationCards;
