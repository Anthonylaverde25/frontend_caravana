import { Box, IconButton, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ActivityBatch } from '@/core/activities/domain/entities/Activity';

interface BatchSheetRowProps {
  batch: ActivityBatch;
  stageColor: string;
  /**
   * Whether the management system of this batch was actually declared. When it was
   * not, the badge is omitted rather than showing the column default as if it were
   * an answer. See `declaresManagementSystem`.
   */
  showManagementSystem: boolean;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, batch: ActivityBatch) => void;
}

/**
 * One batch row of the production sheet.
 *
 * Shows the two axes side by side: what the batch produces (its type) and how it is
 * managed (pen or pasture). An empty batch stays visible and states whether it was
 * emptied by a transfer or never held animals at all.
 */
export default function BatchSheetRow({
  batch,
  stageColor,
  showManagementSystem,
  onOpenMenu,
}: BatchSheetRowProps) {
  const isEmpty = !batch.count;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 0.8fr 0.4fr',
        borderBottom: '1px solid #e0e0e0',
        cursor: 'pointer',
        transition: 'background 0.1s',
        opacity: isEmpty ? 0.75 : 1,
        '&:hover': { bgcolor: alpha(stageColor, 0.05) },
      }}
    >
      <Box sx={{ p: 1, borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#333', lineHeight: 1.2 }}
        >
          {batch.name}
        </Typography>
        <Typography sx={{ fontSize: '0.6rem', color: '#888' }}>{batch.farmName}</Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
          {batch.batchTypeName && (
            <Typography
              sx={{
                fontSize: '0.58rem',
                fontWeight: 900,
                letterSpacing: 0.3,
                px: 0.6,
                py: 0.1,
                borderRadius: '2px',
                bgcolor: alpha(stageColor, 0.12),
                color: stageColor,
              }}
            >
              {batch.batchTypeName.toUpperCase()}
            </Typography>
          )}

          {showManagementSystem && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                px: 0.6,
                py: 0.1,
                borderRadius: '2px',
                bgcolor: batch.isConfined ? '#fff1e6' : '#e8f5e9',
                color: batch.isConfined ? '#ea580c' : '#16a34a',
              }}
            >
              <FuseSvgIcon size={11}>
                {batch.isConfined ? 'heroicons-outline:home' : 'heroicons-outline:sun'}
              </FuseSvgIcon>
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 900, letterSpacing: 0.3 }}>
                {batch.isConfined ? 'A CORRAL' : 'A CAMPO'}
              </Typography>
            </Box>
          )}

          {isEmpty && (
            <Typography
              sx={{
                fontSize: '0.58rem',
                fontWeight: 900,
                letterSpacing: 0.3,
                px: 0.6,
                py: 0.1,
                borderRadius: '2px',
                bgcolor: batch.wasEmptied ? '#ede9fe' : '#f1f1f1',
                color: batch.wasEmptied ? '#6d28d9' : '#888',
              }}
            >
              {batch.wasEmptied ? 'VACÍO' : 'SIN ANIMALES'}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          p: 1,
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.85rem', color: stageColor }}>
          {batch.count}
        </Typography>
      </Box>

      <Box
        sx={{
          p: 1,
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          {/* An empty batch has no average weight. Showing 0 would state that the
              animals weigh nothing, when what happened is that they left. */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: '0.7rem',
              color: batch.current_weight == null ? '#aaa' : '#555',
              bgcolor: '#f1f1f1',
              px: 0.8,
              py: 0.2,
              borderRadius: '2px',
              display: 'inline-block',
            }}
          >
            {batch.current_weight != null ? `${batch.current_weight} KG` : '—'}
          </Typography>
          {batch.total_weight != null && batch.total_weight > 0 && (
            <Typography sx={{ fontSize: '0.58rem', color: '#7b61ff', fontWeight: 700, mt: 0.25 }}>
              {Math.round(batch.total_weight).toLocaleString('es-AR')} kg tot.
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconButton
          size="small"
          onClick={(e) => onOpenMenu(e, batch)}
          sx={{
            p: 0.5,
            color: '#bbb',
            '&:hover': { color: stageColor, bgcolor: alpha(stageColor, 0.1) },
          }}
        >
          <FuseSvgIcon size={16}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
        </IconButton>
      </Box>
    </Box>
  );
}
