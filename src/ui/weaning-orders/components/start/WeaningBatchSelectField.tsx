import React, { useState } from 'react';
import { Autocomplete, Box, Chip, TextField, Typography, createFilterOptions } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CreateBatchDialog from '@/ui/batches/components/CreateBatchDialog';

export interface WeaningBatchOption {
  id: number;
  name: string;
  caravans_count?: number;
  is_confined?: boolean | null;
}

type WeaningBatchSelectFieldProps = {
  batches: WeaningBatchOption[];
  isLoading: boolean;
} & (
  | { multiple?: false; value: number | null; onChange: (batchId: number | null) => void }
  | { multiple: true; value: number[]; onChange: (batchIds: number[]) => void }
);

/** The last option of the list: not a batch, it opens the dialog that creates one. */
const CREATE_OPTION: WeaningBatchOption = { id: -1, name: 'Crear nuevo lote de destete' };

const filter = createFilterOptions<WeaningBatchOption>();

export const managementLabel = (value: boolean | null | undefined) =>
  value === true ? 'Corral' : value === false ? 'Pastura' : 'Sin declarar';

/**
 * The weaning batch every calf goes to — or, with `multiple`, the batches the calves are assigned
 * to one by one: active ones, or a new one created on the spot from the last option of the same
 * list (the batch dialog, fixed to the weaning type).
 */
export const WeaningBatchSelectField: React.FC<WeaningBatchSelectFieldProps> = (props) => {
  const { batches, isLoading } = props;
  const [isCreating, setIsCreating] = useState(false);
  const byId = new Map(batches.map((b) => [b.id, b]));

  const pick = (id: number) => {
    if (props.multiple === true) props.onChange(props.value.includes(id) ? props.value : [...props.value, id]);
    else props.onChange(id);
  };

  const common = {
    options: batches,
    loading: isLoading,
    filterOptions: (options: WeaningBatchOption[], state: Parameters<typeof filter>[1]) => [...filter(options, state), CREATE_OPTION],
    getOptionLabel: (b: WeaningBatchOption) => b.name,
    isOptionEqualToValue: (a: WeaningBatchOption, b: WeaningBatchOption) => a.id === b.id,
    renderOption: ({ key, ...optionProps }: React.HTMLAttributes<HTMLLIElement> & { key: React.Key }, batch: WeaningBatchOption) =>
      batch.id === CREATE_OPTION.id ? (
        <Box
          component="li"
          key={key}
          {...optionProps}
          sx={{ borderTop: '1px solid', borderColor: 'divider', color: 'primary.main', fontWeight: 700, gap: 1 }}
        >
          <FuseSvgIcon size={16}>heroicons-outline:plus-circle</FuseSvgIcon>
          {batch.name}
        </Box>
      ) : (
        <Box component="li" key={key} {...optionProps} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <span>{batch.name}</span>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {batch.caravans_count != null ? `${batch.caravans_count} animales · ` : ''}
            {managementLabel(batch.is_confined)}
          </Typography>
        </Box>
      ),
    // The start dialog sits above the default popper layer.
    slotProps: { popper: { sx: { zIndex: 10000 } } }
  };

  const single = props.multiple === true ? null : (byId.get(props.value ?? -2) ?? null);

  return (
    <>
      {props.multiple === true ? (
        <Autocomplete
          {...common}
          multiple
          disableCloseOnSelect
          value={props.value.map((id) => byId.get(id)).filter((b): b is WeaningBatchOption => b != null)}
          onChange={(_, chosen) => {
            if (chosen.some((b) => b.id === CREATE_OPTION.id)) {
              setIsCreating(true);
              return;
            }

            props.onChange(chosen.map((b) => b.id));
          }}
          renderTags={(chosen, getTagProps) =>
            chosen.map((b, index) => {
              const { key, ...tagProps } = getTagProps({ index });

              return <Chip key={key} {...tagProps} size="small" label={`${b.name} · ${managementLabel(b.is_confined)}`} />;
            })
          }
          renderInput={(params) => (
            <TextField {...params} size="small" label="Lotes de destete" helperText="Los lotes entre los que se reparten las crías." />
          )}
        />
      ) : (
        <Autocomplete
          {...common}
          value={single}
          onChange={(_, batch) => {
            if (batch?.id === CREATE_OPTION.id) {
              setIsCreating(true);
              return;
            }

            props.onChange(batch?.id ?? null);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Lote de destete"
              helperText={single ? `Manejo: ${managementLabel(single.is_confined)}` : 'Uno activo, o creá uno nuevo desde la lista.'}
            />
          )}
        />
      )}

      <CreateBatchDialog
        open={isCreating}
        batchTypeCode="WEANING"
        onClose={() => setIsCreating(false)}
        onSuccess={(batch: { id: number | string }) => pick(Number(batch.id))}
      />
    </>
  );
};

export default WeaningBatchSelectField;
