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
  Chip,
  Box,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { useStartServiceTableStyles } from './useStartServiceTableStyles';
import PlannedSemenCell from './PlannedSemenCell';
import type { PlannedSemenProps } from './StartBatchFemalesStep';

interface StartBatchFemalesTableProps {
  females: Caravan[];
  isControlledService: boolean;
  selectedFemaleIds: number[];
  onToggleFemale: (id: number) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  /** AI: one more column with the semen planned per female. */
  semen?: PlannedSemenProps;
}

/**
 * StartBatchFemalesTable
 * Presenter component for the female animals table in the Start Service modal.
 * Follows the canonical two-tier grouped header pattern of /batches/external-assignment.
 */
export const StartBatchFemalesTable: React.FC<StartBatchFemalesTableProps> = ({
  females,
  isControlledService,
  selectedFemaleIds,
  onToggleFemale,
  onToggleAll,
  allSelected,
  someSelected,
  semen,
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
        <Table stickyHeader size="small" sx={{ minWidth: 780, borderCollapse: 'collapse' }}>
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
                Datos del Vientre
              </TableCell>
              <TableCell
                colSpan={semen ? 2 : 1}
                align="center"
                sx={{ ...tintedGroupCellStyle, borderRight: 0 }}
              >
                Condición Reproductiva
              </TableCell>
            </TableRow>

            {/* Column Headers */}
            <TableRow>
              <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center', p: 0.5 }}>
                {isControlledService ? (
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={onToggleAll}
                    sx={{ p: 0.5 }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', color: 'text.secondary' }}>
                    <FuseSvgIcon size={16}>heroicons-outline:lock-closed</FuseSvgIcon>
                  </Box>
                )}
              </TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 44, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 150 }}>Caravana</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Categoría</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 120 }}>Raza</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 90, textAlign: 'center' }}>Dentición</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 110, textAlign: 'right' }}>Peso Actual</TableCell>
              <TableCell sx={{ ...headerCellStyle, minWidth: 150, textAlign: 'center', borderRight: semen ? undefined : 0 }}>
                Estado
              </TableCell>
              {semen && <TableCell sx={{ ...headerCellStyle, minWidth: 220, borderRight: 0 }}>Semen previsto</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {females.length === 0 ? (
              <TableRow>
                <TableCell colSpan={semen ? 9 : 8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    No se encontraron vientres vacíos con el filtro actual.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              females.map((female, index) => {
                const isChecked = selectedFemaleIds.includes(female.id!);
                const isSelectable = isControlledService && female.is_breeding_eligible;
                const rowBg = isChecked && isControlledService
                  ? selectedRowBg
                  : index % 2 === 1
                  ? zebraBg
                  : 'inherit';

                return (
                  <TableRow
                    key={female.id}
                    hover={isSelectable}
                    onClick={() => {
                      if (isSelectable) onToggleFemale(female.id!);
                    }}
                    sx={{
                      cursor: isSelectable ? 'pointer' : isControlledService ? 'not-allowed' : 'default',
                      bgcolor: rowBg,
                      opacity: isControlledService && !female.is_breeding_eligible ? 0.65 : 1,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', p: 0.5 }}>
                      {isControlledService ? (
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          disabled={!female.is_breeding_eligible}
                          sx={{ p: 0.5 }}
                        />
                      ) : (
                        <FuseSvgIcon size={16} color="disabled">
                          heroicons-outline:check
                        </FuseSvgIcon>
                      )}
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
                        #{female.identification}
                      </Typography>
                      {female.breed && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                          {female.breed}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={bodyCellStyle}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                        {female.category_name || female.category || 'Vientre'}
                      </Typography>
                      {female.subcategory_name && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
                          {female.subcategory_name}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem' }}>
                      {female.breed || '—'}
                    </TableCell>

                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem', textAlign: 'center' }}>
                      {female.teeth ? `${female.teeth} D` : '—'}
                    </TableCell>

                    <TableCell sx={{ ...bodyCellStyle, fontSize: '0.78rem', fontWeight: 600, textAlign: 'right' }}>
                      {female.current_weight ? `${female.current_weight} kg` : '—'}
                    </TableCell>

                    <TableCell sx={{ ...bodyCellStyle, textAlign: 'center', borderRight: semen ? undefined : 0 }}>
                      {!female.is_breeding_eligible ? (
                        <Chip
                          size="small"
                          label={female.breeding_exclusion_reason_label ?? 'Excluida'}
                          color="warning"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Vientre Apto"
                          color="success"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                        />
                      )}
                    </TableCell>
                    {semen && (
                      <TableCell sx={{ ...bodyCellStyle, borderRight: 0, py: 0 }}>
                        <PlannedSemenCell
                          value={semen.planned[female.id!] ?? null}
                          options={semen.options}
                          disabled={!isChecked}
                          onChange={(itemId) => semen.onPlan([female.id!], itemId)}
                        />
                      </TableCell>
                    )}
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

export default StartBatchFemalesTable;
