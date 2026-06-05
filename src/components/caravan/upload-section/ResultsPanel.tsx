import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axiosInstance from '@/utils/axios';
import DataTable from 'src/components/data-table/DataTable';
import { TableResult, ImportResult, DocumentContext } from './types';

// Sub-components & Hooks
import { ResultsHeader } from './results/ResultsHeader';
import { ResultsContextBar } from './results/ResultsContextBar';
import { DocumentHeaderBar } from './results/DocumentHeaderBar';
import { useResultsColumns } from './results/useResultsColumns';
import Rep01ResultsTable from './results/Rep01ResultsTable';

interface ResultsPanelProps {
  data: TableResult[];
  context?: DocumentContext;
  ocrProvider: 'azure' | 'google';
  workdayType: string;
  suggestedWorkdayCode?: string;
  onReset: () => void;
  emptyDestinationBatchId?: number | null;
  identifiedTemplate?: any;
}

/**
 * ResultsPanel Component (Container)
 * Orchestrates the data visualization, editing, and massive import process.
 */
const ResultsPanel = ({ data, context, ocrProvider, workdayType, suggestedWorkdayCode, onReset, emptyDestinationBatchId, identifiedTemplate }: ResultsPanelProps) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done' | 'error'>('idle');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [localRows, setLocalRows] = useState<any[]>([]);

  // Initialize local rows by resolving the correct caravan data table
  useEffect(() => {
    if (data && data.length > 0) {
      // Find the table that contains caravan data (has 'identification' mapped or present in rows)
      const caravanTable = data.find(table => 
        table.field_mapping && Object.values(table.field_mapping).includes('identification')
      ) || data.reduce((max, table) => (table.row_count > max.row_count ? table : max), data[0]);

      const mappedRows = (caravanTable.mapped_rows || []).map(row => {
        const flatRow: any = {};
        Object.entries(row).forEach(([key, val]: [string, any]) => {
          flatRow[key] = val?.value ?? '';
          flatRow[key + '_meta'] = { confidence: val?.confidence ?? 1 };
        });
        return flatRow;
      });

      // Filter out rows that have absolutely no useful data (only contain empty fields)
      const filteredRows = mappedRows.filter(row => {
        const hasCaravan = row.identification && String(row.identification).trim() !== '';
        const hasCategory = row.category && String(row.category).trim() !== '';
        const hasDiagnosis = row.diagnosis && String(row.diagnosis).trim() !== '';
        const hasStage = row.gestational_stage && String(row.gestational_stage).trim() !== '';
        const hasObservations = row.observations && String(row.observations).trim() !== '';
        
        // Check for other dynamic template keys if any
        const otherKeys = Object.keys(row).filter(key => 
          !key.endsWith('_meta') && 
          !['identification', 'category', 'diagnosis', 'gestational_stage', 'observations', 'unnamed_column'].includes(key)
        );
        const hasOtherValues = otherKeys.some(k => row[k] && String(row[k]).trim() !== '');

        return hasCaravan || hasCategory || hasDiagnosis || hasStage || hasObservations || hasOtherValues;
      });

      setLocalRows(filteredRows);
    }
  }, [data]);

  const handleCellEdit = useCallback((rowIndex: number, field: string, value: string) => {
    setLocalRows(prev => {
      const newRows = [...prev];
      const currentRow = { ...newRows[rowIndex] };
      currentRow[field] = value;
      // Mark as manually edited (full confidence)
      currentRow[field + '_meta'] = { confidence: 1 };
      newRows[rowIndex] = currentRow;
      return newRows;
    });
  }, []);

  const handleRemoveRow = useCallback((rowIndex: number) => {
    setLocalRows(prev => prev.filter((_, idx) => idx !== rowIndex));
  }, []);

  // Use the custom hook for columns
  const columns = useResultsColumns({ localRows, handleCellEdit, identifiedTemplate });

  const handleImport = async () => {
    setImportStatus('importing');
    setImportError(null);

    try {
      const cleanedRows = localRows
        .map(row => {
          const { ...data } = row;
          Object.keys(data).forEach(key => { if (key.endsWith('_meta')) delete data[key]; });
          return data;
        })
        .filter(row => {
          const hasId = row.identification && String(row.identification).trim() !== '';
          const hasAnyValue = Object.values(row).some(val => val && String(val).trim() !== '');
          return hasId && hasAnyValue;
        });

      const templateCode = identifiedTemplate?.code?.toUpperCase();

      let response;

      if (templateCode === 'REP-01') {
        // ─── REP-01: Gestation Diagnosis Flow ───
        // This flow evaluates EXISTING caravans, not creating new ones.
        response = await axiosInstance.post('/caravans/import-gestation-ocr', {
          rows: cleanedRows.map(row => ({
            identification: row.identification,
            diagnostico: row.diagnostico || row.diagnosis || 'EMPTY',
            gestation_stage: row.gestation_stage || row.gestational_stage || row.estadio_estimado || null,
            observations: row.observations || null,
          })),
          service_order_id: context?.service_order_id || null,
          diagnosis_date: new Date().toISOString().split('T')[0],
          empty_cows_batch_id: emptyDestinationBatchId || null,
        });
      } else {
        // ─── Standard: Caravan Import Flow ───
        response = await axiosInstance.post('/caravans/import', {
          rows: cleanedRows,
          work_type: workdayType,
          batch_id: context?.batch_id || null,
          farm_id: context?.farm_id || null,
          batch_name: context?.lote || null,
          empty_destination_batch_id: emptyDestinationBatchId || null,
          service_order_id: context?.service_order_id || null,
        });
      }

      if (response.status === 200 || response.status === 201) {
        setImportResult(response.data.data);
        setImportStatus('done');
      } else {
        throw new Error(response.data.message || 'Import failed');
      }
    } catch (err: any) {
      setImportError(err.response?.data?.message || err.message || 'Import failed');
      setImportStatus('error');
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.paper',
      color: 'text.primary'
    }}>
      {/* Header Area */}
      <ResultsHeader 
        animalCount={localRows.length}
        ocrProvider={ocrProvider}
        suggestedWorkdayCode={suggestedWorkdayCode}
        importStatus={importStatus}
        importResult={importResult}
        onReset={onReset}
        onImport={handleImport}
      />

      {/* Document Header (Establecimiento, Service Order, Template Code, Lote, CUIT, RENSPA, Fecha) */}
      <DocumentHeaderBar context={context} identifiedTemplate={identifiedTemplate} />

      {/* Context Area */}
      <ResultsContextBar context={context} />

      {/* Main Content (Helper + Table) */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Puedes editar cualquier celda directamente. Los cambios marcados en color indican baja confianza del OCR.
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden', mx: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {identifiedTemplate?.code?.toUpperCase() === 'REP-01' ? (
            <Rep01ResultsTable
              rows={localRows}
              onCellEdit={handleCellEdit}
              onRemoveRow={handleRemoveRow}
            />
          ) : (
            <DataTable
              columns={columns}
              data={localRows}
              enableEditing={true}
              editDisplayMode="cell"
              enableRowSelection={true}
              enableColumnOrdering={true}
              enableGlobalFilter={true}
              initialState={{
                density: 'compact',
                pagination: { pageSize: 15, pageIndex: 0 },
                showGlobalFilter: true
              }}
              muiTablePaperProps={{ sx: { height: '100%', boxShadow: 'none' } }}
            />
          )}
        </Box>
      </Box>

      {/* Error Feedback */}
      <Snackbar open={!!importError} autoHideDuration={6000} onClose={() => setImportError(null)}>
        <Alert onClose={() => setImportError(null)} severity="error" variant="filled" sx={{ width: '100%' }}>
          {importError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResultsPanel;
