import { alpha, Box, ButtonBase, Typography } from '@mui/material';
import { QUEUE_STAGES, STAGE_COLOR, STAGE_LABELS, type QueueStage } from '../../../utils/servicesQueue';
import type { QueueFilters, StageTile } from './useServicesQueue';

interface ServicesPhaseStripProps {
  allTile: StageTile;
  tiles: Record<QueueStage, StageTile>;
  selected: QueueFilters['stage'];
  /** A click filters by that phase; a click on the selected one clears it. */
  onSelect: (stage: QueueFilters['stage']) => void;
}

/** Palette path of a dot: the grey of "Por aprobar" has no `.main`. */
export const dotColor = (color: (typeof STAGE_COLOR)[QueueStage]) => (color === 'grey' ? 'grey.500' : `${color}.main`);

/**
 * The phases of an order in the order the work happens. Each tile counts its orders and is also
 * the phase filter, so the queue has a single place that says "how many" and "show me these".
 */
export default function ServicesPhaseStrip({ allTile, tiles, selected, onSelect }: ServicesPhaseStripProps) {
  const stageKeys = (Object.keys(tiles) as QueueStage[]);
  const items: { key: QueueFilters['stage']; label: string; tile: StageTile; dot: string | null }[] = [
    { key: 'ALL', label: 'Todas', tile: allTile, dot: null },
    ...stageKeys.map((stage) => ({ key: stage, label: STAGE_LABELS[stage], tile: tiles[stage], dot: dotColor(STAGE_COLOR[stage]) })),
  ];

  return (
    <Box
      component="nav"
      aria-label="Fases de la orden"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(3, minmax(0, 1fr))',
          lg: `repeat(${items.length}, minmax(0, 1fr))`,
        },
        border: 1,
        borderColor: 'divider',
        borderRadius: '8px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {items.map(({ key, label, tile, dot }) => {
        const isSelected = selected === key;
        return (
          <ButtonBase
            key={key}
            aria-pressed={isSelected}
            onClick={() => onSelect(isSelected || key === 'ALL' ? 'ALL' : key)}
            sx={(theme) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 0.5,
              px: 2,
              py: 1.5,
              borderRight: 1,
              borderBottom: { xs: 1, lg: 0 },
              borderColor: 'divider',
              textAlign: 'left',
              bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              boxShadow: isSelected ? `inset 0 -3px 0 ${theme.palette.primary.main}` : 'none',
              '&:hover': { bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'action.hover' },
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {dot && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dot, flexShrink: 0 }} />}
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary' }}>
                {label}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1, color: tile.count === 0 ? 'text.disabled' : 'text.primary' }}>
              {tile.count}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{tile.caption}</Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
