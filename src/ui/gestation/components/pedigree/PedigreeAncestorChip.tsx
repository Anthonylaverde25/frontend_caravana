import { Chip, Typography } from '@mui/material';
import { AncestorRef } from '@/core/caravans/domain/services/pedigreeAnalysis';

interface PedigreeAncestorChipProps {
  ancestor: AncestorRef | null;
  fallbackLabel: string;
  isMale?: boolean;
  isDark: boolean;
}

export default function PedigreeAncestorChip({
  ancestor,
  fallbackLabel,
  isMale,
  isDark,
}: PedigreeAncestorChipProps) {
  if (!ancestor) {
    return (
      <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic', fontSize: '0.72rem' }}>
        {fallbackLabel}
      </Typography>
    );
  }

  return (
    <Chip
      size="small"
      label={`#${ancestor.identification}`}
      sx={{
        fontWeight: 700,
        fontSize: '0.72rem',
        height: 22,
        bgcolor: isMale ? (isDark ? 'rgba(56, 189, 248, 0.12)' : '#e0f2fe') : (isDark ? 'rgba(244, 114, 182, 0.12)' : '#fce7f3'),
        color: isMale ? (isDark ? '#38bdf8' : '#0369a1') : (isDark ? '#f472b6' : '#be185d'),
        border: '1px solid',
        borderColor: isMale ? (isDark ? 'rgba(56, 189, 248, 0.3)' : '#bae6fd') : (isDark ? 'rgba(244, 114, 182, 0.3)' : '#fbcfe8'),
        borderRadius: '4px',
      }}
    />
  );
}
