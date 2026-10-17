import { Box, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';

interface BatchWeighingDialogHeaderProps {
  batch: Batch;
  batchHeads: number | null;
  disabled: boolean;
  onClose: () => void;
}

const kg = (value: number) => value.toLocaleString('es-AR', { maximumFractionDigits: 1 });

/** Which batch is being weighed and how it stands now, so the new figures have a reference. */
export function BatchWeighingDialogHeader({ batch, batchHeads, disabled, onClose }: BatchWeighingDialogHeaderProps) {
  const contextParts = [
    [batch.activity_name, batch.batch_type_name, batch.farm_name].filter(Boolean).join(' · '),
    batchHeads !== null ? `${batchHeads} cab.` : null,
    batch.current_weight ? `peso vigente ${kg(batch.current_weight)} kg/cab` : 'sin peso registrado',
  ].filter(Boolean);

  const subtitle = contextParts.join(' · ');

  return (
    <Box
      sx={{
        p: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ minWidth: 0, pr: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Pesar lote · {batch.name}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mt: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <IconButton onClick={onClose} size="small" disabled={disabled} sx={{ color: 'primary.main', flexShrink: 0 }}>
        <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
      </IconButton>
    </Box>
  );
}
