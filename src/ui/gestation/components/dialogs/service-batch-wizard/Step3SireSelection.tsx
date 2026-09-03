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
  Stack,
  Avatar,
  InputAdornment,
  useTheme,
  Tooltip,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';

interface Step3SireSelectionProps {
  filteredMales: Caravan[];
  selectedMaleIds: number[];
  maleSearch: string;
  setMaleSearch: (val: string) => void;
  maleBatchFilter: string;
  setMaleBatchFilter: (val: string) => void;
  allBatches: Batch[];
  currentRatio: number;
  handleToggleMale: (id: number) => void;
  handleSelectAllFilteredMales: () => void;
}

export const Step3SireSelection: React.FC<Step3SireSelectionProps> = ({
  filteredMales,
  selectedMaleIds,
  maleSearch,
  setMaleSearch,
  maleBatchFilter,
  setMaleBatchFilter,
  allBatches,
  currentRatio,
  handleToggleMale,
  handleSelectAllFilteredMales,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: preServiceBulls = [] } = usePreServiceBulls();
  const bullHealthMap = React.useMemo(
    () => new Map(preServiceBulls.map((b) => [b.caravan_id, b])),
    [preServiceBulls]
  );

  const eligibleMales = React.useMemo(
    () => filteredMales.filter((m) => !bullHealthMap.get(m.id!) || bullHealthMap.get(m.id!)?.is_apt),
    [filteredMales, bullHealthMap]
  );

  const headerBg = isDark ? '#1e293b' : '#f8fafc';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';

  const allSelected =
    eligibleMales.length > 0 &&
    eligibleMales.every((m) => selectedMaleIds.includes(m.id!));
  const someSelected =
    eligibleMales.some((m) => selectedMaleIds.includes(m.id!)) && !allSelected;

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
          {/* Search Input with Icon */}
          <TextField
            size="small"
            placeholder="Buscar reproductor..."
            value={maleSearch}
            onChange={(e) => setMaleSearch(e.target.value)}
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

          {/* Controls & Bull Ratio Metrics */}
          <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap alignItems="center">
            <TextField
              select
              size="small"
              value={maleBatchFilter}
              onChange={(e) => setMaleBatchFilter(e.target.value)}
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

            <Chip
              label={`Toros: ${selectedMaleIds.length}`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.78rem', height: 28, borderRadius: '6px' }}
            />

            <Chip
              label={`Ratio Torada: ${currentRatio}%`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                height: 28,
                borderRadius: '6px',
                bgcolor:
                  currentRatio >= 2.0
                    ? isDark ? 'rgba(16, 126, 62, 0.25)' : '#e7f6ec'
                    : currentRatio > 0
                    ? isDark ? 'rgba(230, 96, 13, 0.25)' : '#fff3e0'
                    : undefined,
                color:
                  currentRatio >= 2.0
                    ? isDark ? '#34d399' : '#107e3e'
                    : currentRatio > 0
                    ? isDark ? '#fb923c' : '#e6600d'
                    : undefined,
                border: '1px solid',
                borderColor:
                  currentRatio >= 2.0
                    ? isDark ? 'rgba(16, 126, 62, 0.4)' : '#b0e4c1'
                    : currentRatio > 0
                    ? isDark ? 'rgba(230, 96, 13, 0.4)' : '#ffe0b2'
                    : 'transparent',
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Spreadsheet Table Container */}
      {filteredMales.length === 0 ? (
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
            No se encontraron toros o machos disponibles en la categoría seleccionada.
          </Typography>
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
                      onChange={handleSelectAllFilteredMales}
                      sx={{ p: 0.5 }}
                    />
                  </TableCell>

                  {/* Index */}
                  <TableCell sx={{ ...headerCellStyle, width: 40, textAlign: 'center' }}>#</TableCell>

                  {/* Caravana / Reproductor */}
                  <TableCell sx={{ ...headerCellStyle, minWidth: 190 }}>Caravana / Reproductor</TableCell>

                  {/* Lote Actual */}
                  <TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Lote Actual</TableCell>

                  {/* Raza / Color */}
                  <TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Raza / Color</TableCell>

                  {/* Dientes */}
                  <TableCell sx={{ ...headerCellStyle, width: 75, textAlign: 'center' }}>Dientes</TableCell>

                  {/* Peso */}
                  <TableCell sx={{ ...headerCellStyle, width: 95, textAlign: 'right' }}>Peso</TableCell>

                  {/* Estado */}
                  <TableCell sx={{ ...headerCellStyle, width: 100, textAlign: 'center', borderRight: 0 }}>Estado</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredMales.map((male, index) => {
                  const isSelected = selectedMaleIds.includes(male.id!);
                  const isEven = index % 2 === 1;
                  const bullHealth = bullHealthMap.get(male.id!);
                  const isBlocked = bullHealth ? !bullHealth.is_apt : false;

                  const rowBg = isSelected
                    ? isDark ? 'rgba(99, 102, 241, 0.22)' : '#e0e7ff'
                    : isBlocked
                    ? isDark ? 'rgba(239, 68, 68, 0.06)' : 'rgba(239, 68, 68, 0.03)'
                    : isEven
                    ? zebraBg
                    : 'inherit';

                  const rowHoverBg = isSelected
                    ? isDark ? 'rgba(99, 102, 241, 0.30)' : '#c7d2fe'
                    : isBlocked
                    ? undefined
                    : undefined;

                  return (
                    <TableRow
                      key={male.id}
                      hover={!isBlocked}
                      onClick={() => !isBlocked && handleToggleMale(male.id!)}
                      sx={{
                        bgcolor: rowBg,
                        cursor: isBlocked ? 'not-allowed' : 'pointer',
                        opacity: isBlocked ? 0.7 : 1,
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
                          disabled={isBlocked}
                          onChange={() => !isBlocked && handleToggleMale(male.id!)}
                          sx={{ p: 0.5 }}
                        />
                      </TableCell>

                      {/* Index */}
                      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
                        {index + 1}
                      </TableCell>

                      {/* Caravana Tag with Avatar ♂ */}
                      <TableCell sx={bodyCellStyle}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Avatar
                            sx={{
                              width: 26,
                              height: 26,
                              bgcolor: isDark ? 'rgba(96, 165, 250, 0.2)' : '#dbeafe',
                              color: isDark ? '#60a5fa' : '#2563eb',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(96, 165, 250, 0.4)' : '#bfdbfe',
                            }}
                          >
                            ♂
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
                              #{male.identification}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}
                            >
                              {male.category_name || male.category || 'Toro'} • {male.breed || 'Sin Raza'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Lote */}
                      <TableCell sx={bodyCellStyle}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                          {male.batch_name || 'Sin Lote'}
                        </Typography>
                      </TableCell>

                      {/* Raza / Color */}
                      <TableCell sx={bodyCellStyle}>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'text.primary' }}>
                          {male.breed || '—'}
                        </Typography>
                      </TableCell>

                      {/* Dientes */}
                      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' }}>
                          {male.teeth}D
                        </Typography>
                      </TableCell>

                      {/* Peso Actual */}
                      <TableCell sx={{ ...bodyCellStyle, textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.primary' }}>
                          {male.current_weight ? `${male.current_weight} kg` : '—'}
                        </Typography>
                      </TableCell>

                      {/* Estado de Aptitud */}
                      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', borderRight: 0 }}>
                        {bullHealth ? (
                          bullHealth.status === 'APT' ? (
                            <Tooltip title={`Apto para servicio. CE: ${bullHealth.scrotal_circumference_cm || 'S/D'} cm, CC: ${bullHealth.body_condition_score || 'S/D'}`}>
                              <Chip
                                label="Apto"
                                size="small"
                                color="success"
                                sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20 }}
                              />
                            </Tooltip>
                          ) : bullHealth.status === 'IN_TREATMENT' ? (
                            <Tooltip title={`En Tratamiento: ${bullHealth.active_diagnoses.map((d) => d.pathogen_name).join(', ') || 'Afección clínica activa'}`}>
                              <Chip
                                label="En Tratamiento"
                                size="small"
                                color="warning"
                                sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20 }}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title={`Rechazo Sanitario / Zootécnico: ${bullHealth.observations || 'No apto para servicio'}`}>
                              <Chip
                                label="No Apto"
                                size="small"
                                color="error"
                                sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20 }}
                              />
                            </Tooltip>
                          )
                        ) : (
                          <Chip
                            label="Sin Examen"
                            size="small"
                            sx={{ fontSize: '0.68rem', fontWeight: 600, height: 20 }}
                          />
                        )}
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

export default Step3SireSelection;
