import { useState, useEffect } from 'react';
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
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';

export interface DraftWeaningBatch {
  id?: number;
  name: string;
  farm_id?: number | null;
  farm_name?: string;
  activity_id?: number;
  activity_name?: string;
  batch_type_id?: number;
  batch_type_code?: string;
  isDraft?: boolean;
}

interface QuickCreateWeaningBatchDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (batch: DraftWeaningBatch) => void;
  defaultFarmId?: number | null;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function QuickCreateWeaningBatchDialog({
  open,
  onClose,
  onCreated,
}: QuickCreateWeaningBatchDialogProps) {
  const { activeCompanyId } = useCompany();
  const { data: activities = [], isLoading: isLoadingActivities } = useActivities(activeCompanyId);
  const { data: batchTypes = [], isLoading: isLoadingBatchTypes } = useBatchTypes();

  const [name, setName] = useState('');
  const [activityId, setActivityId] = useState<number | ''>('');

  // Inicializar nombre por defecto SOLO al abrir el diálogo
  useEffect(() => {
    if (open) {
      const now = new Date();
      const currentMonth = MONTH_NAMES[now.getMonth()];
      const currentYear = now.getFullYear();
      setName(`Destete ${currentMonth} ${currentYear}`);
    } else {
      setName('');
      setActivityId('');
    }
  }, [open]);

  // Preseleccionar actividad inicial o Cría cuando se abre o cargan las actividades
  useEffect(() => {
    if (open && !activityId && activities.length > 0) {
      const initialAct = activities.find((a) => a.isEnabled && a.isInitial) ||
                         activities.find((a) => a.isEnabled && a.code === 'CRIA') ||
                         activities.find((a) => a.isEnabled);
      if (initialAct) {
        setActivityId(initialAct.id);
      }
    }
  }, [open, activities, activityId]);

  const weaningBatchType = batchTypes.find((t) => t.code === 'WEANING');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Ingrese un nombre para el lote');
      return;
    }

    if (!weaningBatchType) {
      toast.error('No se encontró el tipo de lote Destete');
      return;
    }

    const selectedActivity = activities.find((a) => a.id === Number(activityId));

    onCreated({
      id: 0,
      name: name.trim(),
      farm_id: null,
      activity_id: activityId ? Number(activityId) : undefined,
      activity_name: selectedActivity?.name,
      batch_type_id: weaningBatchType.id,
      batch_type_code: 'WEANING',
      isDraft: true,
    });

    toast.info(`Lote "${name.trim()}" seleccionado. Se creará al confirmar el destete.`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
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
              Parámetros generales de destino
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={18}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              label="Nombre del Lote *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="filled"
              fullWidth
              required
              autoFocus
              size="small"
              InputLabelProps={{ shrink: true }}
              placeholder="Ej: Destete Marzo 2026"
              sx={{ bgcolor: 'action.hover' }}
            />

            <TextField
              select
              label="Actividad Asociada *"
              value={activityId}
              onChange={(e) => setActivityId(Number(e.target.value))}
              variant="filled"
              fullWidth
              required
              disabled={isLoadingActivities}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'action.hover' }}
            >
              {activities
                .filter((a) => a.isEnabled)
                .map((act) => (
                  <MenuItem key={act.id} value={act.id}>
                    {act.name} {act.isInitial ? '(Inicial)' : ''}
                  </MenuItem>
                ))}
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
          <Button onClick={onClose} sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoadingBatchTypes}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              bgcolor: '#8b5cf6',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#7c3aed', boxShadow: 'none' },
            }}
          >
            Confirmar Lote
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default QuickCreateWeaningBatchDialog;
