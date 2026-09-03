import React, { useState } from 'react';
import {
  TextField,
  MenuItem,
  Typography,
  Stack,
  Box,
  Button,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { AnimalCategory } from '@/core/categories/domain/entities/AnimalCategory';
import { TemporalWindowExplanationDialog } from '../../dialogs/TemporalWindowExplanationDialog';

interface Step1DefinitionProps {
  name: string;
  setName: (val: string) => void;
  femaleCategoryId: number | '';
  setFemaleCategoryId: (val: number | '') => void;
  femaleSubcategoryId: number | '';
  setFemaleSubcategoryId: (val: number | '') => void;
  maleCategoryId: number | '';
  setMaleCategoryId: (val: number | '') => void;
  plannedStartDate: string;
  setPlannedStartDate: (val: string) => void;
  plannedEndDate: string;
  setPlannedEndDate: (val: string) => void;
  targetBullRatio: number;
  setTargetBullRatio: (val: number) => void;
  observaciones: string;
  setObservaciones: (val: string) => void;
  femaleCategories: AnimalCategory[];
  maleCategories: AnimalCategory[];
  subcategoryOptions: Array<{ value: number; label: string }>;
  onFemaleCategoryChange: () => void;
  onMaleCategoryChange: () => void;
}

export const Step1Definition: React.FC<Step1DefinitionProps> = ({
  name,
  setName,
  femaleCategoryId,
  setFemaleCategoryId,
  femaleSubcategoryId,
  setFemaleSubcategoryId,
  maleCategoryId,
  setMaleCategoryId,
  plannedStartDate,
  setPlannedStartDate,
  plannedEndDate,
  setPlannedEndDate,
  targetBullRatio,
  setTargetBullRatio,
  observaciones,
  setObservaciones,
  femaleCategories,
  maleCategories,
  subcategoryOptions,
  onFemaleCategoryChange,
  onMaleCategoryChange,
}) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <Stack spacing={2.5}>
      <TextField
        label="Nombre del Lote de Servicio *"
        placeholder="ej: LOTE ENTORE VAQUILLONAS 2026"
        value={name}
        onChange={(e) => setName(e.target.value)}
        variant="filled"
        fullWidth
        required
        sx={{ bgcolor: 'action.hover' }}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label="Categoría Homogénea de Vientres *"
          value={femaleCategoryId}
          onChange={(e) => {
            setFemaleCategoryId(Number(e.target.value));
            setFemaleSubcategoryId('');
            onFemaleCategoryChange();
          }}
          variant="filled"
          fullWidth
          required
          sx={{ bgcolor: 'action.hover' }}
        >
          {femaleCategories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name} ({c.code})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Subcategoría Hembra (Opcional)"
          value={femaleSubcategoryId}
          onChange={(e) => {
            setFemaleSubcategoryId(e.target.value ? Number(e.target.value) : '');
            onFemaleCategoryChange();
          }}
          variant="filled"
          fullWidth
          disabled={!femaleCategoryId || subcategoryOptions.length === 0}
          sx={{ bgcolor: 'action.hover' }}
        >
          <MenuItem value="">
            <em>Todas las subcategorías</em>
          </MenuItem>
          {subcategoryOptions.map((sub) => (
            <MenuItem key={sub.value} value={sub.value}>
              {sub.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label="Categoría de Machos / Reproductores *"
          value={maleCategoryId}
          onChange={(e) => {
            setMaleCategoryId(Number(e.target.value));
            onMaleCategoryChange();
          }}
          variant="filled"
          fullWidth
          required
          sx={{ bgcolor: 'action.hover' }}
        >
          {maleCategories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name} ({c.code})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Ratio Objetivo de Toros (%)"
          type="number"
          value={targetBullRatio}
          onChange={(e) => setTargetBullRatio(parseFloat(e.target.value) || 3.0)}
          variant="filled"
          fullWidth
          helperText="Recomendado: 2.0% a 3.0% (Manejo de un Rodeo de Cría)"
          sx={{ bgcolor: 'action.hover' }}
          InputProps={{
            endAdornment: (
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1 }}>
                %
              </Typography>
            ),
          }}
        />
      </Stack>

      {/* Ventana Temporal Header with Info Modal Trigger */}
      <Box sx={{ pt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Ventana Temporal de Exposición Reproductiva
          </Typography>
          <Button
            size="small"
            onClick={() => setIsInfoOpen(true)}
            startIcon={<FuseSvgIcon size={14}>heroicons-outline:information-circle</FuseSvgIcon>}
            sx={{
              fontSize: '0.74rem',
              textTransform: 'none',
              color: 'primary.main',
              py: 0.2,
              px: 0.75,
              borderRadius: '4px',
              bgcolor: 'action.hover',
            }}
          >
            ¿Por qué 60-90 días?
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Fecha Inicio Planificada"
            type="date"
            value={plannedStartDate}
            onChange={(e) => setPlannedStartDate(e.target.value)}
            variant="filled"
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ bgcolor: 'action.hover' }}
          />

          <TextField
            label="Fecha Fin Estimada (60-90 días)"
            type="date"
            value={plannedEndDate}
            onChange={(e) => setPlannedEndDate(e.target.value)}
            variant="filled"
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ bgcolor: 'action.hover' }}
          />
        </Stack>
      </Box>

      <TextField
        label="Observaciones y Notas Operativas"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        variant="filled"
        fullWidth
        multiline
        rows={2}
        sx={{ bgcolor: 'action.hover' }}
      />

      {/* Zootechnical Explanation Modal */}
      <TemporalWindowExplanationDialog
        open={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </Stack>
  );
};

export default Step1Definition;
