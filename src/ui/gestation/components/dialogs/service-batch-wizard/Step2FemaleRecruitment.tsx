import React from 'react';
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Paper,
  Button,
  CircularProgress,
  Stack,
  Avatar,
  InputAdornment,
  alpha,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { AnimalCategory } from '@/core/categories/domain/entities/AnimalCategory';

interface Step2FemaleRecruitmentProps {
  filteredFemales: Caravan[];
  selectedFemaleIds: number[];
  isLoadingCaravans: boolean;
  femaleSearch: string;
  setFemaleSearch: (val: string) => void;
  femaleBatchFilter: string;
  setFemaleBatchFilter: (val: string) => void;
  selectedCategoryName?: string;
  allBatches: Batch[];
  handleToggleFemale: (id: number) => void;
  handleSelectAllFilteredFemales: () => void;
  onResetFilters: () => void;
}

export const Step2FemaleRecruitment: React.FC<Step2FemaleRecruitmentProps> = ({
  filteredFemales,
  selectedFemaleIds,
  isLoadingCaravans,
  femaleSearch,
  setFemaleSearch,
  femaleBatchFilter,
  setFemaleBatchFilter,
  selectedCategoryName,
  allBatches,
  handleToggleFemale,
  handleSelectAllFilteredFemales,
  onResetFilters,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const active = isDark ? '#60a5fa' : '#0a6ed1';
  const headerBg = isDark ? '#1e293b' : '#f8fafc';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';

  const allSelected =
    filteredFemales.length > 0 &&
    filteredFemales.every((f) => selectedFemaleIds.includes(f.id!));
  const someSelected =
    filteredFemales.some((f) => selectedFemaleIds.includes(f.id!)) && !allSelected;

  const headerCellStyle = {
    py: 1.2,
    px: 1.5,
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: isDark ? '#94a3b8' : '#475569',
    borderBottom: '1px solid',
    borderRight: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    whiteSpace: 'nowrap' as const,
    letterSpacing: '0.04em',
    bgcolor: headerBg,
  };

  const bodyCellStyle = {
    px: 1.5,
    py: 1.1,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
  };

  return (
    <Stack spacing={2}>
      {/* Pedigree-Style Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={1.5}
        >
          {/* Search Bar with Icon */}
          <TextField
            size="small"
            placeholder="Buscar por caravana, raza o lote..."
            value={femaleSearch}
            onChange={(e) => setFemaleSearch(e.target.value)}
            sx={{
              flexGrow: 1,
              maxWidth: { md: 280 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                fontSize: '0.85rem',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FuseSvgIcon size={18} color="action">
                    heroicons-outline:magnifying-glass
                  </FuseSvgIcon>
                </InputAdornment>
              ),
            }}
          />

          {/* Quick Filters / Dropdowns & Chips */}
          <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap alignItems="center">
            {selectedCategoryName && (
              <Chip
                label={`Categoría: ${selectedCategoryName}`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  height: 28,
                  borderRadius: '6px',
                }}
              />
            )}

            {/* Batch of Origin Dropdown */}
            <TextField
              select
              size="small"
              value={femaleBatchFilter}
              onChange={(e) => setFemaleBatchFilter(e.target.value)}
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  height: 32,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                },
              }}
            >
              <MenuItem value="ALL">Todos los Lotes</MenuItem>
              {allBatches.map((b) => (
                <MenuItem key={b.id} value={String(b.id)}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Selected Count Badge */}
            <Chip
              label={`Vientres: ${selectedFemaleIds.length}`}
              color={selectedFemaleIds.length > 0 ? 'primary' : 'default'}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                height: 28,
                borderRadius: '6px',
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Spreadsheet Table Container */}
      {isLoadingCaravans ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      ) : filteredFemales.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 6,
            textAlign: 'center',
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          }}
        >
          <Typography color="text.secondary" fontWeight={500} fontSize="0.88rem">
            No se encontraron vientres aptos disponibles para el filtro seleccionado.
          </Typography>
          <Button
            size="small"
            variant="text"
            sx={{ mt: 1, color: active, fontWeight: 600, textTransform: 'none' }}
            onClick={onResetFilters}
          >
            Restablecer filtros y mostrar todas las hembras
          </Button>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: theme.palette.divider,
            borderRadius: '8px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <TableContainer sx={{ maxHeight: 310 }}>
            <Table stickyHeader size="small" sx={{ minWidth: 680, borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: headerBg }}>
                  {/* Selection Checkbox */}
                  <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center', p: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAllFilteredFemales}
                      sx={{ p: 0.5 }}
                    />
                  </TableCell>

                  {/* Index */}
                  <TableCell sx={{ ...headerCellStyle, width: 40, textAlign: 'center' }}>#</TableCell>

                  {/* Caravana / Animal */}
                  <TableCell sx={{ ...headerCellStyle, minWidth: 190 }}>Caravana / Animal</TableCell>

                  {/* Lote Actual */}
                  <TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Lote Actual</TableCell>

                  {/* Categoría */}
                  <TableCell sx={{ ...headerCellStyle, minWidth: 110 }}>Categoría</TableCell>

                  {/* Dientes */}
                  <TableCell sx={{ ...headerCellStyle, width: 75, textAlign: 'center' }}>Dientes</TableCell>

                  {/* Peso */}
                  <TableCell sx={{ ...headerCellStyle, width: 95, textAlign: 'right' }}>Peso</TableCell>

                  {/* Estado */}
                  <TableCell sx={{ ...headerCellStyle, width: 100, textAlign: 'center', borderRight: 0 }}>Estado</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredFemales.map((female, index) => {
                  const isSelected = selectedFemaleIds.includes(female.id!);
                  const isEven = index % 2 === 1;

                  const rowBg = isSelected
                    ? isDark ? 'rgba(99, 102, 241, 0.22)' : '#e0e7ff'
                    : isEven
                    ? zebraBg
                    : 'inherit';

                  const rowHoverBg = isSelected
                    ? isDark ? 'rgba(99, 102, 241, 0.30)' : '#c7d2fe'
                    : undefined;

                  return (
                    <TableRow
                      key={female.id}
                      hover
                      onClick={() => handleToggleFemale(female.id!)}
                      sx={{
                        bgcolor: rowBg,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: rowHoverBg,
                        },
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', p: 0.5 }}>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => handleToggleFemale(female.id!)}
                          sx={{ p: 0.5 }}
                        />
                      </TableCell>

                      {/* Index */}
                      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
                        {index + 1}
                      </TableCell>

                      {/* Caravana Tag with Avatar ♀ */}
                      <TableCell sx={bodyCellStyle}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 26,
                              height: 26,
                              bgcolor: isDark ? 'rgba(244, 114, 182, 0.2)' : '#fce7f3',
                              color: isDark ? '#f472b6' : '#db2777',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(244, 114, 182, 0.4)' : '#fbcfe8',
                            }}
                          >
                            ♀
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                color: 'primary.main',
                                fontSize: '0.84rem',
                                lineHeight: 1.1,
                              }}
                            >
                              #{female.identification}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}
                            >
                              {female.category_name || female.category || 'Vientre'} • {female.breed || 'Sin Raza'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Lote */}
                      <TableCell sx={bodyCellStyle}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                          {female.batch_name || 'Sin Lote'}
                        </Typography>
                      </TableCell>

                      {/* Categoría Chip */}
                      <TableCell sx={bodyCellStyle}>
                        <Chip
                          label={female.category_name || female.category || 'Hembra'}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: 22,
                            fontWeight: 600,
                            borderRadius: '4px',
                          }}
                        />
                      </TableCell>

                      {/* Dientes */}
                      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>
                          {female.teeth}D
                        </Typography>
                      </TableCell>

                      {/* Peso Actual */}
                      <TableCell sx={{ ...bodyCellStyle, textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.primary' }}>
                          {female.current_weight ? `${female.current_weight} kg` : '—'}
                        </Typography>
                      </TableCell>

                      {/* Estado */}
                      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', borderRight: 0 }}>
                        <Chip
                          label="Apta (Vacía)"
                          size="small"
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            height: 20,
                            borderRadius: '4px',
                            bgcolor: isDark ? 'rgba(16, 126, 62, 0.2)' : '#e7f6ec',
                            color: isDark ? '#34d399' : '#107e3e',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(16, 126, 62, 0.4)' : '#b0e4c1',
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
      )}
    </Stack>
  );
};

export default Step2FemaleRecruitment;
