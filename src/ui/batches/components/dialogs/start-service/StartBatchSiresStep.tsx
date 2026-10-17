import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  TextField,
  Chip,
  Paper,
  InputAdornment,
  Button,
  Alert,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';
import { isSelectable, resolveSireAdmission } from '@/core/caravans/domain/rules/resolveSireAdmission';
import BreedingEligibilityDialog from '@/ui/herd/components/shared/breeding-eligibility/BreedingEligibilityDialog';
import StartBatchSiresTable from './StartBatchSiresTable';
import { useStartServiceTableStyles } from './useStartServiceTableStyles';

interface StartBatchSiresStepProps {
  availableMales: Caravan[];
  selectedMaleIds: number[];
  setSelectedMaleIds: React.Dispatch<React.SetStateAction<number[]>>;
  femaleCount: number;
  maleSearch: string;
  setMaleSearch: (val: string) => void;
}

/**
 * StartBatchSiresStep
 * Step 1 coordinator: manages bull selection, andrological evaluation mapping (ADR-5),
 * live ratio calculations, search bar and delegates table to StartBatchSiresTable.
 */
export const StartBatchSiresStep: React.FC<StartBatchSiresStepProps> = ({
  availableMales,
  selectedMaleIds,
  setSelectedMaleIds,
  femaleCount,
  maleSearch,
  setMaleSearch,
}) => {
  const { isDark, active } = useStartServiceTableStyles();
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
        m.batch_name?.toLowerCase().includes(q) ||
        m.breed?.toLowerCase().includes(q)
    );
  }, [availableMales, maleSearch]);

  const bullRatio = useMemo(() => {
    if (femaleCount === 0) return 0;
    return Number(((selectedMaleIds.length / femaleCount) * 100).toFixed(1));
  }, [selectedMaleIds.length, femaleCount]);

  const [enabling, setEnabling] = useState<Caravan | null>(null);

  const eligibleMales = useMemo(() => {
    return filteredMales.filter((m) =>
      isSelectable(resolveSireAdmission(m, bullHealthMap.get(m.id!)))
    );
  }, [filteredMales, bullHealthMap]);

  const eligibleMaleIds = useMemo(() => eligibleMales.map((m) => m.id!), [eligibleMales]);

  const allEligibleSelected = eligibleMaleIds.length > 0 && eligibleMaleIds.every((id) => selectedMaleIds.includes(id));
  const someEligibleSelected = eligibleMaleIds.some((id) => selectedMaleIds.includes(id)) && !allEligibleSelected;

  const handleToggleMale = (male: Caravan) => {
    if (!isSelectable(resolveSireAdmission(male, bullHealthMap.get(male.id!)))) {
      return;
    }
    setSelectedMaleIds((prev) =>
      prev.includes(male.id!) ? prev.filter((id) => id !== male.id!) : [...prev, male.id!]
    );
  };

  const handleToggleAllEligible = () => {
    const idSet = new Set(eligibleMaleIds);
    setSelectedMaleIds((prev) =>
      allEligibleSelected ? prev.filter((id) => !idSet.has(id)) : Array.from(new Set([...prev, ...eligibleMaleIds]))
    );
  };

  return (
    <Stack spacing={2}>
      {/* Top Header Card: Bull Ratio & Guidelines */}
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
            Los toros seleccionados ingresan al lote junto a sus vientres.
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

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? 'background.paper' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar reproductor por caravana, raza o lote actual..."
          value={maleSearch}
          onChange={(e) => setMaleSearch(e.target.value)}
          sx={{
            flexGrow: 1,
            maxWidth: { sm: 400 },
            '& .MuiOutlinedInput-root': { borderRadius: '6px', fontSize: '0.85rem' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={18} color="action">heroicons-outline:magnifying-glass</FuseSvgIcon>
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            variant="outlined"
            label={`${filteredMales.length} disponibles`}
            sx={{ height: 28, px: 0.5, fontWeight: 700, fontSize: '0.75rem' }}
          />

          <Button
            variant={allEligibleSelected ? 'contained' : 'outlined'}
            size="small"
            onClick={handleToggleAllEligible}
            disabled={eligibleMaleIds.length === 0}
            startIcon={
              <FuseSvgIcon size={15}>
                {allEligibleSelected ? 'heroicons-outline:x-mark' : 'heroicons-outline:check-circle'}
              </FuseSvgIcon>
            }
            sx={{ textTransform: 'none', height: 28, fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px' }}
          >
            {allEligibleSelected ? 'Deseleccionar' : 'Seleccionar Aptos'}
          </Button>
        </Stack>
      </Paper>

      {/* Selection Banner (Pedigree style matching ExternalBatchAssignmentView) */}
      {selectedMaleIds.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            px: 2,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: alpha(active, isDark ? 0.22 : 0.16),
            bgcolor: alpha(active, isDark ? 0.08 : 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                px: 1.25,
                py: 0.4,
                borderRadius: '6px',
                bgcolor: alpha(active, 0.14),
                color: active,
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              {selectedMaleIds.length} {selectedMaleIds.length === 1 ? 'toro seleccionado' : 'toros seleccionados'} ({bullRatio}%)
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Reproductores asignados para ingresar al lote de servicio.
            </Typography>
          </Stack>

          <Button
            size="small"
            onClick={() => setSelectedMaleIds([])}
            startIcon={<FuseSvgIcon size={14}>heroicons-outline:x-circle</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', p: 0.5 }}
          >
            Limpiar Selección
          </Button>
        </Paper>
      )}

      {/* Canonical Data Table Presenter */}
      <StartBatchSiresTable
        males={filteredMales}
        bullHealthMap={bullHealthMap}
        selectedMaleIds={selectedMaleIds}
        onToggleMale={handleToggleMale}
        onToggleAllEligible={handleToggleAllEligible}
        allEligibleSelected={allEligibleSelected}
        someEligibleSelected={someEligibleSelected}
        onEnableExcluded={(male) => setEnabling(male)}
      />

      <BreedingEligibilityDialog
        open={enabling !== null}
        onClose={() => setEnabling(null)}
        caravans={enabling ? [{ id: enabling.id, identification: enabling.identification, sex: enabling.sex, is_breeding_eligible: false }] : []}
      />
    </Stack>
  );
};

export default StartBatchSiresStep;
