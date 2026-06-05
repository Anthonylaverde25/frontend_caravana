import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface Rep01ResultsTableProps {
  rows: any[];
  onCellEdit: (rowIndex: number, field: string, value: string) => void;
  onRemoveRow: (rowIndex: number) => void;
}

interface Rep01RowProps {
  row: any;
  index: number;
  onCellEdit: (rowIndex: number, field: string, value: string) => void;
  onRemoveRow: (rowIndex: number) => void;
  isDark: boolean;
  theme: any;
  zebraBg: string;
  headerBg: string;
}

const cellStyle = (theme: any) => ({
  p: 0,
  borderRight: 1,
  borderBottom: 1,
  borderColor: theme.palette.divider,
  '&:last-child': { borderRight: 0 }
});

const inputSx = (theme: any, isDark: boolean) => ({
  '& .MuiInputBase-root': {
    borderRadius: 0,
    fontSize: '0.875rem',
    backgroundColor: 'transparent',
    height: '40px',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}`,
      zIndex: 1
    },
    '&.Mui-error': {
      boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}`
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  },
  '& input': {
    padding: '8px 12px'
  }
});

function Rep01Row({
  row,
  index,
  onCellEdit,
  onRemoveRow,
  isDark,
  theme,
  zebraBg,
  headerBg
}: Rep01RowProps) {
  const [localCaravan, setLocalCaravan] = useState(row.identification || '');
  const [localCategory, setLocalCategory] = useState(row.category || '');
  const [localObservations, setLocalObservations] = useState(row.observations || '');

  useEffect(() => {
    setLocalCaravan(row.identification || '');
    setLocalCategory(row.category || '');
    setLocalObservations(row.observations || '');
  }, [row.identification, row.category, row.observations]);

  // Confidence metadata helpers
  const getFieldMeta = (field: string) => {
    return row[field + '_meta'] || { confidence: 1 };
  };

  const renderConfidenceAlert = (field: string, isSelect = false) => {
    const meta = getFieldMeta(field);
    const confidence = meta.confidence;
    if (confidence >= 0.95) return null;

    const isCritical = confidence < 0.7;
    return (
      <Box
        sx={{
          position: 'absolute',
          right: isSelect ? 32 : 8,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        <Tooltip title={`OCR Confidence: ${(confidence * 100).toFixed(1)}%`}>
          {isCritical ? (
            <ErrorIcon sx={{ fontSize: 16 }} color="error" />
          ) : (
            <WarningIcon sx={{ fontSize: 16 }} color="warning" />
          )}
        </Tooltip>
      </Box>
    );
  };

  const diagnosis = row.diagnosis || '';
  const isPregnant = diagnosis === 'PREGNANT';

  return (
    <TableRow sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}>
      {/* 1. Index */}
      <TableCell
        align="center"
        sx={{
          ...cellStyle(theme),
          bgcolor: headerBg,
          color: theme.palette.text.disabled,
          fontSize: '0.75rem',
          width: 40
        }}
      >
        {index + 1}
      </TableCell>

      {/* 2. Document Row Ref */}
      <TableCell
        align="center"
        sx={{
          ...cellStyle(theme),
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          width: 60
        }}
      >
        {row.unnamed_column || '-'}
      </TableCell>

      {/* 3. Caravan Identification */}
      <TableCell sx={cellStyle(theme)}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <TextField
            fullWidth
            variant="outlined"
            sx={{
              ...inputSx(theme, isDark),
              '& input': {
                padding: '8px 12px',
                paddingRight: getFieldMeta('identification').confidence < 0.95 ? '32px' : '12px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#0a6ed1'
              }
            }}
            value={localCaravan}
            onChange={(e) => setLocalCaravan(e.target.value)}
            onBlur={() => {
              if (localCaravan !== row.identification) {
                onCellEdit(index, 'identification', localCaravan);
              }
            }}
          />
          {renderConfidenceAlert('identification')}
        </Box>
      </TableCell>

      {/* 4. Category */}
      <TableCell sx={cellStyle(theme)}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <TextField
            fullWidth
            variant="outlined"
            sx={{
              ...inputSx(theme, isDark),
              '& input': {
                padding: '8px 12px',
                paddingRight: getFieldMeta('category').confidence < 0.95 ? '32px' : '12px'
              }
            }}
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
            onBlur={() => {
              if (localCategory !== row.category) {
                onCellEdit(index, 'category', localCategory);
              }
            }}
          />
          {renderConfidenceAlert('category')}
        </Box>
      </TableCell>

      {/* 5. Pregnancy Diagnosis (Select) */}
      <TableCell sx={cellStyle(theme)}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <TextField
            select
            fullWidth
            variant="outlined"
            sx={{
              ...inputSx(theme, isDark),
              '& .MuiSelect-select': {
                paddingRight: getFieldMeta('diagnosis').confidence < 0.95 ? '48px !important' : '24px !important',
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                boxSizing: 'border-box',
                py: 0
              }
            }}
            value={diagnosis}
            onChange={(e) => {
              const val = e.target.value;
              onCellEdit(index, 'diagnosis', val);
              // Auto clear gestational stage if empty
              if (val === 'EMPTY') {
                onCellEdit(index, 'gestational_stage', '');
              }
            }}
          >
            <MenuItem value="PREGNANT">Preñada 🟢</MenuItem>
            <MenuItem value="EMPTY">Vacía 🔴</MenuItem>
          </TextField>
          {renderConfidenceAlert('diagnosis', true)}
        </Box>
      </TableCell>

      {/* 6. Gestational Stage (Select) */}
      <TableCell sx={cellStyle(theme)}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <TextField
            select
            fullWidth
            variant="outlined"
            disabled={!isPregnant}
            sx={{
              ...inputSx(theme, isDark),
              '& .MuiSelect-select': {
                paddingRight: getFieldMeta('gestational_stage').confidence < 0.95 ? '48px !important' : '24px !important',
                display: 'flex',
                alignItems: 'center',
                height: '40px',
                boxSizing: 'border-box',
                py: 0
              }
            }}
            value={row.gestational_stage || ''}
            onChange={(e) => onCellEdit(index, 'gestational_stage', e.target.value)}
          >
            <MenuItem value="">
              <em>-- N/A --</em>
            </MenuItem>
            <MenuItem value="head">Cabeza (&gt; 2 meses)</MenuItem>
            <MenuItem value="body">Cuerpo (1-2 meses)</MenuItem>
            <MenuItem value="tail">Cola (&lt; 1 mes)</MenuItem>
          </TextField>
          {renderConfidenceAlert('gestational_stage', true)}
        </Box>
      </TableCell>

      {/* 7. Observations */}
      <TableCell sx={cellStyle(theme)}>
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <TextField
            fullWidth
            variant="outlined"
            sx={{
              ...inputSx(theme, isDark),
              '& input': {
                padding: '8px 12px',
                paddingRight: getFieldMeta('observations').confidence < 0.95 ? '32px' : '12px'
              }
            }}
            value={localObservations}
            onChange={(e) => setLocalObservations(e.target.value)}
            onBlur={() => {
              if (localObservations !== row.observations) {
                onCellEdit(index, 'observations', localObservations);
              }
            }}
          />
          {renderConfidenceAlert('observations')}
        </Box>
      </TableCell>

      {/* 8. Actions (Delete Row) */}
      <TableCell align="center" sx={{ ...cellStyle(theme), borderRight: 0, width: 50 }}>
        <IconButton
          size="small"
          onClick={() => onRemoveRow(index)}
          disabled={index === 0 && row.length === 1}
          sx={{
            color: theme.palette.text.disabled,
            '&:hover': { color: theme.palette.error.main }
          }}
        >
          <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

export default function Rep01ResultsTable({
  rows,
  onCellEdit,
  onRemoveRow
}: Rep01ResultsTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '4px',
          border: 1,
          borderColor: theme.palette.divider,
          overflow: 'hidden',
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <TableContainer sx={{ maxHeight: '100%', overflowY: 'auto' }}>
          <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    ...cellStyle(theme),
                    bgcolor: headerBg,
                    color: theme.palette.text.secondary,
                    fontWeight: 700,
                    width: 40,
                    py: 1.5
                  }}
                >
                  #
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    ...cellStyle(theme),
                    bgcolor: headerBg,
                    color: theme.palette.text.secondary,
                    fontWeight: 700,
                    width: 60,
                    py: 1.5
                  }}
                >
                  Fila Doc
                </TableCell>
                <TableCell
                  sx={{
                    ...cellStyle(theme),
                    bgcolor: headerBg,
                    minWidth: 160,
                    fontWeight: 700,
                    px: 2,
                    py: 1.5,
                    color: theme.palette.text.primary
                  }}
                >
                  Identificación / Caravana
                </TableCell>
                <TableCell
                  sx={{
                    ...cellStyle(theme),
                    bgcolor: headerBg,
                    minWidth: 120,
                    fontWeight: 700,
                    px: 2,
                    py: 1.5,
                    color: theme.palette.text.primary
                  }}
                >
                  Categoría
                </TableCell>
                <TableCell
                  sx={{
                    ...cellStyle(theme),
                    bgcolor: headerBg,
                    minWidth: 160,
                    fontWeight: 700,
                    px: 2,
                    py: 1.5,
                    color: theme.palette.text.primary
                  }}
                >
                  Diagnóstico (Tacto)
                </TableCell>
                <TableCell
                  sx={{
                    ...cellStyle(theme),
                    bgcolor: headerBg,
                    minWidth: 180,
                    fontWeight: 700,
                    px: 2,
                    py: 1.5,
                    color: theme.palette.text.primary
                  }}
                >
                  Estadio Estimado
                </TableCell>
                <TableCell
                  sx={{
                    ...cellStyle(theme),
                    bgcolor: headerBg,
                    minWidth: 200,
                    fontWeight: 700,
                    px: 2,
                    py: 1.5,
                    color: theme.palette.text.primary
                  }}
                >
                  Observaciones
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    ...cellStyle(theme),
                    bgcolor: headerBg,
                    width: 50,
                    borderRight: 0,
                    py: 1.5
                  }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <Rep01Row
                  key={index + '-' + (row.identification || '')}
                  row={row}
                  index={index}
                  onCellEdit={onCellEdit}
                  onRemoveRow={onRemoveRow}
                  isDark={isDark}
                  theme={theme}
                  zebraBg={zebraBg}
                  headerBg={headerBg}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
