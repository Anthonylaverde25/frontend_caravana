import React from 'react';
import { Box, Button, Chip, Stack, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { IssueGuide, ScanIssue } from './types';

interface ScanIssueGroupProps {
  guide: IssueGuide;
  issues: ScanIssue[];
  onGoToRow: (rowId: string) => void;
}

/**
 * One kind of problem: what it is, how many times it happens, what to do about it, and where. The
 * server's message of each occurrence is kept: it names the caravan, the order or the date involved.
 */
export const ScanIssueGroup: React.FC<ScanIssueGroupProps> = ({ guide, issues, onGoToRow }) => {
  const tone = issues[0]?.severity === 'error' ? 'error' : 'warning';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '4px solid',
        borderLeftColor: `${tone}.main`,
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ px: 2, py: 1.25, bgcolor: (t) => alpha(t.palette[tone].main, 0.06) }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', flexGrow: 1 }}>{guide.title}</Typography>
          <Chip size="small" color={tone} variant="outlined" label={issues.length} sx={{ fontWeight: 800, minWidth: 32 }} />
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mt: 0.75 }}>
          <FuseSvgIcon size={16} sx={{ color: 'text.secondary', mt: '2px' }}>
            heroicons-outline:light-bulb
          </FuseSvgIcon>
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Qué hacer:{' '}
            </Box>
            {guide.solution}
          </Typography>
        </Stack>
      </Box>

      <Stack divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
        {issues.map((issue, index) => (
          <Stack key={`${issue.rowId ?? issue.field ?? 'sheet'}-${index}`} direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1 }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {issue.rowLabel && (
                <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'monospace', display: 'block' }}>
                  {issue.rowLabel}
                </Typography>
              )}
              <Typography variant="body2">{issue.message}</Typography>
            </Box>
            {issue.rowId && (
              <Button
                size="small"
                onClick={() => onGoToRow(issue.rowId as string)}
                endIcon={<FuseSvgIcon size={14}>heroicons-outline:arrow-right</FuseSvgIcon>}
                sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Ir a la fila
              </Button>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default ScanIssueGroup;
