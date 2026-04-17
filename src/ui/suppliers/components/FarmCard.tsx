import { Box, Typography, Paper, IconButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FarmFormValues } from './SupplierSchema';

interface FarmCardProps {
  farm: FarmFormValues;
  onRemove: () => void;
}

/**
 * FarmCard Component
 * Displays a summary of a farm in a Fiori-styled card.
 */
function FarmCard({ farm, onRemove }: FarmCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        px: 2,
        bgcolor: '#f8f9fa',
        border: '1px solid #d8dde6',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {farm.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {farm.city}{farm.province ? `, ${farm.province}` : ''}
        </Typography>
      </Box>
      <IconButton 
        size="small" 
        onClick={onRemove}
        sx={{ color: '#e53935' }}
      >
        <FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>
      </IconButton>
    </Paper>
  );
}

export default FarmCard;
