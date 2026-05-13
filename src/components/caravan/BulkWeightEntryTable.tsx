import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
  Box,
  Stack,
  Paper,
  Typography,
  useTheme,
  alpha,
  Container
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from './columns/CaravanColumns';

interface BulkWeightEntryTableProps {
  batchName: string;
  caravans: Caravan[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

interface WeightFormValues {
  weights: {
    caravan_id: number;
    identification: string;
    category: string;
    current_weight: number | null;
    new_weight: number;
    weighing_date: string;
    notes: string;
  }[];
}

export function BulkWeightEntryTable({ batchName, caravans, onSave, onCancel }: BulkWeightEntryTableProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WeightFormValues>({
    defaultValues: {
      weights: caravans.map(c => ({
        caravan_id: c.id,
        identification: c.identification,
        category: c.category || '-',
        current_weight: c.current_weight,
        new_weight: 0,
        weighing_date: new Date().toISOString().split('T')[0],
        notes: ''
      }))
    }
  });

  const { fields } = useFieldArray({
    control,
    name: 'weights'
  });

  const onSubmit = (data: WeightFormValues) => {
    const formattedWeights = data.weights.map(w => ({
      caravan_id: w.caravan_id,
      weight: w.new_weight,
      weighing_date: w.weighing_date,
      notes: w.notes
    }));
    onSave(formattedWeights);
  };

  // Spreadsheet-style Constants
  const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';
  const focusBorder = theme.palette.primary.main;

  const cellStyle = {
    p: 0,
    borderRight: 1,
    borderBottom: 1,
    borderColor: theme.palette.divider,
    '&:last-child': { borderRight: 0 }
  };

  const inputSx = {
    '& .MuiInputBase-root': {
      borderRadius: 0,
      fontSize: '0.875rem',
      backgroundColor: 'transparent',
      height: '40px',
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `inset 0 0 0 2px ${focusBorder}`,
        zIndex: 1
      }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    },
    '& input': {
      padding: '8px 12px'
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header Panel */}
      <Box sx={{ 
        p: 3, 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '12px', color: 'primary.main' }}>
            <FuseSvgIcon size={24}>heroicons-outline:scale</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Carga Masiva de Pesajes</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Lote: <Box component="span" sx={{ color: 'primary.main' }}>{batchName}</Box> ({caravans.length} animales)
            </Typography>
          </Box>
        </Stack>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Container maxWidth={false} sx={{ py: 4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '4px',
              border: 1,
              borderColor: theme.palette.divider,
              overflow: 'hidden',
              bgcolor: theme.palette.background.paper
            }}
          >
            <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
              <Table stickyHeader size="small" sx={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.secondary, fontWeight: 700, width: 50 }}>#</TableCell>
                    <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 150, fontWeight: 700, px: 2, py: 1.5 }}>Caravana</TableCell>
                    <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 140, fontWeight: 700, px: 2, py: 1.5 }}>Categoría</TableCell>
                    <TableCell align="right" sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 120, fontWeight: 700, px: 2, py: 1.5 }}>Peso Actual</TableCell>
                    <TableCell align="right" sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 130, fontWeight: 800, px: 2, py: 1.5, color: 'primary.main' }}>Nuevo Peso (kg)</TableCell>
                    <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 150, fontWeight: 700, px: 2, py: 1.5 }}>Fecha Pesaje</TableCell>
                    <TableCell sx={{ ...cellStyle, bgcolor: headerBg, minWidth: 250, fontWeight: 700, px: 2, py: 1.5 }}>Notas / Observaciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id} sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}>
                      <TableCell align="center" sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.disabled, fontSize: '0.75rem' }}>
                        {index + 1}
                      </TableCell>

                      <TableCell sx={{ ...cellStyle, px: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {field.identification}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ ...cellStyle, px: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                          {field.category}
                        </Typography>
                      </TableCell>

                      <TableCell align="right" sx={{ ...cellStyle, px: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.disabled' }}>
                          {field.current_weight ? `${field.current_weight.toLocaleString()} kg` : '-'}
                        </Typography>
                      </TableCell>

                      <TableCell sx={cellStyle}>
                        <TextField
                          {...register(`weights.${index}.new_weight` as const, { valueAsNumber: true })}
                          fullWidth
                          variant="outlined"
                          type="number"
                          placeholder="0.00"
                          sx={{ ...inputSx, '& input': { textAlign: 'right', fontWeight: 800, color: 'primary.main' } }}
                        />
                      </TableCell>

                      <TableCell sx={cellStyle}>
                        <TextField
                          {...register(`weights.${index}.weighing_date` as const)}
                          fullWidth
                          variant="outlined"
                          type="date"
                          sx={inputSx}
                        />
                      </TableCell>

                      <TableCell sx={cellStyle}>
                        <TextField
                          {...register(`weights.${index}.notes` as const)}
                          fullWidth
                          variant="outlined"
                          placeholder="Añadir nota..."
                          sx={inputSx}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>

        {/* Sticky Footer Actions */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderTop: 1,
            borderColor: theme.palette.divider,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            zIndex: 1000,
            py: 2
          }}
        >
          <Container maxWidth={false}>
            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="text"
                onClick={onCancel}
                sx={{ textTransform: 'none', fontWeight: 600, px: 4, color: 'text.secondary' }}
              >
                Descartar Cambios
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  px: 6,
                  bgcolor: theme.palette.primary.main,
                  borderRadius: '4px',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: theme.palette.primary.dark, boxShadow: 'none' }
                }}
              >
                Guardar Pesajes Registrados
              </Button>
            </Stack>
          </Container>
        </Box>
      </form>
    </Box>
  );
}
