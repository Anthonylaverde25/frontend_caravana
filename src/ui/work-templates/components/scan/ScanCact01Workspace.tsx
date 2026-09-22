import React, { useState } from 'react';
import { Alert, Box, Button } from '@mui/material';
import { ScanCact01PagesBar } from './ScanCact01PagesBar';
import { ScanCact01MetadataHeader } from './ScanCact01MetadataHeader';
import { ScanCact01DestinationsPanel } from './ScanCact01DestinationsPanel';
import { ScanCact01Table } from './ScanCact01Table';
import type { Cact01PagesState } from '../../hooks/useCact01Pages';
import type { Cact01BatchOption, Cact01DestinationsState } from '../../hooks/useCact01Destinations';
import type { Cact01RepairState } from '../../hooks/useCact01Submission';
import type { Cact01Row } from './types';

interface ActivityOption {
  id: number;
  name: string;
  code: string;
}

interface BatchTypeOption {
  id: number;
  name: string;
  activity_id?: number | null;
  is_selectable?: boolean;
}

interface SourceBatchOption {
  id: number;
  name: string;
  activityName: string;
  count: number;
}

interface ScanCact01WorkspaceProps {
  state: Cact01PagesState;
  destinationsState: Cact01DestinationsState;
  batches: Cact01BatchOption[];
  activities: ActivityOption[];
  batchTypes: BatchTypeOption[];
  sourceBatchOptions: SourceBatchOption[];
  sourceMatched: boolean;
  repair: Cact01RepairState | null;
  isRepairOpen: boolean;
  onOpenRepair: () => void;
  onRowChange: (id: string, field: keyof Cact01Row, value: string) => void;
  onPreviewPage: (previewUrl: string) => void;
  isSaving: boolean;
}

/**
 * Review workbench of a CACT-01 load: pages, header, the resolved destinations and the
 * merged table of animals.
 */
export const ScanCact01Workspace: React.FC<ScanCact01WorkspaceProps> = ({
  state,
  destinationsState,
  batches,
  activities,
  batchTypes,
  sourceBatchOptions,
  sourceMatched,
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
      <ScanCact01PagesBar state={state} onPreviewPage={onPreviewPage} disabled={isSaving} />
      <ScanCact01MetadataHeader
        metadata={state.metadata}
        onChange={state.setMetadataField}
        sourceBatchId={state.sourceBatchId}
        onSourceBatchChange={state.setSourceBatchId}
        sourceBatchOptions={sourceBatchOptions}
        sourceMatched={sourceMatched}
        isOpen={isHeaderOpen}
        onToggle={() => setIsHeaderOpen((prev) => !prev)}
        headerErrors={repair?.headerErrors}
      />
      <ScanCact01DestinationsPanel
        state={destinationsState}
        batches={batches}
        activities={activities}
        batchTypes={batchTypes}
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
        <ScanCact01Table
          rows={state.rows}
          metadata={state.metadata}
          destinations={destinationsState.destinations}
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

export default ScanCact01Workspace;
