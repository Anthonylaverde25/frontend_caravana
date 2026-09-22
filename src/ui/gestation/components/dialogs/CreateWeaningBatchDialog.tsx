import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';
import { useCreateBatch } from '@/features/batches/hooks/useCreateBatch';

interface CreateWeaningBatchDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CreateWeaningBatchDialog: React.FC<CreateWeaningBatchDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { activeCompanyId } = useCompany();
  const { data: activities = [] } = useActivities(activeCompanyId);
  const { data: batchTypes = [] } = useBatchTypes();
  const createBatchMutation = useCreateBatch();

  const [name, setName] = useState('');
  const [activityId, setActivityId] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [ageInMonths, setAgeInMonths] = useState<number | ''>(7);
  const [knowsToEat, setKnowsToEat] = useState(false);
  const [observaciones, setObservaciones] = useState('');

  // Initialize defaults on open
  useEffect(() => {
    if (open) {
      const now = new Date();
      const currentMonth = MONTH_NAMES[now.getMonth()];
      const currentYear = now.getFullYear();
      setName(`Destete ${currentMonth} ${currentYear}`);

      const initialAct = activities.find((a) => a.isEnabled && a.code === 'CRIA') ||
                         activities.find((a) => a.isEnabled);
      if (initialAct) {
        setActivityId(initialAct.id);
      }

      setWeight('');
      setAgeInMonths(7);
      setKnowsToEat(false);
      setObservaciones('');
    }
  }, [open, activities]);

  const weaningBatchType = batchTypes.find((t) => t.code === 'WEANING');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Ingrese un nombre para el lote');
      return;
    }

    if (!weaningBatchType) {
      toast.error('No se encontró el tipo de lote Destete en el sistema');
      return;
    }

    try {
      await createBatchMutation.mutateAsync({
        name: name.trim(),
        farm_id: null,
        activity_id: activityId ? Number(activityId) : undefined,
        batch_type_id: weaningBatchType.id,
        weight: weight ? Number(weight) : undefined,
        age_in_months: ageInMonths ? Number(ageInMonths) : undefined,
        knows_to_eat: knowsToEat,
        observaciones: observaciones.trim() || undefined,
      });

      toast.success(`Lote de destete "${name.trim()}" creado exitosamente`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al crear el lote de destete';
      toast.error(errorMsg);
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
          boxShadow: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:clock</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
              Nuevo Lote de Destete
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
              Parámetros zootécnicos de desmadre y recría
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={18}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Nombre del Lote *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
                variant="filled"
                InputLabelProps={{ shrink: true }}
                placeholder="Ej: Destete Marzo 2026"
                sx={{ bgcolor: 'action.hover' }}
              />

              <TextField
                select
                label="Actividad Productiva *"
                value={activityId}
                onChange={(e) => setActivityId(Number(e.target.value))}
                required
                fullWidth
                size="small"
                variant="filled"
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: 'action.hover' }}
              >
                <MenuItem value="" disabled>
                  Seleccione una actividad
                </MenuItem>
                {activities.map((act) => (
                  <MenuItem key={act.id} value={act.id}>
                    {act.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Peso Estimado / Inicial (kg)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                size="small"
                variant="filled"
                InputLabelProps={{ shrink: true }}
                placeholder="Ej: 175"
                sx={{ bgcolor: 'action.hover' }}
              />

              <TextField
                label="Edad Aprox. al Desmadre (meses)"
                type="number"
                value={ageInMonths}
                onChange={(e) => setAgeInMonths(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
                size="small"
                variant="filled"
                InputLabelProps={{ shrink: true }}
                placeholder="Ej: 7"
                sx={{ bgcolor: 'action.hover' }}
              />
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: '6px',
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={knowsToEat}
                    onChange={(e) => setKnowsToEat(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Acostumbramiento a Batea / Suplementación
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Indica si la tropa ya conoce comer ración o balanceado en comederos.
                    </Typography>
                  </Box>
                }
              />
            </Box>

            <TextField
              label="Observaciones Zootécnicas"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
              variant="filled"
              InputLabelProps={{ shrink: true }}
              placeholder="Notas sobre sanidad, descorne, vacunación al destete, etc."
              sx={{ bgcolor: 'action.hover' }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createBatchMutation.isPending}
            startIcon={
              createBatchMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#8b5cf6',
              '&:hover': { bgcolor: '#7c3aed' },
            }}
          >
            Crear Lote de Destete
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateWeaningBatchDialog;
