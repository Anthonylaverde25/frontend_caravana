import { alpha, Box, ButtonBase, Typography } from '@mui/material';
import { TRAY_PHASE_COLOR, TRAY_PHASES, type TrayFilters, type TrayPhase } from '../../utils/diagnosisTray';
import { PHASE_LABELS } from '../../utils/serviceOrderPhase';

interface DiagnosisTraySummaryProps {
  counts: Record<TrayPhase, number>;
  selected: TrayFilters['phase'];
  /** A click filters by that phase; a click on the selected one clears it. */
  onSelect: (phase: TrayFilters['phase']) => void;
}

/** How many open orders each phase has; each tile doubles as the phase filter. */
export default function DiagnosisTraySummary({ counts, selected, onSelect }: DiagnosisTraySummaryProps) {
  return (
    <Box
      component="nav"
      aria-label="Fases"
      sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}
    >
      {TRAY_PHASES.map((phase) => {
        const count = counts[phase];
        const isSelected = selected === phase;
        const color = TRAY_PHASE_COLOR[phase];
        return (
          <ButtonBase
            key={phase}
            aria-pressed={isSelected}
            onClick={() => onSelect(isSelected ? 'ALL' : phase)}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.75,
              border: 1,
              borderRadius: '10px',
              borderColor: isSelected ? `${color}.main` : 'divider',
              bgcolor: isSelected ? alpha(theme.palette[color].main, 0.08) : 'background.paper',
              opacity: count === 0 && !isSelected ? 0.55 : 1,
              transition: 'border-color 0.15s ease',
              '&:hover': { borderColor: isSelected ? `${color}.main` : 'text.disabled' },
            })}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${color}.main`, flexShrink: 0 }} />
            <Typography sx={{ flexGrow: 1, textAlign: 'left', fontSize: '0.82rem', fontWeight: 500, color: 'text.secondary' }}>
              {PHASE_LABELS[phase]}
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700 }}>{count}</Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
