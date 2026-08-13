import { TableRow, TableCell, Checkbox, Stack, Avatar, Box, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PedigreeRecord } from '@/core/caravans/domain/services/pedigreeAnalysis';
import PedigreeAncestorChip from './PedigreeAncestorChip';

interface PedigreeTableRowProps {
  r: PedigreeRecord;
  index: number;
  isSelected: boolean;
  page: number;
  rowsPerPage: number;
  onToggleSelect: (id: number) => void;
  onFocusInTree: (id: number) => void;
  onOpenRiskyCrosses: (id: number) => void;
  onOpenMatingAdvisor: (record: PedigreeRecord) => void;
  onOpenRescueDialog?: (females: PedigreeRecord[]) => void;
  isDark: boolean;
  zebraBg: string;
}

export default function PedigreeTableRow({
  r,
  index,
  isSelected,
  page,
  rowsPerPage,
  onToggleSelect,
  onFocusInTree,
  onOpenRiskyCrosses,
  onOpenMatingAdvisor,
  onOpenRescueDialog,
  isDark,
  zebraBg,
}: PedigreeTableRowProps) {
  const isEven = index % 2 === 1;
  const isMale = r.sex === 'M';
  const risk = r.inbreedingRisk;

  let bg = isDark ? 'rgba(16, 126, 62, 0.15)' : '#e7f6ec';
  let textColor = isDark ? '#34d399' : '#107e3e';
  let border = isDark ? 'rgba(16, 126, 62, 0.3)' : '#b0e4c1';

  if (risk === 'MODERATE') {
    bg = isDark ? 'rgba(230, 96, 13, 0.15)' : '#fff3e0';
    textColor = isDark ? '#fb923c' : '#e6600d';
    border = isDark ? 'rgba(230, 96, 13, 0.3)' : '#ffe0b2';
  } else if (risk === 'HIGH' || risk === 'CRITICAL') {
    bg = isDark ? 'rgba(187, 0, 0, 0.18)' : '#fbebeb';
    textColor = isDark ? '#f87171' : '#bb0000';
    border = isDark ? 'rgba(187, 0, 0, 0.35)' : '#f5c6c6';
  }

  const tooltipContent =
    r.commonAncestors.length > 0
      ? `Ancestros comunes: ${r.commonAncestors.join(', ')}`
      : 'Sin endogamia detectada en las líneas conocidas.';

  const hasInbreedingRisk = risk === 'HIGH' || risk === 'CRITICAL';
  const hasModerateRisk = risk === 'MODERATE';

  const rowBg = isSelected
    ? isDark ? 'rgba(99, 102, 241, 0.22)' : '#e0e7ff'
    : hasInbreedingRisk
    ? isDark ? 'rgba(239, 68, 68, 0.16)' : '#fee2e2'
    : hasModerateRisk
    ? isDark ? 'rgba(245, 158, 11, 0.10)' : '#fef9c3'
    : isEven
    ? zebraBg
    : 'inherit';

  const rowHoverBg = isSelected
    ? isDark ? 'rgba(99, 102, 241, 0.30)' : '#c7d2fe'
    : hasInbreedingRisk
    ? isDark ? 'rgba(239, 68, 68, 0.24)' : '#fecaca'
    : hasModerateRisk
    ? isDark ? 'rgba(245, 158, 11, 0.18)' : '#fef08a'
    : undefined;

  const bodyCellStyle = {
    px: 1.5,
    py: 1.2,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
  };

  return (
    <TableRow
      hover
      sx={{
        bgcolor: rowBg,
        '&:hover': {
          bgcolor: rowHoverBg,
        },
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* 0. Row Selection Checkbox */}
      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', p: 0.5 }}>
        <Checkbox
          size="small"
          checked={isSelected}
          onChange={() => onToggleSelect(r.id)}
          sx={{ p: 0.5 }}
        />
      </TableCell>

      {/* 1. Index */}
      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
        {page * rowsPerPage + index + 1}
      </TableCell>

      {/* 2. Caravana / Animal */}
      <TableCell sx={bodyCellStyle}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: isMale ? 'info.light' : 'secondary.light',
              color: isMale ? 'info.contrastText' : 'secondary.contrastText',
              fontSize: '0.7rem',
              fontWeight: 800,
            }}
          >
            {isMale ? '♂' : '♀'}
          </Avatar>
          <Box>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main', fontSize: '0.85rem', lineHeight: 1.1 }}>
              #{r.identification}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
              {r.category} • {r.breed}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* 3. Lote */}
      <TableCell sx={bodyCellStyle}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
          {r.batchName}
        </Typography>
      </TableCell>

      {/* 4. Padre (Sire) */}
      <TableCell sx={bodyCellStyle}>
        <Stack spacing={0.3}>
          <PedigreeAncestorChip ancestor={r.father} fallbackLabel="— Sin Padre" isMale isDark={isDark} />
          {r.sireIdentificationMethod && (
            <Chip
              size="small"
              label={
                r.sireIdentificationMethod === 'phenotype'
                  ? '🔍 Fenotipo'
                  : r.sireIdentificationMethod === 'lab_genetic'
                  ? '🧬 Genética'
                  : '📋 Operativo'
              }
              sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, width: 'fit-content' }}
            />
          )}
        </Stack>
      </TableCell>

      {/* 5. Madre (Dam) */}
      <TableCell sx={bodyCellStyle}>
        <PedigreeAncestorChip ancestor={r.mother} fallbackLabel="— Sin Madre" isMale={false} isDark={isDark} />
      </TableCell>

      {/* 6. Abuelo Paterno */}
      <TableCell sx={bodyCellStyle}>
        <PedigreeAncestorChip ancestor={r.paternalGrandsire} fallbackLabel="— Desconocido" isMale isDark={isDark} />
      </TableCell>

      {/* 7. Abuelo Materno */}
      <TableCell sx={bodyCellStyle}>
        <Box>
          <PedigreeAncestorChip ancestor={r.maternalGrandsire} fallbackLabel="— Desconocido" isMale isDark={isDark} />
          {r.maternalGrandsire && (
            <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontSize: '0.62rem' }}>
              Línea materna
            </Typography>
          )}
        </Box>
      </TableCell>

      {/* 8. Nivel de Árbol */}
      <TableCell sx={bodyCellStyle}>
        <Chip
          size="small"
          label={r.depthLabel}
          color={r.treeDepth >= 3 ? 'success' : r.treeDepth === 2 ? 'info' : r.treeDepth === 1 ? 'primary' : 'default'}
          variant={r.treeDepth > 0 ? 'outlined' : 'filled'}
          sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
        />
      </TableCell>

      {/* 9. Consanguinidad ($F_X$) */}
      <TableCell
        sx={{
          ...bodyCellStyle,
          bgcolor:
            risk === 'HIGH' || risk === 'CRITICAL'
              ? (isDark ? 'rgba(239, 68, 68, 0.22)' : '#fee2e2')
              : risk === 'MODERATE'
              ? (isDark ? 'rgba(245, 158, 11, 0.16)' : '#fef3c7')
              : undefined,
        }}
      >
        <Tooltip title={tooltipContent} arrow>
          <Chip
            size="small"
            label={`${r.inbreedingCoefficient}% — ${
              risk === 'OPTIMAL'
                ? 'Óptimo'
                : risk === 'VERY_LOW'
                ? 'Muy Bajo'
                : risk === 'MODERATE'
                ? 'Moderado'
                : risk === 'HIGH'
                ? 'Alto'
                : 'Crítico'
            }`}
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '4px',
              bgcolor: bg,
              color: textColor,
              border: '1px solid',
              borderColor: border,
            }}
          />
        </Tooltip>
      </TableCell>

      {/* 10. Hijos */}
      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
        {r.offspringCount > 0 ? (
          <Chip
            size="small"
            label={r.offspringCount}
            color="primary"
            sx={{ height: 20, fontWeight: 800, fontSize: '0.7rem' }}
          />
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            0
          </Typography>
        )}
      </TableCell>

      {/* 11. Acciones */}
      <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', borderRight: 0 }}>
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title="Ver en Árbol Genealógico">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onFocusInTree(r.id)}
              sx={{ p: 0.5 }}
            >
              <FuseSvgIcon size={18}>heroicons-outline:chart-bar</FuseSvgIcon>
            </IconButton>
          </Tooltip>

          <Tooltip title="Ver Cruces Riesgosos de este Animal">
            <IconButton
              size="small"
              color="error"
              onClick={() => onOpenRiskyCrosses(r.id)}
              sx={{ p: 0.5 }}
            >
              <FuseSvgIcon size={18}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
            </IconButton>
          </Tooltip>

          <Tooltip title="Simular Apareamiento (Cruza)">
            <IconButton
              size="small"
              color="warning"
              onClick={() => onOpenMatingAdvisor(r)}
              sx={{ p: 0.5 }}
            >
              <FuseSvgIcon size={18}>heroicons-outline:heart</FuseSvgIcon>
            </IconButton>
          </Tooltip>

          {r.sex === 'H' && onOpenRescueDialog && (
            <Tooltip title="Planificar Orden de Rescate Exogámico (Fx = 0%)">
              <IconButton
                size="small"
                sx={{ color: '#16a34a', p: 0.5 }}
                onClick={() => onOpenRescueDialog([r])}
              >
                <FuseSvgIcon size={18}>heroicons-outline:sparkles</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
