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
  Alert,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';

interface StartBatchSiresStepProps {
  availableMales: Caravan[];
  selectedMaleIds: number[];
  setSelectedMaleIds: React.Dispatch<React.SetStateAction<number[]>>;
  femaleCount: number;
  maleSearch: string;
  setMaleSearch: (val: string) => void;
}

export const StartBatchSiresStep: React.FC<StartBatchSiresStepProps> = ({
  availableMales,
  selectedMaleIds,
  setSelectedMaleIds,
  femaleCount,
  maleSearch,
  setMaleSearch,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: preServiceBulls = [] } = usePreServiceBulls();
  const bullHealthMap = useMemo(
    () => new Map(preServiceBulls.map((b) => [b.caravan_id, b])),
    [preServiceBulls]
  );

  const filteredMales = useMemo(() => {
    if (!maleSearch.trim()) return availableMales;
    const q = maleSearch.toLowerCase();
    return availableMales.filter(
      (m) =>
        m.identification?.toLowerCase().includes(q) ||
        m.batch_name?.toLowerCase().includes(q)
    );
  }, [availableMales, maleSearch]);

  const bullRatio = useMemo(() => {
    if (femaleCount === 0) return 0;
    return Number(((selectedMaleIds.length / femaleCount) * 100).toFixed(1));
  }, [selectedMaleIds.length, femaleCount]);

  const handleToggleMale = (male: Caravan) => {
    const health = bullHealthMap.get(male.id!);
    // Si el toro está evaluado explícitamente como NO apto (ADR-5), advertimos
    if (health && !health.is_apt) {
      return;
    }

    setSelectedMaleIds((prev) =>
      prev.includes(male.id!) ? prev.filter((id) => id !== male.id!) : [...prev, male.id!]
    );
  };

  return (
    <Stack spacing={2.5}>
      {/* Panel Superior: Velocímetro / Bull Ratio & Zootecnia */}
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
            Asignación de Torada (Reproductores)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Los toros seleccionados serán transferidos físicamente al nuevo lote de servicio.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            size="small"
            label={`${selectedMaleIds.length} Toros seleccionados`}
            color="primary"
            sx={{ fontWeight: 700 }}
          />
          <Chip
            size="small"
            label={`Ratio: ${bullRatio}%`}
            color={
              bullRatio >= 2.5 && bullRatio <= 4.5
                ? 'success'
                : bullRatio === 0
                ? 'default'
                : 'warning'
            }
            sx={{ fontWeight: 800 }}
          />
        </Stack>
      </Paper>

      {bullRatio > 0 && (bullRatio < 2.5 || bullRatio > 4.5) && (
        <Alert severity="warning" sx={{ py: 0.5, borderRadius: '8px' }}>
          {bullRatio < 2.5
            ? 'Ratio bajo: según Carrillo (PDF Pág. 20, 166), se recomienda entre 3% y 4% para monta natural a campo.'
            : 'Ratio elevado: dotación de toros superior al 4.5%, puede provocar peleas excesivas entre reproductores.'}
        </Alert>
      )}

      {/* Buscador */}
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar reproductor por caravana o lote actual..."
        value={maleSearch}
        onChange={(e) => setMaleSearch(e.target.value)}
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

      {/* Tabla de Toros con Semáforo ADR-5 */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          maxHeight: 300,
          borderRadius: '8px',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>CARAVANA</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>LOTE ACTUAL</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>C. ESCROTAL</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="center">
                APTITUD ANDROLÓGICA (ADR-5)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No se encontraron reproductores machos disponibles en el establecimiento.
                </TableCell>
              </TableRow>
            ) : (
              filteredMales.map((male) => {
                const isChecked = selectedMaleIds.includes(male.id!);
                const health = bullHealthMap.get(male.id!);
                const isDisqualified = health && !health.is_apt;

                return (
                  <TableRow
                    key={male.id}
                    hover={!isDisqualified}
                    selected={isChecked}
                    onClick={() => !isDisqualified && handleToggleMale(male)}
                    sx={{
                      cursor: isDisqualified ? 'not-allowed' : 'pointer',
                      opacity: isDisqualified ? 0.5 : 1,
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        disabled={Boolean(isDisqualified)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                      {male.identification}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {male.batch_name ?? 'Torada General'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {health?.scrotal_circumference_cm ? `${health.scrotal_circumference_cm} cm` : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {isDisqualified ? (
                        <Chip
                          label="NO APTO (Rechazo Sanitario)"
                          size="small"
                          color="error"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                        />
                      ) : health?.is_apt ? (
                        <Chip
                          label="APTO (Raspaje Negativo)"
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                        />
                      ) : (
                        <Chip
                          label="EVALUADO CLÍNICO"
                          size="small"
                          color="default"
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
    </Stack>
  );
};
