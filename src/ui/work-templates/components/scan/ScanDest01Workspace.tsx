import React, { useState } from 'react';
import { Alert, Box, Button } from '@mui/material';
import { ScanDest01PagesBar } from './ScanDest01PagesBar';
import { ScanDest01BatchTarget } from './ScanDest01BatchTarget';
import { ScanDest01MetadataHeader } from './ScanDest01MetadataHeader';
import { ScanDest01Table } from './ScanDest01Table';
import type { Dest01PagesState } from '../../hooks/useDest01Pages';
import type { Dest01RepairState } from '../../hooks/useDest01Submission';
import type { Dest01Row } from './types';

interface ScanDest01WorkspaceProps {
  state: Dest01PagesState;
  repair: Dest01RepairState | null;
  isRepairOpen: boolean;
  onOpenRepair: () => void;
  onRowChange: (id: string, field: keyof Dest01Row, value: string) => void;
  onPreviewPage: (previewUrl: string) => void;
  isSaving: boolean;
}

/** Review workbench of a DEST-01 load: pages, weaning batch, header and the merged calves table. */
export const ScanDest01Workspace: React.FC<ScanDest01WorkspaceProps> = ({
  state,
  repair,
  isRepairOpen,
  onOpenRepair,
  onRowChange,
  onPreviewPage,
  isSaving,
}) => {
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);

  return (
    <>
      <ScanDest01PagesBar state={state} onPreviewPage={onPreviewPage} disabled={isSaving} />
      <ScanDest01BatchTarget
        sheetName={state.metadata.lote_destete}
        target={state.target}
        onChange={state.setTarget}
        headerErrors={repair?.headerErrors}
      />
      <ScanDest01MetadataHeader
        metadata={state.metadata}
        onChange={state.setMetadataField}
        isOpen={isHeaderOpen}
        onToggle={() => setIsHeaderOpen((prev) => !prev)}
        headerErrors={repair?.headerErrors}
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
        />
      </Box>
    </>
  );
};

export default ScanDest01Workspace;
