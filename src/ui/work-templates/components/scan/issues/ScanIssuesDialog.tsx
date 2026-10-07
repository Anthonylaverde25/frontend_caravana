import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogContent, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { guideFor } from './catalog';
import ScanIssueGroup from './ScanIssueGroup';
import { scrollToScanRow } from './scrollToScanRow';
import { ISSUE_CATEGORY_LABEL, ISSUE_CATEGORY_ORDER, type IssueCategory, type IssueGuide, type ScanIssue } from './types';

interface ScanIssuesDialogProps {
  open: boolean;
  onClose: () => void;
  templateCode: string;
  issues: ScanIssue[];
}

interface Group {
  key: string;
  guide: IssueGuide;
  issues: ScanIssue[];
}

/** The issues of one severity, by category and then by code, in the guide's fixed category order. */
const groupIssues = (templateCode: string, issues: ScanIssue[]): [IssueCategory, Group[]][] => {
  const byCategory = new Map<IssueCategory, Map<string, Group>>();

  issues.forEach((issue) => {
    const guide = guideFor(templateCode, issue);
    const key = issue.code ?? 'LOCAL_CHECK';
    const groups = byCategory.get(guide.category) ?? new Map<string, Group>();
    const group = groups.get(key) ?? { key, guide, issues: [] };

    group.issues.push(issue);
    groups.set(key, group);
    byCategory.set(guide.category, groups);
  });

  return ISSUE_CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => [
    category,
    [...(byCategory.get(category) as Map<string, Group>).values()].sort((a, b) => b.issues.length - a.issues.length)
  ]);
};

/**
 * The guide to what a sheet's load objected to: every problem grouped by kind, with what to do about
 * it and a way to the row it is on. Errors block confirming; warnings only ask to look again.
 */
export const ScanIssuesDialog: React.FC<ScanIssuesDialogProps> = ({ open, onClose, templateCode, issues }) => {
  const errors = useMemo(() => issues.filter((i) => i.severity === 'error'), [issues]);
  const warnings = useMemo(() => issues.filter((i) => i.severity === 'warning'), [issues]);
  const [tab, setTab] = useState<'error' | 'warning'>('error');

  useEffect(() => {
    if (open) setTab(errors.length > 0 || warnings.length === 0 ? 'error' : 'warning');
  }, [open]);

  const shown = tab === 'error' ? errors : warnings;
  const categories = useMemo(() => groupIssues(templateCode, shown), [templateCode, shown]);

  const goToRow = (rowId: string) => {
    onClose();
    // After the dialog's exit transition, or the backdrop would still cover the row.
    window.setTimeout(() => scrollToScanRow(rowId), 250);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}>
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            Guía de errores · {templateCode}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Agrupados por tipo, con qué hacer en cada caso.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider', minHeight: 40 }}>
        <Tab value="error" label={`Errores (${errors.length})`} sx={{ textTransform: 'none', fontWeight: 700, minHeight: 40 }} />
        <Tab value="warning" label={`Avisos (${warnings.length})`} sx={{ textTransform: 'none', fontWeight: 700, minHeight: 40 }} />
      </Tabs>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
        {categories.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {tab === 'error' ? 'No hay errores: la planilla se puede confirmar.' : 'No hay avisos.'}
          </Typography>
        ) : (
          <Stack spacing={3}>
            {categories.map(([category, groups]) => (
              <Box key={category}>
                <Box sx={{ pl: 1.5, borderLeft: '3px solid', borderColor: 'primary.main', mb: 1.25 }}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
                    {ISSUE_CATEGORY_LABEL[category]}
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  {groups.map((group) => (
                    <ScanIssueGroup key={group.key} guide={group.guide} issues={group.issues} onGoToRow={goToRow} />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>

      <Box sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Lo que marca la revisión se actualiza al corregir; lo que respondió el servidor, al volver a confirmar.
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 3.5,
            fontWeight: 700,
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
            flexShrink: 0,
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          Entendido
        </Button>
      </Box>
    </Dialog>
  );
};

export default ScanIssuesDialog;
