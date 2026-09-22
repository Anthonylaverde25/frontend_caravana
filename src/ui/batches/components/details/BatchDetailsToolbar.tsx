import { Box, Button, Chip, Stack, Typography, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface BatchDetailsToolbarProps {
  batch: any;
  onOpenEntry: () => void;
  onOpenTransfer: () => void;
  testerOpen: boolean;
  onToggleTester: () => void;
}

const formatNumber = (value: number | null | undefined, digits = 1): string => {
  if (value == null) return '-';
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

/**
 * BatchDetailsToolbar
 * Action bar providing quick ingress, egress/transfer and tester toggling
 * along with immediate batch health metrics.
 */
export default function BatchDetailsToolbar({
  batch,
  onOpenEntry,
  onOpenTransfer,
  testerOpen,
  onToggleTester,
}: BatchDetailsToolbarProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '8px',
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc',
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      {/* Metric badges */}
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        <Chip
          icon={<FuseSvgIcon size={16}>heroicons-outline:user-group</FuseSvgIcon>}
          label={`${batch.caravans_count ?? 0} cabezas`}
          size="small"
          sx={{ fontWeight: 700, px: 0.5 }}
          color="default"
          variant="outlined"
        />
        <Chip
          icon={<FuseSvgIcon size={16}>heroicons-outline:scale</FuseSvgIcon>}
          label={`Prom: ${formatNumber(batch.current_weight)} kg`}
          size="small"
          sx={{ fontWeight: 700, px: 0.5 }}
          color="primary"
          variant="outlined"
        />
        {batch.total_weight != null && (
          <Chip
            icon={<FuseSvgIcon size={16}>heroicons-outline:circle-stack</FuseSvgIcon>}
            label={`Total: ${formatNumber(batch.total_weight, 0)} kg`}
            size="small"
            sx={{ fontWeight: 700, px: 0.5 }}
            color="secondary"
            variant="outlined"
          />
        )}
      </Stack>

      {/* Action buttons */}
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        <Button
          variant="contained"
          size="small"
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
          onClick={onOpenEntry}
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '6px',
            boxShadow: 'none',
            bgcolor: '#16a34a',
            '&:hover': { bgcolor: '#15803d' },
          }}
        >
          Ingresar Animales
        </Button>

        <Button
          variant="contained"
          size="small"
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-right-circle</FuseSvgIcon>}
          onClick={onOpenTransfer}
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '6px',
            boxShadow: 'none',
            bgcolor: '#ea580c',
            '&:hover': { bgcolor: '#c2410c' },
          }}
        >
          Egresar / Trasladar
        </Button>

        <Button
          variant={testerOpen ? 'contained' : 'outlined'}
          size="small"
          color={testerOpen ? 'primary' : 'inherit'}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:beaker</FuseSvgIcon>}
          onClick={onToggleTester}
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '6px',
            boxShadow: 'none',
          }}
        >
          {testerOpen ? 'Ocultar Simulador' : 'Simulador y Pruebas'}
        </Button>
      </Stack>
    </Box>
  );
}
