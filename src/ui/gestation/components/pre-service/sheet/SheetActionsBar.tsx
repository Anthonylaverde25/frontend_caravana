import React from 'react';
import { Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface Props {
  rowsCount: number;
  canClose: boolean;
  isSaving: boolean;
  onPrintTemplate: () => void;
  onChangeSelection: () => void;
  onClose: () => void;
}

/** Action bar of the chute sheet stage. */
export const SheetActionsBar: React.FC<Props> = ({
  rowsCount,
  canClose,
  isSaving,
  onPrintTemplate,
  onChangeSelection,
  onClose,
}) => (
  <Stack direction="row" spacing={1.5}>
    <Button
      variant="outlined"
      onClick={onPrintTemplate}
      startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
      sx={{ textTransform: 'none', borderRadius: '6px', px: 2 }}
    >
      Imprimir Hoja A4 (TOR-01)
    </Button>

    <Button
      variant="outlined"
      onClick={onChangeSelection}
      disabled={isSaving}
      startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>}
      sx={{ textTransform: 'none', borderRadius: '6px', px: 2 }}
    >
      Cambiar selección
    </Button>

    <Button
      variant="contained"
      onClick={onClose}
      disabled={!canClose || isSaving}
      startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-check</FuseSvgIcon>}
      sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '6px', px: 2.5, boxShadow: 'none' }}
    >
      Cerrar planilla ({rowsCount})
    </Button>
  </Stack>
);
