import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  MenuItem,
  TextField,
  Collapse,
  CircularProgress,
  Tooltip,
  Divider,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { usePendingSires, PendingSireItem } from '@/features/caravans/hooks/usePendingSires';
import { useAssignSire } from '@/features/caravans/hooks/useAssignSire';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useCompany } from '@/contexts/CompanyContext';

const IDENTIFICATION_METHODS = [
  {
    value: 'operational',
    label: '📋 Servicio controlado',
    description: 'Padre conocido por registro operativo',
  },
  {
    value: 'phenotype',
    label: '🔍 Rasgos fenotípicos',
    description: 'Identificado por pelaje, marcas o conformación del ternero',
  },
  {
    value: 'lab_genetic',
    label: '🧬 Laboratorio genético',
    description: 'Confirmado por análisis de ADN / genómica',
  },
];

function UrgencyChip({ days }: { days: number }) {
  if (days > 30) {
    return (
      <Chip
        size="small"
        label={`🔴 ${days}d — URGENTE`}
        sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.65rem', height: 20 }}
      />
    );
  }
  if (days > 14) {
    return (
      <Chip
        size="small"
        label={`🟠 ${days}d — ATENCIÓN`}
        sx={{ bgcolor: '#ffedd5', color: '#ea580c', fontWeight: 700, fontSize: '0.65rem', height: 20 }}
      />
    );
  }
  return (
    <Chip
      size="small"
      label={`🟢 ${days}d — RECIENTE`}
      sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.65rem', height: 20 }}
    />
  );
}

function SireAssignRow({ item, maleCaravans }: { item: PendingSireItem; maleCaravans: any[] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: assignSire, isPending } = useAssignSire();

  const [open, setOpen] = useState(false);
  const [selectedSireId, setSelectedSireId] = useState<string>('');
  const [method, setMethod] = useState<string>('operational');
  const [notes, setNotes] = useState<string>('');

  // Merge candidate sires (from gestation) with all male caravans for full list
  const candidateIds = new Set(item.candidate_sires.map(s => s.id));
  const otherMales = maleCaravans.filter(m => !candidateIds.has(m.id));

  const handleConfirm = async () => {
    if (!selectedSireId) {
      enqueueSnackbar('Seleccioná un padre antes de confirmar', { variant: 'warning' });
      return;
    }
    try {
      await assignSire({
        calfId: item.calf_id,
        father_id: Number(selectedSireId),
        identification_method: method as 'operational' | 'phenotype' | 'lab_genetic',
        sire_notes: notes || null,
      });
      enqueueSnackbar(
        `Paternidad confirmada para ${item.calf_identification}`,
        { variant: 'success' }
      );
    } catch {
      enqueueSnackbar('Error al asignar el padre', { variant: 'error' });
    }
  };

  const rowBg = isDark ? 'rgba(255,255,255,0.02)' : '#fafafa';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: open
          ? alpha(theme.palette.warning.main, 0.4)
          : theme.palette.divider,
        borderRadius: '6px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Row header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr auto auto',
          gap: 1,
          alignItems: 'center',
          px: 2,
          py: 1.5,
          bgcolor: rowBg,
          cursor: 'pointer',
          '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5' },
        }}
        onClick={() => setOpen(v => !v)}
      >
        {/* Calf */}
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
            Ternero
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', fontSize: '0.875rem' }}>
            {item.calf_identification}
            {item.calf_sex && (
              <Chip
                label={item.calf_sex === 'M' ? '♂' : '♀'}
                size="small"
                sx={{ ml: 0.5, height: 16, fontSize: '0.6rem', fontWeight: 700 }}
              />
            )}
          </Typography>
        </Box>

        {/* Mother */}
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
            Madre
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.825rem' }}>
            {item.mother_identification}
          </Typography>
        </Box>

        {/* Batch */}
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
            Lote
          </Typography>
          <Typography sx={{ fontWeight: 500, fontSize: '0.8rem', color: 'text.secondary' }}>
            {item.batch_name ?? '—'}
          </Typography>
        </Box>

        {/* Urgency */}
        <UrgencyChip days={item.days_without_sire} />

        {/* Expand icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
          <FuseSvgIcon size={16}>
            {open ? 'heroicons-outline:chevron-up' : 'heroicons-outline:chevron-down'}
          </FuseSvgIcon>
        </Box>
      </Box>

      {/* Expanded assignment form */}
      <Collapse in={open}>
        <Divider />
        <Box
          sx={{
            px: 2,
            py: 2,
            bgcolor: isDark ? 'rgba(255,167,38,0.04)' : 'rgba(255,167,38,0.03)',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.5fr 1.5fr 2fr auto' },
            gap: 1.5,
            alignItems: 'flex-end',
          }}
        >
          {/* Sire selector */}
          <TextField
            select
            size="small"
            label="Padre (Sire)"
            value={selectedSireId}
            onChange={e => setSelectedSireId(e.target.value)}
            fullWidth
            sx={{ '& .MuiInputLabel-root': { fontSize: '0.8rem' } }}
          >
            <MenuItem value=""><em>— Seleccionar padre —</em></MenuItem>
            {item.candidate_sires.length > 0 && (
              <MenuItem disabled sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', py: 0 }}>
                ⭐ CANDIDATOS DEL LOTE
              </MenuItem>
            )}
            {item.candidate_sires.map(s => (
              <MenuItem key={`cand-${s.id}`} value={s.id}>
                ⭐ {s.identification}
              </MenuItem>
            ))}
            {item.candidate_sires.length > 0 && otherMales.length > 0 && <Divider />}
            {otherMales.map(m => (
              <MenuItem key={m.id} value={m.id}>
                {m.identification}
              </MenuItem>
            ))}
          </TextField>

          {/* Method selector */}
          <TextField
            select
            size="small"
            label="Método de identificación"
            value={method}
            onChange={e => setMethod(e.target.value)}
            fullWidth
            sx={{ '& .MuiInputLabel-root': { fontSize: '0.8rem' } }}
          >
            {IDENTIFICATION_METHODS.map(m => (
              <MenuItem key={m.value} value={m.value}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {m.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    {m.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Notes field */}
          <TextField
            size="small"
            label="Notas / Evidencia (opcional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
            placeholder='Ej: "Cara blanca — Hereford confirmado"'
            inputProps={{ maxLength: 500 }}
            sx={{ '& .MuiInputLabel-root': { fontSize: '0.8rem' } }}
          />

          {/* Confirm button */}
          <Button
            variant="contained"
            color="warning"
            disabled={isPending || !selectedSireId}
            onClick={handleConfirm}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              minWidth: 160,
              borderRadius: '4px',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
            startIcon={
              isPending
                ? <CircularProgress size={14} color="inherit" />
                : <FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>
            }
          >
            {isPending ? 'Guardando...' : 'Confirmar Paternidad'}
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}

/**
 * PendingSiresWidget
 *
 * Dashboard widget that shows calves born without an assigned sire.
 * Allows inline paternity confirmation with identification method and evidence notes.
 *
 * Backed by bibliography: Carrillo "Manejo de un Rodeo de Cría" (PDF pages 182, 184)
 * — Phenotypic identification fails in 2nd-generation crossbreeds; lab analysis takes days/weeks.
 */
export default function PendingSiresWidget() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { activeCompanyId } = useCompany();
  const { data: pendingSires = [], isLoading } = usePendingSires();
  const { data: caravans = [] } = useCaravans(activeCompanyId);

  const maleCaravans = useMemo(() => caravans.filter((c: any) => c.sex === 'M'), [caravans]);

  if (isLoading) return null;
  if (pendingSires.length === 0) return null;

  const urgentCount = pendingSires.filter(s => s.days_without_sire > 30).length;
  const warningCount = pendingSires.filter(s => s.days_without_sire > 14 && s.days_without_sire <= 30).length;

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: urgentCount > 0 ? alpha(theme.palette.error.main, 0.3) : alpha(theme.palette.warning.main, 0.3),
        borderRadius: '8px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          background: urgentCount > 0
            ? (isDark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.04)')
            : (isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.04)'),
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: urgentCount > 0
                ? alpha(theme.palette.error.main, 0.12)
                : alpha(theme.palette.warning.main, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FuseSvgIcon
              size={20}
              sx={{ color: urgentCount > 0 ? 'error.main' : 'warning.main' }}
            >
              heroicons-outline:user-group
            </FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              Sires Pendientes de Asignación
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Terneros nacidos sin padre registrado — requieren confirmación de paternidad
            </Typography>
          </Box>
        </Stack>

        {/* Counters */}
        <Stack direction="row" spacing={1}>
          <Chip
            label={`${pendingSires.length} pendiente${pendingSires.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.warning.main, 0.12), color: 'warning.dark', fontSize: '0.75rem' }}
          />
          {urgentCount > 0 && (
            <Chip
              label={`${urgentCount} urgente${urgentCount !== 1 ? 's' : ''} (+30d)`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.error.main, 0.12), color: 'error.main', fontSize: '0.75rem' }}
            />
          )}
          {warningCount > 0 && (
            <Tooltip title="Entre 14 y 30 días sin padre asignado">
              <Chip
                label={`${warningCount} con atención`}
                size="small"
                sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', fontSize: '0.75rem' }}
              />
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* Body: list of pending sires */}
      <Stack spacing={1} sx={{ p: 2 }}>
        {pendingSires.map(item => (
          <SireAssignRow
            key={item.calf_id}
            item={item}
            maleCaravans={maleCaravans}
          />
        ))}
      </Stack>

      {/* Footer hint */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
          💡 <strong>Guía de campo:</strong> En razas puras o 1ª generación de cruzas, el fenotipo del ternero permite identificar al padre (pelaje, marcas faciales).
          En 2ª generación o servicio colectivo con toros de la misma raza, se requiere análisis genómico de laboratorio.
          — Fuente: Carrillo, "Manejo de un Rodeo de Cría", pp. 182-184.
        </Typography>
      </Box>
    </Paper>
  );
}
