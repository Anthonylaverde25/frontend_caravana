import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axiosInstance from '@/lib/axiosInstance';
import DataTable from 'src/components/data-table/DataTable';
import { TableResult, ImportResult, DocumentContext } from './types';

// Sub-components & Hooks
import { ResultsHeader } from './results/ResultsHeader';
import { ResultsContextBar } from './results/ResultsContextBar';
import { useResultsColumns } from './results/useResultsColumns';

interface ResultsPanelProps {
  data: TableResult[];
  context?: DocumentContext;
  ocrProvider: 'azure' | 'google';
  workdayType: string;
  suggestedWorkdayCode?: string;
  onReset: () => void;
}

/**
 * ResultsPanel Component (Container)
 * Orchestrates the data visualization, editing, and massive import process.
 */
const ResultsPanel = ({ data, context, ocrProvider, workdayType, suggestedWorkdayCode, onReset }: ResultsPanelProps) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done' | 'error'>('idle');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [localRows, setLocalRows] = useState<any[]>([]);

  // Initialize local rows from the first table result
  useEffect(() => {
    if (data && data.length > 0) {
      setLocalRows(data[0].mapped_rows.map(row => {
        const flatRow: any = {};
        Object.entries(row).forEach(([key, val]) => {
          flatRow[key] = val.value;
          flatRow[key + '_meta'] = { confidence: val.confidence };
        });
        return flatRow;
      }));
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

  // Use the custom hook for columns
  const columns = useResultsColumns({ localRows, handleCellEdit });

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

      const response = await axiosInstance.post('/caravans/import', {
        rows: cleanedRows,
        work_type: workdayType,
        batch_id: context?.batch_id || null,
        farm_id: context?.farm_id || null,
        batch_name: context?.lote || null,
      });

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
