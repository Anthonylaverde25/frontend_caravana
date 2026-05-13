import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  IconButton,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCaravanWeights } from '@/features/caravans/hooks/useCaravanWeights';
import { useRecordCaravanWeight } from '@/features/caravans/hooks/useRecordCaravanWeight';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

interface CaravanWeightDialogProps {
  open: boolean;
  onClose: () => void;
  caravan: Caravan | null;
}

export function CaravanWeightDialog({ open, onClose, caravan }: CaravanWeightDialogProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data: weights = [], isLoading } = useCaravanWeights(caravan?.id);
  const { mutateAsync: recordWeight, isPending } = useRecordCaravanWeight();

  const [newWeight, setNewWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleRecord = async () => {
    if (!caravan || !newWeight) return;

    try {
      await recordWeight({
        id: caravan.id,
        data: {
          weight: parseFloat(newWeight),
          weighing_date: date,
          notes: notes
        }
      });
      setNewWeight('');
      setNotes('');
    } catch (error) {
      console.error('Error recording weight:', error);
    }
  };

  if (!caravan) return null;

  // Spreadsheet-style Constants
  const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';
  const focusBorder = theme.palette.primary.main;

  const cellStyle = {
    p: 1.5,
    borderRight: 1,
    borderBottom: 1,
    borderColor: theme.palette.divider,
    fontSize: '0.8125rem',
    '&:last-child': { borderRight: 0 }
  };

  const inputSx = {
    '& .MuiInputBase-root': {
      borderRadius: '4px',
      fontSize: '0.875rem',
      backgroundColor: isDark ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.black, 0.02),
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 2px ${alpha(focusBorder, 0.2)}`,
      }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(theme.palette.text.primary, 0.2),
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          borderRadius: '8px',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)'
        } 
      }}
    >
      <DialogTitle sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: headerBg
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '8px', color: 'primary.main', display: 'flex' }}>
            <FuseSvgIcon size={20}>heroicons-outline:scale</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              Historial de Pesajes
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              ID Animal: {caravan.identification}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.01) }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Peso Actual"
              variant="filled"
              size="small"
              fullWidth
              value={caravan.current_weight ? `${caravan.current_weight.toLocaleString()} kg` : 'SIN REGISTRO'}
              InputProps={{ 
                readOnly: true,
                sx: { 
                  fontWeight: 800, 
                  color: 'success.main',
                  bgcolor: isDark ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.success.main, 0.02)
                }
              }}
              focused={false}
            />
            <TextField
              label="Nuevo Peso (kg)"
              type="number"
              size="small"
              fullWidth
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              sx={inputSx}
            />
            <TextField
              label="Fecha de Pesaje"
              type="date"
              size="small"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={inputSx}
            />
          </Stack>
          <TextField
            label="Notas / Observaciones"
            fullWidth
            size="small"
            multiline
            rows={1}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={inputSx}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={handleRecord}
              disabled={isPending || !newWeight}
              sx={{ 
                fontWeight: 800, 
                px: 4, 
                borderRadius: '6px',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              {isPending && <CircularProgress size={16} sx={{ mr: 1, color: 'inherit' }} />}
              Guardar Pesaje
            </Button>
          </Box>
        </Box>

        <Box sx={{ minHeight: 200 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <TableContainer>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...cellStyle, bgcolor: headerBg, fontWeight: 800, width: '25%' }}>Fecha</TableCell>
                    <TableCell sx={{ ...cellStyle, bgcolor: headerBg, fontWeight: 800, width: '25%' }} align="right">Peso (kg)</TableCell>
                    <TableCell sx={{ ...cellStyle, bgcolor: headerBg, fontWeight: 800, width: '35%' }}>Notas</TableCell>
                    <TableCell sx={{ ...cellStyle, bgcolor: headerBg, fontWeight: 800, width: '15%' }} align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weights.length > 0 ? (
                    weights.map((w: any, index: number) => (
                      <TableRow key={w.id} sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}>
                        <TableCell sx={cellStyle}>{w.weighing_date}</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 700 }} align="right">
                          {w.weight.toLocaleString()} kg
                        </TableCell>
                        <TableCell sx={{ ...cellStyle, color: 'text.secondary', fontStyle: 'italic' }}>
                          {w.notes || '-'}
                        </TableCell>
                        <TableCell sx={{ ...cellStyle, textAlign: 'center' }}>
                          {w.current ? (
                            <Typography variant="caption" sx={{ 
                              bgcolor: alpha(theme.palette.success.main, 0.1), 
                              color: 'success.main', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: '4px', 
                              fontWeight: 800,
                              fontSize: '0.65rem'
                            }}>
                              ACTUAL
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                              Histórico
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          No hay registros de pesajes para este animal.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: headerBg }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
