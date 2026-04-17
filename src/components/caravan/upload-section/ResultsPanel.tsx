import { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Avatar,
  Chip,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  Storage as StorageIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  TableChart as TableChartIcon,
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { MRT_ColumnDef } from 'material-react-table';
import axiosInstance from '@/lib/axiosInstance';
import DataTable from 'src/components/data-table/DataTable';
import { TableResult, ImportResult, DataValue } from './types';

interface ResultsPanelProps {
  data: TableResult[];
  ocrProvider: 'azure' | 'google';
  workdayType: string;
  onReset: () => void;
}

/**
 * ResultsPanel Component
 * Handles data visualization of OCR results using Material React Table
 * and massive DB import. Now supports inline editing.
 */
const ResultsPanel = ({ data, ocrProvider, workdayType, onReset }: ResultsPanelProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done' | 'error'>('idle');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState('');
  
  const tableData = data[activeTab];
  
  // ─── Local State for Editable Rows ───
  const [localRows, setLocalRows] = useState<Record<string, DataValue>[]>([]);

  // Sync local state with incoming props
  useEffect(() => {
    if (tableData) {
      setLocalRows(tableData.mapped_rows);
    }
  }, [tableData]);

  if (!tableData) return null;

  const mappedHeaders = Object.values(tableData.field_mapping);
  const allDbFields = [...new Set(mappedHeaders)];

  // ─── Column Definitions with Editing Support ───
  const columns = useMemo<MRT_ColumnDef<Record<string, DataValue>>[]>(
    () => allDbFields.map(field => ({
      // Accessor returns only the string value for editing
      accessorFn: (row) => row[field]?.value || '',
      id: field,
      header: field.toUpperCase(),
      // Display uses both value and confidence
      Cell: ({ cell, row }) => {
        const val = cell.getValue<string>();
        const confidence = row.original[field]?.confidence ?? 1.0;
        
        const hasWarning = confidence < 0.85;
        const hasCritical = confidence < 0.60;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.75rem',
                color: hasCritical ? 'error.main' : hasWarning ? 'warning.main' : 'inherit',
                fontWeight: (hasWarning || hasCritical) ? 'bold' : 'normal'
              }}
            >
              {val || '—'}
            </Typography>
            {confidence < 0.95 && (
              <Tooltip title={`Confidence: ${(confidence * 100).toFixed(1)}%`}>
                {hasCritical ? (
                  <ErrorIcon sx={{ fontSize: 12 }} color="error" />
                ) : (
                  <WarningIcon sx={{ fontSize: 12 }} color="warning" />
                )}
              </Tooltip>
            )}
          </Box>
        );
      },
      // Configure the text field for editing
      muiEditTextFieldProps: ({ cell, row }) => ({
        variant: 'standard',
        size: 'small',
        onBlur: (event) => {
          const newValue = event.target.value;
          handleCellEdit(row.index, field, newValue);
        },
      }),
    })),
    [allDbFields, localRows]
  );

  const handleCellEdit = (rowIndex: number, field: string, value: string) => {
    setLocalRows(prev => {
      const newRows = [...prev];
      const currentRow = { ...newRows[rowIndex] };
      
      // Update value and force 100% confidence since it's manually edited
      currentRow[field] = {
        value,
        confidence: 1.0
      };
      
      newRows[rowIndex] = currentRow;
      return newRows;
    });
  };

  const handleImport = async () => {
    setImportStatus('importing');
    setImportError('');

    try {
      // Use localRows (the edited ones) instead of props
      const cleanedRows = localRows
        .map(row => {
          const cleaned: Record<string, string> = {};
          Object.entries(row).forEach(([alias, dataValue]) => {
            // Use the field mapping to translate back to DB field names
            // If the field name is already a target field (from mapped_rows), use it directly
            const targetField = tableData.field_mapping[alias] || alias;
            cleaned[targetField] = dataValue.value;
          });
          return cleaned;
        })
        .filter(row => {
          const hasId = row.identification && String(row.identification).trim() !== '';
          const hasAnyValue = Object.values(row).some(val => val && String(val).trim() !== '');
          return hasId && hasAnyValue;
        });

      const response = await axiosInstance.post('/caravans/import', { 
        rows: cleanedRows,
        work_type: workdayType 
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
    <Box sx={{ width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: alpha('#1a73e8', 0.1), color: 'primary.main', width: 32, height: 32 }}>
            <TableChartIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Resultados del Análisis</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">{localRows.length} animales detectados</Typography>
              <Chip 
                label={ocrProvider === 'azure' ? 'Azure Engine' : 'Google AI Engine'} 
                size="small" 
                sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha(ocrProvider === 'azure' ? '#0078d4' : '#4285f4', 0.1), color: ocrProvider === 'azure' ? '#0078d4' : '#4285f4', borderColor: 'transparent' }} 
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {importStatus === 'done' && importResult && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
              <CheckCircleIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight="bold">{importResult.imported} importados</Typography>
            </Box>
          )}

          <Button
            variant="outlined"
            onClick={onReset}
            size="small"
            sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
            startIcon={<CloudUploadIcon />}
          >
            Nuevo Documento
          </Button>
          
          <Button
            variant="contained"
            disableElevation
            onClick={handleImport}
            disabled={importStatus === 'importing' || importStatus === 'done'}
            startIcon={importStatus === 'importing' ? <CircularProgress size={14} color="inherit" /> : importStatus === 'done' ? <CheckIcon /> : <StorageIcon />}
            color={importStatus === 'done' ? 'success' : 'primary'}
            size="small"
            sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
          >
            {importStatus === 'importing' ? 'Importando...' : importStatus === 'done' ? 'Éxito' : 'Guardar en BD'}
          </Button>

          {data.length > 1 && (
            <Tabs 
              value={activeTab} 
              onChange={(_, v) => setActiveTab(v)}
              sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0, textTransform: 'none', fontSize: '0.75rem' } }}
            >
              {data.map((_, i) => (
                <Tab key={i} label={`T${i + 1}`} />
              ))}
            </Tabs>
          )}
        </Box>
      </Box>

      {/* Helper Text */}
      <Box sx={{ px: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
         <EditIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
         <Typography variant="caption" color="text.secondary">
            Puedes hacer clic en cualquier celda para corregir errores manualmente antes de guardar.
         </Typography>
      </Box>

      {/* Material React Table with Editing Enabled */}
      <Box sx={{ flex: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 2, mx: 2 }}>
        <DataTable
          columns={columns}
          data={localRows}
          enableEditing={true}
          editDisplayMode="cell"
          enableRowSelection={true}
          enableColumnOrdering={true}
          enableGlobalFilter={true}
          enableRowActions={false}
          initialState={{
            density: 'compact',
            pagination: { pageSize: 15, pageIndex: 0 },
            showGlobalFilter: true
          }}
          muiTablePaperProps={{
            sx: { height: '100%', boxShadow: 'none' }
          }}
          muiTableContainerProps={{
            sx: { maxHeight: 550 }
          }}
        />
      </Box>

      {importError && (
        <Box sx={{ px: 2, mt: 2 }}>
          <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
             Error: {importError}
          </Typography>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {allDbFields.length} campos mapeados • {tableData.column_count} columnas origen
        </Typography>
      </Box>
    </Box>
  );
};

export default ResultsPanel;
