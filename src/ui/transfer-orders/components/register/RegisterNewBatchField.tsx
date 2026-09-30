import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Activity } from '@/core/activities/domain/entities/Activity';
import type { BatchType } from '@/core/batch-types/domain/entities/BatchType';
import { ConfigureDestinationBatchDialog } from '@/ui/activities/components/transfer/ConfigureDestinationBatchDialog';
import type { NewBatchDraft } from '@/ui/activities/components/transfer/TransferDestinationBar';

interface RegisterNewBatchFieldProps {
  draft: NewBatchDraft;
  onChange: (draft: NewBatchDraft) => void;
  /** Only the declared destination activity: the new batch is born in it and nowhere else. */
  activities: Activity[];
  batchTypes: BatchType[];
  isLoadingBatchTypes: boolean;
}

/** The batch that received the animals and does not exist yet: name, type and management. */
export const RegisterNewBatchField: React.FC<RegisterNewBatchFieldProps> = ({
  draft,
  onChange,
  activities,
  batchTypes,
  isLoadingBatchTypes
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const typeName = batchTypes.find((type) => Number(type.id) === Number(draft.batchTypeId))?.name;
  const management = draft.isConfined === true ? 'Corral' : draft.isConfined === false ? 'Pastura' : null;
  const isComplete = Boolean(draft.name.trim() && typeName && management);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        p: 1.25,
        px: 1.5,
        borderRadius: '6px',
        border: 1,
        borderColor: isComplete ? 'divider' : 'warning.main',
        bgcolor: 'action.hover'
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {draft.name.trim() || 'Lote nuevo sin configurar'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {isComplete ? `${typeName} · ${management}` : 'Falta nombre, tipo o manejo.'}
        </Typography>
      </Box>
      <Button
        size="small"
        variant={isComplete ? 'text' : 'contained'}
        disableElevation
        onClick={() => setIsOpen(true)}
        startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', flexShrink: 0 }}
      >
        {isComplete ? 'Editar' : 'Configurar'}
      </Button>

      <ConfigureDestinationBatchDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={onChange}
        draft={draft}
        activities={activities}
        batchTypes={batchTypes}
        isLoadingBatchTypes={isLoadingBatchTypes}
      />
    </Box>
  );
};

export default RegisterNewBatchField;
