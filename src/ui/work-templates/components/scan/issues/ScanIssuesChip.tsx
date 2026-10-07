import React, { useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ScanIssuesDialog from './ScanIssuesDialog';
import type { ScanIssue } from './types';

interface ScanIssuesChipProps {
  templateCode: string;
  issues: ScanIssue[];
  /** What a clean sheet says, e.g. "Validado (12)". Omitted, a clean sheet shows nothing. */
  validLabel?: string;
  /** Painted for a dark bar (the repair screens), where the coloured chip would not read. */
  onDark?: boolean;
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/**
 * The count of what blocks the load and of what only asks to be looked at, opening the guide to
 * them. On a clean sheet it is only a green check.
 */
export const ScanIssuesChip: React.FC<ScanIssuesChipProps> = ({ templateCode, issues, validLabel, onDark = false }) => {
  const [open, setOpen] = useState(false);
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors;

  if (issues.length === 0) {
    return validLabel ? <Chip label={`🟢 ${validLabel}`} color="success" variant="outlined" sx={{ fontWeight: 800, borderRadius: '6px' }} /> : null;
  }

  const label =
    errors > 0
      ? `🔴 ${plural(errors, 'error', 'errores')}${warnings > 0 ? ` · ${plural(warnings, 'aviso', 'avisos')}` : ''}`
      : `🟡 ${plural(warnings, 'aviso', 'avisos')}`;

  return (
    <>
      <Tooltip arrow title="Ver la guía: errores por tipo y qué hacer">
        <Chip
          label={label}
          color={errors > 0 ? 'error' : 'warning'}
          variant={errors > 0 ? 'filled' : 'outlined'}
          onClick={() => setOpen(true)}
          onDelete={() => setOpen(true)}
          deleteIcon={<FuseSvgIcon size={16}>heroicons-outline:chevron-right</FuseSvgIcon>}
          sx={{
            fontWeight: 800,
            borderRadius: '6px',
            cursor: 'pointer',
            ...(onDark && {
              bgcolor: 'rgba(255, 255, 255, 0.14)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              '& .MuiChip-deleteIcon': { color: '#fff' },
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.24)' }
            })
          }}
        />
      </Tooltip>
      <ScanIssuesDialog open={open} onClose={() => setOpen(false)} templateCode={templateCode} issues={issues} />
    </>
  );
};

export default ScanIssuesChip;
