import React from 'react';
import { Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface Props {
  selectedCount: number;
  onPrintTemplate: () => void;
  onOpenLabResults: () => void;
  onOpenSheet: () => void;
}

/**
 * Stage 1 action bar.
 *
 * "Abrir Planilla de Manga" is disabled without a selection on purpose: the sheet is the
 * continuation of a deliberate choice of animals, never a destination that loads the whole troop.
 */
export const PreServiceActionsBar: React.FC<Props> = ({
  selectedCount,
  onPrintTemplate,
  onOpenLabResults,
  onOpenSheet,
}) => (
  <Stack direction="row" spacing={1.5}>
    <Button
      variant="outlined"
      onClick={onPrintTemplate}
      startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
      sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '6px', px: 2 }}
    >
      Imprimir Hoja TOR-01
    </Button>

    <Button
      variant="outlined"
      color="primary"
      onClick={onOpenLabResults}
      startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-check</FuseSvgIcon>}
      sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '6px', px: 2 }}
    >
      Cargar Resultados Lab
    </Button>

    <Button
      variant="contained"
      onClick={onOpenSheet}
      disabled={selectedCount === 0}
      title={selectedCount === 0 ? 'Seleccione al menos una caravana para abrir la planilla' : undefined}
      startIcon={<FuseSvgIcon size={18}>heroicons-outline:table-cells</FuseSvgIcon>}
      sx={{
        fontWeight: 600,
        textTransform: 'none',
        borderRadius: '6px',
        px: 2.5,
        bgcolor: '#0a6ed1',
        '&:hover': { bgcolor: '#0854a0' },
      }}
    >
      {selectedCount > 0 ? `Abrir Planilla de Manga (${selectedCount})` : 'Seleccione toros para la manga'}
    </Button>
  </Stack>
);
