import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { SimulationPreset } from './types';

interface SimulationSheetCaseSelectProps {
  cases: SimulationPreset[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

/**
 * Picks one test sheet out of a template's SHEET_CASES catalogue. A list instead of more scenario
 * buttons: a dozen cases would bury the six flows the buttons already offer.
 */
export const SimulationSheetCaseSelect: React.FC<SimulationSheetCaseSelectProps> = ({ cases, selectedIndex, onChange }) => (
  <TextField
    select
    fullWidth
    size="small"
    variant="filled"
    label="Planilla de prueba"
    value={selectedIndex}
    onChange={(event) => onChange(Number(event.target.value))}
    sx={{ mt: 1.5, '& .MuiFilledInput-root': { bgcolor: 'action.hover' } }}
  >
    {cases.map((preset, index) => (
      <MenuItem key={preset.scenarioLabel} value={index}>
        {preset.scenarioLabel}
      </MenuItem>
    ))}
  </TextField>
);
