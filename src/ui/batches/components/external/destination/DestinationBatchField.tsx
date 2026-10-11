import React, { useState } from 'react';
import { IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import CreateBatchDialog from '@/ui/batches/components/CreateBatchDialog';
import OwnBatchPickerDialog from '../OwnBatchPickerDialog';
import { filledSx } from '../externalFormParts';

interface DestinationBatchFieldProps {
  label: string;
  value: number | null;
  /** Own active batches, the only valid destinations. */
  batches: Batch[];
  /** What goes there, for the picker's subtitle ("Ternero · machos", "40 cabezas"). */
  subtitle: string;
  onChange: (batchId: number | null) => void;
  /** Leaving it empty sends the animals to the transit batch, to assign later. */
  emptyLabel?: string;
  error?: string;
  helperText?: string;
  /** The name of a batch not in `batches` (closed since, or just created). */
  fallbackName?: string | null;
}

/**
 * A destination batch, chosen — never typed: clicking opens the own batches grouped by activity,
 * with "Crear lote nuevo" (the quick batch dialog, which declares activity, type and management).
 * The cross clears it, and the animals go back to "assign later".
 */
export const DestinationBatchField: React.FC<DestinationBatchFieldProps> = ({
  label,
  value,
  batches,
  subtitle,
  onChange,
  emptyLabel = 'Asignar después',
  error,
  helperText,
  fallbackName
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [created, setCreated] = useState<Record<number, string>>({});
  const name =
    value == null
      ? null
      : (batches.find((b) => b.id === value)?.name ?? created[value] ?? fallbackName ?? `Lote #${value}`);

  return (
    <>
      <TextField
        label={label}
        value={name ?? emptyLabel}
        variant="filled"
        fullWidth
        error={!!error}
        helperText={error ?? helperText}
        onClick={() => setIsPickerOpen(true)}
        InputProps={{
          readOnly: true,
          sx: {
            cursor: 'pointer',
            '& input': {
              cursor: 'pointer',
              fontWeight: name ? 700 : 400,
              color: name ? 'text.primary' : 'text.secondary'
            }
          },
          endAdornment: (
            <InputAdornment position="end">
              {value != null && (
                <Tooltip title={emptyLabel}>
                  <IconButton
                    size="small"
                    aria-label="Quitar destino"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(null);
                    }}
                  >
                    <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
                  </IconButton>
                </Tooltip>
              )}
              <FuseSvgIcon size={18}>heroicons-outline:chevron-up-down</FuseSvgIcon>
            </InputAdornment>
          )
        }}
        sx={filledSx}
      />

      <OwnBatchPickerDialog
        open={isPickerOpen}
        batches={batches}
        selectedId={value ?? ''}
        subtitle={subtitle}
        onClose={() => setIsPickerOpen(false)}
        onPick={(batch) => {
          onChange(batch.id);
          setIsPickerOpen(false);
        }}
        onCreate={() => {
          setIsPickerOpen(false);
          setIsCreateOpen(true);
        }}
      />

      <CreateBatchDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(batch: { id?: number; name?: string } | null) => {
          if (batch?.id) {
            setCreated((prev) => ({ ...prev, [batch.id as number]: batch.name ?? `Lote #${batch.id}` }));
            onChange(batch.id);
          }
        }}
      />
    </>
  );
};

export default DestinationBatchField;
