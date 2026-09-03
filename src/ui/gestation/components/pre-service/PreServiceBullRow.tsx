import { useNavigate } from 'react-router';
import {
  TableRow,
  TableCell,
  Checkbox,
  Chip,
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BullHealthEvaluation, VeterinaryDiagnosis } from '@/core/pre-service/domain/BullHealthEvaluation';

interface PreServiceBullRowProps {
  bull: BullHealthEvaluation;
  index: number;
  isSelected: boolean;
  onToggleSelect: (caravanId: number) => void;
  onEvaluate: (bull: BullHealthEvaluation) => void;
  onResolveDiagnosis: (diag: VeterinaryDiagnosis) => void;
  onViewDiagnoses: (bull: BullHealthEvaluation) => void;
}

export const PreServiceBullRow: React.FC<PreServiceBullRowProps> = ({
  bull,
  index,
  isSelected,
  onToggleSelect,
  onEvaluate,
  onResolveDiagnosis,
  onViewDiagnoses,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isEven = index % 2 === 1;

  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';

  const bodyCellStyle = {
    px: 1.5,
    py: 1.25,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'APT':
        return (
          <Chip
            size="small"
            icon={<FuseSvgIcon size={16}>heroicons-outline:check-circle</FuseSvgIcon>}
            label="Apto para Servicio"
            sx={{
              bgcolor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(16, 185, 129, 0.12)',
              color: isDark ? '#34d399' : '#059669',
              fontWeight: 700,
              borderRadius: '6px',
            }}
          />
        );
      case 'IN_TREATMENT':
        return (
          <Chip
            size="small"
            icon={<FuseSvgIcon size={16}>heroicons-outline:exclamation-circle</FuseSvgIcon>}
            label="En Tratamiento"
            sx={{
              bgcolor: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(245, 158, 11, 0.12)',
              color: isDark ? '#fb923c' : '#D97706',
              fontWeight: 700,
              borderRadius: '6px',
            }}
          />
        );
      case 'UNFIT':
        return (
          <Chip
            size="small"
            icon={<FuseSvgIcon size={16}>heroicons-outline:x-circle</FuseSvgIcon>}
            label="Rechazo / Descarte"
            sx={{
              bgcolor: isDark ? 'rgba(248, 113, 113, 0.15)' : 'rgba(239, 68, 68, 0.12)',
              color: isDark ? '#f87171' : '#DC2626',
              fontWeight: 700,
              borderRadius: '6px',
            }}
          />
        );
      default:
        return (
          <Chip
            size="small"
            icon={<FuseSvgIcon size={16}>heroicons-outline:clock</FuseSvgIcon>}
            label="Pendiente Examen"
            sx={{
              bgcolor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(107, 114, 128, 0.12)',
              color: isDark ? '#94a3b8' : '#4B5563',
              fontWeight: 600,
              borderRadius: '6px',
            }}
          />
        );
    }
  };

  const hasDisqualifying = bull.active_diagnoses.some((d) => d.pathogen_is_disqualifying);
  const diagnosesCount = bull.active_diagnoses.length;

  return (
    <TableRow
      hover
      selected={isSelected}
      sx={{
        bgcolor: isSelected
          ? isDark
            ? 'rgba(37, 99, 235, 0.12)'
            : 'rgba(37, 99, 235, 0.04)'
          : isEven
          ? zebraBg
          : 'inherit',
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Selection Checkbox */}
      <TableCell padding="checkbox" sx={{ ...bodyCellStyle, pl: 2, width: 48 }}>
        <Checkbox
          size="small"
          checked={isSelected}
          onChange={() => onToggleSelect(bull.caravan_id)}
          sx={{
            color: isDark ? '#64748b' : '#94a3b8',
            '&.Mui-checked': {
              color: isDark ? '#60a5fa' : '#0a6ed1',
            },
          }}
        />
      </TableCell>

      {/* Caravan Tag - Clickable to Clinical History */}
      <TableCell sx={{ ...bodyCellStyle, fontWeight: 700, fontSize: '0.88rem' }}>
        <Tooltip title="Ver Historia Clínica Veterinaria Completa" arrow>
          <Box
            onClick={() => navigate(`/gestation/pre-service/${bull.caravan_id}`)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              borderRadius: '6px',
              p: 0.5,
              mx: -0.5,
              '&:hover': {
                bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                '& .caravan-tag-text': {
                  color: isDark ? '#60a5fa' : '#0a6ed1',
                  textDecoration: 'underline',
                },
              },
              transition: 'all 0.15s ease',
            }}
          >
            <Box
              sx={{
                p: 0.5,
                borderRadius: '6px',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                color: isDark ? '#60a5fa' : '#0a6ed1',
                display: 'flex',
              }}
            >
              <FuseSvgIcon size={16}>heroicons-outline:identification</FuseSvgIcon>
            </Box>
            <Box>
              <Typography
                className="caravan-tag-text"
                variant="body2"
                sx={{
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  lineHeight: 1.2,
                  color: isDark ? '#ffffff' : '#0f172a',
                }}
              >
                {bull.caravan_number}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Ver historia clínica →
              </Typography>
            </Box>
          </Box>
        </Tooltip>
      </TableCell>

      {/* Aptitude Status */}
      <TableCell sx={bodyCellStyle}>{getStatusChip(bull.status)}</TableCell>

      {/* Biometry & Andrology */}
      <TableCell sx={bodyCellStyle}>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          <Tooltip title="Circunferencia Escrotal (Umbral mínimo Carrillo: 28 cm)">
            <Chip
              size="small"
              variant="outlined"
              label={bull.scrotal_circumference_cm ? `${bull.scrotal_circumference_cm} cm` : 'S/D'}
              sx={{
                fontWeight: 600,
                fontSize: '0.72rem',
                borderColor:
                  bull.scrotal_circumference_cm && bull.scrotal_circumference_cm < 28
                    ? '#EF4444'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'divider',
                color:
                  bull.scrotal_circumference_cm && bull.scrotal_circumference_cm < 28 ? '#EF4444' : 'text.primary',
              }}
            />
          </Tooltip>

          <Tooltip title="Condición Corporal Escala 1-5 (Óptimo servicio: 3.0 - 3.5)">
            <Chip
              size="small"
              variant="outlined"
              label={bull.body_condition_score ? `CC ${bull.body_condition_score}` : 'S/D'}
              sx={{
                fontWeight: 600,
                fontSize: '0.72rem',
                borderColor:
                  bull.body_condition_score && bull.body_condition_score < 2
                    ? '#EF4444'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'divider',
              }}
            />
          </Tooltip>

          <Tooltip title="Líbido / Deseo de servicio en manga">
            <Chip
              size="small"
              variant="outlined"
              label={`Líbido ${bull.libido}`}
              sx={{ fontSize: '0.72rem', fontWeight: 500 }}
            />
          </Tooltip>
        </Box>
      </TableCell>

      {/* Aplomos & Locomoción */}
      <TableCell sx={{ ...bodyCellStyle, maxWidth: 220 }}>
        <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
          {bull.aplomo_notes || 'Sin observaciones locomotoras'}
        </Typography>
      </TableCell>

      {/* Laboratorio: Raspajes ETS & Serología */}
      <TableCell sx={{ ...bodyCellStyle, minWidth: 200 }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {bull.lab_samples && bull.lab_samples.some((s) => s.sample_type === 'PREPUCE_SCRAPE') ? (
            bull.lab_samples
              .filter((s) => s.sample_type === 'PREPUCE_SCRAPE')
              .slice(0, 2)
              .map((s) => (
                <Tooltip
                  key={s.id}
                  title={`Raspaje ETS R${s.sample_round} (${s.tube_number || 'S/N'}) - Fecha: ${s.sample_date} - Protocolo: ${s.protocol_number || 'Pendiente'}`}
                  arrow
                >
                  <Chip
                    size="small"
                    label={`R${s.sample_round}: ${
                      s.status === 'NEGATIVE_CLEARED'
                        ? 'Limpio'
                        : s.status === 'POSITIVE_DETECTED'
                        ? 'Positivo'
                        : 'Pend.'
                    }`}
                    color={
                      s.status === 'NEGATIVE_CLEARED'
                        ? 'success'
                        : s.status === 'POSITIVE_DETECTED'
                        ? 'error'
                        : 'warning'
                    }
                    sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20 }}
                  />
                </Tooltip>
              ))
          ) : (
            <Chip size="small" variant="outlined" label="Sin raspaje" sx={{ fontSize: '0.68rem', height: 20 }} />
          )}

          {bull.lab_samples && bull.lab_samples.some((s) => s.sample_type === 'BLOOD_SEROLOGY') ? (
            bull.lab_samples
              .filter((s) => s.sample_type === 'BLOOD_SEROLOGY')
              .slice(0, 1)
              .map((s) => (
                <Tooltip
                  key={s.id}
                  title={`Serología Brucelosis (${s.tube_number || 'S/N'}) - Fecha: ${s.sample_date} - Protocolo: ${s.protocol_number || 'Pendiente'}`}
                  arrow
                >
                  <Chip
                    size="small"
                    label={`Sangre: ${
                      s.status === 'NEGATIVE_CLEARED'
                        ? 'Limpio'
                        : s.status === 'POSITIVE_DETECTED'
                        ? 'Positivo'
                        : 'Pend.'
                    }`}
                    color={
                      s.status === 'NEGATIVE_CLEARED'
                        ? 'success'
                        : s.status === 'POSITIVE_DETECTED'
                        ? 'error'
                        : 'primary'
                    }
                    sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20 }}
                  />
                </Tooltip>
              ))
          ) : (
            <Chip size="small" variant="outlined" label="Sin sangre" sx={{ fontSize: '0.68rem', height: 20 }} />
          )}
        </Box>
      </TableCell>

      {/* Diagnósticos / Sanidad (Ultra Compact Pill Width 110) */}
      <TableCell sx={{ ...bodyCellStyle, width: 110, textAlign: 'center' }}>
        <Tooltip title="Haga clic para ver el detalle de diagnósticos y sanidad del toro" arrow>
          <Chip
            size="small"
            variant="outlined"
            onClick={() => onViewDiagnoses(bull)}
            label={
              diagnosesCount === 0
                ? 'Sin afección'
                : diagnosesCount === 1
                ? '1 Afección'
                : `${diagnosesCount} Afecciones`
            }
            sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
              borderRadius: '4px',
              cursor: 'pointer',
              borderColor:
                diagnosesCount === 0
                  ? isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'
                  : hasDisqualifying
                  ? '#f87171'
                  : '#fb923c',
              bgcolor:
                diagnosesCount === 0
                  ? 'transparent'
                  : hasDisqualifying
                  ? isDark ? 'rgba(248, 113, 113, 0.15)' : '#fef2f2'
                  : isDark ? 'rgba(251, 146, 60, 0.15)' : '#fffbeb',
              color:
                diagnosesCount === 0
                  ? 'text.secondary'
                  : hasDisqualifying
                  ? isDark ? '#f87171' : '#dc2626'
                  : isDark ? '#fb923c' : '#d97706',
              '&:hover': {
                bgcolor:
                  diagnosesCount === 0
                    ? isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'
                    : hasDisqualifying
                    ? isDark ? 'rgba(248, 113, 113, 0.25)' : '#fee2e2'
                    : isDark ? 'rgba(251, 146, 60, 0.25)' : '#fef3c7',
              },
            }}
          />
        </Tooltip>
      </TableCell>

      {/* Actions */}
      <TableCell align="right" sx={{ ...bodyCellStyle, borderRight: 0, width: 100 }}>
        <Stack direction="row" spacing={0.75} justifyContent="flex-end">
          <Tooltip title="Ver Historia Clínica Veterinaria">
            <IconButton
              size="small"
              onClick={() => navigate(`/gestation/pre-service/${bull.caravan_id}`)}
              sx={{
                borderRadius: '6px',
                bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(10, 110, 209, 0.08)',
                color: isDark ? '#60a5fa' : '#0a6ed1',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(10, 110, 209, 0.16)',
                },
              }}
            >
              <FuseSvgIcon size={18}>heroicons-outline:clipboard-document-list</FuseSvgIcon>
            </IconButton>
          </Tooltip>

          <Tooltip title="Evaluar en Planilla de Manga">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEvaluate(bull)}
              sx={{
                borderRadius: '6px',
                bgcolor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(10, 110, 209, 0.08)',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(10, 110, 209, 0.16)',
                },
              }}
            >
              <FuseSvgIcon size={18}>heroicons-outline:table-cells</FuseSvgIcon>
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default PreServiceBullRow;
