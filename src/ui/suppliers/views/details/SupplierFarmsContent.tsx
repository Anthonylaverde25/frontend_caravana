import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Farm } from '@/core/suppliers/domain/entities/Farm';
import { FarmsCardsView } from './farms/FarmsCardsView';
import { FarmsTableView } from './farms/FarmsTableView';

interface SupplierFarmsContentProps {
  farms: Farm[];
  viewMode: 'cards' | 'table';
  onViewModeChange: (event: React.MouseEvent<HTMLElement>, nextView: 'cards' | 'table') => void;
  onAddNewFarm: () => void;
}

export const SupplierFarmsContent = ({
  farms,
  viewMode,
  onViewModeChange,
  onAddNewFarm
}: SupplierFarmsContentProps) => {

  return (
    <Box sx={{
      p: 6,
      maxWidth: '1200px',
      bgcolor: (theme) => theme.palette.mode === 'light' ? '#f2f2f2' : 'transparent',
      flexGrow: 1
    }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Typography sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1.1rem' }}>
            Establecimientos Asociados ({farms.length})
          </Typography>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={onViewModeChange}
            size="small"
            sx={{
              height: 32,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '& .MuiToggleButton-root': {
                px: 1,
                border: 'none',
                '&.Mui-selected': {
                  bgcolor: (theme) => alpha(theme.palette.mode === 'light' ? '#0a6ed1' : theme.palette.primary.main, 0.1),
                  color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main',
                }
              }
            }}
          >
            <ToggleButton value="cards">
              <Tooltip title="Tarjetas">
                <Box sx={{ display: 'flex' }}>
                  <FuseSvgIcon size={18}>heroicons-outline:squares-2x2</FuseSvgIcon>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="table">
              <Tooltip title="Tabla">
                <Box sx={{ display: 'flex' }}>
                  <FuseSvgIcon size={18}>heroicons-outline:table-cells</FuseSvgIcon>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            size="small"
            onClick={onAddNewFarm}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-small</FuseSvgIcon>}
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '6px',
              boxShadow: 'none',
              '&:hover': { bgcolor: (theme) => theme.palette.mode === 'light' ? '#0854a1' : 'primary.dark', boxShadow: 'none' }
            }}
          >
            Nueva Finca
          </Button>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />
          <Button
            size="small"
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:funnel</FuseSvgIcon>}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: (theme) => theme.palette.mode === 'light' ? '#0a6ed1' : 'primary.main'
            }}
          >
            Filtrar
          </Button>
        </Stack>
      </Box>

      {/* Conditional Rendering of Views */}
      {viewMode === 'cards' ? (
        <FarmsCardsView farms={farms} />
      ) : (
        <FarmsTableView farms={farms} />
      )}

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled">
          Mostrando {farms.length} establecimientos.
        </Typography>
      </Box>
    </Box>
  );
};
