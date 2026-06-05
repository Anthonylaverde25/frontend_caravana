import { useMemo } from 'react';
import { Box, Typography, Tooltip, MenuItem } from '@mui/material';
import { Error as ErrorIcon, Warning as WarningIcon } from '@mui/icons-material';
import { MRT_ColumnDef } from 'material-react-table';

interface UseResultsColumnsProps {
  localRows: any[];
  handleCellEdit: (rowIndex: number, field: string, value: string) => void;
  identifiedTemplate?: any;
}

/**
 * Helper to normalize strings by removing spaces, underscores, and accents.
 */
const normalizeString = (str: string) => {
  return (str || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, ""); // remove spaces, underscores, and special chars
};

/**
 * Helper to match selectable options with resilient translation support (ES <-> EN).
 */
const matchSelectOption = (optVal: string, optLabel: string, rawVal: string) => {
  const oval = optVal.toLowerCase();
  const olabel = optLabel.toLowerCase();
  const val = rawVal.toLowerCase();
  
  if (oval === val || olabel === val) return true;
  
  // Gestation Stage translations
  const headTerms = ['head', 'cabeza', 'cobeza', 'cab'];
  const bodyTerms = ['body', 'cuerpo', 'cue'];
  const tailTerms = ['tail', 'cola', 'col'];
  
  if (headTerms.includes(val) && (headTerms.includes(oval) || headTerms.includes(olabel))) return true;
  if (bodyTerms.includes(val) && (bodyTerms.includes(oval) || bodyTerms.includes(olabel))) return true;
  if (tailTerms.includes(val) && (tailTerms.includes(oval) || tailTerms.includes(olabel))) return true;
  
  // Diagnosis translations
  const pregnantTerms = ['pregnant', 'preñada', 'prenada', 'preñadas', 'preñ'];
  const emptyTerms = ['empty', 'vacía', 'vacia', 'vacías', 'vac'];
  
  if (pregnantTerms.includes(val) && (pregnantTerms.includes(oval) || pregnantTerms.includes(olabel))) return true;
  if (emptyTerms.includes(val) && (emptyTerms.includes(oval) || emptyTerms.includes(olabel))) return true;
  
  return false;
};

/**
 * Helper to match table fields (raw from OCR or database alias) with schema fields.
 */
const findSchemaField = (field: string, identifiedTemplate: any) => {
  if (!identifiedTemplate?.schema_definition) return null;
  const schema = identifiedTemplate.schema_definition;
  
  const normField = normalizeString(field);
  
  return schema.find((f: any) => {
    const normName = normalizeString(f.name);
    const normLabel = normalizeString(f.label || '');
    
    // Check direct match
    if (normName === normField || normLabel === normField) return true;
    
    // Check known aliases/translations
    if (normField === 'identification' || normField === 'caravana') {
      return normName === 'caravana' || normName === 'identification';
    }
    if (normField === 'category' || normField === 'categoria' || normField === 'categora') {
      return normName === 'category' || normName === 'categoria';
    }
    if (normField === 'diagnosis' || normField === 'diagnostico' || normField === 'diagnstico') {
      return normName === 'diagnosis' || normName === 'diagnostico';
    }
    if (normField === 'gestationalstage' || normField === 'estadioestimado' || normField === 'estadioestimadoccc') {
      return normName === 'gestationalstage' || normName === 'estadioestimado' || normName === 'gestational_stage';
    }
    return false;
  });
};

/**
 * Hook to manage the complex column definitions for the results table.
 * Includes confidence-based styling and inline editing configuration.
 */
export const useResultsColumns = ({ localRows, handleCellEdit, identifiedTemplate }: UseResultsColumnsProps) => {
  const allDbFields = useMemo(() => {
    if (!localRows.length) return [];
    // Filter out internal metadata fields to avoid rendering them as columns
    return Object.keys(localRows[0]).filter(key => !key.endsWith('_meta'));
  }, [localRows]);
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => allDbFields.map((field) => {
      const schemaField = findSchemaField(field, identifiedTemplate);
      return {
        accessorKey: field,
        header: schemaField?.label || field.replace(/_/g, ' ').toUpperCase(),
        Cell: ({ cell }) => {
        const rowData = cell.row.original;
        const fieldData = rowData[field + '_meta'] || { confidence: 1 };
        let val = cell.getValue<string>();
        const confidence = fieldData.confidence;

        // Apply schema options translation for display labels
        const schemaField = findSchemaField(field, identifiedTemplate);
        if (schemaField && schemaField.type === 'select' && val) {
          const option = schemaField.options?.find((o: any) => 
            matchSelectOption(String(o.value), String(o.label || ''), val)
          );
          if (option) {
            val = option.label || option.value;
          }
        }

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
      muiEditTextFieldProps: ({ cell, row }) => {
        const schemaField = findSchemaField(field, identifiedTemplate);
        
        if (schemaField && schemaField.type === 'select') {
          const rawValue = cell.getValue<string>();
          const matchingOption = schemaField.options?.find((o: any) => 
            matchSelectOption(String(o.value), String(o.label || ''), rawValue)
          );
          const selectValue = matchingOption ? matchingOption.value : '';

          return {
            select: true,
            value: selectValue,
            variant: 'standard',
            size: 'small',
            onChange: (event: any) => {
              const newValue = event.target.value;
              handleCellEdit(row.index, field, newValue);
            },
            children: (schemaField.options || []).map((opt: any) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.75rem' }}>
                {opt.label || opt.value}
              </MenuItem>
            )),
          };
        }

        return {
          variant: 'standard',
          size: 'small',
          onBlur: (event: any) => {
            const newValue = event.target.value;
            handleCellEdit(row.index, field, newValue);
          },
        };
      },
    };
  }),
    [allDbFields, handleCellEdit, identifiedTemplate]
  );

  return columns;
};
