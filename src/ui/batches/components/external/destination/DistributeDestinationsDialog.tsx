import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { SexComposition } from '@/features/entry-orders/types';
import { DestinationRule, DistributionLine, splittable, uncovered } from './coverage';
import DistributionLineRow from './DistributionLineRow';

interface DistributeDestinationsDialogProps {
  open: boolean;
  lines: DistributionLine[];
  composition: SexComposition | null | undefined;
  rules: DestinationRule[];
  batches: Batch[];
  /** Names of the batches the rules already point to, for one that is not in `batches`. */
  batchNames?: Record<number, string>;
  /** A note on top, such as what a change of an order in course does. */
  note?: string;
  /** Something to ask under the lines, such as the transit batch's name. */
  footer?: (pending: DestinationRule[]) => React.ReactNode;
  applyLabel?: string;
  isPending?: boolean;
  onClose: () => void;
  onApply: (rules: DestinationRule[]) => void;
}

/**
 * "Distribuir": where the animals of each category line go — a batch for the whole line or, for a
 * line of both sexes in a mixed troop, one for the males and one for the females. What is left on
 * "Asignar después" goes to the transit batch. Holds the rules while open and hands them back on
 * "Aplicar"; the caller decides what applying means (the form, or the order in course).
 *
 * Follows "Alta Rápida de Lote" (CreateBatchDialog): sm width, one column, filled fields.
 */
export const DistributeDestinationsDialog: React.FC<DistributeDestinationsDialogProps> = ({
  open,
  lines,
  composition,
  rules,
  batches,
  batchNames = {},
  note,
  footer,
  applyLabel = 'Aplicar',
  isPending = false,
  onClose,
  onApply
}) => {
  const [draft, setDraft] = useState<DestinationRule[]>(rules);

  // Each opening starts from the rules as they are; while open, only the user changes them.
  useEffect(() => {
    if (open) setDraft(rules);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const left = useMemo(() => uncovered(lines, composition, draft), [lines, composition, draft]);
  const anySplit = lines.some((line) => splittable(line, composition));

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
        >
          Distribuir la tropa
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={isPending}
          sx={{ color: 'primary.main' }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {note && (
            <Alert
              severity="info"
              sx={{ fontSize: '0.8rem', py: 0.5 }}
            >
              {note}
            </Alert>
          )}

          {lines.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Declará las categorías de la tropa para distribuirla.
            </Typography>
          ) : (
            lines.map((line, index) => (
              <React.Fragment key={line.position}>
                {index > 0 && <Divider />}
                <DistributionLineRow
                  line={line}
                  composition={composition}
                  rules={draft.filter((r) => r.category_position === line.position)}
                  batches={batches}
                  batchNames={batchNames}
                  onChange={(lineRules) =>
                    setDraft((prev) => [
                      ...prev.filter((r) => r.category_position !== line.position),
                      ...lineRules
                    ])
                  }
                />
              </React.Fragment>
            ))
          )}

          {anySplit && (
            <Alert
              severity="info"
              sx={{ fontSize: '0.8rem', py: 0.5 }}
            >
              Cuántos machos y cuántas hembras trae cada categoría se sabe al recibir: cada caravana va al
              lote de su sexo.
            </Alert>
          )}
          {left.length > 0 && (
            <Alert
              severity="info"
              sx={{ fontSize: '0.8rem', py: 0.5 }}
            >
              Lo que queda en «Asignar después» entra a un lote de tránsito y se asigna a un lote propio
              más tarde.
            </Alert>
          )}
          {footer?.(draft)}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}
      >
        <Button
          onClick={onClose}
          disabled={isPending}
          variant="text"
          sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onApply(draft)}
          disabled={isPending}
          variant="contained"
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 3.5,
            fontWeight: 700,
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {isPending ? 'Guardando...' : applyLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DistributeDestinationsDialog;
