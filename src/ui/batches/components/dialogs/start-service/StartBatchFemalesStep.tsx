import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Paper,
  InputAdornment,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

interface StartBatchFemalesStepProps {
  batchName: string;
  batchFemales: Caravan[];
  selectedFemaleIds: number[];
  setSelectedFemaleIds: React.Dispatch<React.SetStateAction<number[]>>;
  femaleSearch: string;
  setFemaleSearch: (val: string) => void;
}

export const StartBatchFemalesStep: React.FC<StartBatchFemalesStepProps> = ({
  batchName,
  batchFemales,
  selectedFemaleIds,
  setSelectedFemaleIds,
  femaleSearch,
  setFemaleSearch,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const filteredFemales = useMemo(() => {
    if (!femaleSearch.trim()) return batchFemales;
    const q = femaleSearch.toLowerCase();
    return batchFemales.filter(
      (c) =>
        c.identification?.toLowerCase().includes(q) ||
        c.category_name?.toLowerCase().includes(q)
    );
  }, [batchFemales, femaleSearch]);

  const allSelected =
    filteredFemales.length > 0 &&
    filteredFemales.every((c) => selectedFemaleIds.includes(c.id!));
  const someSelected =
    filteredFemales.some((c) => selectedFemaleIds.includes(c.id!)) && !allSelected;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      const filteredIds = new Set(filteredFemales.map((c) => c.id!));
      setSelectedFemaleIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const newSelected = new Set([...selectedFemaleIds, ...filteredFemales.map((c) => c.id!)]);
      setSelectedFemaleIds(Array.from(newSelected));
    }
  };

  const handleToggleFemale = (id: number) => {
    setSelectedFemaleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Stack spacing={2.5}>
      {/* Banner explicativo del Lote Base */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '8px',
          border: 1,
          borderColor: 'divider',
          bgcolor: isDark ? 'background.default' : '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Vientres Residentes en {batchName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Se cargan automáticamente las hembras de cría de este lote base. Podés desmarcar vientres de descarte o no aptos.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`${selectedFemaleIds.length} de ${batchFemales.length} seleccionadas`}
            sx={{ fontWeight: 700 }}
          />
        </Stack>
      </Paper>

      {/* Buscador de caravanas */}
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por caravana o categoría..."
        value={femaleSearch}
        onChange={(e) => setFemaleSearch(e.target.value)}
        variant="filled"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
            </InputAdornment>
          ),
          sx: { borderRadius: '6px', bgcolor: 'action.hover' },
        }}
      />

      {/* Tabla de Vientres */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          maxHeight: 320,
          borderRadius: '8px',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleToggleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>CARAVANA</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>CATEGORÍA</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">
                PESO ACTUAL
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFemales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No se encontraron hembras registradas en este lote.
                </TableCell>
              </TableRow>
            ) : (
              filteredFemales.map((female) => {
                const isChecked = selectedFemaleIds.includes(female.id!);
                return (
                  <TableRow
                    key={female.id}
                    hover
                    selected={isChecked}
                    onClick={() => handleToggleFemale(female.id!)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={isChecked} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                      {female.identification}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {female.category_name ?? 'Vientre'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {female.current_weight ? `${female.current_weight} kg` : '-'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
