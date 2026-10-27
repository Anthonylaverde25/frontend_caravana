import React, { useMemo } from 'react';
import { Alert, Box, Typography, Stack, TextField, Chip, Paper, InputAdornment, Button, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import ExcludedFemalesNotice from './ExcludedFemalesNotice';
import StartBatchFemalesTable from './StartBatchFemalesTable';
import { useStartServiceTableStyles } from './useStartServiceTableStyles';
import ServiceMethodHeader from './ServiceMethodHeader';
import PlannedSemenBar from './PlannedSemenBar';
import type { ServiceMethod } from './useStartServiceWizard';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';

/** AI only: the semen planned per female (IA4). */
export interface PlannedSemenProps {
  options: SemenOption[];
  byId: Map<number, SemenOption>;
  planned: Record<number, number | null>;
  plannedStraws: Record<number, number>;
  onPlan: (femaleIds: number[], itemId: number | null) => void;
}

interface StartBatchFemalesStepProps {
  batchName: string;
  serviceableFemales: Caravan[];
  pregnantCount: number;
  isControlledService: boolean;
  setIsControlledService: (value: boolean) => void;
  selectedFemaleIds: number[];
  setSelectedFemaleIds: React.Dispatch<React.SetStateAction<number[]>>;
  femaleSearch: string;
  setFemaleSearch: (val: string) => void;
  onSetApart: (ids: number[]) => void;
  method: ServiceMethod;
  onMethodChange: (method: ServiceMethod) => void;
  /** Picking one by one: a controlled service or AI. */
  picksIndividually: boolean;
  semen?: PlannedSemenProps;
}

/**
 * StartBatchFemalesStep
 * Step 0 coordinator: orchestrates filter state, controlled service mode,
 * selection banners and delegates table rendering to StartBatchFemalesTable.
 */
export const StartBatchFemalesStep: React.FC<StartBatchFemalesStepProps> = ({
  batchName,
  serviceableFemales,
  pregnantCount,
  isControlledService,
  setIsControlledService,
  selectedFemaleIds,
  setSelectedFemaleIds,
  femaleSearch,
  setFemaleSearch,
  onSetApart,
  method,
  onMethodChange,
  picksIndividually,
  semen,
}) => {
  const { isDark, active } = useStartServiceTableStyles();

  const excludedFemales = useMemo(
    () => serviceableFemales.filter((c) => !c.is_breeding_eligible),
    [serviceableFemales]
  );

  const listedFemales = useMemo(
    () => (picksIndividually ? serviceableFemales.filter((c) => c.is_breeding_eligible) : serviceableFemales),
    [serviceableFemales, picksIndividually]
  );

  const filteredFemales = useMemo(() => {
    if (!femaleSearch.trim()) return listedFemales;
    const q = femaleSearch.toLowerCase();
    return listedFemales.filter(
      (c) =>
        c.identification?.toLowerCase().includes(q) ||
        c.category_name?.toLowerCase().includes(q) ||
        c.breed?.toLowerCase().includes(q)
    );
  }, [listedFemales, femaleSearch]);

  const eligibleFilteredIds = useMemo(
    () => filteredFemales.filter((c) => c.is_breeding_eligible).map((c) => c.id!),
    [filteredFemales]
  );

  const exposedCount = picksIndividually ? selectedFemaleIds.length : serviceableFemales.length;
  const allSelected = eligibleFilteredIds.length > 0 && eligibleFilteredIds.every((id) => selectedFemaleIds.includes(id));
  const someSelected = eligibleFilteredIds.some((id) => selectedFemaleIds.includes(id)) && !allSelected;

  const handleToggleSelectAll = () => {
    const idSet = new Set(eligibleFilteredIds);
    setSelectedFemaleIds((prev) =>
      allSelected ? prev.filter((id) => !idSet.has(id)) : Array.from(new Set([...prev, ...eligibleFilteredIds]))
    );
  };

  const handleToggleFemale = (id: number) => {
    if (!picksIndividually) return;
    setSelectedFemaleIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <Stack spacing={2}>
      <ServiceMethodHeader
        batchName={batchName}
        method={method}
        onMethodChange={onMethodChange}
        isControlledService={isControlledService}
        setIsControlledService={setIsControlledService}
        serviceableCount={serviceableFemales.length}
        exposedCount={exposedCount}
        isDark={isDark}
      />

      {semen && (
        <PlannedSemenBar
          options={semen.options}
          byId={semen.byId}
          plannedStraws={semen.plannedStraws}
          onApplyToAll={(itemId) => semen.onPlan(selectedFemaleIds, itemId)}
        />
      )}

      <ExcludedFemalesNotice
        excludedFemales={excludedFemales}
        isControlledService={picksIndividually}
        onSetApart={onSetApart}
      />

      {pregnantCount > 0 && (
        <Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
          {pregnantCount === 1
            ? 'Hay 1 vientre preñado en el lote: queda excluido automáticamente.'
            : `Hay ${pregnantCount} vientres preñados en el lote: quedan excluidos automáticamente.`}
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
          placeholder="Buscar por caravana, raza o categoría..."
          value={femaleSearch}
          onChange={(e) => setFemaleSearch(e.target.value)}
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
            label={`${filteredFemales.length} elegibles`}
            sx={{ height: 28, px: 0.5, fontWeight: 700, fontSize: '0.75rem' }}
          />

          {picksIndividually && (
            <Button
              variant={allSelected ? 'contained' : 'outlined'}
              size="small"
              onClick={handleToggleSelectAll}
              startIcon={
                <FuseSvgIcon size={15}>
                  {allSelected ? 'heroicons-outline:x-mark' : 'heroicons-outline:check-circle'}
                </FuseSvgIcon>
              }
              sx={{ textTransform: 'none', height: 28, fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px' }}
            >
              {allSelected ? 'Deseleccionar' : 'Seleccionar Todo'}
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Selection Banner (Pedigree style matching ExternalBatchAssignmentView) */}
      {picksIndividually && selectedFemaleIds.length > 0 && (
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
              {selectedFemaleIds.length} {selectedFemaleIds.length === 1 ? 'vientre seleccionado' : 'vientres seleccionados'}
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {method === 'AI' ? 'Vientres a inseminar.' : 'Vientres expuestos para servicio controlado.'}
            </Typography>
          </Stack>

          <Button
            size="small"
            onClick={() => setSelectedFemaleIds([])}
            startIcon={<FuseSvgIcon size={14}>heroicons-outline:x-circle</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', p: 0.5 }}
          >
            Limpiar Selección
          </Button>
        </Paper>
      )}

      {/* Canonical Data Table Presenter */}
      <StartBatchFemalesTable
        females={filteredFemales}
        isControlledService={picksIndividually}
        selectedFemaleIds={selectedFemaleIds}
        semen={semen}
        onToggleFemale={handleToggleFemale}
        onToggleAll={handleToggleSelectAll}
        allSelected={allSelected}
        someSelected={someSelected}
      />
    </Stack>
  );
};

export default StartBatchFemalesStep;
