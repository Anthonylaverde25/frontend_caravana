import React, { useMemo } from 'react';
import {
  TableRow,
  TableCell,
  TextField,
  MenuItem,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export interface BullEvaluationRowData {
  caravan_id: number;
  caravan_number: string;
  initial_status: string;
  scrotal_circumference: string;
  body_condition_score: string;
  libido: string;
  aplomo_notes: string;
  prepuce_scrape: boolean;
  prepuce_scrape_tube: string;
  blood_serology: boolean;
  blood_serology_tube: string;
  observations: string;
}

interface BullEvaluationSheetRowProps {
  row: BullEvaluationRowData;
  index: number;
  onChange: (field: keyof BullEvaluationRowData, value: any) => void;
  onRemove: (caravanId: number) => void;
}

export const BullEvaluationSheetRow: React.FC<BullEvaluationSheetRowProps> = ({
  row,
  index,
  onChange,
  onRemove,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const primaryColor = isDark ? '#60a5fa' : '#0a6ed1';
  const successColor = isDark ? '#34d399' : '#107e3e';
  const errorColor = isDark ? '#f87171' : '#dc2626';
  const warningColor = isDark ? '#fbbf24' : '#d97706';

  const ce = parseFloat(row.scrotal_circumference);
  const isCeValid = !isNaN(ce) && ce >= 28;
  const isCeLow = !isNaN(ce) && ce < 28;

  // Real-time clinical status computation
  const computedStatus = useMemo(() => {
    if (isCeLow) {
      return {
        label: 'RECHAZO (CE < 28)',
        color: errorColor,
        bg: alpha(errorColor, 0.12),
        tooltip: 'Descarte zootécnico automático: Circunferencia Escrotal inferior al umbral mínimo de 28 cm (Carrillo, 1988)',
      };
    }

    if (row.prepuce_scrape || row.blood_serology) {
      return {
        label: 'APTO FÍSICO • PEND. LAB',
        color: warningColor,
        bg: alpha(warningColor, 0.12),
        tooltip: 'Apto andrológico en manga. Aguarda confirmación analítica de laboratorio (Raspaje ETS y/o Serología).',
      };
    }

    if (isCeValid) {
      return {
        label: 'APTO FÍSICO',
        color: successColor,
        bg: alpha(successColor, 0.12),
        tooltip: 'CE y conformación andrológica apta para servicio.',
      };
    }

    return {
      label: 'PENDIENTE',
      color: theme.palette.text.secondary,
      bg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      tooltip: 'Ingrese la Circunferencia Escrotal y Condición Corporal para evaluar',
    };
  }, [isCeLow, isCeValid, row.prepuce_scrape, row.blood_serology, errorColor, warningColor, successColor, theme, isDark]);

  const cellBorder = {
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    py: 0.75,
    px: 1,
  };

  return (
    <TableRow
      hover
      sx={{
        bgcolor: index % 2 === 0 ? 'transparent' : isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
        '&:hover': {
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.05) !important' : '#f1f5f9 !important',
        },
      }}
    >
      {/* 1. Caravan Tag (Clickable to Clinical History in new tab) */}
      <TableCell sx={{ ...cellBorder, width: 110 }}>
        <Tooltip title="Abrir Historia Clínica en nueva pestaña (sin perder datos de manga)" arrow>
          <Chip
            size="small"
            label={row.caravan_number}
            onClick={() => window.open(`/gestation/pre-service/${row.caravan_id}`, '_blank')}
            sx={{
              fontWeight: 800,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              cursor: 'pointer',
              bgcolor: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(10, 110, 209, 0.1)',
              color: primaryColor,
              border: '1px solid',
              borderColor: alpha(primaryColor, 0.3),
              '&:hover': {
                bgcolor: isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(10, 110, 209, 0.2)',
                textDecoration: 'underline',
              },
            }}
          />
        </Tooltip>
      </TableCell>

      {/* 2. Scrotal Circumference (CE cm) */}
      <TableCell sx={{ ...cellBorder, width: 105 }}>
        <TextField
          size="small"
          type="number"
          placeholder="Ej: 36.5"
          value={row.scrotal_circumference}
          onChange={(e) => onChange('scrotal_circumference', e.target.value)}
          inputProps={{ step: '0.5', min: '15', max: '60' }}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              fontSize: '0.85rem',
              fontWeight: 700,
              bgcolor: isCeValid
                ? alpha(successColor, 0.1)
                : isCeLow
                ? alpha(errorColor, 0.12)
                : 'background.paper',
            },
            '& input': {
              textAlign: 'center',
              py: 0.75,
              color: isCeLow ? errorColor : isCeValid ? successColor : 'inherit',
            },
          }}
        />
      </TableCell>

      {/* 3. Body Condition Score (CC 1-5) */}
      <TableCell sx={{ ...cellBorder, width: 95 }}>
        <TextField
          select
          size="small"
          value={row.body_condition_score}
          onChange={(e) => onChange('body_condition_score', e.target.value)}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': { fontSize: '0.82rem', fontWeight: 600, py: 0.25 },
          }}
        >
          <MenuItem value="2.0">2.0 (Flaco)</MenuItem>
          <MenuItem value="2.5">2.5 (Mod.)</MenuItem>
          <MenuItem value="3.0">3.0 (Bueno)</MenuItem>
          <MenuItem value="3.5">3.5 (Óptimo)</MenuItem>
          <MenuItem value="4.0">4.0 (Gordo)</MenuItem>
          <MenuItem value="4.5">4.5 (Exceso)</MenuItem>
        </TextField>
      </TableCell>

      {/* 4. Libido */}
      <TableCell sx={{ ...cellBorder, width: 95 }}>
        <TextField
          select
          size="small"
          value={row.libido}
          onChange={(e) => onChange('libido', e.target.value)}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': { fontSize: '0.82rem', fontWeight: 600, py: 0.25 },
          }}
        >
          <MenuItem value="BAJA">Baja</MenuItem>
          <MenuItem value="MEDIA">Media</MenuItem>
          <MenuItem value="ALTA">Alta</MenuItem>
          <MenuItem value="MUY_ALTA">Muy Alta</MenuItem>
        </TextField>
      </TableCell>

      {/* 5. Locomotion & Aplomos */}
      <TableCell sx={{ ...cellBorder, minWidth: 160 }}>
        <TextField
          size="small"
          placeholder="Aplomos, tarso, garrones..."
          value={row.aplomo_notes}
          onChange={(e) => onChange('aplomo_notes', e.target.value)}
          sx={{
            width: '100%',
            '& input': { fontSize: '0.8rem', py: 0.75 },
          }}
        />
      </TableCell>

      {/* 6. Preputial Scrape (ETS) */}
      <TableCell sx={{ ...cellBorder, width: 160, bgcolor: isDark ? 'rgba(245, 158, 11, 0.04)' : '#fffdf5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            clickable
            color={row.prepuce_scrape ? 'warning' : 'default'}
            variant={row.prepuce_scrape ? 'filled' : 'outlined'}
            label={row.prepuce_scrape ? '✓ Raspaje SÍ' : 'Sin Raspaje'}
            onClick={() => onChange('prepuce_scrape', !row.prepuce_scrape)}
            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
          />
          {row.prepuce_scrape && (
            <TextField
              size="small"
              placeholder="Tubo R-01"
              value={row.prepuce_scrape_tube}
              onChange={(e) => onChange('prepuce_scrape_tube', e.target.value)}
              sx={{
                width: 75,
                '& input': { fontSize: '0.75rem', py: 0.4, textAlign: 'center', fontWeight: 700 },
              }}
            />
          )}
        </Box>
      </TableCell>

      {/* 7. Blood Serology (Brucellosis) */}
      <TableCell sx={{ ...cellBorder, width: 160, bgcolor: isDark ? 'rgba(37, 99, 235, 0.04)' : '#f8faff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            clickable
            color={row.blood_serology ? 'primary' : 'default'}
            variant={row.blood_serology ? 'filled' : 'outlined'}
            label={row.blood_serology ? '✓ Sangre SÍ' : 'Sin Sangre'}
            onClick={() => onChange('blood_serology', !row.blood_serology)}
            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
          />
          {row.blood_serology && (
            <TextField
              size="small"
              placeholder="Tubo S-01"
              value={row.blood_serology_tube}
              onChange={(e) => onChange('blood_serology_tube', e.target.value)}
              sx={{
                width: 75,
                '& input': { fontSize: '0.75rem', py: 0.4, textAlign: 'center', fontWeight: 700 },
              }}
            />
          )}
        </Box>
      </TableCell>

      {/* 8. Reactive Clinical Verdict */}
      <TableCell sx={{ ...cellBorder, width: 140, textAlign: 'center' }}>
        <Tooltip title={computedStatus.tooltip} arrow>
          <Chip
            size="small"
            label={computedStatus.label}
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              color: computedStatus.color,
              bgcolor: computedStatus.bg,
              border: '1px solid',
              borderColor: alpha(computedStatus.color, 0.35),
            }}
          />
        </Tooltip>
      </TableCell>

      {/* 9. Exclude from current session */}
      <TableCell align="right" sx={{ ...cellBorder, borderRight: 0, width: 45 }}>
        <Tooltip title="Excluir de esta planilla de manga">
          <IconButton
            size="small"
            color="error"
            onClick={() => onRemove(row.caravan_id)}
            sx={{
              opacity: 0.6,
              '&:hover': { opacity: 1, bgcolor: alpha(errorColor, 0.1) },
            }}
          >
            <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default BullEvaluationSheetRow;
