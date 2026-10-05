import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';

interface ChoiceButtonsProps {
  value: string;
  options: { value: string; label: string; title: string }[];
  onChange: (value: string) => void;
  error?: boolean;
  warn?: boolean;
}

/**
 * A choice per caravan in one click — M | H, or the breed letters — instead of a dropdown that has
 * to be opened, aimed at and closed on every row. Clicking the chosen one again clears it.
 */
export const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({ value, options, onChange, error = false, warn = false }) => {
  // The chosen one in the app's brand color, the same as its main buttons.
  const { settings } = useContrastTheme();
  const selectedBg = (settings.enabled && settings.primaryButtonBg) || 'primary.main';

  return (
  <ToggleButtonGroup
    exclusive
    size="small"
    value={value}
    onChange={(_, next: string | null) => onChange(next ?? '')}
    sx={{
      '& .MuiToggleButton-root': {
        px: 1.25,
        py: 0.25,
        minWidth: 32,
        fontSize: '0.75rem',
        fontWeight: 700,
        lineHeight: 1.4,
        borderColor: error ? 'error.main' : warn ? 'warning.main' : 'divider'
      },
      '& .MuiToggleButton-root.Mui-selected': {
        bgcolor: selectedBg,
        color: 'common.white',
        '&:hover': { bgcolor: selectedBg, opacity: 0.9 }
      }
    }}
  >
    {options.map((option) => (
      <Tooltip key={option.value} title={option.title} disableInteractive>
        <ToggleButton value={option.value} aria-label={option.title}>
          {option.label}
        </ToggleButton>
      </Tooltip>
    ))}
  </ToggleButtonGroup>
  );
};

export default ChoiceButtons;
