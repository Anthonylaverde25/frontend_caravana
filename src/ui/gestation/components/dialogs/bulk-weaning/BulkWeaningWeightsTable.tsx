import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Chip,
  InputAdornment,
  Stack,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface SelectedCalf {
  calf_id: number;
  calf_identification: string;
  calf_sex: string | null;
  mother_identification: string;
}

interface BulkWeaningWeightsTableProps {
  selectedCalves: SelectedCalf[];
  weights: Record<number, string>;
  onWeightChange: (calfId: number, value: string) => void;
  disabled: boolean;
}

export const BulkWeaningWeightsTable: React.FC<BulkWeaningWeightsTableProps> = ({
  selectedCalves,
  weights,
  onWeightChange,
  disabled,
}) => {
  const headerStyle = {
    bgcolor: 'action.hover',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    py: 1.2,
    px: 2,
    borderBottom: 1,
    borderColor: 'divider',
  };

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <FuseSvgIcon size={18} sx={{ color: 'primary.main' }}>
            heroicons-outline:scale
          </FuseSvgIcon>
          2. Registro de Pesos Individuales
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {selectedCalves.length} {selectedCalves.length === 1 ? 'animal a registrar' : 'animales a registrar'}
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <TableContainer sx={{ maxHeight: 310 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...headerStyle, width: 44, textAlign: 'center' }}>#</TableCell>
                <TableCell sx={headerStyle}>Caravana Cría</TableCell>
                <TableCell sx={headerStyle}>Madre</TableCell>
                <TableCell sx={{ ...headerStyle, textAlign: 'center', width: 120 }}>Sexo</TableCell>
                <TableCell sx={{ ...headerStyle, width: 180, textAlign: 'right' }}>
                  Peso al Destete *
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCalves.map((calf, index) => {
                const isMale = calf.calf_sex === 'M';
                const isFemale = calf.calf_sex === 'H';

                return (
                  <TableRow
                    key={calf.calf_id}
                    hover
                    sx={{
                      bgcolor: index % 2 === 1 ? 'action.hover' : 'transparent',
                    }}
                  >
                    <TableCell
                      sx={{
                        py: 1,
                        px: 1.5,
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1,
                        px: 2,
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    >
                      {calf.calf_identification}
                    </TableCell>

                    <TableCell
                      sx={{
                        py: 1,
                        px: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        color: 'text.secondary',
                      }}
                    >
                      {calf.mother_identification || 'Sin madre'}
                    </TableCell>

                    <TableCell sx={{ py: 1, px: 2, textAlign: 'center' }}>
                      <Chip
                        label={isMale ? 'Macho' : isFemale ? 'Hembra' : '-'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: isMale
                            ? 'rgba(59, 130, 246, 0.1)'
                            : isFemale
                            ? 'rgba(236, 72, 153, 0.1)'
                            : 'action.hover',
                          color: isMale ? '#2563eb' : isFemale ? '#db2777' : 'text.secondary',
                          border: 1,
                          borderColor: isMale
                            ? 'rgba(59, 130, 246, 0.3)'
                            : isFemale
                            ? 'rgba(236, 72, 153, 0.3)'
                            : 'divider',
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 0.75, px: 2, textAlign: 'right' }}>
                      <TextField
                        type="number"
                        inputProps={{ min: 0.1, step: 0.1 }}
                        value={weights[calf.calf_id] || ''}
                        onChange={(e) => onWeightChange(calf.calf_id, e.target.value)}
                        required
                        size="small"
                        variant="filled"
                        disabled={disabled}
                        placeholder="Ej: 180"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem' }}>
                                kg
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          maxWidth: 150,
                          ml: 'auto',
                          bgcolor: 'action.hover',
                          '& .MuiInputBase-input': {
                            py: 0.75,
                            textAlign: 'right',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
};

export default BulkWeaningWeightsTable;
