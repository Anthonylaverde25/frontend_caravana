import { AppBar, Toolbar, Typography, Box, InputBase, Badge, Avatar, IconButton, Tabs, Tab } from '@mui/material';
import { Search as SearchIcon, Notifications as NotificationsIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Header = () => {
  return (
    <AppBar position="fixed" color="inherit" elevation={1} sx={{ backgroundColor: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 700,
              color: 'primary.main',
              mr: 4
            }}
          >
            Fiori Enterprise
          </Typography>
          <Tabs value={2} sx={{ minHeight: 48 }}>
            <Tab label="Dashboard" sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }} />
            <Tab label="Analytics" sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }} />
            <Tab label="Inventory" sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }} />
            <Tab label="Requests" sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }} />
            <Tab label="Reports" sx={{ textTransform: 'none', minWidth: 'auto', px: 2 }} />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          <IconButton size="large" color="inherit">
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton size="large" color="inherit">
            <SettingsIcon />
          </IconButton>

          <Avatar
            sx={{ ml: 2, width: 32, height: 32 }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUkOsWGNk6H663yjRRu9M7wup0DEgYGvOxPYJNW25bn1y1swArhbSZkFilKLgjBLazcpbTps4QGT8u2G2XPJdvbi0uPBeMv0SdszolEuKLynBwMS7iD1d7kL1LtbSTEA04SxDRsSqVc8GcBrRneFxykQlcEFXBUpXT7jQW6cUJTEAXMi19Wb1Z9C37mHlmh2bG9RHKdU59dMRcoG64QboP2JYRhwxPFBLEApw_kAyCmpe0UR9hdEDF9VwcArHJ808mSjMVjC_A9vZe"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
