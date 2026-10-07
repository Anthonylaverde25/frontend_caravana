import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';
import { ARRIVAL_FINDINGS, type ArrivalFindingCode } from '@/features/entry-orders/types';

interface ArrivalFindingsCellProps {
  value: ArrivalFindingCode[];
  onChange: (findings: ArrivalFindingCode[]) => void;
}

/**
 * What the animal came off the truck with — an injured eye, a damaged ear, a limb problem — one
 * click each, any of them together, like the three boxes of the ING-03.
 */
export const ArrivalFindingsCell: React.FC<ArrivalFindingsCellProps> = ({ value, onChange }) => {
  const { settings } = useContrastTheme();
  const selectedBg = (settings.enabled && settings.primaryButtonBg) || 'warning.main';

  return (
    <ToggleButtonGroup
      size="small"
      value={value}
      onChange={(_, next: ArrivalFindingCode[]) => onChange(next)}
      sx={{
        '& .MuiToggleButton-root': { px: 0.6, py: 0.25, fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.4, textTransform: 'none', borderColor: 'divider' },
        '& .MuiToggleButton-root.Mui-selected': { bgcolor: selectedBg, color: 'common.white', '&:hover': { bgcolor: selectedBg, opacity: 0.9 } }
      }}
    >
      {ARRIVAL_FINDINGS.map((finding) => (
        <Tooltip key={finding.code} title={`Llegó con lesión: ${finding.label}`} disableInteractive>
          <ToggleButton value={finding.code} aria-label={finding.label}>
            {finding.short}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
};

export default ArrivalFindingsCell;
