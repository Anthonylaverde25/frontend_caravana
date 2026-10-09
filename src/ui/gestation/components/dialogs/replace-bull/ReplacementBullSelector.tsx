import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  Chip,
  Alert,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

interface ReplacementBullSelectorProps {
  selectedReplacementId: number | null;
  onSelectReplacementId: (id: number) => void;
  excludeCaravanIds: number[];
  allCaravans: Caravan[];
}

export const ReplacementBullSelector: React.FC<ReplacementBullSelectorProps> = ({
  selectedReplacementId,
  onSelectReplacementId,
  excludeCaravanIds,
  allCaravans,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [search, setSearch] = useState('');

  const { data: preServiceBulls = [], isLoading } = usePreServiceBulls();

  // Map health evaluations by caravanId
  const bullHealthMap = useMemo(
    () => new Map(preServiceBulls.map((b) => [b.caravan_id, b])),
    [preServiceBulls]
  );

  // Available candidate males in the establishment (sex == 'M') not in the exclusion list
  const candidateMales = useMemo(() => {
    return allCaravans.filter((c) => {
      const isMale = c.sex === 'M' || (c.sex as string) === 'MACHO';
      if (!isMale) return false;
      if (excludeCaravanIds.includes(c.id)) return false;
      return true;
    });
  }, [allCaravans, excludeCaravanIds]);

  // Filter by search query
  const filteredCandidates = useMemo(() => {
    if (!search.trim()) return candidateMales;
    const q = search.toLowerCase();
    return candidateMales.filter(
      (m) =>
        m.identification?.toLowerCase().includes(q) ||
        m.batch_name?.toLowerCase().includes(q) ||
        m.breed?.toLowerCase().includes(q)
    );
  }, [candidateMales, search]);

  const selectedBullObject = useMemo(() => {
    return candidateMales.find((c) => c.id === selectedReplacementId) || null;
  }, [candidateMales, selectedReplacementId]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Seleccione el Reproductor Suplente (Entrante) *
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Debe provenir de la torada en descanso y contar con aptitud sanitaria vigente (Guarda ADR-5).
        </Typography>
      </Box>

      {/* Barra de Búsqueda */}
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar reproductor por caravana, raza o lote..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        variant="filled"
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
            </InputAdornment>
          ),
          sx: {
            borderRadius: '8px',
            bgcolor: isDark ? 'background.default' : '#f8fafc',
          },
        }}
      />

      {/* Lista / Tabla de Reproductores Candidatos */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <TableContainer sx={{ maxHeight: 260 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ bgcolor: isDark ? 'background.paper' : '#f8fafc' }} />
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: isDark ? 'background.paper' : '#f8fafc' }}>
                  Caravana
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: isDark ? 'background.paper' : '#f8fafc' }}>
                  Lote Actual
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: isDark ? 'background.paper' : '#f8fafc', textAlign: 'center' }}>
                  Circ. Escrotal
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: isDark ? 'background.paper' : '#f8fafc', textAlign: 'center' }}>
                  Sanidad (ADR-5)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    No se encontraron toros suplentes disponibles para el reemplazo.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((male) => {
                  const isSelected = selectedReplacementId === male.id;
                  const health = bullHealthMap.get(male.id);
                  const isApt = health ? health.is_apt : true;
                  const scrotalCm = health?.scrotal_circumference_cm ?? '—';

                  return (
                    <TableRow
                      key={male.id}
                      hover
                      onClick={() => {
                        if (isApt) onSelectReplacementId(male.id);
                      }}
                      sx={{
                        cursor: isApt ? 'pointer' : 'not-allowed',
                        bgcolor: isSelected
                          ? isDark
                            ? 'rgba(10, 110, 209, 0.12)'
                            : '#f0f7ff'
                          : 'inherit',
                        opacity: isApt ? 1 : 0.6,
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Radio
                          checked={isSelected}
                          disabled={!isApt}
                          onChange={() => onSelectReplacementId(male.id)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: 'primary.main' }}>
                          #{male.identification}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {male.breed || 'Angus'} • {male.current_weight ? `${male.current_weight} kg` : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 500 }}>
                          {male.batch_name || 'Torada en Descanso'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                          {scrotalCm !== '—' ? `${scrotalCm} cm` : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1, textAlign: 'center' }}>
                        {isApt ? (
                          <Chip
                            label="Apto ✅"
                            size="small"
                            color="success"
                            variant="filled"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                        ) : (
                          <Chip
                            label="No Apto ❌"
                            size="small"
                            color="error"
                            variant="filled"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Resumen de Selección */}
      {selectedBullObject && (
        <Alert
          severity="success"
          icon={<FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>}
          sx={{ borderRadius: '8px' }}
        >
          Reproductor seleccionado: <strong>#{selectedBullObject.identification}</strong> ({selectedBullObject.breed || 'Angus'}, {selectedBullObject.current_weight ? `${selectedBullObject.current_weight} kg` : ''}) ingresará al lote de servicio.
        </Alert>
      )}
    </Stack>
  );
};

export default ReplacementBullSelector;
