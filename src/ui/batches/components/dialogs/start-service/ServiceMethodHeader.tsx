import { Box, Chip, FormControlLabel, Paper, Stack, Switch, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { ServiceMethod } from './useStartServiceWizard';

interface ServiceMethodHeaderProps {
  batchName: string;
  method: ServiceMethod;
  onMethodChange: (method: ServiceMethod) => void;
  isControlledService: boolean;
  setIsControlledService: (value: boolean) => void;
  serviceableCount: number;
  exposedCount: number;
  isDark: boolean;
}

/**
 * Head of the females step: how the batch is served (semen S-B, DB12). Natural service may still
 * pick its females (controlled); AI always does.
 */
export default function ServiceMethodHeader({
  batchName,
  method,
  onMethodChange,
  isControlledService,
  setIsControlledService,
  serviceableCount,
  exposedCount,
  isDark,
}: ServiceMethodHeaderProps) {
  const isAi = method === 'AI';
  const hint = isAi
    ? 'Inseminación artificial: elegí los vientres y, si querés, el semen previsto de cada uno.'
    : isControlledService
      ? 'Servicio controlado: elegí individualmente los vientres que se exponen.'
      : `Monta natural: se exponen los ${serviceableCount} vientres vacíos del lote.`;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '8px',
        border: 1,
        borderColor: 'divider',
        bgcolor: isDark ? 'background.default' : '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          Vientres de {batchName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {hint}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={method}
          onChange={(_, value: ServiceMethod | null) => value && onMethodChange(value)}
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', px: 1.5, py: 0.5 } }}
        >
          <ToggleButton value="NATURAL">Monta natural</ToggleButton>
          <ToggleButton value="AI">Inseminación artificial</ToggleButton>
        </ToggleButtonGroup>
        {!isAi && (
          <FormControlLabel
            control={<Switch size="small" checked={isControlledService} onChange={(e) => setIsControlledService(e.target.checked)} />}
            label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Servicio controlado</Typography>}
          />
        )}
        <Chip size="small" color="primary" variant="outlined" label={`${exposedCount} ${isAi ? 'a inseminar' : 'expuestas'}`} sx={{ fontWeight: 700 }} />
      </Stack>
    </Paper>
  );
}
