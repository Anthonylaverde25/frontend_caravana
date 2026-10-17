import React from 'react';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Typography,
} from '@mui/material';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { BullHealthEvaluation } from '@/core/pre-service/domain/BullHealthEvaluation';
import { isSelectable, resolveSireAdmission } from '@/core/caravans/domain/rules/resolveSireAdmission';
import SireAdmissionChip from './SireAdmissionChip';
import { useStartServiceTableStyles } from './useStartServiceTableStyles';

interface StartBatchSiresTableProps {
  males: Caravan[];
  bullHealthMap: Map<number, BullHealthEvaluation>;
  selectedMaleIds: number[];
  onToggleMale: (male: Caravan) => void;
  onToggleAllEligible: () => void;
  allEligibleSelected: boolean;
  someEligibleSelected: boolean;
  onEnableExcluded: (male: Caravan) => void;
}

/**
 * StartBatchSiresTable
 * Presenter component for sires (bulls) in the Start Service modal.
 * Implements the canonical two-tier grouped header pattern of /batches/external-assignment.
 */
export const StartBatchSiresTable: React.FC<StartBatchSiresTableProps> = ({
  males,
  bullHealthMap,
  selectedMaleIds,
  onToggleMale,
  onToggleAllEligible,
  allEligibleSelected,
  someEligibleSelected,
  onEnableExcluded,
}) => {
  const {
    headerCellStyle,
    groupCellStyle,
    tintedGroupCellStyle,
    bodyCellStyle,
    zebraBg,
    selectedRowBg,
    headBg,
    headerBorder,
  } = useStartServiceTableStyles();

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: '8px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <TableContainer sx={{ maxHeight: 340 }}>
        <Table stickyHeader size="small" sx={{ minWidth: 880, borderCollapse: 'collapse' }}>
          <TableHead>
            {/* Group Header Row */}
            <TableRow>
              <TableCell
                colSpan={2}
                sx={{
                  ...groupCellStyle,
                  width: 88,
                  bgcolor: headBg,
                  borderBottom: '1px solid',
                  borderColor: headerBorder,
                }}
              />
              <TableCell
                colSpan={5}
                align="center"
                sx={groupCellStyle}
              >
                Datos del Reproductor
              </TableCell>
              <TableCell
                colSpan={2}
                align="center"
                sx={{ ...tintedGroupCellStyle, borderRight: 0 }}
              >
                Evaluación Andrológica (ADR-5)
              </TableCell>
            </TableRow>

            {/* Column Headers */}
            <TableRow>
              <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center', p: 0.5 }}>
                <Checkbox
                  size="small"
                  checked={allEligibleSelected}
                  indeterminate={someEligibleSelected}
                  onChange={onToggleAllEligible}
                  sx={{ p: 0.5 }}
                />
              </TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>Caravana</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Raza</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Lote Actual</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 90, textAlign: 'center' }}>Dentición</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 110, textAlign: 'right' }}>Peso Actual</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 110, textAlign: 'center' }}>C. Escrotal</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 160, textAlign: 'center', borderRight: 0 }}>
                Aptitud Sanitaria
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {males.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    No se encontraron reproductores con el filtro actual.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              males.map((male, index) => {
                const isChecked = selectedMaleIds.includes(male.id!);
                const health = bullHealthMap.get(male.id!);
                const admission = resolveSireAdmission(male, health);
                const selectable = isSelectable(admission);

                const rowBg = isChecked
                  ? selectedRowBg
                  : index % 2 === 1
                  ? zebraBg
                  : 'inherit';

                return (
                  <TableRow
                    key={male.id}
                    hover={selectable}
                    onClick={() => {
                      if (selectable) onToggleMale(male);
                    }}
                    sx={{
                      cursor: selectable ? 'pointer' : 'not-allowed',
                      bgcolor: rowBg,
                      opacity: selectable ? 1 : 0.6,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', p: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        disabled={!selectable}
                        sx={{ p: 0.5 }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        ...bodyCellStyle,
                        textAlign: 'center',
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}
                    </TableCell>

                    <TableCell sx={bodyCellStyle}>
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: 'primary.main',
                          fontSize: '0.85rem',
                          lineHeight: 1.1,
                        }}
                      >
                        #{male.identification}
                      </Typography>
                      {male.breed && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                          {male.breed}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>
                      {male.breed || '—'}
                    </TableCell>

                    <TableCell sx={bodyCellStyle}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.primary' }}>
                        {male.batch_name ?? 'Torada General'}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem', textAlign: 'center' }}>
                      {male.teeth ? `${male.teeth} D` : '—'}
                    </TableCell>

                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem', fontWeight: 600, textAlign: 'right' }}>
                      {male.current_weight ? `${male.current_weight} kg` : '—'}
                    </TableCell>

                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem', textAlign: 'center' }}>
                      {health?.scrotal_circumference_cm ? `${health.scrotal_circumference_cm} cm` : '—'}
                    </TableCell>

                    <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', borderRight: 0 }}>
                      <SireAdmissionChip
                        admission={admission}
                        onEnable={() => onEnableExcluded(male)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default StartBatchSiresTable;
