import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import axiosInstance from '@/lib/axiosInstance';
import { TableResult, ImportResult } from './types';

interface ResultsPanelProps {
  data: TableResult[];
  ocrProvider: 'azure' | 'google';
}

/**
 * ResultsPanel Component
 * Handles data visualization of OCR results and massive DB import.
 */
const ResultsPanel = ({ data, ocrProvider }: ResultsPanelProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done' | 'error'>('idle');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState('');
  const table = data[activeTab];

  if (!table) return null;

  const mappedHeaders = Object.values(table.field_mapping);
  const allDbFields = [...new Set(mappedHeaders)];

  const handleImport = async () => {
    setImportStatus('importing');
    setImportError('');

    try {
      const cleanedRows = table.mapped_rows
        .map(row => {
          const cleaned: Record<string, string> = {};
          Object.entries(row).forEach(([alias, dataValue]) => {
            const targetField = table.field_mapping[alias] || alias;
            cleaned[targetField] = dataValue.value;
          });
          return cleaned;
        })
        .filter(row => {
          const hasId = row.identification && String(row.identification).trim() !== '';
          const hasAnyValue = Object.values(row).some(val => val && String(val).trim() !== '');
          return hasId && hasAnyValue;
        });

      const response = await axiosInstance.post('/caravans/import', { rows: cleanedRows });

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
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: alpha('#1a73e8', 0.1), color: 'primary.main', width: 32, height: 32 }}>
            <TableChartIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Extracted Data</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">{table.mapped_rows.length} rows</Typography>
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
              <Typography variant="caption" fontWeight="bold">{importResult.imported} imported</Typography>
            </Box>
          )}
          
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
            {importStatus === 'importing' ? 'Importing...' : importStatus === 'done' ? 'Success' : 'Import to DB'}
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

      {/* Field Mapping Summary */}
      <Box sx={{ px: 2, mb: 3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', display: 'block', mb: 1, letterSpacing: 0.5 }}>
          Auto-Detected Mapping
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(table.field_mapping).map(([alias, field]) => (
            <Chip 
              key={alias}
              variant="outlined"
              size="small"
              sx={{ borderRadius: 1.5, height: 24, '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.65rem' } }}
              label={
                <>
                  <Typography variant="caption" sx={{ fontSize: 'inherit' }}>{alias}</Typography>
                  <ArrowForwardIcon sx={{ fontSize: 10, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontSize: 'inherit', fontWeight: 'bold' }}>{field}</Typography>
                </>
              }
            />
          ))}
        </Box>
      </Box>

      {/* Data Table */}
      <TableContainer sx={{ maxHeight: 500, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default', width: 40, fontSize: '0.75rem' }}>#</TableCell>
              {allDbFields.map((field) => (
                <TableCell key={field} sx={{ fontWeight: 'bold', color: 'text.primary', bgcolor: 'background.default', fontSize: '0.75rem' }}>
                  {field.toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {table.mapped_rows.map((row, rowIdx) => (
              <TableRow key={rowIdx} hover>
                <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.7rem' }}>{rowIdx + 1}</TableCell>
                {allDbFields.map((field) => {
                  const cellData = row[field];
                  const hasWarning = cellData && cellData.confidence < 0.85;
                  const hasCritical = cellData && cellData.confidence < 0.60;

                  return (
                    <TableCell 
                      key={field} 
                      sx={{ 
                        fontSize: '0.75rem',
                        color: hasCritical ? 'error.main' : hasWarning ? 'warning.main' : 'inherit',
                        fontWeight: (hasWarning || hasCritical) ? 'bold' : 'normal',
                        bgcolor: hasCritical ? alpha('#d32f2f', 0.02) : hasWarning ? alpha('#ed6c02', 0.02) : 'transparent',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {cellData?.value || '—'}
                        {cellData && cellData.confidence < 0.95 && (
                          <Tooltip title={`Confidence: ${(cellData.confidence * 100).toFixed(1)}%`}>
                            {hasCritical ? (
                              <ErrorIcon sx={{ fontSize: 12 }} color="error" />
                            ) : (
                              <WarningIcon sx={{ fontSize: 12 }} color="warning" />
                            )}
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
          {allDbFields.length} fields mapped • {table.column_count} source columns
        </Typography>
      </Box>
    </Box>
  );
};

export default ResultsPanel;
