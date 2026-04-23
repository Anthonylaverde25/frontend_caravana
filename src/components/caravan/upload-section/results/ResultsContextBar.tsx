import { Box, Typography, Stack, Chip, alpha } from '@mui/material';
import { 
  Inventory2Outlined as BatchIcon, 
  CheckCircleOutline as SuccessIcon, 
  AddCircleOutline as NewIcon, 
  HelpOutline as UnknownIcon 
} from '@mui/icons-material';
import { DocumentContext } from '../types';

interface ResultsContextBarProps {
  context?: DocumentContext;
}

export const ResultsContextBar = ({ context }: ResultsContextBarProps) => {
  if (!context) return null;

  return (
    <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03) }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5, mr: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BatchIcon sx={{ fontSize: 16 }} />
          Contexto:
        </Typography>

        {/* CUIT / Provider */}
        <Chip
          icon={context.provider_id ? <SuccessIcon sx={{ fontSize: '14px !important' }} /> : <UnknownIcon sx={{ fontSize: '14px !important' }} />}
          label={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>CUIT:</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{context.cuit || 'N/A'}</Typography>
            </Box>
          }
          sx={{
            borderRadius: '6px',
            height: 28,
            border: 'none',
            bgcolor: (theme) => theme.palette.mode === 'dark' 
              ? (context.provider_id ? alpha('#0064d2', 0.2) : alpha('#fff', 0.05))
              : (context.provider_id ? '#eaf2fb' : '#f2f2f2'),
            color: (theme) => theme.palette.mode === 'dark'
              ? (context.provider_id ? '#4dabf7' : '#aaa')
              : (context.provider_id ? '#0064d2' : '#555'),
            '& .MuiChip-icon': { color: 'inherit' }
          }}
        />

        {/* RENSPA / Farm */}
        <Chip
          icon={context.farm_id ? <SuccessIcon sx={{ fontSize: '14px !important' }} /> : <UnknownIcon sx={{ fontSize: '14px !important' }} />}
          label={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>RENSPA:</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{context.renspa || 'N/A'}</Typography>
            </Box>
          }
          sx={{
            borderRadius: '6px',
            height: 28,
            border: 'none',
            bgcolor: (theme) => theme.palette.mode === 'dark' 
              ? (context.farm_id ? alpha('#0064d2', 0.2) : alpha('#fff', 0.05))
              : (context.farm_id ? '#eaf2fb' : '#f2f2f2'),
            color: (theme) => theme.palette.mode === 'dark'
              ? (context.farm_id ? '#4dabf7' : '#aaa')
              : (context.farm_id ? '#0064d2' : '#555'),
            '& .MuiChip-icon': { color: 'inherit' }
          }}
        />

        {/* Lote / Batch */}
        <Chip
          icon={context.batch_id ? <SuccessIcon sx={{ fontSize: '14px !important' }} /> : <NewIcon sx={{ fontSize: '14px !important' }} />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>Lote:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{context.lote || 'Sin nombre'}</Typography>
              </Box>
              <Typography variant="caption" sx={{ 
                fontSize: '0.55rem', 
                fontWeight: 900, 
                textTransform: 'uppercase',
                bgcolor: (theme) => alpha(context.batch_id ? '#0064d2' : '#a06321', theme.palette.mode === 'dark' ? 0.3 : 0.1),
                color: (theme) => theme.palette.mode === 'dark' ? (context.batch_id ? '#4dabf7' : '#ffca28') : (context.batch_id ? '#0064d2' : '#a06321'),
                px: 0.6,
                borderRadius: '4px'
              }}>
                {context.batch_id ? '✓' : 'NUEVO'}
              </Typography>
            </Box>
          }
          sx={{
            borderRadius: '6px',
            height: 28,
            border: 'none',
            bgcolor: (theme) => theme.palette.mode === 'dark' 
              ? (context.batch_id ? alpha('#0064d2', 0.2) : alpha('#a06321', 0.2))
              : (context.batch_id ? '#eaf2fb' : '#fdf6e9'),
            color: (theme) => theme.palette.mode === 'dark'
              ? (context.batch_id ? '#4dabf7' : '#ffca28')
              : (context.batch_id ? '#0064d2' : '#a06321'),
            '& .MuiChip-icon': { color: 'inherit' }
          }}
        />
      </Stack>
    </Box>
  );
};
