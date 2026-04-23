import { useMemo } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { Error as ErrorIcon, Warning as WarningIcon } from '@mui/icons-material';
import { MRT_ColumnDef } from 'material-react-table';
import { TableResult } from '../types';

interface UseResultsColumnsProps {
  localRows: any[];
  handleCellEdit: (rowIndex: number, field: string, value: string) => void;
}

/**
 * Hook to manage the complex column definitions for the results table.
 * Includes confidence-based styling and inline editing configuration.
 */
export const useResultsColumns = ({ localRows, handleCellEdit }: UseResultsColumnsProps) => {
  const allDbFields = useMemo(() => {
    if (!localRows.length) return [];
    // Filter out internal metadata fields to avoid rendering them as columns
    return Object.keys(localRows[0]).filter(key => !key.endsWith('_meta'));
  }, [localRows]);

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => allDbFields.map((field) => ({
      accessorKey: field,
      header: field.replace(/_/g, ' ').toUpperCase(),
      Cell: ({ cell }) => {
        const rowData = cell.row.original;
        const fieldData = rowData[field + '_meta'] || { confidence: 1 };
        const val = cell.getValue<string>();
        const confidence = fieldData.confidence;

        // Visual alerts for low confidence
        const hasWarning = confidence < 0.95 && confidence >= 0.7;
        const hasCritical = confidence < 0.7;

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
      muiEditTextFieldProps: ({ cell, row }) => ({
        variant: 'standard',
        size: 'small',
        onBlur: (event) => {
          const newValue = event.target.value;
          handleCellEdit(row.index, field, newValue);
        },
      }),
    })),
    [allDbFields, handleCellEdit]
  );

  return columns;
};
