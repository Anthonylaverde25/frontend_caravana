import React, { useState } from 'react';
import { Alert, Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ScanDest01PagesBar } from './ScanDest01PagesBar';
import { ScanDest01BatchTarget } from './ScanDest01BatchTarget';
import { ScanDest01MetadataHeader } from './ScanDest01MetadataHeader';
import { ScanDest01Table } from './ScanDest01Table';
import { ScanDest01OrderBand } from './ScanDest01OrderBand';
import { ScanDest01PerAnimalTargets } from './ScanDest01PerAnimalTargets';
import type { Dest01PagesState } from '../../hooks/useDest01Pages';
import type { Dest01RepairState } from '../../hooks/useDest01Submission';
import type { Dest01WeaningOrderState } from '../../hooks/useDest01WeaningOrder';
import type { Dest01Row } from './types';

interface ScanDest01WorkspaceProps {
  state: Dest01PagesState;
  order: Dest01WeaningOrderState;
  repair: Dest01RepairState | null;
  isRepairOpen: boolean;
  onOpenRepair: () => void;
  onRowChange: (id: string, field: keyof Dest01Row, value: string) => void;
  onPreviewPage: (previewUrl: string) => void;
  isSaving: boolean;
}

/**
 * Review workbench of a DEST-01 load: pages, the order the paper fulfils, the weaning batch (one for
 * all, or one per calf), header and the merged calves table. What the order already declared is
 * inherited, not asked again.
 */
export const ScanDest01Workspace: React.FC<ScanDest01WorkspaceProps> = ({
  state,
  order,
  repair,
  isRepairOpen,
  onOpenRepair,
  onRowChange,
  onPreviewPage,
  isSaving,
}) => {
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);
  const inheritedFrom = order.order ? order.order.code : null;
  const perAnimal = state.destinationMode === 'per_animal';

  return (
    <>
      <ScanDest01PagesBar state={state} onPreviewPage={onPreviewPage} disabled={isSaving} />
      <ScanDest01OrderBand state={order} />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, pt: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          Destino de las crías
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={state.destinationMode}
          disabled={Boolean(inheritedFrom)}
          onChange={(_, mode) => mode && state.setDestinationMode(mode)}
        >
          <ToggleButton value="single" sx={{ textTransform: 'none', py: 0.25 }}>
            Un lote para todas
          </ToggleButton>
          <ToggleButton value="per_animal" sx={{ textTransform: 'none', py: 0.25 }}>
            Lote por cría
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {perAnimal ? (
        <ScanDest01PerAnimalTargets state={state} orderCode={inheritedFrom} headerErrors={repair?.headerErrors} />
      ) : (
        <ScanDest01BatchTarget
          sheetName={state.metadata.lote_destete}
          sheetManagement={state.metadata.sistema_manejo}
          inheritedFromOrder={inheritedFrom}
          target={state.target}
          onChange={state.setTarget}
          headerErrors={repair?.headerErrors}
        />
      )}

      <ScanDest01MetadataHeader
        metadata={state.metadata}
        onChange={state.setMetadataField}
        isOpen={isHeaderOpen}
        onToggle={() => setIsHeaderOpen((prev) => !prev)}
        headerErrors={repair?.headerErrors}
        weaningTypeFromOrder={order.order?.weaning_type_label ?? null}
        rows={state.rows}
      />
      <Box sx={{ p: 2 }}>
        {repair && !isRepairOpen && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: '6px' }}
            action={
              <Button color="inherit" size="small" onClick={onOpenRepair}>
                Abrir reparación
              </Button>
            }
          >
            La carga está bloqueada hasta reparar la planilla.
          </Alert>
        )}
        <ScanDest01Table
          rows={state.rows}
          pageLabelByKey={state.pageLabelByKey}
          onRowChange={onRowChange}
          onDeleteRow={state.deleteRow}
          onAddRow={state.addRow}
          rowErrorsById={repair?.rowErrorsById}
          editedRowIds={repair?.editedRowIds}
          perAnimal={perAnimal}
          showCategory={order.order?.category_mode !== 'KEEP'}
        />
      </Box>
    </>
  );
};

export default ScanDest01Workspace;
